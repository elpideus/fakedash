import React, { useState } from 'react';

// External libraries
import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { type MRT_ColumnDef, type MRT_PaginationState, type MRT_RowSelectionState } from "material-react-table";

// Material-UI components
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Tooltip } from '@mui/material';

// Local/relative imports
import { PrimaryButton, SecondaryButton } from "./Buttons.tsx";
import ContentTable from './ContentTable.tsx';

/** Interface defining the data structure of the users used in this component */
interface User {
    id: string | number;
    name: string;
    email: string;
}

/** Component rendering into a table containing users */
function UserListContent() {
    /** We use TanStack query for querying */
    const queryClient = useQueryClient();
    /** Define the pagination to start at page 0 and have 10 elements per page */
    const [pagination, setPagination] = useState<MRT_PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });
    /** Stores the row selection */
    const [rowSelection, setRowSelection] = useState<MRT_RowSelectionState>({});
    /** Initializes data for a snackbar (notification) in the bottom right corner of the screen */
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
        open: false,
        message: '',
        severity: 'success'
    });
    /** Keeps track and controls the "Are you sure you want to delete this" kind of dialogue showing up on screen. */
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    /** Same as the \[deleteDialogOpen, setDeleteDialogOpen\] but for bulk actions */
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    /** Stores the user that the logged in client chose to delete */
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    /** Stores the users selected for bulk action */
    const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);

    /** Fetches users with pagination using TanStack Query */
    const { data, isLoading, isError, isFetching, refetch } = useQuery<{ users: User[]; totalCount: number; }>({
        queryKey: ['users-list', pagination.pageIndex, pagination.pageSize],
        queryFn: async () => {
            try {
                const allUsersData = await axios.get("http://localhost:3001/users");
                const totalCount = allUsersData.data.length;
                const startIndex = pagination.pageIndex * pagination.pageSize;
                const endIndex = startIndex + pagination.pageSize;
                const allUsers = allUsersData.data;

                const sanitizedUsers = allUsers.map((user: User) => ({
                    id: user.id || '',
                    name: user.name || 'Nome non disponibile',
                    email: user.email || ''
                }));

                const paginatedUsers = sanitizedUsers.slice(startIndex, endIndex);

                return {
                    users: paginatedUsers as User[],
                    totalCount: totalCount,
                };
            } catch (error) {
                console.error('Error fetching users:', error);
                throw error;
            }
        },
        placeholderData: keepPreviousData,
    });

    /** Handle single delete click */
    const handleDeleteUserClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    /** Handle bulk delete click */
    const handleBulkDeleteClick = () => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;

        /** Gets the actual user IDs from the selected rows */
        const ids = selectedIds.map(index => {
            const rowIndex = parseInt(index);
            return data?.users[rowIndex]?.id;
        }).filter(id => id !== undefined);

        setSelectedUserIds(ids);
        setBulkDeleteDialogOpen(true);
    };

    /** Handle single delete confirmation */
    const handleDeleteUser = () => {
        if (!userToDelete) return;

        setDeleteDialogOpen(false);

        /** Updates cache */
        const currentData = queryClient.getQueryData(['users-list', pagination.pageIndex, pagination.pageSize]);
        if (currentData && typeof currentData === 'object' && 'users' in currentData && 'totalCount' in currentData) {
            const typedData = currentData as { users: User[], totalCount: number };
            const remainingUsers = typedData.users.filter(u => u.id !== userToDelete.id);

            queryClient.setQueryData(['users-list', pagination.pageIndex, pagination.pageSize], {
                users: remainingUsers,
                totalCount: typedData.totalCount - 1
            });
        }

        /** Sets the actual data to show inside the snackbar (notification) */
        setSnackbar({
            open: true,
            message: `Utente "${userToDelete.name}" eliminato con successo`,
            severity: 'success'
        });

        /** Clears the stored user to delete as it has been deleted
         TODO: Implement more robust deletion verification */
        setUserToDelete(null);
    };

    /** Handle bulk delete confirmation */
    const handleBulkDelete = async () => {
        setBulkDeleteDialogOpen(false);

        if (selectedUserIds.length === 0) return;

        /** Remove from local cache first for immediate UI update */
        const currentData = queryClient.getQueryData(['users-list', pagination.pageIndex, pagination.pageSize]);
        if (currentData && typeof currentData === 'object' && 'users' in currentData && 'totalCount' in currentData) {
            const typedData = currentData as { users: User[], totalCount: number };
            const remainingUsers = typedData.users.filter(user => !selectedUserIds.includes(user.id));
            const newTotalCount = typedData.totalCount - selectedUserIds.length;

            /** Update the query cache */
            queryClient.setQueryData(['users-list', pagination.pageIndex, pagination.pageSize], {
                users: remainingUsers,
                totalCount: newTotalCount
            });

            /** Check if we need to adjust pagination */
            const currentPageIndex = pagination.pageIndex;
            const pageSize = pagination.pageSize;

            /** If the current page is empty and not the first page, go to previous page */
            if (remainingUsers.length === 0 && currentPageIndex > 0)
                setPagination({
                    pageIndex: currentPageIndex - 1,
                    pageSize: pageSize
                });
            /** If we're on the first page, and it's empty after deletion, just refetch */
            else if (remainingUsers.length === 0 && currentPageIndex === 0) await refetch();
        }

        /** Show a success message in the snackbar (notification) */
        setSnackbar({
            open: true,
            message: `${selectedUserIds.length} utente(i) eliminati con successo`,
            severity: 'success'
        });

        /** Clear selection */
        setRowSelection({});
        setSelectedUserIds([]);

        /** Refetch data to fill empty spaces */
        setTimeout(() => { refetch() }, 100);
    };

    /** Handle editing a user */
    const handleEditUser = (user: User) => {
        // Navigate to edit user page or open modal
        alert(`Modifica utente: ${user.name}`);
        // TODO: Implement user page and edit feature
        // navigate(`/users/edit/${user.id}`);
    };

    /** Handle "view user" button */
    const handleViewUser = (user: User) => {
        // Navigate to user detail page
        alert(`Visualizza utente: ${user.name}`);
        // TODO: Implement user page and edit feature
        // navigate(`/users/${user.id}`);
    };

    /** Defines the columns for the Material React Table (MRT) */
    const columns = React.useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: 'name',
                header: 'Nome',
                size: 200,
            },
            {
                accessorKey: 'email',
                header: 'Email',
                size: 250,
            },
        ],
        [],
    );

    /** Stores number of selected users for batch action */
    const selectedCount = Object.keys(rowSelection).length;

    /** Component at the top of the page containing buttons such as the ones for adding new users and downloading the
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
            <PrimaryButton startIcon={<AddIcon />}>Nuovo Utente</PrimaryButton>
            <SecondaryButton><DownloadIcon /></SecondaryButton>
        </div>
    );

    /** Handle clicking anywhere on any given row except for the checkbox */
    const muiTableBodyRowProps = (row: never) => ({
        onClick: (event: React.MouseEvent) => {
            const isSelectionCheckbox = (event.target as HTMLElement).closest(
                'input[type="checkbox"], .Mui-Checkbox-root, [role="checkbox"]'
            );

            // @ts-expect-error Incompatible Type
            if (!isSelectionCheckbox) handleViewUser(row.original);
        },
        sx: {
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
        },
    });

    return (
        <>
            {isError ? (
                <div className="p-4 text-red-600 bg-red-100 rounded-lg">
                    Impossibile caricare i dati. Assicurati che `json-server --watch db.json --port 3001` sia attivo.
                </div>
            ) : (
                <ContentTable<User>
                    columns={columns}
                    data={data?.users ?? []}
                    rowCount={data?.totalCount ?? 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    rowSelection={rowSelection}
                    onRowSelectionChange={setRowSelection}
                    enableRowSelection={true}
                    enableRowActions={true}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUserClick}
                    onView={handleViewUser}
                    title="Gestione Utenti"
                    totalCountText={isLoading ? "Caricamento..." : `${data?.totalCount ?? 0} utenti totali`}
                    selectedCount={selectedCount}
                    renderTopToolbarCustomActions={renderTopToolbarCustomActions}
                    // @ts-expect-error Incompatible Type
                    muiTableBodyRowProps={muiTableBodyRowProps}
                />
            )}

            {/* Single Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-user-dialog-title"
                aria-describedby="delete-user-dialog-description"
                slotProps={{
                    paper: {
                        sx: { borderRadius: '16px', padding: '8px' }
                    }
                }}
            >
                <DialogTitle id="delete-user-dialog-title" className="font-semibold text-xl">
                    Conferma eliminazione
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-user-dialog-description" className="text-gray-700">
                        Sei sicuro di voler eliminare l'utente "{userToDelete?.name}"?
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
                        Elimina
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => setBulkDeleteDialogOpen(false)}
                aria-labelledby="bulk-delete-users-dialog-title"
                aria-describedby="bulk-delete-users-dialog-description"
                slotProps={{
                    paper: {
                        sx: { borderRadius: '16px', padding: '8px' }
                    }
                }}
            >
                <DialogTitle id="bulk-delete-users-dialog-title" className="font-semibold text-xl">
                    Conferma eliminazione multipla
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="bulk-delete-users-dialog-description" className="text-gray-700">
                        Sei sicuro di voler eliminare {selectedUserIds.length} utenti selezionati?
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
                        Elimina {selectedUserIds.length} utenti
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar as notifications */}
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

export default UserListContent;