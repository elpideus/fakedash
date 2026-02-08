import { useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { encodeNavigationState, decodeNavigationState, createUrl } from '../utils/urlUtils';
import { useNavigationHistory } from '../store/navigationStore';

interface UseNavigationHelpersReturn {
    // Navigation state
    currentPath: string;
    currentSearch: string;
    searchParams: URLSearchParams;

    // Navigation methods
    navigateTo: (path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => void;
    navigateWithFrom: (path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => void;
    navigateBack: (fallback?: string) => void;

    // URL building methods
    createLink: (path: string, params?: Record<string, string | number | boolean>) => string;
    createLinkWithFrom: (path: string, params?: Record<string, string | number | boolean>) => string;

    // Parameter handling
    getFromParam: (fallback?: string) => string;
    getQueryParam: (key: string, defaultValue?: string) => string;
    hasQueryParam: (key: string) => boolean;
    updateSearchParams: (updates: Record<string, string | null>) => URLSearchParams;

    // View navigation
    navigateToPost: (postId: string | number, editMode?: boolean) => void;
    navigateToUser: (userId: string | number, editMode?: boolean) => void;

    // Navigation history
    getBackTarget: () => string;
    getNavigationHistory: () => Array<{ path: string; search: string; timestamp: number }>;
}

/**
 * Hook for common navigation patterns and URL parameter handling
 * with Zustand-based navigation history tracking
 */
export const useNavigationHelpers = (): UseNavigationHelpersReturn => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigationHistory = useNavigationHistory();

    // Initialize history with current location if empty
    const initializeHistory = useCallback(() => {
        if (navigationHistory.history.length === 0) {
            navigationHistory.initializeFromCurrentLocation(location.pathname, location.search);
        }
    }, [navigationHistory, location.pathname, location.search]);

    // Initialize on first render
    initializeHistory();

    const navigateTo = useCallback((path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
        navigate(path, options);
    }, [navigate]);

    const navigateWithFrom = useCallback((path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
        // Add current location to history before navigating
        navigationHistory.pushToHistory({
            path: location.pathname,
            search: location.search
        });

        // Add 'from' parameter to maintain compatibility
        const from = encodeNavigationState(location.pathname, location.search);
        const params: Record<string, string | boolean> = { from };

        if (options?.state) {
            Object.assign(params, options.state);
        }

        const url = createUrl(path, params);
        navigate(url, { replace: options?.replace });
    }, [navigate, location, navigationHistory]);

    const navigateBack = useCallback((fallback: string = '/') => {
        // Get the most recent different path from history
        const backTarget = navigationHistory.getBackTarget(location.pathname, location.search);

        if (backTarget) {
            // Remove current location from history before navigating back
            navigationHistory.popFromHistory();
            navigate(backTarget);
        } else {
            // Fallback to the 'from' parameter or provided fallback
            const fromParam = searchParams.get('from');
            const target = decodeNavigationState(fromParam, fallback);
            navigate(target);
        }
    }, [navigate, searchParams, navigationHistory, location.pathname, location.search]);

    const createLink = useCallback((path: string, params?: Record<string, string | number | boolean>) => {
        return createUrl(path, params);
    }, []);

    const createLinkWithFrom = useCallback((path: string, params?: Record<string, string | number | boolean>) => {
        const from = encodeNavigationState(location.pathname, location.search);
        return createUrl(path, { from, ...params });
    }, [location]);

    const getFromParam = useCallback((fallback: string = '/') => {
        const fromParam = searchParams.get('from');
        return decodeNavigationState(fromParam, fallback);
    }, [searchParams]);

    const getQueryParam = useCallback((key: string, defaultValue: string = '') => {
        return searchParams.get(key) || defaultValue;
    }, [searchParams]);

    const hasQueryParam = useCallback((key: string) => {
        const value = searchParams.get(key);
        return value !== null && value.trim() !== '';
    }, [searchParams]);

    const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value.trim() === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        // Update the search params
        setSearchParams(newParams, { replace: true });

        return newParams;
    }, [searchParams, setSearchParams]);

    const navigateToPost = useCallback((postId: string | number, editMode: boolean = false) => {
        const params: Record<string, string | boolean> = {};
        if (editMode) params.edit = true;

        navigateWithFrom(`/post/${postId}`, { state: params });
    }, [navigateWithFrom]);

    const navigateToUser = useCallback((userId: string | number, editMode: boolean = false) => {
        const params: Record<string, string | boolean> = {};
        if (editMode) params.edit = true;

        navigateWithFrom(`/user/${userId}`, { state: params });
    }, [navigateWithFrom]);

    const getBackTarget = useCallback(() => {
        return navigationHistory.getBackTarget(location.pathname, location.search);
    }, [navigationHistory, location.pathname, location.search]);

    const getNavigationHistory = useCallback(() => {
        return navigationHistory.getHistory();
    }, [navigationHistory]);

    return {
        currentPath: location.pathname,
        currentSearch: location.search,
        searchParams,
        navigateTo,
        navigateWithFrom,
        navigateBack,
        createLink,
        createLinkWithFrom,
        getFromParam,
        getQueryParam,
        hasQueryParam,
        updateSearchParams,
        navigateToPost,
        navigateToUser,
        getBackTarget,
        getNavigationHistory
    };
};