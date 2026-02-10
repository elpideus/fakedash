import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import NavElement from './NavElement';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../store/authStore.ts';

/**
 * Interface defining the properties for the {@link Sidebar} component.
 */
interface SidebarProps {
    /** Optional callback fired when a navigation item is clicked.
     * Receives the unique ID of the clicked menu item.
     */
    onNavClick?: (id: number) => void;
    /** The index of the currently active navigation item (for external control). */
    activeItem?: number;
}

/**
 * Primary vertical navigation sidebar for the application.
 *
 * @remarks
 * This component manages a complex "sliding" selection indicator. It uses `useRef` to track
 * navigation history (previous route and index) to determine whether the indicator should
 * slide vertically, fade out (when entering detail pages), or "pop" in (when returning to lists).
 *
 * @component
 */
function Sidebar({ onNavClick }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    /** Reference for sequence animation timers to prevent memory leaks or race conditions. */
    const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    /** Persists the "detail page" state across renders to calculate entry/exit animations. */
    const prevIsDetailPageRef = useRef(false);
    /** Persists the last valid menu index to provide a starting point for the next animation. */
    const prevActiveIndexRef = useRef(-1);

    /** Configuration for sidebar navigation links.
     * Icons are customized with specific font sizes and opacities for visual consistency.
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

    /** Evaluates if the current route is a sub-page (detail view).
     * This state is used to hide/show the selection background.
     */
    const isDetailPage =
        location.pathname.startsWith('/post/') ||
        location.pathname.startsWith('/user/');

    /** Matches the current URL path against the navigation item list.
     */
    const activeItem = navItems.findIndex(item =>
        item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)
    );

    const safeActiveIndex = activeItem === -1 ? 0 : activeItem;

    /** CSS properties for the sliding background indicator.
     */
    const [selectionStyle, setSelectionStyle] = useState({
        top: `${safeActiveIndex * 64}px`,
        left: isDetailPage ? '-100%' : '0',
        opacity: isDetailPage ? 0 : 1,
        transition: 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease-out'
    });

    /** Coordinate state for the indicator's CSS transform.
     */
    const [transform, setTransform] = useState({
        translateX: isDetailPage ? '-100%' : '0%',
        translateY: `${safeActiveIndex * 64}px`
    });

    /** Effect hook to manage the state machine of the sidebar indicator.
     * Logic branches:
     * 1. Entering a detail page (Hide indicator).
     * 2. Returning from a detail page (Teleport and fade in).
     * 3. Switching between list items (Smooth vertical slide).
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
                // Moving into a detail page
                setTransform({
                    translateX: '-100%',
                    translateY: `${prevActiveIndexRef.current * 64}px`
                });
                setSelectionStyle(prev => ({ ...prev, opacity: 0 }));
            } else if (!isDetailPage && prevIsDetailPage) {
                // Returning to a list page
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
                // Normal vertical slide
                setTransform({
                    translateX: '0%',
                    translateY: `${safeActiveIndex * 64}px`
                });
            } else if (!isDetailPage) {
                // Static initialization
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
     * Executes navigation and triggers the optional click callback.
     * @param {number} id - The ID of the nav item.
     * @param {string} path - The target route.
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
     * Clears authentication state and routes the user to the login screen.
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
                {/* Selection Indicator Background */}
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

            {/* User Profile and Actions Footer */}
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