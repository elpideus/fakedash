/**
 * Format a date string to Italian locale with custom formatting options
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
    dateString: string | Date,
    options: Intl.DateTimeFormatOptions = {}
): string => {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }

        const defaultOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };

        return new Intl.DateTimeFormat('it-IT', defaultOptions).format(date);
    } catch {
        return typeof dateString === 'string' ? dateString : 'Invalid date';
    }
};

/**
 * Format date for display in tables (shorter format)
 * @param dateString - ISO date string or Date object
 * @returns Short formatted date string
 */
export const formatDateShort = (dateString: string | Date): string => {
    return formatDate(dateString, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string or Date object
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | Date): string => {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 30) {
            return formatDateShort(date);
        } else if (diffDays > 0) {
            return `${diffDays} giorno${diffDays > 1 ? 'i' : ''} fa`;
        } else if (diffHours > 0) {
            return `${diffHours} ora${diffHours > 1 ? 'e' : ''} fa`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes} minuto${diffMinutes > 1 ? 'i' : ''} fa`;
        } else {
            return 'Pochi secondi fa';
        }
    } catch {
        return 'Data non disponibile';
    }
};

/**
 * Parse date string and validate it
 * @param dateString - Date string to validate
 * @returns Valid Date object or null
 */
export const parseDate = (dateString: string): Date | null => {
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
};

/**
 * Check if date is in the past
 * @param dateString - Date to check
 * @returns Boolean indicating if date is in past
 */
export const isPastDate = (dateString: string | Date): boolean => {
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        const now = new Date();
        return date < now;
    } catch {
        return false;
    }
};