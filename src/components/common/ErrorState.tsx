import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface ErrorStateProps {
    title?: string;
    message: string;
    details?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    backText?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
                                                   title = 'Errore',
                                                   message,
                                                   details,
                                                   showBackButton = true,
                                                   onBack,
                                                   backText = 'Torna alla lista'
                                               }) => {
    return (
        <div className="p-8 h-full">
            {showBackButton && onBack && (
                <div className="mb-6">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        <ArrowBackIcon /> {backText}
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