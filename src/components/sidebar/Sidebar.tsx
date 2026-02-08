import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import NavElement from './NavElement';
import {useLocation, useNavigate} from "react-router-dom";
import React, { useEffect, useState, useRef } from 'react';

interface SidebarProps {
    onNavClick?: (id: number) => void,
    activeItem?: number
}

function Sidebar({onNavClick}: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const animationTimeoutRef = useRef<NodeJS.Timeout>();
    const prevIsDetailPageRef = useRef(false);
    const prevActiveIndexRef = useRef(-1);

    const navItems = [
        {
            id: 0,
            label: "Post",
            path: "/",
            icon: <DashboardIcon style={{fontSize: "2rem", color: "black", opacity: .7}}/>
        },
        {
            id: 1,
            label: "Utenti",
            path: "/users",
            icon: <PersonIcon style={{fontSize: "2rem", color: "black", opacity: .7}}/>
        },
    ];

    // Check if we're on a detail page (post or user details)
    const isDetailPage = location.pathname.startsWith('/post/') ||
        location.pathname.startsWith('/user/');

    const activeItem = navItems.findIndex(item =>
        item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path)
    );

    const safeActiveIndex = activeItem === -1 ? 0 : activeItem;

    // State to control selection background animation
    const [selectionStyle, setSelectionStyle] = useState({
        top: `${safeActiveIndex * 64}px`,
        left: isDetailPage ? '-100%' : '0',
        opacity: isDetailPage ? 0 : 1,
        transition: 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease-out'
    });

    // Store transform values separately for GPU acceleration
    const [transform, setTransform] = useState({
        translateX: isDetailPage ? '-100%' : '0%',
        translateY: `${safeActiveIndex * 64}px`
    });

    // Effect to handle animations when route changes
    useEffect(() => {
        // Clear any pending timeout
        if (animationTimeoutRef.current) {
            clearTimeout(animationTimeoutRef.current);
        }

        const prevIsDetailPage = prevIsDetailPageRef.current;
        const isSwitchingListPages = !prevIsDetailPage && !isDetailPage &&
            prevActiveIndexRef.current !== -1 &&
            prevActiveIndexRef.current !== safeActiveIndex;

        // Prepare for animation - enable GPU acceleration
        setSelectionStyle(prev => ({
            ...prev,
            transition: 'transform 300ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 300ms ease-out'
        }));

        if (isDetailPage && !prevIsDetailPage) {
            // When entering detail page from list page, slide out
            requestAnimationFrame(() => {
                setTransform({
                    translateX: '-100%',
                    translateY: `${prevActiveIndexRef.current * 64}px`
                });
                setSelectionStyle(prev => ({
                    ...prev,
                    opacity: 0
                }));
            });
        } else if (!isDetailPage && prevIsDetailPage) {
            // When exiting detail page to list page, slide in
            // First set off-screen
            setTransform({
                translateX: '-100%',
                translateY: `${safeActiveIndex * 64}px`
            });
            setSelectionStyle(prev => ({
                ...prev,
                opacity: 0
            }));

            // Then animate in on next frame
            animationTimeoutRef.current = setTimeout(() => {
                requestAnimationFrame(() => {
                    setTransform({
                        translateX: '0%',
                        translateY: `${safeActiveIndex * 64}px`
                    });
                    setSelectionStyle(prev => ({
                        ...prev,
                        opacity: 1
                    }));
                });
            }, 10);
        } else if (isSwitchingListPages) {
            // When switching between list pages (Posts <-> Users)
            // Animate vertical movement only
            requestAnimationFrame(() => {
                setTransform(prev => ({
                    ...prev,
                    translateY: `${safeActiveIndex * 64}px`,
                    translateX: '0%'
                }));
            });
        } else if (!isDetailPage) {
            // Initial load on list page or direct navigation
            requestAnimationFrame(() => {
                setTransform({
                    translateX: '0%',
                    translateY: `${safeActiveIndex * 64}px`
                });
                setSelectionStyle(prev => ({
                    ...prev,
                    opacity: 1
                }));
            });
        }

        // Update refs for next comparison
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

    const handleNavigation = (id: number, path: string) => {
        // Navigate immediately but don't wait for content to load
        navigate(path);
        if (onNavClick) {
            // Use requestAnimationFrame to ensure animation runs before heavy content loads
            requestAnimationFrame(() => {
                onNavClick(id);
            });
        }
    };

    return (
        <aside className="w-64 bg-white flex flex-col py-4 flex-shrink-0">
            <div className="logo-section px-6 mb-8">
                <h2 className="text-2xl font-bold">FakeDash</h2>
            </div>

            <nav className="flex-1 relative overflow-y-auto overflow-x-hidden">
                {/* Selection background with GPU-accelerated animation */}
                <div
                    className="absolute left-0 w-[80%] bg-[#F1F1F1] rounded-tr-2xl rounded-br-2xl"
                    style={{
                        height: '64px',
                        transform: `translateX(${transform.translateX}) translateY(${transform.translateY})`,
                        opacity: selectionStyle.opacity,
                        transition: selectionStyle.transition,
                        zIndex: 0,
                        willChange: 'transform, opacity', // Hint to browser for GPU acceleration
                        backfaceVisibility: 'hidden', // Additional GPU optimization
                        WebkitFontSmoothing: 'subpixel-antialiased', // Better text rendering
                    }}
                />
                <ul className="flex flex-col list-none p-0 m-0">
                    {navItems.map((item) => (
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
                <div
                    className="profile-picture rounded-full bg-black/10 min-w-12 min-h-12 w-12 h-12 flex justify-center items-center">
                    <PersonIcon style={{fontSize: "2.5rem", color: "black", opacity: .5}}/>
                </div>
                <div className="h-12 flex flex-col truncate">
                    <div className="truncate font-semibold">Admin User</div>
                    <div className="text-sm text-red-700 cursor-pointer" onClick={() => navigate('/login')}>Logout</div>
                </div>
            </div>
        </aside>
    );
}

// Export memoized component to prevent unnecessary re-renders
export default React.memo(Sidebar);