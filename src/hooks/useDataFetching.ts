import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Configuration options for the data fetching hook.
 * @template T - The expected type of the data to be returned by the fetch function.
 */
interface UseDataFetchingOptions<T> {
    /** Whether to trigger the fetch automatically on component mount.
     * @default true
     */
    autoFetch?: boolean;
    /** Optional callback executed after a successful data retrieval. */
    onSuccess?: (data: T) => void;
    /** Optional callback executed when the fetch function throws an error. */
    onError?: (error: Error) => void;
}

/**
 * The state and control methods returned by the useDataFetching hook.
 * @template T - The type of the data state.
 */
interface UseDataFetchingReturn<T> {
    /** The fetched data or null if the request hasn't completed. */
    data: T | null;
    /** Loading state indicator. Starts as true if autoFetch is enabled. */
    isLoading: boolean;
    /** Error object if the request failed, otherwise null. */
    error: Error | null;
    /** Function to manually re-trigger the fetch logic. */
    refetch: () => Promise<void>;
    /** Becomes true after the first successful data load. */
    isInitialized: boolean;
}

/**
 * A reusable hook for managing asynchronous data fetching patterns.
 *
 * Provides standardized state management for loading, errors, and data,
 * while preventing state updates on unmounted components using a safety ref.
 *
 * @template T - The data type to be managed.
 * @param {function(): Promise<T> | T} fetchFn - The async function that performs the data request.
 * @param {UseDataFetchingOptions<T>} [options={}] - Hook configuration including callbacks and auto-fetch behavior.
 * @returns {UseDataFetchingReturn<T>} Current fetching state and the refetch function.
 *
 * @example
 * const { data, isLoading } = useDataFetching(() => api.getUsers());
 */
export const useDataFetching = <T>(
    fetchFn: () => Promise<T> | T,
    options: UseDataFetchingOptions<T> = {}
): UseDataFetchingReturn<T> => {
    const { autoFetch = true, onSuccess, onError } = options;

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
    const [error, setError] = useState<Error | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    /**
     * Ref used to track the component's mount status.
     * Prevents "Can't perform a React state update on an unmounted component" errors.
     */
    const isMounted = useRef(true);

    useEffect(() => {
        // Set to true on mount, false on unmount.
        return () => {
            isMounted.current = false;
        };
    }, []);

    /**
     * The core fetching logic.
     * Wrapped in useCallback to ensure stability when passed as a dependency or prop.
     */
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn();

            // Only update state if the component is still in the DOM
            if (isMounted.current) {
                setData(result);
                setIsInitialized(true);
                onSuccess?.(result);
            }
        } catch (err) {
            if (isMounted.current) {
                const error = err instanceof Error ? err : new Error('Unknown error occurred');
                setError(error);
                onError?.(error);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [fetchFn, onSuccess, onError]);

    // Handle automatic execution on mount
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
        isInitialized
    };
};