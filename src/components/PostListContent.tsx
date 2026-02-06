import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// External libraries
import axios from "axios";
import {keepPreviousData, useQuery, useQueryClient} from "@tanstack/react-query";
import type { MRT_PaginationState, MRT_RowSelectionState } from "material-react-table";

// Material-UI components
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Tooltip } from '@mui/material';

// Local/relative imports
import { PrimaryButton, SecondaryButton } from "./Buttons.tsx";
import ContentTable from './ContentTable.tsx';

/** Defines the User data structure used by this component */
interface User {
    id: string | number;
    name: string;
}

/** I had to call it like this so that it doesn't get confused with the Post route. It is not really a Struct though. */
interface PostStruct {
    id: string | number;
    userId: string | number;
    title: string;
    content: string;
}

/** Defines the properties used by the component */
interface PostListContentProps {
    pagination: MRT_PaginationState;
    onPaginationChange: (pagination: MRT_PaginationState) => void;
    isPostDetailPage: boolean;
}


function PostListContent({ pagination, onPaginationChange, isPostDetailPage }: PostListContentProps) {
    /** Using React Router */
    const navigate = useNavigate();
    /** Using TanStack Query for better querying */
    const queryClient = useQueryClient();
    /** Keeps track of which MRT rows are currently selected. */
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    /** Related to the \[rowSelection, setRowSelection\] pair just that it keeps track of which posts IDs have been selected */
    const [selectedPostIds, setSelectedPostIds] = useState<(string | number)[]>([]);
    /** Initializes a snackbar (notification) for later use */
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
        open: false,
        message: '',
        severity: 'success'
    });
    /** State used to control the "Are you sure you want to delete this?" kind of dialog showing up */
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    /** Similar to the \[deleteDialogOpen, setDeleteDialogOpen\] pair but for bulk deletion */
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    /** Keeps track which post is going to be deleted */
    const [postToDelete, setPostToDelete] = useState<PostStruct | null>(null);

    /** Fetch Users once to use for mapping */
        /* There is actually a better way of doing this. I am using this method temporarily (also because we are using
        a fake API). We can fetch users in batches based on the current posts' pagination.
        TODO:Implement optimized way of querying user data for posts list based of posts list pagination
         */
    const { data: users = [] } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}:${import.meta.env.VITE_API_PORT || '3001'}/users`);
            return res.data;
        },
    });

    /** Fetch Posts with proper pagination - only fetch when on the post list page */
    const { data, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ['posts', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            // Fetch total count separately
            const countResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}:${import.meta.env.VITE_API_PORT || '3001'}/posts`);
            const totalCount = countResponse.data.length;

            // Calculate start and end indices for the current page
            const startIndex = pagination.pageIndex * pagination.pageSize;
            const endIndex = startIndex + pagination.pageSize;

            // Fetch ALL posts (json-server doesn't support efficient pagination)
            const allPostsResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}:${import.meta.env.VITE_API_PORT || '3001'}/posts`);
            const allPosts = allPostsResponse.data;

            // Manually slice the array to get the current page
            const paginatedPosts = allPosts.slice(startIndex, endIndex);

            return {
                posts: paginatedPosts as PostStruct[],
                totalCount: totalCount,
            };
        },
        placeholderData: keepPreviousData,
        enabled: !isPostDetailPage, // Only fetch posts when not on detail page
    });

    /** Handle single delete click */
    const handleDeletePostClick = (post: PostStruct) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    /** Handle bulk delete click */
    const handleBulkDeleteClick = () => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;

        /** Get the actual post IDs from the selected rows */
        const ids = selectedIds.map(index => {
            const rowIndex = parseInt(index);
            return data?.posts[rowIndex]?.id;
        }).filter(id => id !== undefined);

        setSelectedPostIds(ids);
        setBulkDeleteDialogOpen(true);
    };

    /** Handle single post delete confirmation */
    const handleDeletePost = () => {
        if (!postToDelete) return;

        setDeleteDialogOpen(false);

        /** Update cache */
        const currentData = queryClient.getQueryData(['posts', pagination.pageIndex, pagination.pageSize]);
        if (currentData && typeof currentData === 'object' && 'posts' in currentData && 'totalCount' in currentData) {
            const typedData = currentData as { posts: PostStruct[], totalCount: number };
            const remainingPosts = typedData.posts.filter(p => p.id !== postToDelete.id);

            queryClient.setQueryData(['posts', pagination.pageIndex, pagination.pageSize], {
                posts: remainingPosts,
                totalCount: typedData.totalCount - 1
            });
        }

        // Sets the snackbar (notification) content
        setSnackbar({
            open: true,
            message: `Post "${postToDelete.title}" eliminato con successo`,
            severity: 'success'
        });

        setPostToDelete(null);
    };

    /** Handle bulk delete confirmation */
    const handleBulkDelete = async () => {
        setBulkDeleteDialogOpen(false);

        if (selectedPostIds.length === 0) return;

        // Remove from local cache first for immediate UI update
        const currentData = queryClient.getQueryData(['posts', pagination.pageIndex, pagination.pageSize]);
        if (currentData && typeof currentData === 'object' && 'posts' in currentData && 'totalCount' in currentData) {
            const typedData = currentData as { posts: PostStruct[], totalCount: number };
            const remainingPosts = typedData.posts.filter(post => !selectedPostIds.includes(post.id));
            const newTotalCount = typedData.totalCount - selectedPostIds.length;

            // Update the query cache
            queryClient.setQueryData(['posts', pagination.pageIndex, pagination.pageSize], {
                posts: remainingPosts,
                totalCount: newTotalCount
            });

            // Also update the all posts query
            const allPostsData = queryClient.getQueryData(['posts-all']);
            if (allPostsData && Array.isArray(allPostsData)) {
                const remainingAllPosts = (allPostsData as PostStruct[]).filter(post => !selectedPostIds.includes(post.id));
                queryClient.setQueryData(['posts-all'], remainingAllPosts);
            }

            // Check if we need to adjust pagination
            const currentPageIndex = pagination.pageIndex;
            const pageSize = pagination.pageSize;

            // If current page is empty and not the first page, go to previous page
            if (remainingPosts.length === 0 && currentPageIndex > 0) {
                onPaginationChange({
                    pageIndex: currentPageIndex - 1,
                    pageSize: pageSize
                });
            }
            // If we're on the first page and it's empty after deletion, just refetch
            else if (remainingPosts.length === 0 && currentPageIndex === 0) {
                // Keep same page but trigger refetch
                await refetch();
            }
        }

        // Show success message
        setSnackbar({
            open: true,
            message: `${selectedPostIds.length} post(s) eliminati con successo`,
            severity: 'success'
        });

        // Clear selection
        setRowSelection({});
        setSelectedPostIds([]);

        // Refetch data to fill empty spaces
        setTimeout(() => {
            refetch();
        }, 100);
    };

    /** Handle view post */
    const handleViewPost = (post: PostStruct) => {
        navigate(`/post/${post.id}`);
    };

    /** Handle edit post */
    const handleEditPost = (post: PostStruct) => {
        navigate(`/post/${post.id}?edit=true`);
    };

    /** Defines the columns for the Material React Table (MRT) */
    const columns = React.useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID',
            size: 80,
        },
        {
            accessorKey: 'title',
            header: 'Titolo',
            size: 300,
        },
        {
            id: 'author',
            header: 'Autore',
            size: 200,
            accessorFn: (row: PostStruct) => {
                const user = users.find(u => String(u.id) === String(row.userId));
                return user ? user.name : `User ${row.userId}`;
            },
        },
    ], [users]);

    /** Stores number of selected posts for batch action */
    const selectedCount = Object.keys(rowSelection).length;

    /** Component at the top of the page containing buttons such as the ones for creating new posts and downloading the
     data */
    const renderTopToolbarCustomActions = () => (
        <div className="flex gap-4 items-center">
            {selectedCount > 0 && (
                <Tooltip title="Elimina selezionati">
                    <IconButton
                        onClick={handleBulkDeleteClick}
                        className="bg-red-100 hover:bg-red-200 text-red-600"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            )}
            <PrimaryButton startIcon={<AddIcon />}>Crea Post</PrimaryButton>
            <SecondaryButton><DownloadIcon /></SecondaryButton>
        </div>
    );

    /** Accordion / Dropdown panel showing a preview of the post content. */
    const detailPanel = (post: PostStruct) => {
        const previewLength = 300;
        const showPreview = post.content.length > previewLength;
        const displayContent = showPreview
            ? `${post.content.substring(0, previewLength)}...`
            : post.content;

        const user = users.find(u => String(u.id) === String(post.userId));
        const authorName = user ? user.name : `User ${post.userId}`;

        return (
            <div className="p-6 bg-white border-l-4 border-black/50 shadow-inner relative">
                <h3 className="text-sm uppercase tracking-wider text-black/50 font-bold mb-2">Dettagli Post</h3>
                <div className="mb-4">
                    <p className="text-sm text-black/60 font-medium">Autore</p>
                    <p className="text-lg text-black/80">{authorName}</p>
                </div>
                <div className="mb-4">
                    <p className="text-sm text-black/60 font-medium">Contenuto</p>
                    <div className="relative">
                        <p className="text-lg text-black/80 leading-relaxed pr-4 whitespace-pre-line">
                            {displayContent}
                        </p>

                        {/* Fade effect for preview */}
                        {showPreview && (
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                        )}
                    </div>
                </div>

                {/* Read more link */}
                {showPreview && (
                    <Link
                        to={`/post/${post.id}`}
                        className="mt-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium text-sm"
                    >
                        Leggi di più
                    </Link>
                )}
            </div>
        );
    };

    /** Returns the row props */
    const getRowProps = ({ row }: { row: any }) => {
        if (!row?.original) {
            return {
                sx: {
                    cursor: 'default',
                }
            };
        }

        return {
            onClick: (event: React.MouseEvent) => {
                // Prevent navigation when clicking on certain elements
                const target = event.target as HTMLElement;
                const isActionButton = target.closest('button[class*="MuiIconButton"]');
                const isCheckbox = target.closest('input[type="checkbox"], .MuiCheckbox-root, [role="checkbox"]');
                const isExpansionToggle = target.closest('button[aria-label*="Expand"], button[aria-label*="Collapse"]');

                // Only navigate if not clicking on action buttons, checkboxes, or expansion toggle
                if (!isActionButton && !isCheckbox && !isExpansionToggle) handleViewPost(row.original);
            },
            sx: {
                cursor: 'pointer',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
            },
        };
    };

    return (
        <>
            {isError ? (
                <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                    Impossibile caricare i dati. Assicurati che `json-server --watch db.json --port 3001` sia attivo.
                </div>
            ) : (
                <ContentTable<PostStruct>
                    columns={columns}
                    data={data?.posts ?? []}
                    rowCount={data?.totalCount ?? 0}
                    pagination={pagination}
                    onPaginationChange={onPaginationChange}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    enableRowSelection={true}
                    enableRowActions={true}
                    showViewAction={false} // Hide View button
                    showEditAction={true}
                    showDeleteAction={true}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePostClick}
                    onView={handleViewPost}
                    detailPanel={detailPanel}
                    muiTableBodyRowProps={getRowProps}
                    title="Gestione dei post"
                    totalCountText={isLoading ? "Caricamento..." : `${data?.totalCount ?? 0} post totali`}
                    selectedCount={selectedCount}
                    renderTopToolbarCustomActions={renderTopToolbarCustomActions}
                />
            )}

            {/* Single Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-post-dialog-title"
                aria-describedby="delete-post-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle id="delete-post-dialog-title" className="font-semibold text-xl">
                    Conferma eliminazione
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-post-dialog-description" className="text-gray-700">
                        Sei sicuro di voler eliminare il post "{postToDelete?.title}"?
                        Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-6 pt-2">
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        variant="outlined"
                        className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Annulla
                    </Button>
                    <Button
                        onClick={handleDeletePost}
                        variant="contained"
                        color="error"
                        className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        autoFocus
                    >
                        Elimina
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => setBulkDeleteDialogOpen(false)}
                aria-labelledby="bulk-delete-dialog-title"
                aria-describedby="bulk-delete-dialog-description"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle id="bulk-delete-dialog-title" className="font-semibold text-xl">
                    Conferma eliminazione multipla
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="bulk-delete-dialog-description" className="text-gray-700">
                        Sei sicuro di voler eliminare {selectedPostIds.length} post selezionati?
                        Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-6 pt-2">
                    <Button
                        onClick={() => setBulkDeleteDialogOpen(false)}
                        variant="outlined"
                        className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Annulla
                    </Button>
                    <Button
                        onClick={handleBulkDelete}
                        variant="contained"
                        color="error"
                        className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                        autoFocus
                    >
                        Elimina {selectedPostIds.length} post
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
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