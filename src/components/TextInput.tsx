import React, {type JSX} from "react";

/**
 * Props for the TextInput component.
 * @interface TextInputProps
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 * @property {boolean} [error=false] - If true, the input and helper text will display in a red error state.
 * @property {string} [helperText] - Optional descriptive or error message displayed below the input.
 */
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    helperText?: string;
}

/**
 * A styled text input component with built-in validation styling and helper text support.
 *
 * This component wraps a standard HTML5 input and applies Tailwind CSS for styling.
 * It dynamically adjusts its border and text colors based on the `error` state.
 * @component
 * @param className
 * @param error
 * @param helperText
 * @param props
 * @returns {JSX.Element} A container div containing the input and an optional helper text paragraph.
 */
function TextInput({ className = "", error = false, helperText, ...props }: TextInputProps): JSX.Element {
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
            {/* Render helper text if provided, adjusting color based on error status */}
            {helperText && (
                <p className={`text-sm mt-1 ml-2 ${error ? 'text-red-500' : 'text-black/50'}`}>
                    {helperText}
                </p>
            )}
        </div>
    );
}

export default TextInput;