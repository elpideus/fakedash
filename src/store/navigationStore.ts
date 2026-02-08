import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationHistoryEntry {
    path: string;
    search: string;
    title?: string;
    timestamp: number;
}

interface NavigationState {
    // Navigation history stack
    history: NavigationHistoryEntry[];
    maxHistorySize: number;

    // Actions
    pushToHistory: (entry: Omit<NavigationHistoryEntry, 'timestamp'>) => void;
    popFromHistory: () => NavigationHistoryEntry | null;
    getPreviousPath: () => string | null;
    getHistory: () => NavigationHistoryEntry[];
    clearHistory: () => void;
    getBackTarget: (currentPath: string, currentSearch: string) => string;
    initializeFromCurrentLocation: (path: string, search: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
    persist(
        (set, get) => ({
            history: [],
            maxHistorySize: 20,

            pushToHistory: (entry) => {
                set((state) => {
                    const newEntry = {
                        ...entry,
                        timestamp: Date.now()
                    };

                    // Don't add if it's the same as the last entry
                    const lastEntry = state.history[state.history.length - 1];
                    if (lastEntry &&
                        lastEntry.path === newEntry.path &&
                        lastEntry.search === newEntry.search) {
                        return state;
                    }

                    // Also check if it's the same as the current location (shouldn't happen but just in case)
                    if (state.history.length > 0) {
                        const currentEntry = state.history[state.history.length - 1];
                        if (currentEntry.path === newEntry.path &&
                            currentEntry.search === newEntry.search) {
                            return state;
                        }
                    }

                    // Add new entry and limit history size
                    const newHistory = [...state.history, newEntry];
                    if (newHistory.length > state.maxHistorySize) {
                        newHistory.shift(); // Remove oldest entry
                    }

                    return { history: newHistory };
                });
            },

            popFromHistory: () => {
                let poppedEntry: NavigationHistoryEntry | null = null;

                set((state) => {
                    if (state.history.length === 0) return state;

                    const newHistory = [...state.history];
                    poppedEntry = newHistory.pop() || null;

                    return { history: newHistory };
                });

                return poppedEntry;
            },

            getPreviousPath: () => {
                const state = get();
                if (state.history.length < 2) return null;

                const previousEntry = state.history[state.history.length - 2];
                return previousEntry ? previousEntry.path + previousEntry.search : null;
            },

            getHistory: () => {
                return get().history;
            },

            clearHistory: () => {
                set({ history: [] });
            },

            // src/store/navigationStore.ts (update the getBackTarget method only)
            getBackTarget: (currentPath: string, currentSearch: string) => {
                const state = get();
                const currentFullPath = currentPath + currentSearch;

                // If history is empty, return fallback
                if (state.history.length === 0) {
                    return '/';
                }

                // Find the most recent different path in history
                let foundIndex = -1;
                for (let i = state.history.length - 1; i >= 0; i--) {
                    const entry = state.history[i];
                    const entryFullPath = entry.path + entry.search;

                    if (entryFullPath !== currentFullPath) {
                        foundIndex = i;
                        break;
                    }
                }

                // If we found a different entry, return it
                if (foundIndex >= 0) {
                    const targetEntry = state.history[foundIndex];
                    return targetEntry.path + targetEntry.search;
                }

                // If we didn't find a different entry, clear duplicates and try again
                // This can happen if we have multiple identical entries
                const uniqueHistory = state.history.filter((entry, index, self) => {
                    const entryFullPath = entry.path + entry.search;
                    return self.findIndex(e =>
                        e.path + e.search === entryFullPath
                    ) === index;
                });

                // If current is still the same as the last unique entry, go to root
                if (uniqueHistory.length > 0) {
                    const lastUnique = uniqueHistory[uniqueHistory.length - 1];
                    const lastUniqueFullPath = lastUnique.path + lastUnique.search;

                    if (lastUniqueFullPath !== currentFullPath) {
                        return lastUniqueFullPath;
                    }
                }

                // Default fallback
                return '/';
            },

            initializeFromCurrentLocation: (path: string, search: string) => {
                set((state) => {
                    // Only initialize if history is empty
                    if (state.history.length === 0) {
                        const initialEntry = {
                            path,
                            search,
                            timestamp: Date.now()
                        };
                        return { history: [initialEntry] };
                    }
                    return state;
                });
            }
        }),
        {
            name: 'navigation-history',
            version: 1,
        }
    )
);

// Helper hook for using navigation store with React components
export const useNavigationHistory = () => {
    const store = useNavigationStore();

    return {
        history: store.history,
        pushToHistory: store.pushToHistory,
        popFromHistory: store.popFromHistory,
        getPreviousPath: store.getPreviousPath,
        getBackTarget: store.getBackTarget,
        clearHistory: store.clearHistory,
        initializeFromCurrentLocation: store.initializeFromCurrentLocation
    };
};