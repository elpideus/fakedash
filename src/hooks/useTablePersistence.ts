import { useCallback } from 'react';
import { useTableStore } from './useTableStore';

export const useTablePersistence = (tableKey: string) => {
    const store = useTableStore();

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

    const saveState = useCallback((state: any) => {
        const setterName = `set${tableKey.charAt(0).toUpperCase() + tableKey.slice(1)}`;

        Object.keys(state).forEach(key => {
            const fullSetterName = `${setterName}${key.charAt(0).toUpperCase() + key.slice(1)}`;
            if (typeof store[fullSetterName as keyof typeof store] === 'function') {
                (store[fullSetterName as keyof typeof store] as Function)(state[key]);
            }
        });
    }, [store, tableKey]);

    return {
        getStoredState,
        saveState
    };
};