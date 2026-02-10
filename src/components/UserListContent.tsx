import React, { useMemo, useCallback, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { IconButton, Tooltip, Alert, Snackbar } from "@mui/material";
import type { MRT_ColumnDef, MRT_Row } from "material-react-table";

// Import shared components and hooks
import { useDashAPI } from '../context/APIContext.tsx';
import { useNavigationHelpers } from '../hooks/useNavigationHelpers.ts';
import { useDeleteConfirmation, useBulkDeleteConfirmation } from '../hooks/useDeleteConfirmation.ts';
import { useTableOperations, createTextFilterFn } from '../hooks/useTableOperations.ts';
import { useAuth } from "../store/authStore.ts";

import ConfirmationDialog from "./common/ConfirmationDialog.tsx";
import ContentTable from "./ContentTable.tsx";
import { PrimaryButton, SecondaryButton } from "./common/Buttons.tsx";
import CreateUserDrawer from "./CreateUserDrawer.tsx";

// Types
interface User {
  id: string | number;
  name: string;
  email: string;
  postCount: number;
}

function UserListContent() {
  const { api, isLoading: apiLoading, error: apiError, refreshTrigger } = useDashAPI();
  const navigation = useNavigationHelpers();
  const { isAuthenticated, isOwner } = useAuth();

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Delete states - typed properly instead of 'any'
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Table operations
  const tableOps = useTableOperations({
    initialPagination: { pageIndex: 0, pageSize: 10 },
    syncWithUrl: true,
    searchParamKey: 'q',
    tableKey: 'userTable'
  });

  // Get all users - refreshTrigger ensures we get fresh data
  const allUsers = useMemo(() => {
    void refreshTrigger; // Tells TS/ESLint this is intentionally getting used as a dependency
    if (apiLoading || !api.isInitialized) {
      return [];
    }

    // CHANGE: Create a copy and reverse the array to show newest users (added to end) first
    return [...api.getUsers()].reverse().map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      postCount: user.posts.length
    })) as User[];
  }, [api, apiLoading, refreshTrigger]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (apiLoading || !api.isInitialized) {
      return { users: [], totalCount: 0 };
    }

    // Filter function for users
    const filterFn = createTextFilterFn<User>(['name', 'email']) as unknown as (item: Record<string, unknown>, filter: string) => boolean;
    const filteredUsers = tableOps.applyFiltersAndSorting(allUsers, filterFn);

    const totalCount = filteredUsers.length;
    const paginatedUsers = tableOps.applyPagination(filteredUsers) as User[];

    return {
      users: paginatedUsers,
      totalCount
    };
  }, [allUsers, apiLoading, api.isInitialized, tableOps]);

  // Check if user can edit/delete a specific user
  const canEditDeleteUser = useCallback((targetUser: User) => {
    return isAuthenticated && isOwner(targetUser.id);
  }, [isAuthenticated, isOwner]);

  // Delete confirmations
  const singleDeleteConfirmation = useDeleteConfirmation({
    onConfirm: async () => {
      if (userToDelete && canEditDeleteUser(userToDelete)) {
        try {
          const userObj = api.getUser(String(userToDelete.id));
          if (userObj) {
            await userObj.delete();
            setSnackbar({
              open: true,
              message: `Utente "${userToDelete.name}" eliminato`,
              severity: "success",
            });
            // Reset selection after delete
            tableOps.setRowSelection({});
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          setSnackbar({
            open: true,
            message: "Errore durante l'eliminazione dell'utente",
            severity: "error"
          });
        } finally {
          setUserToDelete(null);
        }
      }
    },
    title: 'Conferma eliminazione',
    message: `Sei sicuro di voler eliminare l'utente "${userToDelete?.name}"? Tutti i post associati a questo utente verranno eliminati. Questa azione non può essere annullata.`
  });

  const bulkDeleteConfirmation = useBulkDeleteConfirmation({
    onConfirm: async () => {
      const selectedIds = Object.keys(tableOps.rowSelection);
      try {
        const deletePromises = selectedIds.map(id => {
          const user = api.getUser(id);
          // Only delete if current user owns this user
          if (user && canEditDeleteUser({ id: user.id, name: user.name, email: user.email, postCount: user.posts.length })) {
            return user?.delete() || Promise.resolve();
          }
          return Promise.resolve();
        });
        await Promise.all(deletePromises);
        tableOps.setRowSelection({});
        setSnackbar({
          open: true,
          message: `${selectedIds.length} utenti eliminati con successo`,
          severity: "success",
        });
      } catch (error) {
        console.error('Error deleting users:', error);
        setSnackbar({
          open: true,
          message: "Errore durante l'eliminazione degli utenti",
          severity: "error"
        });
      }
    },
    count: tableOps.selectedCount,
    itemName: 'utenti'
  });

  // Handlers
  const handleDeleteUserClick = useCallback((user: User) => {
    if (canEditDeleteUser(user)) {
      setUserToDelete(user);
      singleDeleteConfirmation.openDialog();
    }
  }, [singleDeleteConfirmation, canEditDeleteUser]);

  const handleViewUser = useCallback((user: User) => {
    navigation.navigateToUser(String(user.id));
  }, [navigation]);

  const handleEditUser = useCallback((user: User) => {
    if (canEditDeleteUser(user)) {
      navigation.navigateToUser(String(user.id), true);
    }
  }, [navigation, canEditDeleteUser]);

  // Table columns - Typed correctly to avoid 'any'
  const columns = useMemo<MRT_ColumnDef<User>[]>(() => [
    {
      accessorKey: "name",
      header: "Nome",
      size: 200,
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 250,
      enableSorting: true,
    },
    {
      accessorKey: "postCount",
      header: "Post Scritti",
      size: 150,
      Cell: ({ cell }) => cell.getValue<number>() ?? 0,
      muiTableBodyCellProps: { align: "center" },
      muiTableHeadCellProps: { align: "center" },
      enableSorting: true,
    },
  ], []);

  // Row props - Typed correctly
  const getRowProps = useCallback(({ row }: { row: MRT_Row<User> }) => ({
    onClick: (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const isActionButton = target.closest("button");
      const isCheckbox = target.closest(
          'input[type="checkbox"], .MuiCheckbox-root',
      );

      if (!isActionButton && !isCheckbox) {
        handleViewUser(row.original);
      }
    },
    sx: {
      cursor: "pointer",
    },
  }), [handleViewUser]);

  // Top toolbar actions - only show if authenticated
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
                onClick={() => setIsCreateDrawerOpen(true)}
            >
              Nuovo Utente
            </PrimaryButton>
        )}
        <SecondaryButton>
          <DownloadIcon />
        </SecondaryButton>
      </div>
  ), [tableOps.selectedCount, bulkDeleteConfirmation, isAuthenticated]);

  if (apiError) {
    return (
        <div className="p-4 text-red-600 bg-red-100 rounded-lg">
          Impossibile caricare i dati. Assicurati che il server API sia attivo.
        </div>
    );
  }

  return (
      <>
        <ContentTable<User>
            columns={columns}
            data={tableData?.users ?? []}
            rowCount={tableData?.totalCount ?? 0}
            pagination={tableOps.pagination}
            onPaginationChange={tableOps.setPagination}
            isLoading={apiLoading || !api.isInitialized}
            isFetching={false}
            rowSelection={tableOps.rowSelection}
            onRowSelectionChange={tableOps.setRowSelection}
            getRowId={(row) => String(row.id)}
            enableRowSelection={isAuthenticated}
            enableRowActions={isAuthenticated}
            onEdit={handleEditUser}
            onDelete={handleDeleteUserClick}
            onView={handleViewUser}
            title="Gestione Utenti"
            totalCountText={
              apiLoading || !api.isInitialized
                  ? "Caricamento..."
                  : tableOps.globalFilter
                      ? `${tableData?.totalCount ?? 0} risultati trovati (ricerca: "${tableOps.globalFilter}")`
                      : `${tableData?.totalCount ?? 0} utenti totali`
            }
            selectedCount={tableOps.selectedCount}
            renderTopToolbarCustomActions={renderTopToolbarCustomActions}
            globalFilter={tableOps.globalFilter}
            onGlobalFilterChange={tableOps.setGlobalFilter}
            showGlobalFilter={tableOps.showGlobalFilter}
            onShowGlobalFilterChange={tableOps.setShowGlobalFilter}
            muiTableBodyRowProps={getRowProps}
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
            tableKey="users-table"
            isRowActionEnabled={(row) => canEditDeleteUser(row)}
        />

        <ConfirmationDialog
            open={singleDeleteConfirmation.isOpen}
            title={singleDeleteConfirmation.dialogConfig.title}
            message={singleDeleteConfirmation.dialogConfig.message}
            onConfirm={singleDeleteConfirmation.handleConfirm}
            onCancel={() => {
              singleDeleteConfirmation.closeDialog();
              setUserToDelete(null);
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
            confirmText={`Elimina ${tableOps.selectedCount} utenti`}
            cancelText="Annulla"
            severity="error"
            isLoading={bulkDeleteConfirmation.isDeleting}
        />

        <CreateUserDrawer
            open={isCreateDrawerOpen}
            onClose={() => setIsCreateDrawerOpen(false)}
            onSuccess={() => {
              setSnackbar({
                open: true,
                message: 'Utente creato con successo!',
                severity: 'success'
              });
            }}
        />

        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
              severity={snackbar.severity}
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              className="shadow-lg"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
  );
}

export default UserListContent;