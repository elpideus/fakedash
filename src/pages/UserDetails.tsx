import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  TextField,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import type { MRT_ColumnDef, MRT_Row } from "material-react-table";

// Import shared components and hooks
import { useDashAPI } from '../context/APIContext.tsx';
import { useNavigationHelpers } from '../hooks/useNavigationHelpers.ts';
import { useDeleteConfirmation, useBulkDeleteConfirmation } from '../hooks/useDeleteConfirmation.ts';
import { useTableOperations } from '../hooks/useTableOperations.ts';
import { formatDate } from '../utils/dateUtils.ts';
import { validateUser } from '../utils/validationUtils.ts';
import { useAuth } from "../store/authStore.ts";

import LoadingState from "../components/common/LoadingState.tsx";
import ErrorState from "../components/common/ErrorState.tsx";
import ConfirmationDialog from "../components/common/ConfirmationDialog.tsx";
import HeaderActions from "../components/common/HeaderActions.tsx";
import ContentTable from "../components/ContentTable.tsx";
import { SecondaryButton } from "../components/common/Buttons.tsx";
import DeleteIcon from "@mui/icons-material/Delete";

// Interfaces
interface Post {
  id: string | number;
  title: string;
  content: string;
  createdAt: string;
}

interface EditedUserState {
  id: string;
  name: string;
  email: string;
}

function UserDetails() {
  const { userId } = useParams<{ userId: string }>();
  const { api, isLoading: apiLoading, error: apiError, refreshTrigger } = useDashAPI();
  const navigation = useNavigationHelpers();
  const { isAuthenticated, isOwner } = useAuth(); // Add this

  // User and Posts state - use refreshTrigger to get fresh data
  const user = userId ? api.getUser(userId) : null;
  const userPosts = useMemo(() => user?.posts || [], [user, refreshTrigger]);

  // Check if current user can edit/delete this user
  const canEditDelete = isAuthenticated && user && isOwner(user.id);

  // Edit state from URL
  const [isEditing, setIsEditing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Track if we're in the process of deleting

  // Initialize isEditing from URL on component mount
  useEffect(() => {
    const editParam = navigation.searchParams.get('edit');
    setIsEditing(editParam === 'true');
  }, [navigation.searchParams]);

  // Form state
  const [editedUser, setEditedUser] = useState<EditedUserState | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize editedUser when user changes
  useEffect(() => {
    if (user) {
      setEditedUser({
        id: String(user.id),
        name: user.name,
        email: user.email
      });
      setInitialized(true);
    }
  }, [user]);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Table operations
  const tableOps = useTableOperations({
    initialPagination: { pageIndex: 0, pageSize: 10 },
    syncWithUrl: true,
    searchParamKey: 'q'
  });

  // Delete confirmations - only if user is owner
  const userDeleteConfirmation = useDeleteConfirmation({
    onConfirm: async () => {
      setIsDeleting(true); // Set deleting flag
      if (user) {
        try {
          await user.delete();
          setSnackbar({
            open: true,
            message: 'Utente eliminato con successo',
            severity: 'success'
          });
          setTimeout(() => {
            navigation.navigateBack('/users');
          }, 1000);
        } catch (error) {
          console.error('Error deleting user:', error);
          setIsDeleting(false); // Reset on error
        }
      }
    },
    title: 'Conferma eliminazione utente',
    message: `Sei sicuro di voler eliminare l'utente "${user?.name}"? Tutti i post associati a questo utente verranno eliminati. Questa azione non può essere annullata.`
  });

  const bulkDeleteConfirmation = useBulkDeleteConfirmation({
    onConfirm: async () => {
      const selectedIds = Object.keys(tableOps.rowSelection);
      try {
        const deletePromises = selectedIds.map(id => {
          const post = api.getPost(id);
          // Check if user owns this post before deleting
          if (post && canEditDelete && String(post.userId) === String(user?.id)) {
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
          message: 'Errore nell\'eliminazione dei post',
          severity: 'error'
        });
      }
    },
    count: tableOps.selectedCount,
    itemName: 'post'
  });

  // Handlers
  const handleEditStart = useCallback(() => {
    if (canEditDelete) {
      navigation.updateSearchParams({ edit: 'true' });
      setIsEditing(true);
    }
  }, [navigation, canEditDelete]);

  const handleEditCancel = useCallback(() => {
    setValidationErrors([]);
    if (user) {
      setEditedUser({
        id: String(user.id),
        name: user.name,
        email: user.email
      });
    }
    navigation.updateSearchParams({ edit: null });
    setIsEditing(false);
  }, [user, navigation]);

  const handleSaveUser = useCallback(async () => {
    if (!editedUser || !user) return;

    const errors = validateUser(editedUser);
    if (errors.length > 0) {
      setValidationErrors(errors);
      setSnackbar({
        open: true,
        message: 'Correggi gli errori nel form',
        severity: 'error'
      });
      return;
    }

    try {
      // Update user properties
      Object.assign(user, {
        name: editedUser.name,
        email: editedUser.email
      });
      await user.save();

      setValidationErrors([]);
      navigation.updateSearchParams({ edit: null });
      setIsEditing(false);

      setSnackbar({
        open: true,
        message: 'Utente aggiornato con successo',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({
        open: true,
        message: 'Errore nell\'aggiornamento dell\'utente',
        severity: 'error'
      });
    }
  }, [editedUser, user, navigation]);

  const handleDoubleClick = useCallback(() => {
    if (!isEditing && canEditDelete) handleEditStart();
  }, [isEditing, handleEditStart, canEditDelete]);

  // Table logic
  const tableData = useMemo(() => {
    if (!userPosts) {
      return { posts: [], totalCount: 0 };
    }

    let filteredPosts = [...userPosts];

    if (tableOps.globalFilter) {
      const searchLower = tableOps.globalFilter.toLowerCase();
      filteredPosts = filteredPosts.filter((post: Post) => {
        return (
            post.title.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower) ||
            String(post.id).toLowerCase().includes(searchLower)
        );
      });
    }

    const totalCount = filteredPosts.length;
    const paginatedPosts = tableOps.applyPagination(filteredPosts);

    return {
      posts: paginatedPosts,
      totalCount
    };
  }, [userPosts, tableOps]);

  const handleViewPost = useCallback((post: Post) => {
    navigation.navigateToPost(String(post.id));
  }, [navigation]);

  const handleEditPost = useCallback((post: Post) => {
    // Only allow editing if user owns this post
    if (canEditDelete && String(post.userId) === String(user?.id)) {
      navigation.navigateToPost(String(post.id), true);
    }
  }, [navigation, canEditDelete, user]);

  const handleDeletePost = useCallback((post: Post) => {
    // Only allow deleting if user owns this post
    if (canEditDelete && String(post.userId) === String(user?.id)) {
      tableOps.setRowSelection({ [String(post.id)]: true });
      bulkDeleteConfirmation.openDialog();
    }
  }, [bulkDeleteConfirmation, tableOps, canEditDelete, user]);

  const columns = useMemo<MRT_ColumnDef<Post>[]>(() => [
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
        const content = cell.getValue<string>() || '';
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

  const getRowProps = useCallback(({ row }: { row: MRT_Row<Post> }) => ({
    onClick: (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('button') && !target.closest('input[type="checkbox"], .MuiCheckbox-root')) {
        handleViewPost(row.original);
      }
    },
    sx: { cursor: 'pointer' },
  }), [handleViewPost]);

  const renderTopToolbarCustomActions = useCallback(() => (
      <div className="flex gap-4 items-center">
        {tableOps.selectedCount > 0 && canEditDelete && (
            <Tooltip title="Elimina post selezionati">
              <IconButton
                  onClick={bulkDeleteConfirmation.openDialog}
                  className="bg-red-100 hover:bg-red-200 text-red-600"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
        )}
        <SecondaryButton><DownloadIcon /></SecondaryButton>
      </div>
  ), [tableOps.selectedCount, bulkDeleteConfirmation, canEditDelete]);

  // Detail panel
  const detailPanel = useCallback((post: Post) => {
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
            <p className="text-lg text-black/80 leading-relaxed pr-4 whitespace-pre-line">{displayContent}</p>
          </div>
          {showPreview && (
              <Button
                  variant="contained"
                  onClick={() => handleViewPost(post)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Leggi di più
              </Button>
          )}
        </div>
    );
  }, [handleViewPost]);

  // If we're deleting, show loading state immediately
  if (isDeleting || userDeleteConfirmation.isDeleting) {
    return (
        <LoadingState
            message="Eliminazione utente in corso..."
        />
    );
  }

  // Loading states - show loading until everything is initialized
  if (apiLoading || !api.isInitialized || !initialized) {
    return (
        <LoadingState
            message="Caricamento..."
        />
    );
  }

  // Error states
  if (apiError) {
    return (
        <ErrorState
            title="Errore"
            message="Impossibile caricare l'utente."
            showBackButton={true}
            onBack={() => navigation.navigateBack()}
        />
    );
  }

  if (!user) {
    return (
        <ErrorState
            title="Utente non trovato"
            message={`L'utente con ID "${userId}" non esiste.`}
            showBackButton={true}
            onBack={() => navigation.navigateBack()}
        />
    );
  }

  if (!editedUser) {
    return <LoadingState message="Caricamento dettagli utente..." />;
  }

  return (
      <div className="p-8 h-full overflow-auto">
        <div className="mb-6">
          <button
              onClick={navigation.navigateBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowBackIcon /> Torna indietro
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center" onDoubleClick={handleDoubleClick}>
            <div className="flex-1">
              {isEditing ? (
                  <div className="space-y-4">
                    <TextField
                        fullWidth
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        label="Nome"
                        error={validationErrors.some(err => err.includes('Nome'))}
                        helperText={validationErrors.find(err => err.includes('Nome'))}
                    />
                    <TextField
                        fullWidth
                        value={editedUser.email}
                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                        label="Email"
                        error={validationErrors.some(err => err.includes('Email'))}
                        helperText={validationErrors.find(err => err.includes('Email'))}
                    />
                  </div>
              ) : (
                  <div>
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-500 mt-2">{userPosts.length} post totali</p>
                  </div>
              )}
            </div>
            <div className="ml-4">
              <HeaderActions
                  isEditing={isEditing}
                  onEdit={handleEditStart}
                  onSave={handleSaveUser}
                  onCancel={handleEditCancel}
                  onDelete={canEditDelete ? userDeleteConfirmation.openDialog : undefined}
                  isDeleting={userDeleteConfirmation.isDeleting}
                  disableEdit={!canEditDelete}
                  disableSave={validationErrors.length > 0}
                  showDelete={canEditDelete}
              />
            </div>
          </div>

          <ContentTable<Post>
              columns={columns}
              data={tableData.posts ?? []}
              rowCount={tableData.totalCount ?? 0}
              pagination={tableOps.pagination}
              onPaginationChange={tableOps.setPagination}
              isLoading={false}
              isFetching={false}
              rowSelection={tableOps.rowSelection}
              onRowSelectionChange={tableOps.setRowSelection}
              getRowId={(row) => String(row.id)}
              enableRowSelection={true}
              enableRowActions={canEditDelete}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onView={handleViewPost}
              detailPanel={detailPanel}
              muiTableBodyRowProps={getRowProps}
              title={`Post di ${user.name}`}
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
              tableKey="user-details-posts"
          />
        </div>

        <ConfirmationDialog
            open={userDeleteConfirmation.isOpen}
            title={userDeleteConfirmation.dialogConfig.title}
            message={userDeleteConfirmation.dialogConfig.message}
            onConfirm={userDeleteConfirmation.handleConfirm}
            onCancel={() => {
              userDeleteConfirmation.closeDialog();
              setIsDeleting(false); // Reset deleting flag if cancelled
            }}
            confirmText="Elimina Utente"
            severity="error"
            isLoading={userDeleteConfirmation.isDeleting}
        />

        <ConfirmationDialog
            open={bulkDeleteConfirmation.isOpen}
            title={bulkDeleteConfirmation.dialogConfig.title}
            message={bulkDeleteConfirmation.dialogConfig.message}
            onConfirm={bulkDeleteConfirmation.handleConfirm}
            onCancel={bulkDeleteConfirmation.closeDialog}
            confirmText={`Elimina ${tableOps.selectedCount} post`}
            severity="error"
            isLoading={bulkDeleteConfirmation.isDeleting}
        />

        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
  );
}

export default UserDetails;