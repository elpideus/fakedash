import React from 'react';

interface NavElementProps {
    children: React.ReactNode;
    active?: boolean;
    onClick: () => void;
}

function NavElement({ children, active = false, onClick }: NavElementProps) {
    return (
        <li
            onClick={onClick}
            className="h-16 p-0 rounded-tr-2xl rounded-br-2xl cursor-pointer relative z-10 flex items-center"
        >
            <div className={`flex items-center transition-all duration-500 gap-2 w-full p-4 ${active ? "translate-x-6" : "hover:translate-x-2"}`}>
                {children}
            </div>
        </li>
    );
}

export default NavElement;