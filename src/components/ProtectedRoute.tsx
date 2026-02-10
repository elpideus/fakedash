import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore.ts";
import React, {type JSX} from "react";

/**
 * Props for the ProtectedRoute component.
 * @interface ProtectedRouteProps
 * @property {React.ReactNode} children - The components to be rendered if the user is authenticated.
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * A wrapper component that restricts access to routes based on authentication status.
 * - While checking auth status, it displays a loading spinner.
 * - If unauthenticated, it redirects to `/login` and preserves the current location in state.
 * - If authenticated, it renders the child components.
 *
 * @component
 * @param {ProtectedRouteProps} props - The properties for the protected route.
 * @returns {JSX.Element} The rendered component or a redirect.
 */
function ProtectedRoute({ children }: ProtectedRouteProps): JSX.Element {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    // Show a loading state while auth status is being determined
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Redirect to log in if not authenticated, saving the 'from' path for post-login redirection
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}

export default ProtectedRoute;