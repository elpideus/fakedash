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
    FormHelperText
} from '@mui/material';
import { useDashAPI } from '../context/APIContext';
import { validatePost } from '../utils/validationUtils';
import Drawer from './common/Drawer';
import { useAuth } from '../store/authStore';
import {PrimaryButton, SecondaryButton} from "./common/Buttons.tsx";

interface CreatePostDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreatePostDrawer: React.FC<CreatePostDrawerProps> = ({ open, onClose, onSuccess }) => {
    const { api, triggerRefresh } = useDashAPI();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        userId: user?.id || ''
    });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    // Get all users for dropdown
    const users = api.getUsers();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        if (name) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors([]);

        // Validate form
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

            // Refresh data
            triggerRefresh();

            // Reset form
            setFormData({
                title: '',
                content: '',
                userId: user?.id || ''
            });

            // Call success callback
            onSuccess?.();

            // Close drawer
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la creazione del post');
            console.error('Error creating post:', err);
        } finally {
            setIsLoading(false);
        }
    };

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