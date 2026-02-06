import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// External libraries
import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type {MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_RowSelectionState} from "material-react-table";

// Material-UI components
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Tooltip } from '@mui/material';

// Local/relative imports
import { PrimaryButton, SecondaryButton } from "./Buttons.tsx";
import ContentTable from './ContentTable.tsx';
import { useTableStore } from '../hooks/useTableStore.ts';
import formatDate from "../utils/formatDate.ts";

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
    createdAt: string;
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
    /** Store search parameters */
    const [searchParams, setSearchParams] = useSearchParams();
    /** Using TanStack Query for better querying */
    const queryClient = useQueryClient();

    /** Zustand store for table state */
    const {
        postTable,
        setPostTablePagination,
        setPostTableGlobalFilter,
        setPostTableShowGlobalFilter,
        setPostTableSelection
    } = useTableStore();

    /** Keep track of which MRT rows are currently selected. */
    const rowSelection = postTable.rowSelection || {};
    const setRowSelection = (updater: MRT_RowSelectionState | ((old: MRT_RowSelectionState) => MRT_RowSelectionState)) => {
        const nextState = typeof updater === 'function' ? updater(rowSelection) : updater;
        setPostTableSelection(nextState);
    };

    /** Initialize global filter from URL param 'q' if present, otherwise from Zustand store */
    const [globalFilter, setGlobalFilter] = useState(() => {
        const urlQ = searchParams.get('q');
        // If URL has it, use it. Otherwise, use Zustand.
        return urlQ !== null ? urlQ : postTable.globalFilter;
    });

    /** Set the table searchbar to the current query parameter's value */
    const [showGlobalFilter, setShowGlobalFilter] = useState(() => {
        const urlQ = searchParams.get('q');
        // If there is a query in the URL, we want to show the filter bar
        return urlQ !== null || postTable.showGlobalFilter;
    });

    /** Related to the [rowSelection, setRowSelection] pair just that it keeps track of which posts IDs have been selected */
    const [selectedPostIds, setSelectedPostIds] = useState<(string | number)[]>([]);
    /** Initialize a snackbar (notification) for later use */
    const [snackbar, setSnackbar] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });
    /** State used to control the "Are you sure you want to delete this?" kind of dialog showing up */
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    /** Similar to the [deleteDialogOpen, setDeleteDialogOpen] pair but for bulk deletion */
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    /** Keep track which post is going to be deleted */
    const [postToDelete, setPostToDelete] = useState<PostStruct | null>(null);

    /** Update URL when global filter changes */
    useEffect(() => {
        if (globalFilter) {
            searchParams.set('q', globalFilter);
        } else {
            searchParams.delete('q');
        }
        setSearchParams(searchParams, { replace: true });
    }, [globalFilter, searchParams, setSearchParams]);

    /** Save pagination to Zustand store whenever it changes */
    useEffect(() => {
        setPostTablePagination(pagination);
    }, [pagination, setPostTablePagination]);

    /** Save global filter to Zustand store whenever it changes */
    useEffect(() => {
        setPostTableGlobalFilter(globalFilter);
    }, [globalFilter, setPostTableGlobalFilter]);

    /** Save showGlobalFilter to Zustand store whenever it changes */
    useEffect(() => {
        setPostTableShowGlobalFilter(showGlobalFilter);
    }, [showGlobalFilter, setPostTableShowGlobalFilter]);

    /** Fetch Users once to use for mapping */
    const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}:${import.meta.env.VITE_API_PORT || '3001'}/users`);
            return res.data;
        },
    });

    /** Fetch Posts with proper pagination and filtering - only fetch when on the post-list page */
    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ['posts', pagination.pageIndex, pagination.pageSize, globalFilter, users] as const,
        queryFn: async ({ queryKey }) => {
            // 1. Properly type the queryKey elements
            const pageIndex = queryKey[1] as number;
            const pageSize = queryKey[2] as number;
            const filter = (queryKey[3] as string) || "";
            const currentUsers = queryKey[4] as User[];

            const allPostsResponse = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}:${import.meta.env.VITE_API_PORT || '3001'}/posts`);
            let allPosts = allPostsResponse.data as PostStruct[];

            if (filter && currentUsers && Array.isArray(currentUsers)) {
                const searchLower = filter.toLowerCase();
                allPosts = allPosts.filter((post: PostStruct) => {
                    const user = currentUsers.find((u: User) => String(u.id) === String(post.userId));
                    const authorName = user ? user.name.toLowerCase() : '';

                    return (
                        post.title.toLowerCase().includes(searchLower) ||
                        post.content.toLowerCase().includes(searchLower) ||
                        authorName.includes(searchLower) ||
                        String(post.id).toLowerCase().includes(searchLower) // Safe conversion
                    );
                });
            }

            const totalCount = allPosts.length;
            // 2. Arithmetic is now safe because types are guaranteed
            const startIndex = pageIndex * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedPosts = allPosts.slice(startIndex, endIndex);

            return {
                posts: paginatedPosts,
                totalCount: totalCount,
            };
        },
        placeholderData: keepPreviousData,
        enabled: !isPostDetailPage && !usersLoading,
    });

    /** Handle global filter change - reset to first page when searching */
    const handleGlobalFilterChange = (filter: string) => {
        setGlobalFilter(filter);
        onPaginationChange({
            ...pagination,
            pageIndex: 0
        });
    };

    /** Handle single delete click */
    const handleDeletePostClick = (post: PostStruct) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    /** Handle bulk delete click */
    const handleBulkDeleteClick = () => {
        const selectedIds = Object.keys(rowSelection); // With getRowId, keys are IDs
        if (selectedIds.length === 0) return;
        setSelectedPostIds(selectedIds);
        setBulkDeleteDialogOpen(true);
    };

    /** Handle single post delete confirmation */
    const handleDeletePost = async () => {
        if (!postToDelete) return;
        setDeleteDialogOpen(false);

        try {
            // TODO: Call API to actually remove the item

            /* To make items "Shift", invalidate the query.
            TanStack Query will re-run the queryFn, which re-slices the data,
            naturally pulling the next item into the current page. */
            await queryClient.invalidateQueries({ queryKey: ['posts'] });

            setSnackbar({ open: true, message: `Post eliminato`, severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: `Errore`, severity: 'error' });
        }
        setPostToDelete(null);
    };

    /** Handle bulk delete confirmation */
    const handleBulkDelete = async () => {
        setBulkDeleteDialogOpen(false);
        if (selectedPostIds.length === 0) return;

        try {
            // TODO: Call API to actually remove the item

            setRowSelection({});
            await queryClient.invalidateQueries({ queryKey: ['posts'] });

            setSnackbar({ open: true, message: `${selectedPostIds.length} post eliminati`, severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: `Errore`, severity: 'error' });
        }
    };

    const handleViewPost = (post: PostStruct) => {
        navigate(`/post/${post.id}`);
    };

    const handleEditPost = (post: PostStruct) => {
        navigate(`/post/${post.id}?edit=true`);
    };

    /** Define the columns for the Material React Table (MRT) */
    const columns = React.useMemo<MRT_ColumnDef<PostStruct>[]>(() => [
        {
            accessorKey: 'title',
            header: 'Titolo',
            size: 300,
        },
        {
            id: 'author',
            header: 'Autore',
            size: 200,
            accessorFn: (row) => {
                const user = users.find(u => String(u.id) === String(row.userId));
                return user ? user.name : `User ${row.userId}`;
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Data di creazione',
            size: 180,
            Cell: ({ cell }) => {
                const dateValue = cell.getValue<string>();
                return dateValue ? formatDate(dateValue) : 'N/D';
            },
        },
    ], [users]);

    const selectedCount = Object.keys(rowSelection).length;

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
                    <PrimaryButton
                        /* Use the 'navigate' function you defined at the top of the component */
                        onClick={() => navigate(`/post/${post.id}`)}
                        className="mt-4 inline-flex items-center gap-1 text-white font-medium text-sm hover:bg-black/80"
                    >
                        Leggi di più
                    </PrimaryButton>
                )}
            </div>
        );
    };

    /** Returns the row props with correct typing */
    const getRowProps = ({ row }: { row: MRT_Row<PostStruct> }) => {
        return {
            onClick: (event: React.MouseEvent) => {
                const target = event.target as HTMLElement;
                const isActionButton = target.closest('button[class*="MuiIconButton"]');
                const isCheckbox = target.closest('input[type="checkbox"], .MuiCheckbox-root, [role="checkbox"]');
                const isExpansionToggle = target.closest('button[aria-label*="Expand"], button[aria-label*="Collapse"]');

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
                    isLoading={isLoading || usersLoading}
                    isFetching={isFetching}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    getRowId={(row) => String(row.id)}
                    enableRowSelection={true}
                    enableRowActions={true}
                    showViewAction={false}
                    showEditAction={true}
                    showDeleteAction={true}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePostClick}
                    onView={handleViewPost}
                    detailPanel={detailPanel}
                    muiTableBodyRowProps={getRowProps}
                    title="Gestione dei post"
                    totalCountText={
                        isLoading || usersLoading
                            ? "Caricamento..."
                            : globalFilter
                                ? `${data?.totalCount ?? 0} risultati trovati (ricerca: "${globalFilter}")`
                                : `${data?.totalCount ?? 0} post totali`
                    }
                    selectedCount={selectedCount}
                    renderTopToolbarCustomActions={renderTopToolbarCustomActions}
                    globalFilter={globalFilter}
                    onGlobalFilterChange={(filter) => {
                        handleGlobalFilterChange(filter);
                    }}
                    showGlobalFilter={showGlobalFilter}
                    onShowGlobalFilterChange={setShowGlobalFilter}
                />
            )}

            {/* Single Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-post-dialog-title"
                aria-describedby="delete-post-dialog-description"
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '16px',
                            padding: '8px'
                        }
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
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: '16px',
                            padding: '8px'
                        }
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