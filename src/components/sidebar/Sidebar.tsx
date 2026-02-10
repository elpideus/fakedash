import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NavElement from './NavElement';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../store/authStore.ts';

/**
 * Props for the Sidebar component.
 */
interface SidebarProps {
    /**
     * Optional callback fired when a navigation item is clicked.
     * Receives the id of the clicked item.
     */
    onNavClick?: (id: number) => void;
    /** Currently active navigation item (optional external control) */
    activeItem?: number;
}

/**
 * Application sidebar navigation.
 *
 * Features:
 * - Route-aware active item highlighting
 * - Animated selection indicator
 * - Special handling for list vs detail pages
 * - User profile and logout action
 */
function Sidebar({ onNavClick }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    /** Timeout ref used to sequence animations */
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Tracks whether the previous route was a detail page */
    const prevIsDetailPageRef = useRef(false);
    /** Tracks the previously active navigation index */
    const prevActiveIndexRef = useRef(-1);

    /**
     * Sidebar navigation items.
     */
    const navItems = [
        {
            id: 0,
            label: 'Post',
            path: '/',
            icon: <DashboardIcon style={{ fontSize: '2rem', color: 'black', opacity: 0.7 }} />
        },
        {
            id: 1,
            label: 'Utenti',
            path: '/users',
            icon: <PersonIcon style={{ fontSize: '2rem', color: 'black', opacity: 0.7 }} />
        }
    ];

    /**
     * Determines whether the current route is a detail page.
     * Detail pages hide the selection indicator.
     */
    const isDetailPage =
        location.pathname.startsWith('/post/') ||
        location.pathname.startsWith('/user/');

    /**
     * Resolves the active navigation index based on the current route.
     */
    const activeItem = navItems.findIndex(item =>
        item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
    );

    const safeActiveIndex = activeItem === -1 ? 0 : activeItem;

    /**
     * Visual styles for the selection indicator.
     */
    const [selectionStyle, setSelectionStyle] = useState({
        top: `${safeActiveIndex * 64}px`,
        left: isDetailPage ? '-100%' : '0',
        opacity: isDetailPage ? 0 : 1,
        transition: 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease-out'
    });

    /**
     * Transform state for animating the selection indicator.
     */
    const [transform, setTransform] = useState({
        translateX: isDetailPage ? '-100%' : '0%',
        translateY: `${safeActiveIndex * 64}px`
    });

    /**
     * Handles sidebar selection animations on route changes.
     * Special cases:
     * - Entering a detail page
     * - Returning from a detail page
     * - Switching between list pages
     */
    useEffect(() => {
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        const prevIsDetailPage = prevIsDetailPageRef.current;
        const isSwitchingListPages =
            !prevIsDetailPage &&
            !isDetailPage &&
            prevActiveIndexRef.current !== -1 &&
            prevActiveIndexRef.current !== safeActiveIndex;

        requestAnimationFrame(() => {
            setSelectionStyle(prev => ({
                ...prev,
                transition:
                    'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease-out'
            }));

            if (isDetailPage && !prevIsDetailPage) {
                setTransform({
                    translateX: '-100%',
                    translateY: `${prevActiveIndexRef.current * 64}px`
                });
                setSelectionStyle(prev => ({ ...prev, opacity: 0 }));
            } else if (!isDetailPage && prevIsDetailPage) {
                setTransform({
                    translateX: '-100%',
                    translateY: `${safeActiveIndex * 64}px`
                });
                setSelectionStyle(prev => ({ ...prev, opacity: 0 }));

                animationTimeoutRef.current = window.setTimeout(() => {
                    requestAnimationFrame(() => {
                        setTransform({
                            translateX: '0%',
                            translateY: `${safeActiveIndex * 64}px`
                        });
                        setSelectionStyle(prev => ({ ...prev, opacity: 1 }));
                    });
                }, 10);
            } else if (isSwitchingListPages) {
                setTransform({
                    translateX: '0%',
                    translateY: `${safeActiveIndex * 64}px`
                });
            } else if (!isDetailPage) {
                setTransform({
                    translateX: '0%',
                    translateY: `${safeActiveIndex * 64}px`
                });
                setSelectionStyle(prev => ({ ...prev, opacity: 1 }));
            }
        });

        prevIsDetailPageRef.current = isDetailPage;
        if (!isDetailPage) {
            prevActiveIndexRef.current = safeActiveIndex;
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [isDetailPage, safeActiveIndex]);

    /**
     * Navigates to a new route and notifies listeners.
     */
    const handleNavigation = (id: number, path: string) => {
        navigate(path);
        if (onNavClick) {
            requestAnimationFrame(() => {
                onNavClick(id);
            });
        }
    };

    /**
     * Logs out the current user and redirects to login.
     */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-64 bg-white flex flex-col py-4 flex-shrink-0">
            <div className="logo-section px-6 mb-8">
                <h2 className="text-2xl font-bold">FakeDash</h2>
            </div>

            <nav className="flex-1 relative overflow-y-auto overflow-x-hidden">
                <div
                    className="absolute left-0 w-[80%] bg-[#F1F1F1] rounded-tr-2xl rounded-br-2xl"
                    style={{
                        height: '64px',
                        transform: `translateX(${transform.translateX}) translateY(${transform.translateY})`,
                        opacity: selectionStyle.opacity,
                        transition: selectionStyle.transition,
                        zIndex: 0,
                        willChange: 'transform, opacity',
                        backfaceVisibility: 'hidden',
                        WebkitFontSmoothing: 'subpixel-antialiased',
                    }}
                />

                <ul className="flex flex-col list-none p-0 m-0">
                    {navItems.map(item => (
                        <NavElement
                            key={item.id}
                            active={!isDetailPage && safeActiveIndex === item.id}
                            onClick={() => handleNavigation(item.id, item.path)}
                        >
                            {item.icon}
                            <span className="text-lg font-medium">{item.label}</span>
                        </NavElement>
                    ))}
                </ul>
            </nav>

            <div className="mt-4 mx-4 p-4 flex gap-2 bg-black/5 rounded-2xl flex-shrink-0">
                <div className="profile-picture rounded-full bg-black/10 min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                    <PersonIcon style={{ fontSize: '2.5rem', color: 'black', opacity: 0.5 }} />
                </div>

                <div className="h-12 flex flex-col truncate flex-1">
                    <div className="truncate font-semibold">
                        {user?.name || 'Admin User'}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                        {user?.email || 'admin@example.com'}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Logout"
                >
                    <LogoutIcon />
                </button>
            </div>
        </aside>
    );
}

export default React.memo(Sidebar);
