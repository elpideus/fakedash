import { useCallback } from 'react';
import { useTableStore } from '../store/useTableStore.ts';

/**
 * A hook for persisting and retrieving Material React Table (MRT) states
 * (pagination, sorting, filtering) using a centralized Zustand store.
 * @param {string} tableKey - The unique identifier for the table (e.g., 'postTable', 'userTable').
 * @returns {{ getStoredState: Function, saveState: Function }} Methods to interact with stored table states.
 */
export const useTablePersistence = (tableKey: string) => {
    const store = useTableStore();

    /**
     * Retrieves the current stored state for the initialized tableKey.
     * @returns {Object|null} The stored table state or null if the key is unrecognized.
     */
    const getStoredState = useCallback(() => {
        switch (tableKey) {
            case 'postTable':
                return store.postTable;
            case 'userTable':
                return store.userTable;
            case 'userDetailsTable':
                return store.userDetailsTable;
            default:
                return null;
        }
    }, [store, tableKey]);

    /**
     * Persists table state updates to the store by dynamically invoking setter functions.
     *
     * This method constructs setter names based on the `tableKey` and the state keys.
     * For example, if `tableKey` is 'postTable' and the state contains 'sorting',
     * it will look for a function named `setPostTableSorting` in the store.
     * @param {Record<string, any>} state - An object containing the table state slices to update.
     */
    const saveState = useCallback((state: never) => {
        // Construct the base setter prefix: e.g., "setPostTable"
        const setterName = `set${tableKey.charAt(0).toUpperCase() + tableKey.slice(1)}`;

        Object.keys(state).forEach(key => {
            // Construct the specific property setter: e.g., "setPostTableSorting"
            const fullSetterName = `${setterName}${key.charAt(0).toUpperCase() + key.slice(1)}`;

            // Dynamically check and invoke the store action
            if (typeof store[fullSetterName as keyof typeof store] === 'function') {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
                (store[fullSetterName as keyof typeof store] as Function)(state[key]);
            }
        });
    }, [store, tableKey]);

    return {
        getStoredState,
        saveState
    };
};