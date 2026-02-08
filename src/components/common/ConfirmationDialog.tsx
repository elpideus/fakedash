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

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    severity?: 'error' | 'warning' | 'info';
    isLoading?: boolean;
    disableConfirm?: boolean;
    disableCancel?: boolean;
}

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
    const handleConfirm = async () => { await onConfirm() };

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