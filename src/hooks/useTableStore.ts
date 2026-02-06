import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MRT_RowSelectionState } from 'material-react-table';

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
    };
    userTable: {
        pagination: PaginationState;
        globalFilter: string;
        showGlobalFilter: boolean;
        rowSelection: MRT_RowSelectionState;
    };
    setPostTablePagination: (pagination: PaginationState) => void;
    setPostTableGlobalFilter: (globalFilter: string) => void;
    setPostTableShowGlobalFilter: (show: boolean) => void;
    setPostTableSelection: (selection: MRT_RowSelectionState) => void;
    setUserTablePagination: (pagination: PaginationState) => void;
    setUserTableGlobalFilter: (globalFilter: string) => void;
    setUserTableShowGlobalFilter: (show: boolean) => void;
    setUserTableSelection: (selection: MRT_RowSelectionState) => void;
}

export const useTableStore = create<TableState>()(
    persist(
        (set) => ({
            postTable: {
                pagination: { pageIndex: 0, pageSize: 10 },
                globalFilter: '',
                showGlobalFilter: false,
                rowSelection: {},
            },
            userTable: {
                pagination: { pageIndex: 0, pageSize: 10 },
                globalFilter: '',
                showGlobalFilter: false,
                rowSelection: {},
            },
            setPostTablePagination: (pagination) =>
                set((state) => ({ postTable: { ...state.postTable, pagination } })),
            setPostTableGlobalFilter: (globalFilter) =>
                set((state) => ({ postTable: { ...state.postTable, globalFilter } })),
            setPostTableShowGlobalFilter: (showGlobalFilter) =>
                set((state) => ({ postTable: { ...state.postTable, showGlobalFilter } })),
            setPostTableSelection: (rowSelection) =>
                set((state) => ({ postTable: { ...state.postTable, rowSelection } })),

            setUserTablePagination: (pagination) =>
                set((state) => ({ userTable: { ...state.userTable, pagination } })),
            setUserTableGlobalFilter: (globalFilter) =>
                set((state) => ({ userTable: { ...state.userTable, globalFilter } })),
            setUserTableShowGlobalFilter: (showGlobalFilter) =>
                set((state) => ({ userTable: { ...state.userTable, showGlobalFilter } })),
            setUserTableSelection: (rowSelection) =>
                set((state) => ({ userTable: { ...state.userTable, rowSelection } })),
        }),
        { name: 'table-storage' }
    )
);