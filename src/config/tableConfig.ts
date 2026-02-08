import type { MRT_ColumnDef } from "material-react-table";
import { formatDate } from "../utils/dateUtils.ts";

// Post table columns
export const postTableColumns: MRT_ColumnDef<any>[] = [
    {
        accessorKey: 'title',
        header: 'Titolo',
        size: 300,
        enableSorting: true,
    },
    {
        accessorKey: 'author',
        header: 'Autore',
        size: 200,
        enableSorting: true,
        Cell: ({ row }) => {
            const author = row.original.author;
            const authorName = author ? author.name : `User ${row.original.userId}`;
            return authorName;
        }
    },
    {
        accessorKey: 'createdAt',
        header: 'Data di creazione',
        size: 180,
        enableSorting: true,
        Cell: ({ cell }) => {
            const dateValue = cell.getValue<string>();
            return dateValue ? formatDate(dateValue) : 'N/D';
        },
    },
];

// User table columns
export const userTableColumns: MRT_ColumnDef<any>[] = [
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
];

// User posts table columns (used in UserDetails)
export const userPostsTableColumns: MRT_ColumnDef<any>[] = [
    {
        accessorKey: 'title',
        header: 'Titolo',
        size: 300,
    },
    {
        accessorKey: 'content',
        header: 'Contenuto',
        size: 400,
        Cell: ({ cell }) => {
            const content = cell.getValue<string>();
            const previewLength = 100;
            return content.length > previewLength
                ? `${content.substring(0, previewLength)}...`
                : content;
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Data di creazione',
        size: 180,
        Cell: ({ cell }) => {
            const dateValue = cell.getValue<string>();
            return dateValue ? formatDate(dateValue) : 'N/D';
        },
    },
];

// Default table options
export const defaultTableOptions = {
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
    enableRowSelection: true,
    enableRowActions: true,
    enableColumnOrdering: true,
    enableColumnFilters: false,
    enableSorting: true,
    enableFilters: true,
    enableHiding: true,
    enableGlobalFilter: true,
    enableDensityToggle: true,
    enableFullScreenToggle: true,
    enableStickyHeader: true,
};

// Table localization (Italian)
export const tableLocalization = {
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
};