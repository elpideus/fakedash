import { useCallback, useState } from 'react';

/**
 * Configuration options for the delete confirmation dialog.
 */
interface UseDeleteConfirmationOptions {
    /** Function to execute when the user confirms the deletion. Supports async operations. */
    onConfirm: () => Promise<void> | void;
    /** Optional callback executed when the user cancels or closes the dialog. */
    onCancel?: () => void;
    /** Custom title for the dialog. @default 'Conferma eliminazione' */
    title?: string;
    /** Custom message body for the dialog. @default 'Sei sicuro di voler eliminare questo elemento? Questa azione non può essere annullata.' */
    message?: string;
}

/**
 * State and methods returned by the useDeleteConfirmation hook.
 */
interface UseDeleteConfirmationReturn {
    /** Whether the dialog is currently visible. */
    isOpen: boolean;
    /** Function to set isOpen to true. */
    openDialog: () => void;
    /** Function to set isOpen to false. Will not close if isDeleting is true. */
    closeDialog: () => void;
    /** The handler to be passed to the dialog's confirm button. Manages the loading state and execution of onConfirm. */
    handleConfirm: () => Promise<void>;
    /** Indicates if the onConfirm promise is currently pending. */
    isDeleting: boolean;
    /** Static configuration for the dialog UI. */
    dialogConfig: {
        title: string;
        message: string;
    };
}

/**
 * A custom hook for managing the state and logic of a single-item delete confirmation dialog.
 * Provides built-in protection to prevent closing the dialog while a deletion is in progress
 * and exposes a loading state (`isDeleting`) for UI feedback.
 *
 * @hook
 * @param {UseDeleteConfirmationOptions} options - Configuration for callbacks and text content.
 * @returns {UseDeleteConfirmationReturn} Logic and state for the confirmation UI.
 * @example
 * const { openDialog, handleConfirm, isDeleting } = useDeleteConfirmation({
 * onConfirm: () => api.deletePost(id),
 * });
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

    /**
     * Opens the confirmation dialog.
     */
    const openDialog = useCallback(() => {
        setIsOpen(true);
    }, []);

    /**
     * Closes the confirmation dialog and triggers the onCancel callback.
     * Prevents closing if a deletion is currently in progress.
     */
    const closeDialog = useCallback(() => {
        if (!isDeleting) {
            setIsOpen(false);
            onCancel?.();
        }
    }, [isDeleting, onCancel]);

    /**
     * Executes the confirmation logic.
     * Sets the deleting state to true, awaits the callback, and closes the dialog on success.
     * @throws {Error} Re-throws the error after logging if the deletion fails.
     */
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
 * A specialized version of the delete confirmation hook for bulk actions.
 * Automatically generates an Italian confirmation message based on the number of items.
 *
 * @hook
 * @param {Omit<UseDeleteConfirmationOptions, 'title' | 'message'> & { count: number, itemName?: string }} options
 * @param {number} options.count - The number of items selected for deletion.
 * @param {string} [options.itemName='elementi'] - The plural name of the items being deleted.
 * @returns {UseDeleteConfirmationReturn}
 */
export const useBulkDeleteConfirmation = (options: Omit<UseDeleteConfirmationOptions, 'title' | 'message'> & {
    count: number;
    itemName?: string;
}): UseDeleteConfirmationReturn => {
    const { onConfirm, onCancel, count, itemName = 'elementi' } = options;

    return useDeleteConfirmation({
        onConfirm,
        onCancel,
        title: 'Conferma eliminazione multipla',
        message: `Sei sicuro di voler eliminare ${count} ${itemName} selezionati? Questa azione non può essere annullata.`
    });
};