/**
 * Encode navigation state for URL parameters
 * @param currentPath - Current pathname
 * @param currentSearch - Current search params
 * @returns Encoded from parameter
 */
export const encodeNavigationState = (
    currentPath: string,
    currentSearch: string = ''
): string => {
    const fullPath = currentPath + currentSearch;
    // Remove any existing from parameter to avoid nesting
    const searchParams = new URLSearchParams(currentSearch);
    searchParams.delete('from');
    const cleanSearch = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return encodeURIComponent(currentPath + cleanSearch);
};

/**
 * Decode and validate navigation state
 * @param encodedState - Encoded from parameter
 * @param fallback - Fallback path if decoding fails
 * @returns Decoded path or fallback
 */
export const decodeNavigationState = (
    encodedState: string | null,
    fallback: string = '/'
): string => {
    if (!encodedState) return fallback;

    try {
        const decoded = decodeURIComponent(encodedState);
        // Basic validation: should start with /
        return decoded.startsWith('/') ? decoded : fallback;
    } catch {
        return fallback;
    }
};

/**
 * Update URL search parameters
 * @param currentParams - Current URLSearchParams
 * @param updates - Object with parameter updates
 * @param removeIfEmpty - Remove parameter if value is empty
 * @returns New URLSearchParams
 */
export const updateSearchParams = (
    currentParams: URLSearchParams,
    updates: Record<string, string | null>,
    removeIfEmpty: boolean = true
): URLSearchParams => {
    const newParams = new URLSearchParams(currentParams);

    Object.entries(updates).forEach(([key, value]) => {
        if (value === null || (removeIfEmpty && value.trim() === '')) {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
    });

    return newParams;
};

/**
 * Get query parameter with fallback
 * @param params - URLSearchParams
 * @param key - Parameter key
 * @param defaultValue - Default value if not found
 * @returns Parameter value or default
 */
export const getQueryParam = (
    params: URLSearchParams,
    key: string,
    defaultValue: string = ''
): string => {
    return params.get(key) || defaultValue;
};

/**
 * Check if URL parameter exists and has truthy value
 * @param params - URLSearchParams
 * @param key - Parameter key
 * @returns Boolean indicating parameter exists and has value
 */
export const hasQueryParam = (
    params: URLSearchParams,
    key: string
): boolean => {
    const value = params.get(key);
    return value !== null && value.trim() !== '';
};

/**
 * Create URL with query parameters
 * @param pathname - Base path
 * @param params - Query parameters as object
 * @returns Full URL string
 */
export const createUrl = (
    pathname: string,
    params: Record<string, string | number | boolean> = {}
): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.set(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
};