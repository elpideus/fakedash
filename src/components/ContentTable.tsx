import React from 'react';
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_PaginationState,
    type MRT_RowData,
    type MRT_RowSelectionState,
    type MRT_Row,
    type MRT_TableInstance
} from "material-react-table";
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

/** Defines the Content Table Properties structure */
interface ContentTableProps<T extends MRT_RowData> {
    columns: MRT_ColumnDef<T>[];
    data: T[];
    rowCount: number;
    pagination: MRT_PaginationState;
    onPaginationChange: (pagination: MRT_PaginationState) => void;
    isLoading: boolean;
    isFetching: boolean;
    rowSelection?: MRT_RowSelectionState;
    onRowSelectionChange?: (rowSelection: MRT_RowSelectionState) => void;
    enableRowSelection?: boolean;
    enableRowActions?: boolean;
    showViewAction?: boolean;
    showEditAction?: boolean;
    showDeleteAction?: boolean;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    detailPanel?: (row: T) => React.ReactNode;
    muiTableBodyRowProps?: (props: {
        row: MRT_Row<T>;
        table: MRT_TableInstance<T>;
        staticRowIndex: number;
        isDetailPanel?: boolean;
    }) => React.HTMLAttributes<HTMLTableRowElement>;
    title: string;
    totalCountText?: string;
    selectedCount?: number;
    renderTopToolbarCustomActions?: () => React.ReactNode;
    globalFilter?: string;
    onGlobalFilterChange?: (filter: string) => void;
    showGlobalFilter?: boolean;
    onShowGlobalFilterChange?: (show: boolean) => void;
    getRowId?: (row: T) => string;
}

function ContentTable<T extends MRT_RowData>({
                                                 columns,
                                                 data,
                                                 rowCount,
                                                 pagination,
                                                 onPaginationChange,
                                                 isLoading,
                                                 isFetching,
                                                 rowSelection = {},
                                                 getRowId,
                                                 onRowSelectionChange,
                                                 enableRowSelection = false,
                                                 enableRowActions = false,
                                                 showViewAction = true,
                                                 showEditAction = true,
                                                 showDeleteAction = true,
                                                 onEdit,
                                                 onDelete,
                                                 onView,
                                                 detailPanel,
                                                 muiTableBodyRowProps,
                                                 title,
                                                 totalCountText,
                                                 selectedCount = 0,
                                                 renderTopToolbarCustomActions,
                                                 globalFilter = '',
                                                 onGlobalFilterChange,
                                                 showGlobalFilter = false,
                                                 onShowGlobalFilterChange
                                             }: ContentTableProps<T>) {

    /** Actions Area */
    const actionColumn: MRT_ColumnDef<T> = {
        id: 'actions',
        header: 'Azioni',
        size: 150,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
            <div className="flex gap-1">
                {showViewAction && onView && row.original && (
                    <Tooltip title="Visualizza">
                        <IconButton
                            size="small"
                            onClick={() => onView(row.original)}
                            className="text-black/80 hover:bg-black/10"
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                {showEditAction && onEdit && row.original && (
                    <Tooltip title="Modifica">
                        <IconButton
                            size="small"
                            onClick={() => onEdit(row.original)}
                            className="text-black/80 hover:bg-black/10"
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
                {showDeleteAction && onDelete && row.original && (
                    <Tooltip title="Elimina">
                        <IconButton
                            size="small"
                            onClick={() => onDelete(row.original)}
                            className="text-black/80 hover:bg-black/10"
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </div>
        ),
    };

    const finalColumns = enableRowActions
        ? [...columns, actionColumn]
        : columns;

    /** Safe detail panel renderer */
    const renderDetailPanelSafe = detailPanel
        ? ({ row }: { row: MRT_Row<T>; table: MRT_TableInstance<T> }) => {
            if (!row.original) {
                return (
                    <div className="p-4 bg-black/5 text-black/60">
                        Dati non disponibili
                    </div>
                );
            }
            try {
                return detailPanel(row.original);
            } catch (error) {
                console.error('Error rendering detail panel:', error);
                return (
                    <div className="p-4 bg-black/10 text-black/70">
                        Errore nel caricamento dei dettagli
                    </div>
                );
            }
        }
        : undefined;

    return (
        <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
            <div className="mb-4 mt-6">
                <h1 className="text-4xl font-light text-black/80">{title}</h1>
                <div className="flex justify-between items-center -mt-2">
                    <span className="text-sm text-black/50">
                        {isLoading ? "Caricamento..." : totalCountText || `${rowCount} elementi totali`}
                        {selectedCount > 0 && (
                            <span className="ml-4 text-black/50 font-medium">
                                {selectedCount} selezionati
                            </span>
                        )}
                    </span>
                    {renderTopToolbarCustomActions && renderTopToolbarCustomActions()}
                </div>
            </div>

            <MaterialReactTable
                columns={finalColumns}
                data={data}
                manualPagination
                manualFiltering
                getRowId={getRowId}
                rowCount={rowCount}
                enableRowSelection={enableRowSelection}
                onRowSelectionChange={(updaterOrValue) => {
                    const newSelection =
                        typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
                    onRowSelectionChange?.(newSelection);
                }}
                onPaginationChange={(updaterOrValue) => {
                    const newPagination =
                        typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
                    onPaginationChange(newPagination);
                }}
                onGlobalFilterChange={(updaterOrValue) => {
                    const newFilter =
                        typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter) : updaterOrValue;
                    onGlobalFilterChange?.(newFilter ?? '');
                }}
                onShowGlobalFilterChange={(updaterOrValue) => {
                    const newShowGlobalFilter =
                        typeof updaterOrValue === 'function' ? updaterOrValue(showGlobalFilter) : updaterOrValue;
                    onShowGlobalFilterChange?.(newShowGlobalFilter);
                }}
                state={{
                    isLoading,
                    pagination,
                    rowSelection,
                    showProgressBars: isFetching,
                    globalFilter,
                    showGlobalFilter,
                }}
                muiTableBodyRowProps={({ row, table, staticRowIndex, isDetailPanel }) => {
                    const isSelected = row.getIsSelected();
                    const baseProps = muiTableBodyRowProps ? muiTableBodyRowProps({
                        row,
                        table,
                        staticRowIndex,
                        isDetailPanel
                    }) : {};

                    return {
                        ...baseProps, // This ensures onClick and other props are passed through
                        style: {
                            ...(baseProps.style || {}),
                            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.08) !important' : 'transparent',
                        },
                        // Ensure standard event handlers are preserved
                        onClick: baseProps.onClick,
                        onMouseEnter: baseProps.onMouseEnter,
                        onMouseLeave: baseProps.onMouseLeave,
                        sx: {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            ...baseProps.sx,
                            '&:hover': {
                                backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.12) !important' : 'rgba(0, 0, 0, 0.04)',
                            },
                        },
                    };
                }}
                renderDetailPanel={renderDetailPanelSafe}
                muiTablePaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: '16px',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden',
                        '& .MuiTableRow-root.Mui-selected': {
                            backgroundColor: 'rgba(0, 0, 0, 0.08) !important',
                        },
                        '& .MuiTableRow-root.Mui-selected:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.12) !important',
                        },
                        '& .MuiButton-text': {
                            color: 'rgba(0, 0, 0, 0.8)',
                            textTransform: 'none',
                            fontWeight: 500,
                            padding: ".5em 1em .5em 1em"
                        },
                        '& .MuiButton-text:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                    }
                }}
                muiTableContainerProps={{
                    sx: {
                        flexGrow: 1,
                        overflow: 'auto'
                    }
                }}
                muiTableBodyRowDragHandleProps={{
                    sx: {
                        color: 'rgba(0, 0, 0, 0.5)',
                    }
                }}
                muiBottomToolbarProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                    }
                }}
                muiTopToolbarProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                        '& .MuiAlert-root': {
                            backgroundColor: 'transparent',
                            color: 'rgba(0, 0, 0, 0.8)',
                            padding: '0',
                        },
                        '& .MuiAlert-message': {
                            padding: '8px 0',
                        },
                    }
                }}
                muiTableHeadCellProps={{
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        color: 'rgba(0, 0, 0, 0.8)',
                        fontWeight: 600,
                        '& .MuiCheckbox-root': {
                            color: 'rgba(0, 0, 0, 0.6)',
                            '&.Mui-checked': {
                                color: 'rgba(0, 0, 0, 0.8)',
                            },
                        },
                    }
                }}
                muiTableBodyCellProps={{
                    sx: {
                        color: 'rgba(0, 0, 0, 0.7)',
                    }
                }}
                muiSelectCheckboxProps={{
                    sx: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-checked': {
                            color: 'rgba(0, 0, 0, 0.8)',
                        }
                    }
                }}
                muiSelectAllCheckboxProps={{
                    sx: {
                        color: 'rgba(0, 0, 0, 0.6)',
                        '&.Mui-checked': {
                            color: 'rgba(0, 0, 0, 0.8)',
                        }
                    }
                }}
                muiRowNumbersProps={{
                    sx: {
                        color: 'rgba(0, 0, 0, 0.5)',
                    }
                }}
                enableGlobalFilterModes
                enableColumnOrdering
                enableColumnFilters={false}
                enableSorting
                enableFilters
                enableHiding
                enableGlobalFilter
                enableDensityToggle
                enableFullScreenToggle
                enableStickyHeader
                localization={{
                    actions: 'Azioni',
                    and: 'e',
                    cancel: 'Annulla',
                    changeFilterMode: 'Cambia modalità filtro',
                    changeSearchMode: 'Cambia modalità ricerca',
                    clearFilter: 'Pulisci filtro',
                    clearSearch: 'Pulisci ricerca',
                    clearSort: 'Pulisci ordinamento',
                    clickToCopy: 'Clicca per copiare',
                    columnActions: 'Azioni colonna',
                    copiedToClipboard: 'Copiato negli appunti',
                    dropToGroupBy: 'Rilascia per raggruppare per {column}',
                    // @ts-expect-error Unknown Property
                    filter: 'Filtro',
                    filterByColumn: 'Filtra per {column}',
                    filterMode: 'Modalità filtro: {filterType}',
                    grab: 'Afferra',
                    groupByColumn: 'Raggruppa per {column}',
                    groupedBy: 'Raggruppato per ',
                    hideAll: 'Nascondi tutto',
                    hideColumn: 'Nascondi colonna {column}',
                    max: 'Max',
                    min: 'Min',
                    noRecordsToDisplay: 'Nessun record da visualizzare',
                    noResultsFound: 'Nessun risultato trovato',
                    of: 'di',
                    or: 'o',
                    pin: 'Fissa',
                    pinToLeft: 'Fissa a sinistra',
                    pinToRight: 'Fissa a destra',
                    resetColumnSize: 'Reimposta dimensione colonna',
                    resetOrder: 'Reimposta ordine',
                    rowActions: 'Azioni riga',
                    rowNumber: '#',
                    rowNumbers: 'Numeri riga',
                    rowsPerPage: 'Righe per pagina',
                    save: 'Salva',
                    search: 'Cerca',
                    selectedCountOfRowCountRowsSelected: '{selectedCount} di {rowCount} righe selezionate',
                    select: 'Seleziona',
                    showAll: 'Mostra tutto',
                    showAllColumns: 'Mostra tutte le colonne',
                    showHideColumns: 'Mostra/Nascondi colonne',
                    showHideFilters: 'Mostra/Nascondi filtri',
                    showHideSearch: 'Mostra/Nascondi ricerca',
                    sortByColumnAsc: 'Ordina per {column} ascendente',
                    sortByColumnDesc: 'Ordina per {column} discendente',
                    thenBy: ', poi per ',
                    toggleDensity: 'Cambia densità',
                    toggleFullScreen: 'Attiva/disattiva schermo intero',
                    toggleSelectAll: 'Attiva/disattiva selezione tutto',
                    toggleSelectRow: 'Attiva/disattiva selezione riga',
                    toggleVisibility: 'Attiva/disattiva visibilità',
                    ungroupByColumn: 'Separa per {column}',
                    unpin: 'Sblocca',
                    unpinAll: 'Sblocca tutto',
                    clearSelection: 'Deseleziona',
                }}
            />
        </div>
    );
}

export default ContentTable;