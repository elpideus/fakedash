import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type {
    MRT_PaginationState,
    MRT_SortingState,
    MRT_RowSelectionState,
    MRT_ColumnOrderState,
    MRT_VisibilityState,
    MRT_ColumnPinningState
} from 'material-react-table';
import { useTableStore } from './useTableStore';
import type { TableKey } from '../types';

interface UseTableOperationsOptions {
    initialPagination?: MRT_PaginationState;
    initialSorting?: MRT_SortingState;
    initialGlobalFilter?: string;
    onPaginationChange?: (pagination: MRT_PaginationState) => void;
    onSortingChange?: (sorting: MRT_SortingState) => void;
    onGlobalFilterChange?: (filter: string) => void;
    onRowSelectionChange?: (selection: MRT_RowSelectionState) => void;
    syncWithUrl?: boolean;
    searchParamKey?: string;
    tableKey?: TableKey;
}

/**
 * Hook for common table operations (filtering, pagination, sorting, selection)
 * with Zustand persistence support
 */
export const useTableOperations = <T extends Record<string, any>>({
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

    // Get initial state from store if tableKey is provided
    const getInitialState = () => {
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
    };

    const initialState = getInitialState();

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

    // Map property names to store setter property names
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

    // Helper function to get setter name
    const getSetterName = useCallback((property: string): keyof typeof store | null => {
        if (!tableKey) return null;

        const tableKeyFormatted = tableKey.charAt(0).toUpperCase() + tableKey.slice(1);
        const storeProperty = getStorePropertyName(property);
        const propertyFormatted = storeProperty.charAt(0).toUpperCase() + storeProperty.slice(1);
        const setterName = `set${tableKeyFormatted}${propertyFormatted}` as keyof typeof store;

        return setterName;
    }, [tableKey, getStorePropertyName]);

    // Helper function to update store
    const updateStore = useCallback((property: string, value: any) => {
        if (!tableKey || !store) return;

        const setterName = getSetterName(property);
        if (setterName && typeof store[setterName] === 'function') {
            (store[setterName] as Function)(value);
        }
    }, [tableKey, store, getSetterName]);

    // Define setShowGlobalFilter first to avoid circular dependency
    const setShowGlobalFilter = useCallback((show: boolean) => {
        setShowGlobalFilterState(show);
        if (!show) {
            setGlobalFilterState(''); // Use the state setter directly
            updateStore('globalFilter', '');
        }
        updateStore('showGlobalFilter', show);
    }, [updateStore]);

    // Wrapped setters that also persist to store
    const setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>> = useCallback((updater) => {
        setPaginationState((prev) => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            onPaginationChange?.(nextValue);
            updateStore('pagination', nextValue);
            return nextValue;
        });
    }, [onPaginationChange, updateStore]);

    const setSorting: React.Dispatch<React.SetStateAction<MRT_SortingState>> = useCallback((updater) => {
        setSortingState((prev) => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            onSortingChange?.(nextValue);
            updateStore('sorting', nextValue);
            return nextValue;
        });
    }, [onSortingChange, updateStore]);

    const setRowSelection: React.Dispatch<React.SetStateAction<MRT_RowSelectionState>> = useCallback((updater) => {
        setRowSelectionState((prev) => {
            const nextValue = typeof updater === 'function' ? updater(prev) : updater;
            onRowSelectionChange?.(nextValue);
            updateStore('rowSelection', nextValue);
            return nextValue;
        });
    }, [onRowSelectionChange, updateStore]);

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

    const setColumnOrder = useCallback((newOrder: MRT_ColumnOrderState) => {
        setColumnOrderState(newOrder);
        updateStore('columnOrder', newOrder);
    }, [updateStore]);

    const setColumnVisibility = useCallback((newVisibility: MRT_VisibilityState) => {
        setColumnVisibilityState(newVisibility);
        updateStore('columnVisibility', newVisibility);
    }, [updateStore]);

    const setColumnPinning = useCallback((newPinning: MRT_ColumnPinningState) => {
        setColumnPinningState(newPinning);
        updateStore('columnPinning', newPinning);
    }, [updateStore]);

    const setScrollPosition = useCallback((position: number) => {
        setScrollPositionState(position);
        updateStore('scrollPosition', position);
    }, [updateStore]);

    // Reset functions
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

    const resetSelection = useCallback(() => {
        setRowSelectionState({});
        if (tableKey) {
            updateStore('rowSelection', {});
        }
    }, [tableKey, updateStore]);

    // Derived values
    const selectedIds = useMemo(() => Object.keys(rowSelection), [rowSelection]);
    const selectedCount = selectedIds.length;

    // Data processing functions
    const applyFiltersAndSorting = useCallback((data: T[], filterFn?: (item: T, filter: string) => boolean): T[] => {
        let filteredData = [...data];

        if (globalFilter && filterFn) {
            filteredData = filteredData.filter(item => filterFn(item, globalFilter));
        }

        if (sorting.length > 0) {
            filteredData.sort((a, b) => {
                for (const sort of sorting) {
                    const { id, desc } = sort;

                    // Helper to get nested values
                    const getValue = (obj: any, path: string) => {
                        return path.split('.').reduce((acc, part) => acc?.[part], obj);
                    };

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
    }, [globalFilter, sorting]);

    const applyPagination = useCallback(<T,>(data: T[]): T[] => {
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
        pagination,
        sorting,
        globalFilter,
        rowSelection,
        showGlobalFilter,
        columnOrder,
        columnVisibility,
        columnPinning,
        scrollPosition,
        setPagination,
        setSorting,
        setGlobalFilter,
        setRowSelection,
        setShowGlobalFilter,
        setColumnOrder,
        setColumnVisibility,
        setColumnPinning,
        setScrollPosition,
        resetFilters,
        resetSelection,
        selectedIds,
        selectedCount,
        applyFiltersAndSorting,
        applyPagination
    };
};

export const createTextFilterFn = <T,>(fields: (keyof T)[]) => {
    return (item: T, filter: string): boolean => {
        if (!filter.trim()) return true;
        const searchLower = filter.toLowerCase();

        return fields.some(field => {
            const value = item[field];
            return String(value).toLowerCase().includes(searchLower);
        });
    };
};