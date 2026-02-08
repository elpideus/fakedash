import React from "react";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    helperText?: string;
}

function TextInput({ className = "", error = false, helperText, ...props }: TextInputProps) {
    return (
        <div className="w-full">
            <input
                type="text"
                className={`bg-[#fdfefe] border w-full h-12 rounded-xl px-4 focus:outline-none transition-colors ${
                    error
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-black/10 focus:border-black/40'
                } ${className}`}
                {...props}
            />
            {helperText && (
                <p className={`text-sm mt-1 ml-2 ${error ? 'text-red-500' : 'text-black/50'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default TextInput;