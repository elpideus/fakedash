import React from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Props for the DetailPageLayout component.
 */
interface DetailPageLayoutProps {
    // Navigation
    /** URL to navigate back to (used if onBack is not provided) */
    backUrl?: string;
    /** Text displayed next to the back arrow */
    backText?: string;
    /** Custom back navigation handler */
    onBack?: () => void;

    // Header
    /** Main page title */
    title?: React.ReactNode;
    /** Optional subtitle shown below the title */
    subtitle?: React.ReactNode;
    /** Optional actions rendered in the header (e.g. buttons, menus) */
    headerActions?: React.ReactNode;
    // Content

    /** Main page content */
    children: React.ReactNode;

    // States
    /** Shows a loading spinner instead of the page content */
    isLoading?: boolean;
    /** Whether the page is currently in edit mode */
    isEditing?: boolean;
    /** Shows a hint suggesting double-click to edit */
    showEditHint?: boolean;
    /** Callback triggered on double-click of the content area */
    onDoubleClick?: () => void;

    // Styling
    /** Extra classes applied to the outer container */
    className?: string;
    /** Extra classes applied to the content card */
    contentClassName?: string;
}

/**
 * Layout component for detail pages.
 *
 * Provides:
 * - Optional back navigation
 * - Page header with title, subtitle and actions
 * - Loading state
 * - Editable content hint
 */
const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
                                                               backUrl,
                                                               backText,
                                                               onBack,
                                                               title,
                                                               subtitle,
                                                               headerActions,
                                                               children,
                                                               isLoading = false,
                                                               isEditing = false,
                                                               showEditHint = false,
                                                               onDoubleClick,
                                                               className = '',
                                                               contentClassName = ''
                                                           }) => {

    /**
     * Renders a full-page loading state.
     */
    if (isLoading) {
        return (
            <div className="p-8 h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Caricamento...</p>
                </div>
            </div>
        );
    }

    /**
     * Renders the back button.
     * Priority:
     * 1. onBack handler
     * 2. backUrl link
     * 3. Disabled fallback
     */
    const renderBackButton = () => {
        const backButtonContent = (
            <div className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200 cursor-pointer">
                <span className="inline-block transition-transform duration-200 group-hover:-translate-x-2 delay-150">
                    <ArrowBackIcon />
                </span>
                <span className="group-hover:scale-110 transition-all duration-200">
                    {backText || 'Torna indietro'}
                </span>
            </div>
        );

        if (onBack) {
            return (
                <button
                    onClick={onBack}
                    className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200"
                >
                    {backButtonContent}
                </button>
            );
        }

        if (backUrl) {
            return (
                <Link
                    to={backUrl}
                    className="group inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-all duration-200"
                >
                    {backButtonContent}
                </Link>
            );
        }

        // Fallback: disabled back button
        return (
            <div className="inline-flex items-center gap-2 text-gray-400 cursor-not-allowed">
                <ArrowBackIcon />
                <span>{backText || 'Torna indietro'}</span>
            </div>
        );
    };

    return (
        <div className={`p-8 h-full overflow-auto ${className}`}>
            {/* Navigation + header actions */}
            <div className="flex justify-between items-center mb-6">
                {renderBackButton()}

                {headerActions && (
                    <div className="flex gap-2">
                        {headerActions}
                    </div>
                )}
            </div>

            {/* Main content container */}
            <article
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-200 ${contentClassName}`}
                onDoubleClick={onDoubleClick}
            >
                {/* Header */}
                {(title || subtitle) && (
                    <header className="mb-8">
                        {title && (
                            typeof title === 'string'
                                ? <h1 className="text-4xl font-bold text-gray-800 mb-4">{title}</h1>
                                : <div className="mb-4">{title}</div>
                        )}

                        {subtitle && (
                            <div className="flex items-center gap-4 text-gray-600">
                                {typeof subtitle === 'string'
                                    ? <p className="text-lg">{subtitle}</p>
                                    : subtitle
                                }
                            </div>
                        )}
                    </header>
                )}

                {/* Page body */}
                <div className="prose max-w-none">
                    {children}
                </div>

                {/* Edit hint */}
                {showEditHint && !isEditing && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500 italic">
                            Doppio click per attivare la modalità modifica
                        </p>
                    </div>
                )}
            </article>
        </div>
    );
};

export default DetailPageLayout;
