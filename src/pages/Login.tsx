import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PersonIcon from '@mui/icons-material/Person';
import { Alert, CircularProgress } from '@mui/material';
import TextInput from "../components/TextInput.tsx";
import PasswordInput from "../components/PasswordInput.tsx";
import { useAuth } from "../store/authStore.ts";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || "/";
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location]);

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!email.trim()) {
            errors.email = "Email è obbligatoria";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = "Email non valida";
        }

        if (!password.trim()) {
            errors.password = "Password è obbligatoria";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setFormErrors({});

        if (!validateForm()) {
            return;
        }

        const success = await login(email, password);
        if (success) {
            const from = (location.state as any)?.from?.pathname || "/";
            navigate(from, { replace: true });
        }
    };

    return (
        <div className="main-container flex flex-col justify-center items-center h-screen font-inter gap-12">
            <div className="flex flex-col gap-2">
                <div className="login-icon flex justify-center items-center">
                    <PersonIcon
                        fontSize="inherit"
                        color="inherit"
                        className="bg-black rounded-2xl p-2 shadow-xl"
                        style={{fontSize: "4rem", color: "white"}}
                    />
                </div>
                <div className="flex flex-col justify-center items-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                    <h1 className="text-4xl font-medium">Bentornato</h1>
                    <h3 className="text-black/50">Inserisci le tue credenziali per accedere</h3>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-[#fcfdfe] w-[30vw] max-w-[660px] shadow-xl rounded-2xl p-8 flex flex-col"
            >
                {error && (
                    <Alert
                        severity="error"
                        className="mb-6"
                        onClose={clearError}
                    >
                        {error}
                    </Alert>
                )}

                <div className="mb-2">
                    <label className="ml-2 opacity-80">Email</label>
                    <TextInput
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        error={!!formErrors.email}
                    />
                    {formErrors.email && (
                        <p className="text-red-500 text-sm mt-1 ml-2">{formErrors.email}</p>
                    )}
                </div>

                <div className="mb-2">
                    <div className="flex justify-between items-center ml-2 opacity-80 mb-2">
                        <label htmlFor="password">Password</label>
                        <a href="/forgot-password" className="text-sm text-black/50 hover:underline mr-2">
                            Recupera password
                        </a>
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        error={!!formErrors.password}
                    />
                    {formErrors.password && (
                        <p className="text-red-500 text-sm mt-1 ml-2">{formErrors.password}</p>
                    )}
                </div>

                <div className="w-full flex justify-center items-center mt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-black text-white py-2 px-4 rounded-xl cursor-pointer hover:bg-black/80 disabled:bg-black/20 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[120px]"
                    >
                        {isLoading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            "Login"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginPage;