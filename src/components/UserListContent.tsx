import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// External libraries
import axios from "axios";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    type MRT_ColumnDef,
    type MRT_PaginationState,
    type MRT_Row, type MRT_RowSelectionState,
    type MRT_TableInstance
} from "material-react-table";

// Material-UI components
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Snackbar,
    Tooltip
} from '@mui/material';

// Local/relative imports
import { PrimaryButton, SecondaryButton } from "./Buttons.tsx";
import ContentTable from './ContentTable.tsx';
import { useTableStore } from '../hooks/useTableStore.ts';

/** Interface defining the data structure of the users used in this component */
interface User {
    id: string | number;
    name: string;
    email: string;
}

/** Component rendering into a table containing users */
function UserListContent() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();

    /** Zustand store for table state */
    const {
        userTable,
        setUserTablePagination,
        setUserTableGlobalFilter,
        setUserTableShowGlobalFilter,
        setUserTableSelection
    } = useTableStore();

    /** Initialize pagination from Zustand store */
    const [pagination, setPagination] = useState<MRT_PaginationState>(userTable.pagination);
    /** Stores the row selection */
    const rowSelection = userTable.rowSelection || {}; // Fallback prevents Object.keys crash
    const setRowSelection = (updater: MRT_RowSelectionState | ((old: MRT_RowSelectionState) => MRT_RowSelectionState)) => {
        const nextState = typeof updater === 'function' ? updater(rowSelection) : updater;
        setUserTableSelection(nextState);
    };

    /** Initialize global filter from URL param 'q' if present, otherwise from Zustand store */
    const [globalFilter, setGlobalFilter] = useState(() => {
        const urlQ = searchParams.get('q');
        return urlQ || userTable.globalFilter;
    });
    /** Track whether search toolbar should be shown */
    const [showGlobalFilter, setShowGlobalFilter] = useState(() => {
        const urlQ = searchParams.get('q');
        return !!urlQ || userTable.showGlobalFilter;
    });

    /** Initializes data for a snackbar (notification) */
    const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<(string | number)[]>([]);

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
        setUserTablePagination(pagination);
    }, [pagination, setUserTablePagination]);

    /** Save global filter to Zustand store whenever it changes */
    useEffect(() => {
        setUserTableGlobalFilter(globalFilter);
    }, [globalFilter, setUserTableGlobalFilter]);

    /** Save showGlobalFilter to Zustand store whenever it changes */
    useEffect(() => {
        setUserTableShowGlobalFilter(showGlobalFilter);
    }, [showGlobalFilter, setUserTableShowGlobalFilter]);

    /** Fetches users with pagination and filtering */
    const { data, isLoading, isError, isFetching } = useQuery<{ users: User[]; totalCount: number; }>({
        queryKey: ['users-list', pagination.pageIndex, pagination.pageSize, globalFilter],
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost'}:${import.meta.env.VITE_API_PORT || '3001'}/users`);
            let allUsers = res.data as User[];

            // Apply global filter from URL or search box
            if (globalFilter) {
                const searchLower = globalFilter.toLowerCase();
                allUsers = allUsers.filter((user: User) =>
                    user.name.toLowerCase().includes(searchLower) ||
                    user.email.toLowerCase().includes(searchLower) ||
                    String(user.id).toLowerCase().includes(searchLower)
                );
            }

            const totalCount = allUsers.length;
            const startIndex = pagination.pageIndex * pagination.pageSize;
            const endIndex = startIndex + pagination.pageSize;
            const paginatedUsers = allUsers.slice(startIndex, endIndex);

            return {
                users: paginatedUsers as User[],
                totalCount: totalCount,
            };
        },
        placeholderData: keepPreviousData,
    });

    /** Handle global filter change - reset to first page when searching */
    const handleGlobalFilterChange = (filter: string) => {
        setGlobalFilter(filter);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));
    };

    const handleDeleteUserClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleBulkDeleteClick = () => {
        const selectedIds = Object.keys(rowSelection);
        if (selectedIds.length === 0) return;
        setSelectedUserIds(selectedIds);
        setBulkDeleteDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setDeleteDialogOpen(false);

        try {
            // TODO: Actually implement deleting user

            // Refetching causes the table to "shift" items up from the next page
            await queryClient.invalidateQueries({ queryKey: ['users-list'] });

            setSnackbar({
                open: true,
                message: `Utente "${userToDelete.name}" eliminato`,
                severity: 'success'
            });
        } catch {
            setSnackbar({ open: true, message: 'Errore', severity: 'error' });
        }
        setUserToDelete(null);
    };

    const handleBulkDelete = async () => {
        setBulkDeleteDialogOpen(false);
        if (selectedUserIds.length === 0) return;

        try {
            // TODO: Actually implement deleting users

            setRowSelection({});
            await queryClient.invalidateQueries({ queryKey: ['users-list'] });

            setSnackbar({ open: true, message: `${selectedUserIds.length} utenti eliminati`, severity: 'success' });
        } catch {
            setSnackbar({ open: true, message: 'Errore', severity: 'error' });
        }
        setSelectedUserIds([]);
    };

    const handleEditUser = (user: User) => {
        navigate(`/users/edit/${user.id}`);
    };

    const handleViewUser = (user: User) => {
        navigate(`/users/${user.id}`);
    };

    const columns = React.useMemo<MRT_ColumnDef<User>[]>(() => [
        { accessorKey: 'name', header: 'Nome', size: 250 },
        { accessorKey: 'email', header: 'Email', size: 300 },
    ], []);

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
            <PrimaryButton startIcon={<AddIcon />}>Nuovo Utente</PrimaryButton>
            <SecondaryButton><DownloadIcon /></SecondaryButton>
        </div>
    );

    /** Returns the row props with consistent click behavior and styling */
    const getRowProps = ({ row }: { row: MRT_Row<User>, table: MRT_TableInstance<User> }) => ({
        onClick: (event: React.MouseEvent) => {
            const target = event.target as HTMLElement;
            const isActionButton = target.closest('button[class*="MuiIconButton"]');
            const isCheckbox = target.closest('input[type="checkbox"], .MuiCheckbox-root, [role="checkbox"]');

            if (!isActionButton && !isCheckbox) handleViewUser(row.original);
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
                    Impossibile caricare i dati. Assicurati che il server API sia attivo.
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
                    getRowId={(row) => String(row.id)}
                    enableRowSelection={true}
                    enableRowActions={true}
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUserClick}
                    onView={handleViewUser}
                    title="Gestione Utenti"
                    totalCountText={
                        isLoading
                            ? "Caricamento..."
                            : globalFilter
                                ? `${data?.totalCount ?? 0} risultati trovati (ricerca: "${globalFilter}")`
                                : `${data?.totalCount ?? 0} utenti totali`
                    }
                    selectedCount={selectedCount}
                    renderTopToolbarCustomActions={renderTopToolbarCustomActions}
                    globalFilter={globalFilter}
                    onGlobalFilterChange={(filter) => {
                        handleGlobalFilterChange(filter);
                        setShowGlobalFilter(filter.length > 0);
                    }}
                    showGlobalFilter={showGlobalFilter}
                    onShowGlobalFilterChange={setShowGlobalFilter}
                    muiTableBodyRowProps={getRowProps}
                />
            )}

            {/* Single Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
            >
                <DialogTitle className="font-semibold text-xl">Conferma eliminazione</DialogTitle>
                <DialogContent>
                    <DialogContentText className="text-gray-700">
                        Sei sicuro di voler eliminare l'utente "{userToDelete?.name}"? Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-6 pt-2">
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" className="rounded-lg border-gray-300 text-gray-700">
                        Annulla
                    </Button>
                    <Button onClick={handleDeleteUser} variant="contained" color="error" className="rounded-lg bg-red-600 hover:bg-red-700">
                        Elimina
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Delete Confirmation Dialog */}
            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => setBulkDeleteDialogOpen(false)}
                slotProps={{ paper: { sx: { borderRadius: '16px', padding: '8px' } } }}
            >
                <DialogTitle className="font-semibold text-xl">Conferma eliminazione multipla</DialogTitle>
                <DialogContent>
                    <DialogContentText className="text-gray-700">
                        Sei sicuro di voler eliminare {selectedUserIds.length} utenti selezionati? Questa azione non può essere annullata.
                    </DialogContentText>
                </DialogContent>
                <DialogActions className="p-6 pt-2">
                    <Button onClick={() => setBulkDeleteDialogOpen(false)} variant="outlined" className="rounded-lg border-gray-300 text-gray-700">
                        Annulla
                    </Button>
                    <Button onClick={handleBulkDelete} variant="contained" color="error" className="rounded-lg bg-red-600 hover:bg-red-700">
                        Elimina {selectedUserIds.length} utenti
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} className="shadow-lg">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

export default UserListContent;