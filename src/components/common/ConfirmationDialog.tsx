import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress
} from '@mui/material';
import { PrimaryButton, SecondaryButton } from "./Buttons.tsx";

/**
 * Interface defining the configuration properties for the ConfirmationDialog.
 */
interface ConfirmationDialogProps {
    /** Controls the visibility of the dialog. */
    open: boolean;
    /** Header text displayed at the top of the modal. */
    title: string;
    /** Detailed body text explaining the consequence of the action. */
    message: string;
    /** * Function triggered when user clicks the primary action button.
     * Supports async/await for network-dependent actions.
     */
    onConfirm: () => void | Promise<void>;
    /** Function triggered when user cancels or clicks outside the modal. */
    onCancel: () => void;
    /** Label for the confirmation button. Defaults to "Conferma". */
    confirmText?: string;
    /** Label for the cancellation button. Defaults to "Annulla". */
    cancelText?: string;
    /** Categorizes the action to determine color coding.
     * - 'error': Red (Destructive actions)
     * - 'warning': Amber (Risky actions)
     * - 'info': Blue (Standard procedural updates)
     * @default 'error'
     */
    severity?: 'error' | 'warning' | 'info';
    /** If true, replaces text with a spinner and disables all buttons. */
    isLoading?: boolean;
    /** Manually prevents the confirm button from being clickable. */
    disableConfirm?: boolean;
    /** Manually prevents the cancel button from being clickable. */
    disableCancel?: boolean;
}

/**
 * A reusable modal for high-stakes user decisions.
 *
 * Features accessibility via ARIA labels, built-in loading states,
 * and severity-based styling using Tailwind classes.
 *
 * @component
 * @example
 * ```tsx
 * <ConfirmationDialog
 * open={isDeleteDialogOpen}
 * title="Elimina Post"
 * message="Sei sicuro di voler eliminare questo post? L'azione è irreversibile."
 * severity="error"
 * onConfirm={async () => await deleteApiCall()}
 * onCancel={() => setOpen(false)}
 * />
 * ```
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
                                                                   open,
                                                                   title,
                                                                   message,
                                                                   onConfirm,
                                                                   onCancel,
                                                                   confirmText = 'Conferma',
                                                                   cancelText = 'Annulla',
                                                                   severity = 'error',
                                                                   isLoading = false,
                                                                   disableConfirm = false,
                                                                   disableCancel = false
                                                               }) => {

    /**
     * Executes the confirmation callback.
     * Wraps the call in an async wrapper to ensure Promise support.
     */
    const handleConfirm = async () => {
        await onConfirm();
    };

    /**
     * Internal helper to map the 'severity' prop to Tailwind CSS utility classes.
     * @returns {string} Tailwind class names for background and hover states.
     */
    const getSeverityStyles = (): string => {
        switch (severity) {
            case 'error':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 text-white';
            case 'info':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            default:
                return 'bg-red-600 hover:bg-red-700 text-white';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onCancel}
            aria-labelledby="confirmation-dialog-title"
            aria-describedby="confirmation-dialog-description"
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: '16px',
                        padding: '8px'
                    }
                }
            }}
        >
            <DialogTitle id="confirmation-dialog-title" className="font-semibold text-xl">
                {title}
            </DialogTitle>

            <DialogContent>
                <DialogContentText id="confirmation-dialog-description" className="text-gray-700">
                    {message}
                </DialogContentText>
            </DialogContent>

            <DialogActions className="p-6 pt-2">
                <SecondaryButton
                    onClick={onCancel}
                    variant="outlined"
                    className="rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                    disabled={isLoading || disableCancel}
                >
                    {cancelText}
                </SecondaryButton>

                <PrimaryButton
                    onClick={handleConfirm}
                    variant="contained"
                    className={`rounded-lg ${getSeverityStyles()}`}
                    disabled={isLoading || disableConfirm}
                    autoFocus
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <CircularProgress size={20} sx={{ color: 'white' }} />
                            <span>Caricamento...</span>
                        </div>
                    ) : (
                        confirmText
                    )}
                </PrimaryButton>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;