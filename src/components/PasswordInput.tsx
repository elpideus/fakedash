import React, { useState } from "react";

/**
 * Properties for the PasswordInput component.
 * Extends standard HTML input attributes.
 */
interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** If true, applies error styling to the borders and helper text. */
    error?: boolean;
    /** Optional message displayed below the input field. */
    helperText?: string;
}

/**
 * A specialized input component for sensitive password data.
 *
 * Features a built-in visibility toggle that switches the input type
 * between 'password' and 'text'. Styled with Tailwind to match the
 * dashboard's clean, rounded aesthetic.
 *
 * @component
 */
function PasswordInput({ className = "", error = false, helperText, ...props }: PasswordInputProps) {
    /** * Local state to track whether the password should be masked or visible.
     */
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="w-full">
            <div className="relative">
                <input
                    type={showPassword ? "text" : "password"}
                    className={`bg-[#fdfefe] border w-full h-12 rounded-xl px-4 pr-12 focus:outline-none transition-colors ${
                        error
                            ? 'border-red-500 focus:border-red-600'
                            : 'border-black/10 focus:border-black/40'
                    } ${className}`}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black/50 hover:text-black/80 text-sm font-medium"
                >
                    {showPassword ? "Nascondi" : "Mostra"}
                </button>
            </div>

            {/* Contextual Helper or Error Text */}
            {helperText && (
                <p className={`text-sm mt-1 ml-2 ${error ? 'text-red-500' : 'text-black/50'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default PasswordInput;