import React from 'react';

/**
 * Interface defining the properties for the {@link NavElement} component.
 */
interface NavElementProps {
    /** The content to be rendered inside the list item, typically an icon and a label. */
    children: React.ReactNode;
    /** Indicates if the item is currently selected.
     * If true, applies a persistent horizontal offset.
     * @default false
     */
    active?: boolean;
    /** Callback function executed when the navigation item is clicked. */
    onClick: () => void;
}

/**
 * A specialized list item for sidebar or menu navigation.
 *
 * Uses CSS transitions to provide visual feedback:
 * - **Active state:** Moves the content right by 24px (translate-x-6).
 * - **Hover state:** Moves the content right by 8px (translate-x-2) if not active.
 *
 * @component
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