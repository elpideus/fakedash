import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useDashAPI } from '../context/APIContext';
import { validateUser } from '../utils/validationUtils';
import Drawer from './common/Drawer';
import {PrimaryButton, SecondaryButton} from "./common/Buttons.tsx";

interface CreateUserDrawerProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const CreateUserDrawer: React.FC<CreateUserDrawerProps> = ({ open, onClose, onSuccess }) => {
    const { api, triggerRefresh } = useDashAPI();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors([]);

        // Validate form
        const errors = validateUser(formData);
        if (errors.length > 0) {
            setValidationErrors(errors);
            return;
        }

        setIsLoading(true);

        try {
            const userData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password.trim()
            };

            await api.createUser(userData);

            // Refresh data
            triggerRefresh();

            // Reset form
            setFormData({
                name: '',
                email: '',
                password: ''
            });

            // Call success callback
            onSuccess?.();

            // Close drawer
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la creazione dell\'utente');
            console.error('Error creating user:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setFormData({
                name: '',
                email: '',
                password: ''
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
            title="Crea Nuovo Utente"
            width={600}
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

                    <TextField
                        fullWidth
                        label="Nome"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        error={validationErrors.some(err => err.includes('Nome'))}
                        helperText={validationErrors.find(err => err.includes('Nome')) || "Inserisci il nome completo"}
                        disabled={isLoading}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={validationErrors.some(err => err.includes('Email'))}
                        helperText={validationErrors.find(err => err.includes('Email')) || "Inserisci l'indirizzo email"}
                        disabled={isLoading}
                        required
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={validationErrors.some(err => err.includes('Password'))}
                        helperText={validationErrors.find(err => err.includes('Password')) || "Inserisci una password sicura"}
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
                            {isLoading ? 'Creazione...' : 'Crea Utente'}
                        </PrimaryButton>
                    </Box>
                </Box>
            </form>
        </Drawer>
    );
};

export default CreateUserDrawer;