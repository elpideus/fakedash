import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Interface for the {@link ErrorState} component properties.
 */
interface ErrorStateProps {
    /** Short title describing the nature of the error.
     * @default 'Errore'
     */
    title?: string;
    /** The user-facing explanation of what went wrong. */
    message: string;
    /** Technical information or stack trace, rendered in a secondary
     * highlighted block for debugging purposes.
     */
    details?: string;
    /** If true, renders a navigation button at the top of the container.
     * @default true
     */
    showBackButton?: boolean;
    /** Callback function triggered when the back navigation button is clicked. */
    onBack?: () => void;
    /** Label for the navigation button.
     * @default 'Torna Indietro'
     */
    backText?: string;
}

/**
 * A generic component to display full-page or section-level error messages.
 *
 * Provides a clear visual distinction for blocking errors such as 404s,
 * 500s, or unauthorized access attempts, including an optional back-navigation
 * trigger and technical detail expansion.
 *
 * @component
 */
const ErrorState: React.FC<ErrorStateProps> = ({
                                                   title = 'Errore',
                                                   message,
                                                   details,
                                                   showBackButton = true,
                                                   onBack,
                                                   backText = 'Torna Indietro'
                                               }) => {
    return (
        <div className="p-8 h-full">
            {/* Conditional Back Navigation */}
            {showBackButton && onBack && (
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowBackIcon />
                        <span>{backText}</span>
                    </button>
                </div>
            )}

            {/* Error Message Card */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-600">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>

                {/* Technical Details Block */}
                {details && (
                    <div className="mt-4 p-3 bg-red-100 rounded-lg">
                        <p className="text-sm font-medium">Dettagli:</p>
                        <p className="text-sm mt-1">{details}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorState;