// --- Core Data Types ---
export interface RawPost {
    id: string;
    userId: number;
    title: string;
    content: string;
    createdAt: string;
}

export interface RawUser {
    id: string;
    name: string;
    email: string;
    password?: string;
}

// Domain Classes (re-exported from FakeDashAPI)
export type { Post, User } from '../services/FakeDashAPI';

// --- Table State Types ---
export interface PaginationState {
    pageIndex: number;
    pageSize: number;
}

export interface TableState {
    pagination: PaginationState;
    globalFilter: string;
    showGlobalFilter: boolean;
    rowSelection: Record<string, boolean>;
    sorting: Array<{ id: string; desc: boolean }>;
    columnOrder: string[];
    columnVisibility: Record<string, boolean>;
    columnPinning: { left: string[], right: string[] };
    scrollPosition: number;
}

export type TableKey = 'postTable' | 'userTable' | 'userDetailsTable';

// --- API Context Types ---
export interface APIContextType {
    api: any;
    isLoading: boolean;
    error: Error | null;
    version: number;
}

// --- Component Props Types ---
export interface ContentTableProps<T> {
    columns: any[];
    data: T[];
    rowCount: number;
    pagination: PaginationState;
    onPaginationChange: (pagination: PaginationState) => void;
    isLoading: boolean;
    isFetching: boolean;
    rowSelection?: Record<string, boolean>;
    onRowSelectionChange?: (rowSelection: Record<string, boolean>) => void;
    enableRowSelection?: boolean;
    enableRowActions?: boolean;
    showViewAction?: boolean;
    showEditAction?: boolean;
    showDeleteAction?: boolean;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    onView?: (row: T) => void;
    detailPanel?: (row: T) => React.ReactNode;
    muiTableBodyRowProps?: (props: any) => React.HTMLAttributes<HTMLTableRowElement>;
    title: string;
    totalCountText?: string;
    selectedCount?: number;
    renderTopToolbarCustomActions?: () => React.ReactNode;
    globalFilter?: string;
    onGlobalFilterChange?: (filter: string) => void;
    showGlobalFilter?: boolean;
    onShowGlobalFilterChange?: (show: boolean) => void;
    getRowId?: (row: T) => string;
    sorting?: any[];
    onSortingChange?: (sorting: any[]) => void;
    columnOrder?: string[];
    onColumnOrderChange?: (columnOrder: string[]) => void;
    columnVisibility?: Record<string, boolean>;
    onColumnVisibilityChange?: (columnVisibility: Record<string, boolean>) => void;
    columnPinning?: { left: string[], right: string[] };
    onColumnPinningChange?: (columnPinning: { left: string[], right: string[] }) => void;
    scrollPosition?: number;
    onScrollPositionChange?: (scrollPosition: number) => void;
    tableKey?: string;
}

// --- Snackbar Types ---
export interface SnackbarState {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

// --- Dialog Types ---
export interface DialogConfig {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    severity?: 'error' | 'warning';
}

// --- Navigation Types ---
export interface NavigationState {
    from: string;
    searchParams: URLSearchParams;
}

// --- Response Types ---
export interface APIResponse<T> {
    data: T;
    error?: string;
    status: number;
}

// --- Bulk Operation Types ---
export interface BulkOperation {
    ids: (string | number)[];
    type: 'delete' | 'update';
    entity: 'post' | 'user';
}