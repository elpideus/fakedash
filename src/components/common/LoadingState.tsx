import React from 'react';
import { CircularProgress } from '@mui/material';

/**
 * Props for the LoadingState component.
 */
interface LoadingStateProps {
    /** Optional loading message displayed below the spinner */
    message?: string;
    /** Size of the spinner in pixels (default: 60) */
    size?: number;
    /** Whether the loader should take the full available height */
    fullHeight?: boolean;
}

/**
 * Generic loading state component.
 *
 * Used to indicate ongoing async operations such as
 * data fetching, page transitions, or background processing.
 */
const LoadingState: React.FC<LoadingStateProps> = ({
                                                       message = 'Caricamento...',
                                                       size = 60,
                                                       fullHeight = true
                                                   }) => {
    return (
        <div className={`${fullHeight ? 'h-full' : ''} flex items-center justify-center p-8`}>
            <div className="text-center">
                <CircularProgress size={size} sx={{ color: '#4a5565' }} />

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
