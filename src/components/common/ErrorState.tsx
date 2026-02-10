import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Props for the ErrorState component.
 */
interface ErrorStateProps {
    /** Short title describing the error */
    title?: string;
    /** Main error message shown to the user */
    message: string;
    /** Optional technical or additional error details */
    details?: string;
    /** Whether to show a back navigation button */
    showBackButton?: boolean;
    /** Callback triggered when the back button is clicked */
    onBack?: () => void;
    /** Text displayed for the back button */
    backText?: string;
}

/**
 * Generic error state component.
 *
 * Used to display blocking errors such as failed data loading,
 * missing resources, or permission issues.
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

            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-600">
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <p className="mb-4">{message}</p>

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
