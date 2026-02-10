import React from 'react';

/**
 * Props for the NavElement component.
 */
interface NavElementProps {
    /** Content of the navigation item (icon, label, etc.) */
    children: React.ReactNode;
    /** Whether the navigation item is currently active */
    active?: boolean;
    /** Click handler for the navigation item */
    onClick: () => void;
}

/**
 * Navigation list item component.
 *
 * Represents a single entry in a navigation menu.
 * Applies a visual offset when active and a subtle
 * hover animation when inactive.
 */
function NavElement({ children, active = false, onClick }: NavElementProps) {
    return (
        <li
            onClick={onClick}
            className="h-16 p-0 rounded-tr-2xl rounded-br-2xl cursor-pointer relative z-10 flex items-center"
        >
            <div
                className={`flex items-center transition-all duration-500 gap-2 w-full p-4 ${
                    active ? 'translate-x-6' : 'hover:translate-x-2'
                }`}
            >
                {children}
            </div>
        </li>
    );
}

export default NavElement;
