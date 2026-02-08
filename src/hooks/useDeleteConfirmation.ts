import {useCallback, useState} from 'react';

interface UseDeleteConfirmationOptions {
    onConfirm: () => Promise<void> | void;
    onCancel?: () => void;
    title?: string;
    message?: string;
}

interface UseDeleteConfirmationReturn {
    isOpen: boolean;
    openDialog: () => void;
    closeDialog: () => void;
    handleConfirm: () => Promise<void>;
    isDeleting: boolean;
    dialogConfig: {
        title: string;
        message: string;
    };
}

/**
 * Hook for managing delete confirmation dialogs
 * Used in PostDetails, UserDetails, PostListContent, UserListContent
 */
export const useDeleteConfirmation = (options: UseDeleteConfirmationOptions): UseDeleteConfirmationReturn => {
    const {
        onConfirm,
        onCancel,
        title = 'Conferma eliminazione',
        message = 'Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.'
    } = options;

    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDialog = useCallback(() => {
        setIsOpen(true);
    }, []);

    const closeDialog = useCallback(() => {
        if (!isDeleting) {
            setIsOpen(false);
            onCancel?.();
        }
    }, [isDeleting, onCancel]);

    const handleConfirm = useCallback(async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
            setIsOpen(false);
        } catch (error) {
            console.error('Error during deletion:', error);
            throw error;
        } finally {
            setIsDeleting(false);
        }
    }, [onConfirm]);

    return {
        isOpen,
        openDialog,
        closeDialog,
        handleConfirm,
        isDeleting,
        dialogConfig: {
            title,
            message
        }
    };
};

/**
 * Hook for managing bulk delete confirmation dialogs
 */
export const useBulkDeleteConfirmation = (options: Omit<UseDeleteConfirmationOptions, 'title' | 'message'> & {
    count: number;
    itemName?: string;
}) => {
    const { onConfirm, onCancel, count, itemName = 'elementi' } = options;

    return useDeleteConfirmation({
        onConfirm,
        onCancel,
        title: 'Conferma eliminazione multipla',
        message: `Sei sicuro di voler eliminare ${count} ${itemName} selezionati? Questa azione non può essere annullata.`
    });
};