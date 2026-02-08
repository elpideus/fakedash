import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';

// External libraries
import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MRT_ColumnDef, MRT_PaginationState, MRT_Row, MRT_RowSelectionState } from "material-react-table";

// Material-UI components
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import {
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip
} from '@mui/material';

// Local/relative imports
import { PrimaryButton, SecondaryButton } from "../components/Buttons.tsx";
import ContentTable from "../components/ContentTable.tsx";
import { useTableStore } from "../hooks/useTableStore.ts";
import formatDate from "../utils/formatDate.ts";

/** Interface defining the User data structure */
interface User {
  id: string | number;
  name: string;
  email: string;
}

/** Interface defining the Post data structure */
interface PostStruct {
  id: string | number;
  userId: string | number;
  title: string;
  content: string;
  createdAt: string;
}

function UserDetails() {
  /** Get the user ID from URL parameters */
  const { userId } = useParams<{ userId: string }>();
  /** Used for routing */
  const navigate = useNavigate();
  /** Store search parameters */
  const [searchParams, setSearchParams] = useSearchParams();
  /** Get current location for 'from' parameter */
  const location = useLocation();
  /** Get the 'from' parameter from URL to know where to go back */
  const from = searchParams.get('from') || '/users';
  /** We use TanStack Query for querying the data */
  const queryClient = useQueryClient();

  // Decode the from parameter
  const decodedFrom = from ? decodeURIComponent(from) : '/users';

  /** Zustand store for table state */
  const {
    userDetailsTable,
    setUserDetailsTablePagination,
    setUserDetailsTableGlobalFilter,
    setUserDetailsTableShowGlobalFilter,
    setUserDetailsTableSelection
  } = useTableStore();

  /** Initialize pagination from Zustand store */
  const [pagination, setPagination] = useState<MRT_PaginationState>(
      userDetailsTable.pagination
  );

  /** Stores the row selection */
  const rowSelection = userDetailsTable.rowSelection || {};
  const setRowSelection = (
      updater: MRT_RowSelectionState | ((old: MRT_RowSelectionState) => MRT_RowSelectionState)
  ) => {
    const nextState = typeof updater === 'function' ? updater(rowSelection) : updater;
    setUserDetailsTableSelection(nextState);
  };

  /** Initialize global filter from URL param 'q' if present, otherwise from Zustand store */
  const [globalFilter, setGlobalFilter] = useState(() => {
    const urlQ = searchParams.get('q');
    return urlQ !== null ? urlQ : userDetailsTable.globalFilter;
  });

  /** Set the table searchbar to the current query parameter's value */
  const [showGlobalFilter, setShowGlobalFilter] = useState(() => {
    const urlQ = searchParams.get('q');
    return urlQ !== null || userDetailsTable.showGlobalFilter;
  });

  /** Check if edit mode should be activated from URL */
  const shouldActivateEditMode = searchParams.get('edit') === 'true';

  /** State that determines if the user is being edited or not */
  const [isEditing, setIsEditing] = useState(shouldActivateEditMode);
  /** State containing the edited contents of the user */
  const [editedUser, setEditedUser] = useState<User | null>(null);
  /** Deleting user state */
  const [isDeleting, setIsDeleting] = useState(false);
  /** State for delete confirmation dialog */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  /** State for bulk delete confirmation dialog */
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  /** Keep track which post IDs are selected for bulk delete */
  const [selectedPostIds, setSelectedPostIds] = useState<(string | number)[]>([]);

  /** Initialize data for a snackbar (notification) */
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

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
    setUserDetailsTablePagination(pagination);
  }, [pagination, setUserDetailsTablePagination]);

  /** Save global filter to Zustand store whenever it changes */
  useEffect(() => {
    setUserDetailsTableGlobalFilter(globalFilter);
  }, [globalFilter, setUserDetailsTableGlobalFilter]);

  /** Save showGlobalFilter to Zustand store whenever it changes */
  useEffect(() => {
    setUserDetailsTableShowGlobalFilter(showGlobalFilter);
  }, [showGlobalFilter, setUserDetailsTableShowGlobalFilter]);

  /** Fetches user data from API */
  const { data: user, isLoading: userLoading, isError: userError } = useQuery<User>({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost'}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/users?id=${userId}`
      );
      const userData = res.data[0];
      setEditedUser(userData); /** Initialize edit state with the user's data */
      return userData;
    },
    enabled: !!userId,
  });

  /** Fetches posts for this user with proper pagination and filtering */
  const { data: postsData, isLoading: postsLoading, isError: postsError, isFetching } = useQuery<{
    posts: PostStruct[];
    totalCount: number;
  }>({
    queryKey: ['user-posts', userId, pagination.pageIndex, pagination.pageSize, globalFilter],
    queryFn: async ({ queryKey }) => {
      const [, , pageIndex, pageSize, filter] = queryKey as [string, string | undefined, number, number, string];

      // First get all posts for this user
      const allPostsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost'}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/posts?userId=${userId}`
      );
      let allPosts = allPostsResponse.data as PostStruct[];

      // Apply global filter if present
      if (filter) {
        const searchLower = filter.toLowerCase();
        allPosts = allPosts.filter((post: PostStruct) => {
          return (
              post.title.toLowerCase().includes(searchLower) ||
              post.content.toLowerCase().includes(searchLower) ||
              String(post.id).toLowerCase().includes(searchLower)
          );
        });
      }

      const totalCount = allPosts.length;
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPosts = allPosts.slice(startIndex, endIndex);

      return {
        posts: paginatedPosts,
        totalCount: totalCount,
      };
    },
    placeholderData: keepPreviousData,
    enabled: !!userId && !!user,
  });

  /** Remove edit parameter from URL when leaving edit mode */
  const handleCancelEdit = () => {
    setEditedUser(user || null);
    setIsEditing(false);

    // Remove edit parameter from URL
    if (searchParams.has('edit')) {
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  };

  /** Handle entering edit mode */
  const handleEditStart = () => {
    setIsEditing(true);

    // Add edit parameter to URL
    if (!searchParams.has('edit')) {
      searchParams.set('edit', 'true');
      setSearchParams(searchParams, { replace: true });
    }
  };

  /** Handle global filter change - reset to first page when searching */
  const handleGlobalFilterChange = (filter: string) => {
    setGlobalFilter(filter);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  /** Handle single post delete click */
  const handleDeletePostClick = (post: PostStruct) => {
    setSelectedPostIds([post.id]);
    setBulkDeleteDialogOpen(true);
  };

  /** Handle bulk delete click for posts */
  const handleBulkDeleteClick = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setSelectedPostIds(selectedIds);
    setBulkDeleteDialogOpen(true);
  };

  /** Handle user delete click */
  const handleDeleteUserClick = () => {
    setDeleteDialogOpen(true);
  };

  /** Handle user delete confirmation */
  const handleDeleteUser = async () => {
    setDeleteDialogOpen(false);
    setIsDeleting(true);

    try {
      // TODO: Call API to actually remove the user
      // await axios.delete(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/users/${userId}`);

      // Invalidate relevant queries
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['users-list'] });
      await queryClient.invalidateQueries({ queryKey: ['user', userId] });

      setSnackbar({ open: true, message: `Utente eliminato`, severity: 'success' });

      // Redirect to users list after a delay
      setTimeout(() => {
        navigate(from);
      }, 1000);
    } catch {
      setSnackbar({ open: true, message: `Errore nell'eliminazione dell'utente`, severity: 'error' });
      setIsDeleting(false);
    }
  };

  /** Handle bulk delete confirmation for posts */
  const handleBulkDeletePosts = async () => {
    setBulkDeleteDialogOpen(false);
    if (selectedPostIds.length === 0) return;

    try {
      // TODO: Call API to actually remove the posts
      // await Promise.all(selectedPostIds.map(id =>
      //     axios.delete(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/posts/${id}`)
      // ));

      setRowSelection({});
      await queryClient.invalidateQueries({ queryKey: ['user-posts', userId] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });

      setSnackbar({
        open: true,
        message: `${selectedPostIds.length} post eliminati`,
        severity: 'success'
      });
    } catch {
      setSnackbar({ open: true, message: `Errore nell'eliminazione dei post`, severity: 'error' });
    }
    setSelectedPostIds([]);
  };

  /** Handle saving user edits */
  const handleSaveUser = async () => {
    if (!editedUser) return;

    try {
      // TODO: Call API to update the user
      // await axios.put(`${import.meta.env.VITE_API_URL}${import.meta.env.VITE_API_PORT ? `:${import.meta.env.VITE_API_PORT}` : ''}/users/${userId}`, editedUser);

      // Update cache with edited user
      queryClient.setQueryData(['user', userId], editedUser);

      // Also update in users list cache
      await queryClient.invalidateQueries({ queryKey: ['users-list'] });

      setIsEditing(false);

      // Remove edit parameter from URL
      if (searchParams.has('edit')) {
        searchParams.delete('edit');
        setSearchParams(searchParams, { replace: true });
      }

      setSnackbar({
        open: true,
        message: `Utente aggiornato`,
        severity: 'success'
      });
    } catch {
      setSnackbar({
        open: true,
        message: `Errore nell'aggiornamento dell'utente`,
        severity: 'error'
      });
    }
  };

  /** Handle double-click to enter edit mode */
  const handleDoubleClick = () => {
    if (!isEditing) handleEditStart();
  };

  /** Handle view post */
  const handleViewPost = (post: PostStruct) => {
    navigate(`/post/${post.id}?from=${encodeURIComponent(location.pathname + location.search)}`);
  };

  /** Handle edit post - with edit mode enabled */
  const handleEditPost = (post: PostStruct) => {
    navigate(`/post/${post.id}?edit=true&from=${encodeURIComponent(location.pathname + location.search)}`);
  };

  /** Define the columns for the posts table */
  const columns = React.useMemo<MRT_ColumnDef<PostStruct>[]>(() => [
    {
      accessorKey: 'title',
      header: 'Titolo',
      size: 300,
    },
    {
      accessorKey: 'content',
      header: 'Contenuto',
      size: 400,
      Cell: ({ cell }) => {
        const content = cell.getValue<string>();
        const previewLength = 100;
        return content.length > previewLength
            ? `${content.substring(0, previewLength)}...`
            : content;
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
  ], []);

  /** Returns the row props with consistent click behavior and styling */
  const getRowProps = ({ row }: { row: MRT_Row<PostStruct> }) => ({
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
  });

  const selectedCount = Object.keys(rowSelection).length;

  const renderTopToolbarCustomActions = () => (
      <div className="flex gap-4 items-center">
        {selectedCount > 0 && (
            <Tooltip title="Elimina post selezionati">
              <IconButton
                  onClick={handleBulkDeleteClick}
                  className="bg-red-100 hover:bg-red-200 text-red-600"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
        )}
        <SecondaryButton>
          <DownloadIcon />
        </SecondaryButton>
      </div>
  );

  /** Detail panel for posts */
  const detailPanel = (post: PostStruct) => {
    const previewLength = 300;
    const showPreview = post.content.length > previewLength;
    const displayContent = showPreview
        ? `${post.content.substring(0, previewLength)}...`
        : post.content;

    return (
        <div className="p-6 bg-white border-l-4 border-black/50 shadow-inner relative">
          <h3 className="text-sm uppercase tracking-wider text-black/50 font-bold mb-2">Dettagli Post</h3>
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
                  onClick={() => navigate(`/post/${post.id}?from=${encodeURIComponent(location.pathname + location.search)}`)}
                  className="mt-4 inline-flex items-center gap-1 font-medium text-sm"
              >
                Leggi di più
              </PrimaryButton>
          )}
        </div>
    );
  };

  // Show loading state
  if (userLoading || isDeleting) {
    return (
        <div className="p-8 h-full flex items-center justify-center">
          <div className="text-center">
            <CircularProgress size={60} sx={{ color: "#4a5565" }} />
            <p className="mt-4 text-gray-600">
              {isDeleting ? "Eliminazione dell'utente in corso..." : "Caricamento dei dettagli utente..."}
            </p>
          </div>
        </div>
    );
  }

  // Show error state for user
  if (userError || !user) {
    return (
        <div className="p-8 h-full">
          <div className="mb-6">
            <Link
                to={from}  // Changed from "/users" to {from}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowBackIcon /> Torna alla lista utenti
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-600">
            <h2 className="text-2xl font-bold mb-4">Errore nel caricamento dell'utente</h2>
            <p>Impossibile caricare l'utente. Assicurati che il server sia attivo e che l'utente esista.</p>
            <p className="mt-2 text-sm">User ID: {userId}</p>
          </div>
        </div>
    );
  }

  return (
      <div className="p-8 h-full overflow-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link
              to={decodedFrom}
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200"
          >
          <span className="inline-block transition-transform duration-200 group-hover:-translate-x-2 delay-150">
            <ArrowBackIcon />
          </span>
            <span className="group-hover:scale-110 transition-all duration-200">
            {from === '/users' ? 'Torna alla lista utenti' : 'Torna indietro'}
          </span>
          </Link>
        </div>

        {/* Posts table with integrated user info header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Integrated user info header */}
          <div
              className="p-6 border-b border-gray-200 flex justify-between items-center"
              onDoubleClick={handleDoubleClick}
          >
            <div className="flex-1">
              {isEditing ? (
                  <div className="space-y-4">
                    <TextField
                        fullWidth
                        value={editedUser?.name || ''}
                        onChange={(e) => setEditedUser(prev => prev ? { ...prev, name: e.target.value } : null)}
                        variant="outlined"
                        label="Nome"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.75rem',
                            fontWeight: 'bold',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '1rem',
                          }
                        }}
                    />
                    <TextField
                        fullWidth
                        value={editedUser?.email || ''}
                        onChange={(e) => setEditedUser(prev => prev ? { ...prev, email: e.target.value } : null)}
                        variant="outlined"
                        label="Email"
                        sx={{
                          marginTop: "20px",

                          '& .MuiOutlinedInput-root': {
                            fontSize: '1rem',
                          },
                          '& .MuiInputLabel-root': {
                            fontSize: '0.875rem',
                          }
                        }}
                    />
                  </div>
              ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">{user?.name || 'Nome non disponibile'}</h1>
                    <p className="text-gray-600">{user?.email || 'Email non disponibile'}</p>
                  </div>
              )}
            </div>

            {/* Edit/Delete/Save/Cancel buttons */}
            <div className="ml-4">
              {!isEditing ? (
                  <div className="flex gap-2">
                    <IconButton
                        onClick={handleEditStart}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                        title="Modifica utente"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleDeleteUserClick}
                        className="bg-red-100 hover:bg-red-200 text-red-600"
                        title="Elimina utente"
                        disabled={isDeleting}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
              ) : (
                  <div className="flex gap-2">
                    <IconButton
                        onClick={handleSaveUser}
                        className="bg-green-100 hover:bg-green-200 text-green-600"
                        title="Salva modifiche"
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                        onClick={handleCancelEdit}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                        title="Annulla modifiche"
                    >
                      <CancelIcon />
                    </IconButton>
                  </div>
              )}
            </div>
          </div>

          {/* Edit hint (only show when not editing) */}
          {!isEditing && (
              <div className="px-6 py-2 border-b border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500 italic">
                  Doppio click sul nome o email per attivare la modalità modifica
                </p>
              </div>
          )}

          {/* Posts table */}
          {postsError ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 inline-block">
                  <p>Impossibile caricare i post. Assicurati che il server sia attivo.</p>
                </div>
              </div>
          ) : (
              <ContentTable<PostStruct>
                  columns={columns}
                  data={postsData?.posts ?? []}
                  rowCount={postsData?.totalCount ?? 0}
                  pagination={pagination}
                  onPaginationChange={setPagination}
                  isLoading={postsLoading}
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
                  title=""
                  totalCountText={
                    postsLoading
                        ? "Caricamento..."
                        : globalFilter
                            ? `${postsData?.totalCount ?? 0} risultati trovati (ricerca: "${globalFilter}")`
                            : `${postsData?.totalCount ?? 0} post totali`
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
        </div>

        {/* User Delete Confirmation Dialog */}
        <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            aria-labelledby="delete-user-dialog-title"
            aria-describedby="delete-user-dialog-description"
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '16px',
                  padding: '8px'
                }
              }
            }}
        >
          <DialogTitle id="delete-user-dialog-title" className="font-semibold text-xl">
            Conferma eliminazione utente
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-user-dialog-description" className="text-gray-700">
              Sei sicuro di voler eliminare l'utente "{user?.name}"?
              Tutti i post associati a questo utente verranno eliminati.
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
                onClick={handleDeleteUser}
                variant="contained"
                color="error"
                className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
                autoFocus
            >
              Elimina Utente
            </Button>
          </DialogActions>
        </Dialog>

        {/* Posts Bulk Delete Confirmation Dialog */}
        <Dialog
            open={bulkDeleteDialogOpen}
            onClose={() => setBulkDeleteDialogOpen(false)}
            aria-labelledby="bulk-delete-posts-dialog-title"
            aria-describedby="bulk-delete-posts-dialog-description"
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '16px',
                  padding: '8px'
                }
              }
            }}
        >
          <DialogTitle id="bulk-delete-posts-dialog-title" className="font-semibold text-xl">
            Conferma eliminazione post
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="bulk-delete-posts-dialog-description" className="text-gray-700">
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
                onClick={handleBulkDeletePosts}
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
      </div>
  );
}

export default UserDetails;