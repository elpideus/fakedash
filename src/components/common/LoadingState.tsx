import React from 'react';
import { CircularProgress } from '@mui/material';

interface LoadingStateProps {
    message?: string;
    size?: number;
    fullHeight?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
                                                       message = 'Caricamento...',
                                                       size = 60,
                                                       fullHeight = true
                                                   }) => {
    return (
        <div className={`${fullHeight ? 'h-full' : ''} flex items-center justify-center p-8`}>
            <div className="text-center">
                <CircularProgress size={size} sx={{ color: "#4a5565" }} />
                {message && (
                    <p className="mt-4 text-gray-600">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default LoadingState;