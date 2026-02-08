import React, { useState } from "react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    helperText?: string;
}

function PasswordInput({ className = "", error = false, helperText, ...props }: PasswordInputProps) {
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
            {helperText && (
                <p className={`text-sm mt-1 ml-2 ${error ? 'text-red-500' : 'text-black/50'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default PasswordInput;