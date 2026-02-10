import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { FakeDashAPI } from '../services/FakeDashAPI';

/**
 * Shape of the context provided by the APIProvider.
 * @interface APIContextType
 */
interface APIContextType {
    /** The singleton instance of the FakeDashAPI. */
    api: FakeDashAPI;
    /** Indicates if the initial data loading is in progress. */
    isLoading: boolean;
    /** Holds any error encountered during API initialization. */
    error: Error | null;
    /** A counter used to force re-renders in consuming components when data changes. */
    refreshTrigger: number;
    /** Function to manually increment the refreshTrigger. */
    triggerRefresh: () => void;
}

/**
 * Context for the Dash API, initialized as null.
 */
const APIContext = createContext<APIContextType | null>(null);

/**
 * Provider component that initializes the FakeDashAPI and manages its lifecycle.
 * * This provider:
 * 1. Maintains a singleton instance of the API via `useRef`.
 * 2. Handles initial data loading/hydration.
 * 3. Subscribes to API changes to trigger UI updates across the app.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Child components that will have access to the API context.
 * @returns {JSX.Element} The context provider wrapper.
 */
export const APIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Maintain a stable reference to the API instance throughout the component lifecycle
    const apiRef = useRef(new FakeDashAPI());
    const api = apiRef.current;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    /**
     * Increments the refresh counter to notify subscribers that data has changed.
     * Memoized to prevent unnecessary re-renders of child components.
     */
    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        // Subscribe to API internal changes to sync with React state
        const unsubscribe = api.subscribe(() => {
            triggerRefresh();
        });

        /**
         * Asynchronous initialization of the API data layer.
         */
        const loadData = async () => {
            try {
                setIsLoading(true);
                await api.initialize();
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // Cleanup: remove the subscription when the provider unmounts
        return () => unsubscribe();
    }, [api, triggerRefresh]);

    return (
        <APIContext.Provider value={{ api, isLoading, error, refreshTrigger, triggerRefresh }}>
            {children}
        </APIContext.Provider>
    );
};

/**
 * Custom hook to access the Dash API and its current state.
 * * @throws {Error} If used outside of an `APIProvider`.
 * @returns {APIContextType} The API instance and status state.
 * * @example
 * const { api, isLoading } = useDashAPI();
 */
export const useDashAPI = () => {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error("useDashApi must be used within an ApiProvider");
    }
    return context;
};