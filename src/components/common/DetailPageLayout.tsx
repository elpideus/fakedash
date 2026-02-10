import React from 'react';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Configuration properties for the {@link DetailPageLayout} component.
 */
interface DetailPageLayoutProps {
    // --- Navigation ---
    /** The destination path for the back link.
     * @example "/dashboard/posts"
     */
    backUrl?: string;
    /** The label displayed next to the back arrow icon. Defaults to "Torna indietro". */
    backText?: string;
    /** Optional custom click handler for the back button.
     * If provided, this takes precedence over `backUrl`.
     */
    onBack?: () => void;

    // --- Header ---
    /** The primary heading of the page. Supports strings or custom JSX elements. */
    title?: React.ReactNode;
    /** Descriptive text or metadata displayed directly beneath the title. */
    subtitle?: React.ReactNode;
    /** Area for action components (e.g., Edit, Delete, Save buttons)
     * rendered in the top-right corner.
     */
    headerActions?: React.ReactNode;

    // --- Content ---
    /** The main body content to be rendered inside the white card. */
    children: React.ReactNode;

    // --- States ---
    /** If true, renders a centered loading spinner instead of the page content. */
    isLoading?: boolean;
    /** Indicates if the page is in an active editing state (hides the edit hint). */
    isEditing?: boolean;
    /** If true, displays a footer hint indicating that double-clicking triggers edit mode. */
    showEditHint?: boolean;
    /** Event handler triggered when the main content area is double-clicked. */
    onDoubleClick?: () => void;

    // --- Styling ---
    /** Optional Tailwind classes or custom CSS for the outer wrapper. */
    className?: string;
    /** Optional Tailwind classes or custom CSS for the internal white card. */
    contentClassName?: string;
}

/**
 * A structural layout wrapper for entity detail pages.
 *
 * @remarks
 * This component standardizes the "Detail" view across the application. It automatically
 * handles breadcrumb-style navigation, header alignment, and loading states.
 *
 * **Navigation Priority:**
 * 1. `onBack` (as a button)
 * 2. `backUrl` (as a Router Link)
 * 3. Disabled state (if neither is provided)
 *
 * @component
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
     * Renders a centered, full-height loading state with an animated spinner.
     * @returns {JSX.Element}
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
     * Internal helper to determine the correct navigation element.
     * Logic: prioritizes functional handlers over static links.
     * @returns {JSX.Element}
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

        // Fallback: visually disabled state
        return (
            <div className="inline-flex items-center gap-2 text-gray-400 cursor-not-allowed">
                <ArrowBackIcon />
                <span>{backText || 'Torna indietro'}</span>
            </div>
        );
    };

    return (
        <div className={`p-8 h-full overflow-auto ${className}`}>
            {/* Navigation row containing back button and action cluster */}
            <div className="flex justify-between items-center mb-6">
                {renderBackButton()}

                {headerActions && (
                    <div className="flex gap-2">
                        {headerActions}
                    </div>
                )}
            </div>

            {/* Main content card */}
            <article
                className={`bg-white rounded-2xl p-8 shadow-sm border border-gray-200 ${contentClassName}`}
                onDoubleClick={onDoubleClick}
            >
                {/* Header Section */}
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

                {/* Main Body Area */}
                <div className="prose max-w-none">
                    {children}
                </div>

                {/* UX Helper: Edit hint footer */}
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