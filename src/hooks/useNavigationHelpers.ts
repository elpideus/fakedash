import { useCallback } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { encodeNavigationState, decodeNavigationState, createUrl } from '../utils/urlUtils';
import { useNavigationHistory } from '../store/navigationStore';

/**
 * Interface representing the comprehensive navigation toolkit.
 * @interface UseNavigationHelpersReturn
 */
interface UseNavigationHelpersReturn {
    /** The current URL pathname (e.g., '/dashboard'). */
    currentPath: string;
    /** The current URL search string (e.g., '?id=123'). */
    currentSearch: string;
    /** The URLSearchParams object for the current location. */
    searchParams: URLSearchParams;

    /** Standard navigation to a specific path.
     * @param {string} path - Target URL.
     * @param {Object} [options] - Navigation options.
     */
    navigateTo: (path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => void;

    /** Navigates to a path while appending the current location to the 'from' query param.
     * Useful for redirecting back after an action (like login or editing).
     */
    navigateWithFrom: (path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => void;

    /** Attempts to go back based on internal history store, falling back to 'from' param or a default path.
     * @param {string} [fallback='/'] - The path to go to if no history exists.
     */
    navigateBack: (fallback?: string) => void;

    /** Creates a URL string with serialized parameters. */
    createLink: (path: string, params?: Record<string, string | number | boolean>) => string;

    /** Creates a URL string including the current location as a 'from' parameter. */
    createLinkWithFrom: (path: string, params?: Record<string, string | number | boolean>) => string;

    /** Decodes and retrieves the 'from' parameter from the current URL. */
    getFromParam: (fallback?: string) => string;

    /** Gets a specific query parameter value.
     * @param {string} key - The query key.
     * @param {string} [defaultValue=''] - Returned if the key is missing.
     */
    getQueryParam: (key: string, defaultValue?: string) => string;

    /** Checks if a query parameter exists and is not empty. */
    hasQueryParam: (key: string) => boolean;

    /** Updates multiple search parameters at once.
     * Setting a value to `null` or empty string will delete the parameter.
     */
    updateSearchParams: (updates: Record<string, string | null>) => URLSearchParams;

    /** Semantic navigation to a specific Post view. */
    navigateToPost: (postId: string | number, editMode?: boolean) => void;

    /** Semantic navigation to a specific User view. */
    navigateToUser: (userId: string | number, editMode?: boolean) => void;

    /** Retrieves the calculated return path from the history store. */
    getBackTarget: () => string;

    /** Returns the full navigation stack from the store. */
    getNavigationHistory: () => Array<{ path: string; search: string; timestamp: number }>;
}

/**
 * A comprehensive hook for managing application navigation, URL state, and history tracking.
 * * This hook integrates **React Router** with a **Zustand** navigation store to provide:
 * 1. Sophisticated "Back" logic that understands app context.
 * 2. URL state persistence via 'from' parameters.
 * 3. Semantic navigation helpers (e.g., `MapsToPost`).
 * 4. Reactive search parameter management.
 *
 * @hook
 * @returns {UseNavigationHelpersReturn} A suite of navigation and URL manipulation utilities.
 */
export const useNavigationHelpers = (): UseNavigationHelpersReturn => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigationHistory = useNavigationHistory();

    /**
     * Ensures the navigation store is aware of the current entry point.
     * @private
     */
    const initializeHistory = useCallback(() => {
        if (navigationHistory.history.length === 0) {
            navigationHistory.initializeFromCurrentLocation(location.pathname, location.search);
        }
    }, [navigationHistory, location.pathname, location.search]);

    // Side effect: Sync initial location with store
    initializeHistory();

    const navigateTo = useCallback((path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
        navigate(path, options);
    }, [navigate]);

    /**
     * Advanced navigation that preserves history state.
     * Encodes the current path into a Base64/URI string and attaches it to the target URL.
     */
    const navigateWithFrom = useCallback((path: string, options?: { replace?: boolean; state?: Record<string, unknown> }) => {
        navigationHistory.pushToHistory({
            path: location.pathname,
            search: location.search
        });

        const from = encodeNavigationState(location.pathname, location.search);
        const params: Record<string, string | boolean> = { from };

        if (options?.state) {
            Object.assign(params, options.state);
        }

        const url = createUrl(path, params);
        navigate(url, { replace: options?.replace });
    }, [navigate, location, navigationHistory]);

    /**
     * Logic-heavy back navigation.
     * 1. Priority: Store-based history (Zustand).
     * 2. Secondary: 'from' URL parameter.
     * 3. Final: fallback string (defaulting to root).
     */
    const navigateBack = useCallback((fallback: string = '/') => {
        const backTarget = navigationHistory.getBackTarget(location.pathname, location.search);

        if (backTarget) {
            navigationHistory.popFromHistory();
            navigate(backTarget);
        } else {
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

    /**
     * Functional update for URL parameters.
     * Triggers a 'replace' navigation to update the browser's address bar.
     */
    const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value.trim() === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });

        setSearchParams(newParams, { replace: true });
        return newParams;
    }, [searchParams, setSearchParams]);

    /**
     * Navigates to a specific post detail view.
     * @param {string | number} postId - The unique identifier of the post.
     * @param {boolean} [editMode=false] - Whether to open the post in edit mode immediately.
     */
    const navigateToPost = useCallback((postId: string | number, editMode: boolean = false) => {
        const params: Record<string, string | boolean> = {};
        if (editMode) params.edit = true;

        navigateWithFrom(`/post/${postId}`, { state: params });
    }, [navigateWithFrom]);

    /**
     * Navigates to a specific user profile view.
     * @param {string | number} userId - The unique identifier of the user.
     * @param {boolean} [editMode=false] - Whether to open the profile in edit mode immediately.
     */
    const navigateToUser = useCallback((userId: string | number, editMode: boolean = false) => {
        const params: Record<string, string | boolean> = {};
        if (editMode) params.edit = true;

        navigateWithFrom(`/user/${userId}`, { state: params });
    }, [navigateWithFrom]);

    /**
     * Calculates the return path based on the internal navigation stack.
     * Useful for determining where a "Back" button should lead before the action is taken.
     * @returns {string} The path and search string of the previous location.
     */
    const getBackTarget = useCallback(() => {
        return navigationHistory.getBackTarget(location.pathname, location.search);
    }, [navigationHistory, location.pathname, location.search]);

    /**
     * Retrieves the complete stack of visited locations from the navigation store.
     * @todo Fix type mismatch between navigationHistory state and expected return type.
     * @returns {Array<{ path: string; search: string; timestamp: number }>} The history stack.
     */
    const getNavigationHistory = useCallback(() => {
        // @ts-expect-error TODO: Fix this properly
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