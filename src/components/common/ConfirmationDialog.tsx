import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    CircularProgress
} from '@mui/material';
import {PrimaryButton, SecondaryButton} from "./Buttons.tsx";


/**
 * Props for the ConfirmationDialog component.
 */
interface ConfirmationDialogProps {
    /** Whether the dialog is open */
    open: boolean;
    /** Title displayed at the top of the dialog */
    title: string;
    /** Main message shown inside the dialog */
    message: string;
    /**
     * Callback executed when the confirm action is triggered.
     * Can be synchronous or asynchronous.
     */
    onConfirm: () => void | Promise<void>;
    /** Callback executed when the dialog is canceled or closed */
    onCancel: () => void;
    /** Text for the confirm button (default: "Conferma") */
    confirmText?: string;
    /** Text for the cancel button (default: "Annulla") */
    cancelText?: string;
    /**
     * Visual severity of the confirm action.
     * Affects confirm button styling.
     */
    severity?: 'error' | 'warning' | 'info';
    /** Shows a loading state on the confirm button */
    isLoading?: boolean;
    /** Disables the confirm button */
    disableConfirm?: boolean;
    /** Disables the cancel button */
    disableCancel?: boolean;
}

/**
 * Generic confirmation dialog component.
 *
 * Used to ask the user to confirm or cancel a critical action
 * (e.g. delete, overwrite, irreversible operations).
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
     * Handles the confirm action.
     * Awaits the onConfirm callback to support async operations.
     */
    const handleConfirm = async () => { await onConfirm() };

    /**
     * Returns Tailwind classes based on the selected severity.
     */
    const getSeverityStyles = () => {
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