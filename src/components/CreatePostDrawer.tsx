import React, { useState } from 'react';
import {
    TextField,
    Box,
    Alert,
    CircularProgress,
    MenuItem,
    InputLabel,
    FormControl,
    Select,
    FormHelperText,
    type SelectChangeEvent
} from '@mui/material';
import { useDashAPI } from '../context/useDashAPI.tsx';
import { validatePost } from '../utils/validationUtils';
import Drawer from './common/Drawer';
import { useAuth } from '../store/authStore';
import { PrimaryButton, SecondaryButton } from "./common/Buttons.tsx";

/**
 * Properties for the CreatePostDrawer component.
 */
interface CreatePostDrawerProps {
    /** Controls whether the drawer is visible. */
    open: boolean;
    /** Callback function triggered when the drawer requests to close. */
    onClose: () => void;
    /** Optional callback triggered after a post is successfully created. */
    onSuccess?: () => void;
}

/**
 * A slide-out drawer component that provides a form for creating new blog posts.
 * @remarks
 * This component manages the full lifecycle of post creation:
 * 1. **State:** Tracks local form data and validation errors.
 * 2. **Validation:** Uses the `validatePost` utility before submission.
 * 3. **Persistence:** Communicates with `useDashAPI` to save the post.
 * 4. **Sync:** Calls `triggerRefresh()` on success to update global table data.
 *
 * @component
 */
const CreatePostDrawer: React.FC<CreatePostDrawerProps> = ({ open, onClose, onSuccess }) => {
    const { api, triggerRefresh } = useDashAPI();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Internal state for the post creation form.
     */
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        userId: user?.id || ''
    });

    /**
     * List of validation error strings to be displayed in the UI.
     */
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    /**
     * Retrieves the current list of users from the API context for the author dropdown.
     */
    const users = api.getUsers();

    /**
     * Synchronizes form state with input changes.
     * Handles both standard text inputs and MUI Select components.
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent} e - The change event.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    /**
     * Processes form submission.
     * Validates data, converts types, and handles the API request lifecycle.
     *
     * @param {React.FormEvent} e - The form submission event.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors([]);

        // Perform schema validation
        const errors = validatePost(formData);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        if (!formData.userId) {
            setValidationErrors(['Seleziona un autore']);
            return;
        }

        setIsLoading(true);

        try {
            const postData = {
                userId: parseInt(formData.userId as string),
                title: formData.title.trim(),
                content: formData.content.trim(),
                createdAt: new Date().toISOString()
            };

            await api.createPost(postData);

            // Notify context that data has changed
            triggerRefresh();

            // Reset form to initial state
            setFormData({
                title: '',
                content: '',
                userId: user?.id || ''
            });

            onSuccess?.();
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la creazione del post');
            console.error('Error creating post:', err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Resets form state and closes the drawer.
     * Blocked if an async operation is in progress to prevent data loss.
     */
    const handleClose = () => {
        if (!isLoading) {
            setFormData({
                title: '',
                content: '',
                userId: user?.id || ''
            });
            setError(null);
            setValidationErrors([]);
            onClose();
        }
    };

    return (
        <Drawer
            open={open}
            onClose={handleClose}
            title="Crea Nuovo Post"
            width={700}
        >
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                    {/* Error Alerts */}
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {validationErrors.length > 0 && (
                        <Alert severity="error">
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {validationErrors.map((err, index) => (
                                    <li key={index}>{err}</li>
                                ))}
                            </ul>
                        </Alert>
                    )}

                    {/* Author Selection Dropdown */}
                    <FormControl fullWidth error={validationErrors.some(err => err.includes('Autore'))}>
                        <InputLabel id="user-select-label">Autore</InputLabel>
                        <Select
                            labelId="user-select-label"
                            name="userId"
                            value={formData.userId}
                            label="Autore"
                            onChange={handleChange}
                            disabled={isLoading}
                        >
                            {users.map((user) => (
                                <MenuItem key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                            {validationErrors.find(err => err.includes('Autore'))}
                        </FormHelperText>
                    </FormControl>

                    {/* Title Text Input */}
                    <TextField
                        fullWidth
                        label="Titolo"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        error={validationErrors.some(err => err.includes('Titolo'))}
                        helperText={validationErrors.find(err => err.includes('Titolo')) || "Inserisci il titolo del post"}
                        disabled={isLoading}
                        required
                    />

                    {/* Content Multiline Input */}
                    <TextField
                        fullWidth
                        label="Contenuto"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        multiline
                        rows={10}
                        error={validationErrors.some(err => err.includes('Contenuto'))}
                        helperText={validationErrors.find(err => err.includes('Contenuto')) || "Scrivi il contenuto del post"}
                        disabled={isLoading}
                        required
                    />

                    {/* Form Footer Actions */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                        <SecondaryButton
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Annulla
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'Creazione...' : 'Crea Post'}
                        </PrimaryButton>
                    </Box>
                </Box>
            </form>
        </Drawer>
    );
};

export default CreatePostDrawer;