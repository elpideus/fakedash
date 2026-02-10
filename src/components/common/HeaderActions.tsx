import React from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * Props for the HeaderActions component.
 */
interface HeaderActionsProps {
    /** Whether the parent view is currently in edit mode */
    isEditing: boolean;
    /** Trigger edit mode */
    onEdit: () => void;
    /** Persist changes */
    onSave: () => void;
    /** Cancel editing and revert changes */
    onCancel: () => void;
    /** Delete action (optional) */
    onDelete?: () => void;
    /** Whether a delete operation is in progress */
    isDeleting?: boolean;
    /** Disable the edit action */
    disableEdit?: boolean;
    /** Disable the save action */
    disableSave?: boolean;
    /** Disable the delete action */
    disableDelete?: boolean;
    /** Whether to show the edit button when not editing */
    showEdit?: boolean;
    /** Whether to show the delete button when not editing */
    showDelete?: boolean;
}

/**
 * Header action buttons for detail pages.
 *
 * Displays different actions depending on edit state:
 * - View mode: edit / delete
 * - Edit mode: save / cancel
 */
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
                {showEdit && (
                    <IconButton
                        onClick={onEdit}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-600"
                        title="Modifica"
                        disabled={disableEdit}
                    >
                        <EditIcon />
                    </IconButton>
                )}

                {showDelete && onDelete && (
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
