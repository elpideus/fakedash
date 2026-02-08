import { useState, useCallback, useEffect, useRef } from 'react';

interface UseDataFetchingOptions<T> {
    autoFetch?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

interface UseDataFetchingReturn<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    isInitialized: boolean;
}

/**
 * Hook for common data fetching patterns with the FakeDashAPI
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

    // Track mounted state to prevent state updates after unmount
    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
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