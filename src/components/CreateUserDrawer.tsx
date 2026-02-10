import React, { useState } from 'react';
import {
    TextField,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { useDashAPI } from '../context/useDashAPI.tsx';
import { validateUser } from '../utils/validationUtils';
import Drawer from './common/Drawer';
import { PrimaryButton, SecondaryButton } from "./common/Buttons.tsx";

/**
 * Properties for the CreateUserDrawer component.
 */
interface CreateUserDrawerProps {
    /** Whether the drawer is open. */
    open: boolean;
    /** Callback fired when the drawer closes. */
    onClose: () => void;
    /** Optional callback executed after successful user creation. */
    onSuccess?: () => void;
}

/**
 * A slide-out form for registering new users in the system.
 * @remarks
 * This component standardizes the user creation workflow by:
 * 1. Handling input state for name, email, and password.
 * 2. Running client-side validation via `validateUser`.
 * 3. Handling API submission and updating the global context via `triggerRefresh`.
 *
 * @component
 */
const CreateUserDrawer: React.FC<CreateUserDrawerProps> = ({ open, onClose, onSuccess }) => {
    const { api, triggerRefresh } = useDashAPI();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    /**
     * Local form state for user credentials and profile information.
     */
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    /**
     * List of active validation error messages.
     */
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

    /**
     * Updates form state on input change.
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Handles the user creation lifecycle: validation, API call, and UI feedback.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setValidationErrors([]);

        // Perform schema validation
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

            // Notify API Context to refetch users
            triggerRefresh();

            // Clear form on success
            setFormData({
                name: '',
                email: '',
                password: ''
            });

            onSuccess?.();
            onClose();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Errore durante la creazione dell\'utente');
            console.error('Error creating user:', err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Resets form state and closes the drawer, preventing action if loading.
     */
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
                    {/* Server/API Error Alert */}
                    {error && (
                        <Alert severity="error" onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {/* Client-side Validation Alerts */}
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

                    {/* Form Actions */}
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