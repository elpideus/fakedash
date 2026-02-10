import React, { useMemo, useCallback } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { IconButton, Tooltip, Alert, Snackbar } from '@mui/material';
import type {MRT_ColumnDef} from 'material-react-table';

// Import shared components and hooks
import { useDashAPI } from '../context/APIContext.tsx';
import { useNavigationHelpers } from '../hooks/useNavigationHelpers.ts';
import { useDeleteConfirmation, useBulkDeleteConfirmation } from '../hooks/useDeleteConfirmation.ts';
import { useTableOperations } from '../hooks/useTableOperations.ts';
import { formatDate } from '../utils/dateUtils.ts';
import { useAuth } from "../store/authStore.ts";

import ConfirmationDialog from "./common/ConfirmationDialog.tsx";
import ContentTable from "./ContentTable.tsx";
import { PrimaryButton, SecondaryButton } from "./common/Buttons.tsx";
import CreatePostDrawer from "./CreatePostDrawer.tsx";


interface PostListContentProps {
    pagination: { pageIndex: number; pageSize: number };
    onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
    isPostDetailPage?: boolean;
}

interface Post {
    id: string | number;
    title: string;
    content: string;
    author?: { name: string };
    userId: number;
    createdAt: string;
    delete?: () => Promise<void>;
}

function PostListContent({ pagination, onPaginationChange }: PostListContentProps) {
    const { api, isLoading: apiLoading, error: apiError, refreshTrigger } = useDashAPI();
    const navigation = useNavigationHelpers();
    const { isAuthenticated, isOwner } = useAuth(); // Add this

    // Snackbar state
    const [snackbar, setSnackbar] = React.useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Delete states
    const [postToDelete, setPostToDelete] = React.useState<Post | null>(null);

    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = React.useState(false);

    // Table operations - include refreshTrigger in dependencies to reset on data changes
    const tableOps = useTableOperations({
        initialPagination: pagination,
        onPaginationChange: onPaginationChange,
        syncWithUrl: true,
        searchParamKey: 'q',
        tableKey: 'postTable'
    });

    // Get all posts - refreshTrigger ensures we get fresh data
    const posts = useMemo(() => {
        // Get all posts and reverse to show newest first (same as UserListContent)
        return [...api.getPosts()].reverse() as Post[];
    }, [api, refreshTrigger]);

    // Prepare table data
    const tableData = useMemo(() => {
        if (apiLoading || !api.isInitialized) {
            return { posts: [] as Post[], totalCount: 0 };
        }

        const filteredPosts = tableOps.applyFiltersAndSorting(posts, (post, filter) => {
            const author = post.author;
            const authorName = author ? author.name.toLowerCase() : '';
            const searchLower = filter.toLowerCase();

            return (
                post.title.toLowerCase().includes(searchLower) ||
                post.content.toLowerCase().includes(searchLower) ||
                authorName.includes(searchLower) ||
                String(post.id).toLowerCase().includes(searchLower)
            );
        });

        const totalCount = filteredPosts.length;
        const paginatedPosts = tableOps.applyPagination(filteredPosts);

        return {
            posts: paginatedPosts as Post[],
            totalCount
        };
    }, [posts, apiLoading, api.isInitialized, tableOps]);

    // Delete confirmations - only show for posts owned by current user
    const singleDeleteConfirmation = useDeleteConfirmation({
        onConfirm: async () => {
            if (postToDelete && postToDelete.delete) {
                try {
                    await postToDelete.delete();
                    setSnackbar({
                        open: true,
                        message: 'Post eliminato con successo',
                        severity: 'success'
                    });
                    // Reset selection after delete
                    tableOps.setRowSelection({});
                } catch (error) {
                    console.error('Error deleting post:', error);
                    setSnackbar({
                        open: true,
                        message: 'Errore durante l\'eliminazione del post',
                        severity: 'error'
                    });
                } finally {
                    setPostToDelete(null);
                }
            }
        },
        title: 'Conferma eliminazione',
        message: `Sei sicuro di voler eliminare il post "${postToDelete?.title}"? Questa azione non può essere annullata.`
    });

    const bulkDeleteConfirmation = useBulkDeleteConfirmation({
        onConfirm: async () => {
            const selectedIds = Object.keys(tableOps.rowSelection);
            try {
                const deletePromises = selectedIds.map(id => {
                    const post = api.getPost(id);
                    // Only delete if user owns this post
                    if (post && isOwner(post.userId)) {
                        return post?.delete() || Promise.resolve();
                    }
                    return Promise.resolve();
                });
                await Promise.all(deletePromises);
                tableOps.setRowSelection({});
                setSnackbar({
                    open: true,
                    message: `${selectedIds.length} post eliminati con successo`,
                    severity: 'success'
                });
            } catch (error) {
                console.error('Error deleting posts:', error);
                setSnackbar({
                    open: true,
                    message: 'Errore durante l\'eliminazione dei post',
                    severity: 'error'
                });
            }
        },
        count: tableOps.selectedCount,
        itemName: 'post'
    });

    // Check if user can edit/delete a specific post
    const canEditDeletePost = useCallback((post: Post) => {
        return isAuthenticated && isOwner(post.userId);
    }, [isAuthenticated, isOwner]);

    // Handlers
    const handleDeletePostClick = useCallback((post: Post) => {
        if (canEditDeletePost(post)) {
            setPostToDelete(post);
            singleDeleteConfirmation.openDialog();
        }
    }, [singleDeleteConfirmation, canEditDeletePost]);

    const handleViewPost = useCallback((post: Post) => {
        navigation.navigateToPost(post.id);
    }, [navigation]);

    const handleEditPost = useCallback((post: Post) => {
        if (canEditDeletePost(post)) {
            navigation.navigateToPost(post.id, true);
        }
    }, [navigation, canEditDeletePost]);

    const handleViewAuthor = useCallback((userId: number) => {
        navigation.navigateToUser(userId);
    }, [navigation]);

    // Table columns
    const columns = useMemo<MRT_ColumnDef<Post>[]>(() => [
        {
            accessorKey: 'title',
            header: 'Titolo',
            size: 300,
            enableSorting: true,
        },
        {
            accessorKey: 'author',
            header: 'Autore',
            size: 200,
            enableSorting: true,
            Cell: ({ row }) => {
                const author = row.original.author;
                const authorName = author ? author.name : `User ${row.original.userId}`;

                return (
                    <span
                        className="cursor-pointer hover:underline text-gray-600"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewAuthor(row.original.userId);
                        }}
                    >
                    {authorName}
                </span>
                );
            }
        },
        {
            accessorKey: 'createdAt',
            header: 'Data di creazione',
            size: 180,
            enableSorting: true,
            Cell: ({ cell }) => {
                const dateValue = cell.getValue<string>();
                return dateValue ? formatDate(dateValue) : 'N/D';
            },
        },
    ], [handleViewAuthor]);

    // Row props
    const getRowProps = useCallback(({ row }: { row: { original: Post } }) => ({
        onClick: (event: React.MouseEvent) => {
            const target = event.target as HTMLElement;
            const isActionButton = target.closest('button');
            const isCheckbox = target.closest('input[type="checkbox"], .MuiCheckbox-root');

            if (!isActionButton && !isCheckbox) {
                handleViewPost(row.original);
            }
        },
        sx: {
            cursor: 'pointer',
        },
    }), [handleViewPost]);

    // Detail panel
    const detailPanel = useCallback((post: Post) => {
        const previewLength = 300;
        const showPreview = post.content.length > previewLength;
        const displayContent = showPreview
            ? `${post.content.substring(0, previewLength)}...`
            : post.content;

        const author = post.author;
        const authorName = author ? author.name : `User ${post.userId}`;

        return (
            <div className="p-6 bg-white border-l-4 border-black/50 shadow-inner relative">
                <h3 className="text-sm uppercase tracking-wider text-black/50 font-bold mb-2">Dettagli Post</h3>
                <div className="mb-4">
                    <p className="text-sm text-black/60 font-medium">Autore</p>
                    <p className="text-lg text-black/80">{authorName}</p>
                </div>
                <div className="mb-4">
                    <p className="text-sm text-black/60 font-medium">Data di creazione</p>
                    <p className="text-lg text-black/80">{post.createdAt ? formatDate(post.createdAt) : 'N/D'}</p>
                </div>
                <div className="mb-4">
                    <p className="text-sm text-black/60 font-medium">Contenuto</p>
                    <div className="relative">
                        <p className="text-lg text-black/80 leading-relaxed pr-4 whitespace-pre-line">
                            {displayContent}
                        </p>
                        {showPreview && (
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        )}
                    </div>
                </div>

                {showPreview && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewPost(post);
                        }}
                        className="mt-4 inline-flex items-center gap-1 font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                    >
                        Leggi di più
                    </button>
                )}
            </div>
        );
    }, [handleViewPost]);

    // Top toolbar actions - only show if user is authenticated
    const renderTopToolbarCustomActions = useCallback(() => (
        <div className="flex gap-4 items-center">
            {isAuthenticated && tableOps.selectedCount > 0 && (
                <Tooltip title="Elimina selezionati">
                    <IconButton
                        onClick={bulkDeleteConfirmation.openDialog}
                        className="bg-red-100 hover:bg-red-200 text-red-600"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
            {isAuthenticated && (
                <PrimaryButton
                    startIcon={<AddIcon />}
                    className="font-medium"
                    onClick={() => setIsCreateDrawerOpen(true)}
                >
                    Crea Post
                </PrimaryButton>
            )}
            <SecondaryButton><DownloadIcon /></SecondaryButton>
        </div>
    ), [tableOps.selectedCount, bulkDeleteConfirmation, isAuthenticated]);

    return (
        <>
            <ContentTable<Post>
                columns={columns}
                data={tableData.posts ?? []}
                rowCount={tableData.totalCount ?? 0}
                pagination={tableOps.pagination}
                onPaginationChange={tableOps.setPagination}
                isLoading={apiLoading || !api.isInitialized}
                isFetching={false}
                rowSelection={tableOps.rowSelection}
                onRowSelectionChange={tableOps.setRowSelection}
                getRowId={(row) => String(row.id)}
                enableRowSelection={isAuthenticated} // Only enable selection if authenticated
                enableRowActions={isAuthenticated} // Only enable actions if authenticated
                showViewAction={true}
                showEditAction={isAuthenticated} // Only show edit if authenticated
                showDeleteAction={isAuthenticated} // Only show delete if authenticated
                onEdit={handleEditPost}
                onDelete={handleDeletePostClick}
                onView={handleViewPost}
                detailPanel={detailPanel}
                muiTableBodyRowProps={getRowProps}
                title="Gestione dei post"
                totalCountText={
                    apiLoading || !api.isInitialized
                        ? "Caricamento..."
                        : tableOps.globalFilter
                            ? `${tableData.totalCount ?? 0} risultati trovati (ricerca: "${tableOps.globalFilter}")`
                            : `${tableData.totalCount ?? 0} post totali`
                }
                selectedCount={tableOps.selectedCount}
                renderTopToolbarCustomActions={renderTopToolbarCustomActions}
                globalFilter={tableOps.globalFilter}
                onGlobalFilterChange={tableOps.setGlobalFilter}
                showGlobalFilter={tableOps.showGlobalFilter}
                onShowGlobalFilterChange={tableOps.setShowGlobalFilter}
                sorting={tableOps.sorting}
                onSortingChange={tableOps.setSorting}
                columnOrder={tableOps.columnOrder}
                onColumnOrderChange={tableOps.setColumnOrder}
                columnVisibility={tableOps.columnVisibility}
                onColumnVisibilityChange={tableOps.setColumnVisibility}
                columnPinning={tableOps.columnPinning}
                onColumnPinningChange={tableOps.setColumnPinning}
                scrollPosition={tableOps.scrollPosition}
                onScrollPositionChange={tableOps.setScrollPosition}
                tableKey="posts-table"
                isRowActionEnabled={(row) => canEditDeletePost(row)}
            />

            {/* Delete confirmation dialogs */}
            <ConfirmationDialog
                open={singleDeleteConfirmation.isOpen}
                title={singleDeleteConfirmation.dialogConfig.title}
                message={singleDeleteConfirmation.dialogConfig.message}
                onConfirm={singleDeleteConfirmation.handleConfirm}
                onCancel={() => {
                    singleDeleteConfirmation.closeDialog();
                    setPostToDelete(null);
                }}
                confirmText="Elimina"
                cancelText="Annulla"
                severity="error"
                isLoading={singleDeleteConfirmation.isDeleting}
            />

            <ConfirmationDialog
                open={bulkDeleteConfirmation.isOpen}
                title={bulkDeleteConfirmation.dialogConfig.title}
                message={bulkDeleteConfirmation.dialogConfig.message}
                onConfirm={bulkDeleteConfirmation.handleConfirm}
                onCancel={bulkDeleteConfirmation.closeDialog}
                confirmText={`Elimina ${tableOps.selectedCount} post`}
                cancelText="Annulla"
                severity="error"
                isLoading={bulkDeleteConfirmation.isDeleting}
            />

            <CreatePostDrawer
                open={isCreateDrawerOpen}
                onClose={() => setIsCreateDrawerOpen(false)}
                onSuccess={() => {
                    // Show success message or refresh data
                    setSnackbar({
                        open: true,
                        message: 'Post creato con successo!',
                        severity: 'success'
                    });
                }}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    className="shadow-lg"
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default PostListContent;