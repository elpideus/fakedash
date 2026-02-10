import React from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * Interface defining the properties for the {@link HeaderActions} component.
 */
interface HeaderActionsProps {
    /** Indicates if the interface should display "Save/Cancel" (true) or "Edit/Delete" (false). */
    isEditing: boolean;
    /** Function to trigger the transition into edit mode. */
    onEdit: () => void;
    /** Function to persist current changes to the data source. */
    onSave: () => void;
    /** Function to discard changes and return to view mode. */
    onCancel: () => void;
    /** Optional function to trigger a resource deletion. */
    onDelete?: () => void;
    /** If true, prevents interaction with the delete button.
     * @default false
     */
    isDeleting?: boolean;
    /** If true, prevents the edit button from being clicked. */
    disableEdit?: boolean;
    /** If true, prevents the save button from being clicked (e.g., during validation errors). */
    disableSave?: boolean;
    /** If true, prevents the delete button from being clicked. */
    disableDelete?: boolean;
    /** * Controls the visibility of the Edit action when in view mode.
     * @default false
     */
    showEdit?: boolean;
    /** Controls the visibility of the Delete action when in view mode.
     * @default false
     */
    showDelete?: boolean;
}

/**
 * A context-aware toolbar for detail headers.
 *
 * @remarks
 * This component toggles between two distinct action sets based on the `isEditing` prop:
 * - **View Mode:** Renders Edit and Delete buttons.
 * - **Edit Mode:** Renders Save and Cancel buttons.
 *
 * It uses Tailwind classes for background coloring and MUI IconButtons for interaction.
 *
 * @component
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
    // Mode: View (Edit / Delete)
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

    // Mode: Edit (Save / Cancel)
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