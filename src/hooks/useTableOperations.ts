import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {
    MRT_ColumnOrderState,
    MRT_ColumnPinningState,
    MRT_PaginationState,
    MRT_RowSelectionState,
    MRT_SortingState,
    MRT_VisibilityState
} from 'material-react-table';
import {useTableStore} from '../store/useTableStore.ts';
import type {TableKey} from '../types';

/**
 * Configuration options for the useTableOperations hook
 * @interface UseTableOperationsOptions
 */
interface UseTableOperationsOptions {
    /** Initial pagination state */
    initialPagination?: MRT_PaginationState;
    /** Initial sorting state */
    initialSorting?: MRT_SortingState;
    /** Initial global filter value */
    initialGlobalFilter?: string;
    /** Callback when pagination changes */
    onPaginationChange?: (pagination: MRT_PaginationState) => void;
    /** Callback when sorting changes */
    onSortingChange?: (sorting: MRT_SortingState) => void;
    /** Callback when global filter changes */
    onGlobalFilterChange?: (filter: string) => void;
    /** Callback when row selection changes */
    onRowSelectionChange?: (selection: MRT_RowSelectionState) => void;
    /** Whether to sync filter state with URL */
    syncWithUrl?: boolean;
    /** URL parameter key for search */
    searchParamKey?: string;
    /** Unique key for table state persistence */
    tableKey?: TableKey;
}

/**
 * Hook for common table operations (filtering, pagination, sorting, selection)
 * with Zustand persistence support
 *
 * @template T - The type of data items in the table
 * @param {UseTableOperationsOptions} options - Configuration options
 * @returns {TableOperationsReturn<T>} Table operations object with state and methods
 *
 * @example
 * const tableOps = useTableOperations<User>({
 *   tableKey: 'users',
 *   initialPagination: { pageIndex: 0, pageSize: 10 }
 * });
 */
export const useTableOperations = <T extends Record<string, unknown>>({
                                                                          initialPagination = { pageIndex: 0, pageSize: 10 },
                                                                          initialSorting = [],
                                                                          initialGlobalFilter = '',
                                                                          onPaginationChange,
                                                                          onSortingChange,
                                                                          onRowSelectionChange,
                                                                          syncWithUrl = false,
                                                                          searchParamKey = 'q',
                                                                          tableKey
                                                                      }: UseTableOperationsOptions = {}) => {
    // Get the Zustand store
    const store = useTableStore();

    /**
     * Interface for the table state
     */
    interface TableState {
        pagination: MRT_PaginationState;
        sorting: MRT_SortingState;
        globalFilter: string;
        showGlobalFilter: boolean;
        rowSelection: MRT_RowSelectionState;
        columnOrder: MRT_ColumnOrderState;
        columnVisibility: MRT_VisibilityState;
        columnPinning: MRT_ColumnPinningState;
        scrollPosition: number;
    }

    /**
     * Gets initial state from Zustand store or defaults
     * @returns {TableState} Initial state object
     */
    const getInitialState = useCallback((): TableState => {
        if (tableKey && store) {
            const storedState = store[tableKey];
            if (storedState) {
                return {
                    pagination: storedState.pagination,
                    sorting: storedState.sorting,
                    globalFilter: storedState.globalFilter,
                    showGlobalFilter: storedState.showGlobalFilter,
                    rowSelection: storedState.rowSelection,
                    columnOrder: storedState.columnOrder,
                    columnVisibility: storedState.columnVisibility,
                    columnPinning: storedState.columnPinning,
                    scrollPosition: storedState.scrollPosition,
                };
            }
        }
        return {
            pagination: initialPagination,
            sorting: initialSorting,
            globalFilter: initialGlobalFilter,
            showGlobalFilter: false,
            rowSelection: {},
            columnOrder: [],
            columnVisibility: {},
            columnPinning: { left: [], right: [] },
            scrollPosition: 0,
        };
    }, [tableKey, store, initialPagination, initialSorting, initialGlobalFilter]);

    const initialState = useMemo(() => getInitialState(), [getInitialState]);

    // State management
    const [pagination, setPaginationState] = useState<MRT_PaginationState>(initialState.pagination);
    const [sorting, setSortingState] = useState<MRT_SortingState>(initialState.sorting);
    const [globalFilter, setGlobalFilterState] = useState<string>(initialState.globalFilter);
    const [rowSelection, setRowSelectionState] = useState<MRT_RowSelectionState>(initialState.rowSelection);
    const [showGlobalFilter, setShowGlobalFilterState] = useState<boolean>(initialState.showGlobalFilter);
    const [columnOrder, setColumnOrderState] = useState<MRT_ColumnOrderState>(initialState.columnOrder);
    const [columnVisibility, setColumnVisibilityState] = useState<MRT_VisibilityState>(initialState.columnVisibility);
    const [columnPinning, setColumnPinningState] = useState<MRT_ColumnPinningState>(initialState.columnPinning);
    const [scrollPosition, setScrollPositionState] = useState<number>(initialState.scrollPosition);

    /**
     * Maps internal property names to store property names
     * @param {string} property - Internal property name
     * @returns {string} Store property name
     */
    const getStorePropertyName = useCallback((property: string): string => {
        const propertyMap: Record<string, string> = {
            pagination: 'pagination',
            sorting: 'sorting',
            globalFilter: 'globalFilter',
            showGlobalFilter: 'showGlobalFilter',
            rowSelection: 'selection',
            columnOrder: 'columnOrder',
            columnVisibility: 'columnVisibility',
            columnPinning: 'columnPinning',
            scrollPosition: 'scrollPosition'
        };

        return propertyMap[property] || property;
    }, []);

    /**
     * Gets the Zustand store setter name for a property
     * @param {string} property - Property name
     * @returns {keyof typeof store | null} Store setter name or null
     */
    const getSetterName = useCallback((property: string): keyof typeof store | null => {
        if (!tableKey) return null;

        const tableKeyFormatted = tableKey.charAt(0).toUpperCase() + tableKey.slice(1);
        const storeProperty = getStorePropertyName(property);
        const propertyFormatted = storeProperty.charAt(0).toUpperCase() + storeProperty.slice(1);
        return `set${tableKeyFormatted}${propertyFormatted}` as keyof typeof store;
    }, [tableKey, getStorePropertyName]);

    /**
     * Updates Zustand store with new state
     * @param {string} property - Property name to update
     * @param {unknown} value - New value
     */
    const updateStore = useCallback((property: string, value: unknown) => {
        if (!tableKey || !store) return;

        const setterName = getSetterName(property);
        if (setterName && typeof store[setterName] === 'function') {
            (store[setterName] as (value: unknown) => void)(value);
        }
    }, [tableKey, store, getSetterName]);

    /** Sets the visibility of the global filter */
    const setShowGlobalFilter = useCallback((show: boolean) => {
        setShowGlobalFilterState(show);
        if (!show) {
            setGlobalFilterState(''); // Use the state setter directly
            updateStore('globalFilter', '');
        }
        updateStore('showGlobalFilter', show);
    }, [updateStore]);

    /**
     * Wrapped pagination setter with store persistence
     */
    const setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>> = useCallback((updater) => {
        setPaginationState((prev) => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            onPaginationChange?.(nextValue);
            updateStore('pagination', nextValue);
            return nextValue;
        });
    }, [onPaginationChange, updateStore]);

    /**
     * Wrapped sorting setter with store persistence
     */
    const setSorting: React.Dispatch<React.SetStateAction<MRT_SortingState>> = useCallback((updater) => {
        setSortingState((prev) => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            onSortingChange?.(nextValue);
            updateStore('sorting', nextValue);
            return nextValue;
        });
    }, [onSortingChange, updateStore]);

    /**
     * Wrapped row selection setter with store persistence
     */
    const setRowSelection: React.Dispatch<React.SetStateAction<MRT_RowSelectionState>> = useCallback((updater) => {
        setRowSelectionState((prev) => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            onRowSelectionChange?.(nextValue);
            updateStore('rowSelection', nextValue);
            return nextValue;
        });
    }, [onRowSelectionChange, updateStore]);

    /**
     * Sets global filter value and resets pagination
     * @param {string} filter - Filter value
     */
    const setGlobalFilter = useCallback((filter: string) => {
        setGlobalFilterState(filter);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));

        if (filter.trim()) {
            // Use the state setter directly instead of setShowGlobalFilter
            setShowGlobalFilterState(true);
            updateStore('showGlobalFilter', true);
        }

        updateStore('globalFilter', filter);
    }, [setPagination, updateStore]);

    /**
     * Sets column order with store persistence
     * @param {MRT_ColumnOrderState} newOrder - New column order
     */
    const setColumnOrder = useCallback((newOrder: MRT_ColumnOrderState) => {
        setColumnOrderState(newOrder);
        updateStore('columnOrder', newOrder);
    }, [updateStore]);

    /**
     * Sets column visibility with store persistence
     * @param {MRT_VisibilityState} newVisibility - New column visibility
     */
    const setColumnVisibility = useCallback((newVisibility: MRT_VisibilityState) => {
        setColumnVisibilityState(newVisibility);
        updateStore('columnVisibility', newVisibility);
    }, [updateStore]);

    /**
     * Sets column pinning with store persistence
     * @param {MRT_ColumnPinningState} newPinning - New column pinning state
     */
    const setColumnPinning = useCallback((newPinning: MRT_ColumnPinningState) => {
        setColumnPinningState(newPinning);
        updateStore('columnPinning', newPinning);
    }, [updateStore]);

    /**
     * Sets scroll position with store persistence
     * @param {number} position - Scroll position
     */
    const setScrollPosition = useCallback((position: number) => {
        setScrollPositionState(position);
        updateStore('scrollPosition', position);
    }, [updateStore]);

    /**
     * Resets all filters to initial state
     */
    const resetFilters = useCallback(() => {
        setGlobalFilterState('');
        setPagination(initialPagination);
        setSorting(initialSorting);
        setShowGlobalFilterState(false);

        // Also reset in store if tableKey is provided
        if (tableKey) {
            updateStore('globalFilter', '');
            updateStore('pagination', initialPagination);
            updateStore('sorting', initialSorting);
            updateStore('showGlobalFilter', false);
        }
    }, [initialPagination, initialSorting, setPagination, setSorting, tableKey, updateStore]);

    /**
     * Resets row selection
     */
    const resetSelection = useCallback(() => {
        setRowSelectionState({});
        if (tableKey) {
            updateStore('rowSelection', {});
        }
    }, [tableKey, updateStore]);

    // Derived values
    const selectedIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);
    const selectedCount = selectedIds.length;

    /**
     * Helper to get nested values from an object
     */
    const getValue = useCallback((obj: Record<string, unknown>, path: string): unknown => {
        return path.split('.').reduce<unknown>((acc, part) => {
            if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
                return (acc as Record<string, unknown>)[part];
            }
            return undefined;
        }, obj);
    }, []);

    /**
     * Applies filtering and sorting to data array
     * @param {T[]} data - Array of data items
     * @param {(item: T, filter: string) => boolean} [filterFn] - Custom filter function
     * @returns {T[]} Filtered and sorted data
     */
    const applyFiltersAndSorting = useCallback((data: T[], filterFn?: (item: T, filter: string) => boolean): T[] => {
        let filteredData = [...data];

        if (globalFilter && filterFn) {
            filteredData = filteredData.filter(item => filterFn(item, globalFilter));
        }

        if (sorting.length > 0) {
            filteredData.sort((a, b) => {
                for (const sort of sorting) {
                    const { id, desc } = sort;

                    const aValue = getValue(a, id);
                    const bValue = getValue(b, id);

                    if (aValue == null) return desc ? -1 : 1;
                    if (bValue == null) return desc ? 1 : -1;

                    if (aValue < bValue) return desc ? 1 : -1;
                    if (aValue > bValue) return desc ? -1 : 1;
                }
                return 0;
            });
        }

        return filteredData;
    }, [globalFilter, sorting, getValue]);

    /**
     * Applies pagination to data array
     * @template D - Type of data items
     * @param {D[]} data - Array of data items
     * @returns {D[]} Paginated data slice
     */
    const applyPagination = useCallback(<D,>(data: D[]): D[] => {
        const startIndex = pagination.pageIndex * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        return data.slice(startIndex, endIndex);
    }, [pagination]);

    // URL synchronization
    useEffect(() => {
        if (syncWithUrl && typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            if (globalFilter) {
                url.searchParams.set(searchParamKey, globalFilter);
            } else {
                url.searchParams.delete(searchParamKey);
            }
            window.history.replaceState({}, '', url.toString());
        }
    }, [globalFilter, syncWithUrl, searchParamKey]);

    return {
        // State
        pagination,
        sorting,
        globalFilter,
        rowSelection,
        showGlobalFilter,
        columnOrder,
        columnVisibility,
        columnPinning,
        scrollPosition,

        // Setters
        setPagination,
        setSorting,
        setGlobalFilter,
        setRowSelection,
        setShowGlobalFilter,
        setColumnOrder,
        setColumnVisibility,
        setColumnPinning,
        setScrollPosition,

        // Actions
        resetFilters,
        resetSelection,

        // Derived values
        selectedIds,
        selectedCount,

        // Data processing
        applyFiltersAndSorting,
        applyPagination
    };
};

/**
 * Creates a text filter function for specified fields
 *
 * @template T - The type of data items
 * @param {(keyof T)[]} fields - Fields to search within
 * @returns {(item: T, filter: string) => boolean} Filter function
 *
 * @example
 * const filterFn = createTextFilterFn<User>(['name', 'email']);
 * const filteredUsers = users.filter(user => filterFn(user, 'search term'));
 */
export const createTextFilterFn = <T extends Record<string, unknown>>(
    fields: (keyof T)[]
): ((item: T, filter: string) => boolean) => {
    return (item: T, filter: string): boolean => {
        if (!filter.trim()) return true;
        const searchLower = filter.toLowerCase();

        return fields.some(field => {
            const value = item[field];
            return String(value).toLowerCase().includes(searchLower);
        });
    };
};