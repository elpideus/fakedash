import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    MRT_RowSelectionState,
    MRT_SortingState,
    MRT_ColumnOrderState,
    MRT_VisibilityState
} from 'material-react-table';

interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

interface TableState {
    postTable: {
        pagination: PaginationState;
        globalFilter: string;
        showGlobalFilter: boolean;
        rowSelection: MRT_RowSelectionState;
        sorting: MRT_SortingState;
        columnOrder: MRT_ColumnOrderState;
        columnVisibility: MRT_VisibilityState;
        columnPinning: { left: string[], right: string[] };
        scrollPosition: number; // Add scroll position
    };
    userTable: {
        pagination: PaginationState;
        globalFilter: string;
        showGlobalFilter: boolean;
        rowSelection: MRT_RowSelectionState;
        sorting: MRT_SortingState;
        columnOrder: MRT_ColumnOrderState;
        columnVisibility: MRT_VisibilityState;
        columnPinning: { left: string[], right: string[] };
        scrollPosition: number; // Add scroll position
    };
    userDetailsTable: {
        pagination: PaginationState;
        globalFilter: string;
        showGlobalFilter: boolean;
        rowSelection: MRT_RowSelectionState;
        sorting: MRT_SortingState;
        columnOrder: MRT_ColumnOrderState;
        columnVisibility: MRT_VisibilityState;
        columnPinning: { left: string[], right: string[] };
        scrollPosition: number; // Add scroll position
    };
    setPostTablePagination: (pagination: PaginationState) => void;
    setPostTableGlobalFilter: (globalFilter: string) => void;
    setPostTableShowGlobalFilter: (show: boolean) => void;
    setPostTableSelection: (selection: MRT_RowSelectionState) => void;
    setPostTableSorting: (sorting: MRT_SortingState) => void;
    setPostTableColumnOrder: (columnOrder: MRT_ColumnOrderState) => void;
    setPostTableColumnVisibility: (columnVisibility: MRT_VisibilityState) => void;
    setPostTableColumnPinning: (columnPinning: { left: string[], right: string[] }) => void;
    setPostTableScrollPosition: (scrollPosition: number) => void; // New setter
    setUserTablePagination: (pagination: PaginationState) => void;
    setUserTableGlobalFilter: (globalFilter: string) => void;
    setUserTableShowGlobalFilter: (show: boolean) => void;
    setUserTableSelection: (selection: MRT_RowSelectionState) => void;
    setUserTableSorting: (sorting: MRT_SortingState) => void;
    setUserTableColumnOrder: (columnOrder: MRT_ColumnOrderState) => void;
    setUserTableColumnVisibility: (columnVisibility: MRT_VisibilityState) => void;
    setUserTableColumnPinning: (columnPinning: { left: string[], right: string[] }) => void;
    setUserTableScrollPosition: (scrollPosition: number) => void; // New setter
    setUserDetailsTablePagination: (pagination: PaginationState) => void;
    setUserDetailsTableGlobalFilter: (globalFilter: string) => void;
    setUserDetailsTableShowGlobalFilter: (show: boolean) => void;
    setUserDetailsTableSelection: (selection: MRT_RowSelectionState) => void;
    setUserDetailsTableSorting: (sorting: MRT_SortingState) => void;
    setUserDetailsTableColumnOrder: (columnOrder: MRT_ColumnOrderState) => void;
    setUserDetailsTableColumnVisibility: (columnVisibility: MRT_VisibilityState) => void;
    setUserDetailsTableColumnPinning: (columnPinning: { left: string[], right: string[] }) => void;
    setUserDetailsTableScrollPosition: (scrollPosition: number) => void; // New setter
}

export const useTableStore = create<TableState>()(
    persist(
        (set) => ({
            postTable: {
                pagination: { pageIndex: 0, pageSize: 10 },
                globalFilter: '',
                showGlobalFilter: false,
                rowSelection: {},
                sorting: [],
                columnOrder: [],
                columnVisibility: {},
                columnPinning: { left: [], right: [] },
                scrollPosition: 0, // Initialize scroll position
            },
            userTable: {
                pagination: { pageIndex: 0, pageSize: 10 },
                globalFilter: '',
                showGlobalFilter: false,
                rowSelection: {},
                sorting: [],
                columnOrder: [],
                columnVisibility: {},
                columnPinning: { left: [], right: [] },
                scrollPosition: 0, // Initialize scroll position
            },
            userDetailsTable: {
                pagination: { pageIndex: 0, pageSize: 10 },
                globalFilter: '',
                showGlobalFilter: false,
                rowSelection: {},
                sorting: [],
                columnOrder: [],
                columnVisibility: {},
                columnPinning: { left: [], right: [] },
                scrollPosition: 0, // Initialize scroll position
            },
            setPostTablePagination: (pagination) =>
                set((state) => ({ postTable: { ...state.postTable, pagination } })),
            setPostTableGlobalFilter: (globalFilter) =>
                set((state) => ({ postTable: { ...state.postTable, globalFilter } })),
            setPostTableShowGlobalFilter: (showGlobalFilter) =>
                set((state) => ({ postTable: { ...state.postTable, showGlobalFilter } })),
            setPostTableSelection: (rowSelection) =>
                set((state) => ({ postTable: { ...state.postTable, rowSelection } })),
            setPostTableSorting: (sorting) =>
                set((state) => ({ postTable: { ...state.postTable, sorting } })),
            setPostTableColumnOrder: (columnOrder) =>
                set((state) => ({ postTable: { ...state.postTable, columnOrder } })),
            setPostTableColumnVisibility: (columnVisibility) =>
                set((state) => ({ postTable: { ...state.postTable, columnVisibility } })),
            setPostTableColumnPinning: (columnPinning) =>
                set((state) => ({ postTable: { ...state.postTable, columnPinning } })),
            setPostTableScrollPosition: (scrollPosition) =>
                set((state) => ({ postTable: { ...state.postTable, scrollPosition } })),

            setUserTablePagination: (pagination) =>
                set((state) => ({ userTable: { ...state.userTable, pagination } })),
            setUserTableGlobalFilter: (globalFilter) =>
                set((state) => ({ userTable: { ...state.userTable, globalFilter } })),
            setUserTableShowGlobalFilter: (showGlobalFilter) =>
                set((state) => ({ userTable: { ...state.userTable, showGlobalFilter } })),
            setUserTableSelection: (rowSelection) =>
                set((state) => ({ userTable: { ...state.userTable, rowSelection } })),
            setUserTableSorting: (sorting) =>
                set((state) => ({ userTable: { ...state.userTable, sorting } })),
            setUserTableColumnOrder: (columnOrder) =>
                set((state) => ({ userTable: { ...state.userTable, columnOrder } })),
            setUserTableColumnVisibility: (columnVisibility) =>
                set((state) => ({ userTable: { ...state.userTable, columnVisibility } })),
            setUserTableColumnPinning: (columnPinning) =>
                set((state) => ({ userTable: { ...state.userTable, columnPinning } })),
            setUserTableScrollPosition: (scrollPosition) =>
                set((state) => ({ userTable: { ...state.userTable, scrollPosition } })),

            setUserDetailsTablePagination: (pagination) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, pagination } })),
            setUserDetailsTableGlobalFilter: (globalFilter) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, globalFilter } })),
            setUserDetailsTableShowGlobalFilter: (showGlobalFilter) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, showGlobalFilter } })),
            setUserDetailsTableSelection: (rowSelection) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, rowSelection } })),
            setUserDetailsTableSorting: (sorting) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, sorting } })),
            setUserDetailsTableColumnOrder: (columnOrder) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, columnOrder } })),
            setUserDetailsTableColumnVisibility: (columnVisibility) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, columnVisibility } })),
            setUserDetailsTableColumnPinning: (columnPinning) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, columnPinning } })),
            setUserDetailsTableScrollPosition: (scrollPosition) =>
                set((state) => ({ userDetailsTable: { ...state.userDetailsTable, scrollPosition } })),
        }),
        {
            name: 'table-storage',
            version: 1,
            // Optional: add migration if you change the structure
            migrate: (persistedState: any, version: number) => {
                if (version === 0) {
                    // Migration from version 0 to 1
                    return {
                        ...persistedState,
                        postTable: {
                            ...persistedState.postTable,
                            scrollPosition: 0
                        },
                        userTable: {
                            ...persistedState.userTable,
                            scrollPosition: 0
                        },
                        userDetailsTable: {
                            ...persistedState.userDetailsTable,
                            scrollPosition: 0
                        }
                    };
                }
                return persistedState;
            }
        }
    )
);