import React, { useRef, useEffect } from 'react';
import {
    MaterialReactTable,
    type MRT_ColumnDef,
    type MRT_PaginationState,
    type MRT_RowData,
    type MRT_RowSelectionState,
    type MRT_Row,
    type MRT_TableInstance,
    type MRT_SortingState,
    type MRT_ColumnOrderState,
    type MRT_VisibilityState
} from "material-react-table";
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';

/**
 * Properties for the {@link ContentTable} component.
 * @template T - The data structure representing a single row.
 */
interface ContentTableProps<T extends MRT_RowData> {
    /** Column definitions following Material React Table specification. */
    columns: MRT_ColumnDef<T>[];
    /** The array of data objects to be displayed in the table. */
    data: T[];
    /** Total number of rows available on the server (for manual pagination). */
    rowCount: number;
    /** Current state of pagination (pageIndex and pageSize). */
    pagination: MRT_PaginationState;
    /** Callback triggered when pagination state changes. */
    onPaginationChange: (pagination: MRT_PaginationState) => void;
    /** Flag to show the global loading overlay. */
    isLoading: boolean;
    /** Flag to show progress bars during background data fetching. */
    isFetching: boolean;
    /** Object representing the currently selected rows. */
    rowSelection?: MRT_RowSelectionState;
    /** Callback triggered when row selection state changes. */
    onRowSelectionChange?: (rowSelection: MRT_RowSelectionState) => void;
    /** Whether to enable checkboxes for row selection. */
    enableRowSelection?: boolean;
    /** Whether to enable the built-in actions column. */
    enableRowActions?: boolean;
    /** Whether to show the 'View' icon in the actions column. */
    showViewAction?: boolean;
    /** Whether to show the 'Edit' icon in the actions column. */
    showEditAction?: boolean;
    /** Whether to show the 'Delete' icon in the actions column. */
    showDeleteAction?: boolean;
    /** Callback function triggered when the Edit action is clicked. */
    onEdit?: (row: T) => void;
    /** Callback function triggered when the Delete action is clicked. */
    onDelete?: (row: T) => void;
    /** Callback function triggered when the View action is clicked. */
    onView?: (row: T) => void;
    /** Optional function to render a detail panel when a row is expanded. */
    detailPanel?: (row: T) => React.ReactNode;
    /** Custom styling or attributes for the table body rows. */
    muiTableBodyRowProps?: (props: {
        row: MRT_Row<T>;
        table: MRT_TableInstance<T>;
        staticRowIndex: number;
        isDetailPanel?: boolean;
    }) => React.HTMLAttributes<HTMLTableRowElement>;
    /** The title displayed in the header area. */
    title: string;
    /** Custom text for the total count display (e.g., "50 results found"). */
    totalCountText?: string;
    /** Number of currently selected items. */
    selectedCount?: number;
    /** Function to render custom buttons/actions in the top right toolbar. */
    renderTopToolbarCustomActions?: () => React.ReactNode;
    /** Current value of the global search filter. */
    globalFilter?: string;
    /** Callback triggered when the global filter value changes. */
    onGlobalFilterChange?: (filter: string) => void;
    /** Whether the search input is currently visible. */
    showGlobalFilter?: boolean;
    /** Callback triggered when the visibility of the global filter changes. */
    onShowGlobalFilterChange?: (show: boolean) => void;
    /** Custom function to get a unique ID for each row. */
    getRowId?: (row: T) => string;
    /** Current sorting state. */
    sorting?: MRT_SortingState;
    /** Callback triggered when sorting changes. */
    onSortingChange?: (sorting: MRT_SortingState) => void;
    /** Array representing the order of columns. */
    columnOrder?: MRT_ColumnOrderState;
    /** Callback triggered when column order is changed. */
    onColumnOrderChange?: (columnOrder: MRT_ColumnOrderState) => void;
    /** State for hidden/visible columns. */
    columnVisibility?: MRT_VisibilityState;
    /** Callback triggered when column visibility changes. */
    onColumnVisibilityChange?: (columnVisibility: MRT_VisibilityState) => void;
    /** Configuration for pinned columns (left or right). */
    columnPinning?: { left?: string[], right?: string[] };
    /** Callback triggered when column pinning changes. */
    onColumnPinningChange?: (columnPinning: { left?: string[], right?: string[] }) => void;
    /** Vertical scroll position of the table container in pixels. */
    scrollPosition?: number;
    /** Callback triggered after scrolling (debounced) to save the position. */
    onScrollPositionChange?: (scrollPosition: number) => void;
    /** Unique key to track this table instance (useful for persistent state). */
    tableKey?: string;
    /** Function to determine if actions should be visible for a specific row. */
    isRowActionEnabled?: (row: T) => boolean;
}

/**
 * An abstraction over Material React Table providing standardized styling and behavior.
 * @remarks
 * This component implements several advanced features:
 * - **Manual State Management:** Pagination, filtering, and sorting are expected to be handled by the parent (server-side).
 * - **Scroll Persistence:** Automatically restores the vertical scroll position after data refreshes using `requestAnimationFrame`.
 * - **Action Handling:** Injects an "Actions" column if `enableRowActions` is true.
 * - **Localization:** Provides a complete Italian translation for the table UI.
 *
 * @component
 */
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
                                                 onShowGlobalFilterChange,
                                                 sorting = [],
                                                 onSortingChange,
                                                 columnOrder = [],
                                                 onColumnOrderChange,
                                                 columnVisibility = {},
                                                 onColumnVisibilityChange,
                                                 columnPinning = { left: [], right: [] },
                                                 onColumnPinningChange,
                                                 scrollPosition = 0,
                                                 onScrollPositionChange,
                                                 isRowActionEnabled
                                             }: ContentTableProps<T>) {

    /** Reference to the underlying table container for scroll management. */
    const tableContainerRef = useRef<HTMLDivElement>(null);
    /** Ref for debouncing the scroll callback to optimize performance. */
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Prevents redundant scroll restoration after the initial data load. */
    const isInitialScrollDone = useRef(false);

    /**
     * Handles the container scroll event and notifies the parent of the new position.
     * Uses a 150ms debounce to prevent state-update thrashing.
     */
    const handleScroll = () => {
        if (!tableContainerRef.current) return;
        const scrollTop = tableContainerRef.current.scrollTop;

        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
            onScrollPositionChange?.(scrollTop);
        }, 150);
    };

    /**
     * Effect: Restores scroll position once data fetching is complete.
     */
    useEffect(() => {
        if (!isLoading && !isFetching && tableContainerRef.current && scrollPosition > 0 && !isInitialScrollDone.current) {
            requestAnimationFrame(() => {
                if (tableContainerRef.current) {
                    tableContainerRef.current.scrollTop = scrollPosition;
                    isInitialScrollDone.current = true;
                }
            });
        }
    }, [isLoading, isFetching, scrollPosition]);

    /**
     * Effect: Resets scroll tracking when the page index changes.
     */
    useEffect(() => {
        isInitialScrollDone.current = false;
    }, [pagination.pageIndex]);

    /**
     * Cleanup scroll timeout on unmount.
     */
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    /**
     * Internally generated column for row-level actions (Edit, View, Delete).
     */
    const actionColumn: MRT_ColumnDef<T> = {
        id: 'actions',
        header: 'Azioni',
        size: 150,
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => {
            const isActionEnabled = isRowActionEnabled ? isRowActionEnabled(row.original) : true;
            if (!isActionEnabled) return null;

            return (
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
            );
        },
    };

    const finalColumns = enableRowActions
        ? [...columns, actionColumn]
        : columns;

    /**
     * Wraps the detail panel renderer in a boundary to prevent row-level crashes
     * from breaking the entire table.
     */
    const renderDetailPanelSafe = detailPanel
        ? ({ row }: { row: MRT_Row<T>; table: MRT_TableInstance<T> }) => {
            if (!row.original) {
                return <div className="p-4 bg-black/5 text-black/60">Dati non disponibili</div>;
            }
            try {
                return detailPanel(row.original);
            } catch (error) {
                console.error('Error rendering detail panel:', error);
                return <div className="p-4 bg-black/10 text-black/70">Errore nel caricamento dei dettagli</div>;
            }
        }
        : undefined;

    return (
        <div className="flex-1 px-4 pb-4 overflow-hidden flex flex-col">
            {/* Table Header Section */}
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
                manualSorting
                getRowId={getRowId}
                rowCount={rowCount}
                enableRowSelection={enableRowSelection}
                onRowSelectionChange={(updaterOrValue) => {
                    const newSelection = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection) : updaterOrValue;
                    onRowSelectionChange?.(newSelection);
                }}
                onPaginationChange={(updaterOrValue) => {
                    const newPagination = typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
                    onPaginationChange(newPagination);
                }}
                onSortingChange={(updaterOrValue) => {
                    const newSorting = typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
                    onSortingChange?.(newSorting);
                }}
                onColumnOrderChange={(updaterOrValue) => {
                    const newColumnOrder = typeof updaterOrValue === 'function' ? updaterOrValue(columnOrder) : updaterOrValue;
                    onColumnOrderChange?.(newColumnOrder);
                }}
                onColumnVisibilityChange={(updaterOrValue) => {
                    const newColumnVisibility = typeof updaterOrValue === 'function' ? updaterOrValue(columnVisibility) : updaterOrValue;
                    onColumnVisibilityChange?.(newColumnVisibility);
                }}
                onColumnPinningChange={(updaterOrValue) => {
                    const newColumnPinning = typeof updaterOrValue === 'function' ? updaterOrValue(columnPinning) : updaterOrValue;
                    onColumnPinningChange?.(newColumnPinning);
                }}
                onGlobalFilterChange={(updaterOrValue) => {
                    const newFilter = typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter) : updaterOrValue;
                    onGlobalFilterChange?.(newFilter ?? '');
                }}
                onShowGlobalFilterChange={(updaterOrValue) => {
                    const newShowGlobalFilter = typeof updaterOrValue === 'function' ? updaterOrValue(showGlobalFilter) : updaterOrValue;
                    onShowGlobalFilterChange?.(newShowGlobalFilter);
                }}
                state={{
                    isLoading,
                    pagination,
                    rowSelection,
                    sorting,
                    columnOrder,
                    columnVisibility,
                    columnPinning,
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
                        ...baseProps,
                        style: {
                            ...(baseProps.style || {}),
                            backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.08) !important' : 'transparent',
                        },
                        sx: {
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
                    }
                }}
                muiTableContainerProps={{
                    ref: tableContainerRef,
                    onScroll: handleScroll,
                    sx: {
                        flexGrow: 1,
                        overflow: 'auto'
                    }
                }}
                // Custom localization for the Italian market
                localization={{
                    noRecordsToDisplay: 'Nessun record da visualizzare',
                    noResultsFound: 'Nessun risultato trovato',
                    rowsPerPage: 'Righe per pagina',
                    selectedCountOfRowCountRowsSelected: '{selectedCount} di {rowCount} righe selezionate',
                    // ... (rest of localizations)
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
            />
        </div>
    );
}

export default ContentTable;