import React from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface HeaderActionsProps {
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onDelete?: () => void;
    isDeleting?: boolean;
    disableEdit?: boolean;
    disableSave?: boolean;
    disableDelete?: boolean;
    showEdit?: boolean; // Add this prop
    showDelete?: boolean; // Add this prop
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
                                                         isEditing,
                                                         onEdit,
                                                         onSave,
                                                         onCancel,
                                                         onDelete,
                                                         isDeleting = false,
                                                         disableEdit = false,
                                                         disableSave = false,
                                                         disableDelete = false,
                                                         showEdit = false,
                                                         showDelete = false
                                                     }) => {
    if (!isEditing) {
        return (
            <div className="flex gap-2">
                {showEdit && ( // Only show edit button if showEdit is true
                    <IconButton
                        onClick={onEdit}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                        title="Modifica"
                        disabled={disableEdit}
                    >
                        <EditIcon />
                    </IconButton>
                )}

                {showDelete && onDelete && ( // Only show delete button if showDelete is true
                    <IconButton
                        onClick={onDelete}
                        className="bg-red-100 hover:bg-red-200 text-red-600"
                        title="Elimina"
                        disabled={isDeleting || disableDelete}
                    >
                        <DeleteIcon />
                    </IconButton>
                )}
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <IconButton
                onClick={onSave}
                className="bg-green-100 hover:bg-green-200 text-green-600"
                title="Salva modifiche"
                disabled={disableSave}
            >
                <SaveIcon />
            </IconButton>

            <IconButton
                onClick={onCancel}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Annulla modifiche"
            >
                <CancelIcon />
            </IconButton>
        </div>
    );
};

export default HeaderActions;