import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { FakeDashAPI } from '../services/FakeDashAPI';

interface APIContextType {
    api: FakeDashAPI;
    isLoading: boolean;
    error: Error | null;
    refreshTrigger: number; // Trigger refresh using a simple counter
    triggerRefresh: () => void;
}

const APIContext = createContext<APIContextType | null>(null);

export const APIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 1. Create the API instance
    const apiRef = useRef(new FakeDashAPI());
    const api = apiRef.current;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Simple counter

    // Function to manually trigger a refresh
    const triggerRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        // 2. Subscribe to API changes
        const unsubscribe = api.subscribe(() => {
            triggerRefresh();
        });

        // 3. Initialize Data
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

        return () => unsubscribe();
    }, [api, triggerRefresh]);

    return (
        <APIContext.Provider value={{ api, isLoading, error, refreshTrigger, triggerRefresh }}>
            {children}
        </APIContext.Provider>
    );
};

// --- Custom Hook ---
export const useDashAPI = () => {
    const context = useContext(APIContext);
    if (!context) {
        throw new Error("useDashApi must be used within an ApiProvider");
    }
    return context;
};