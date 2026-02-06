import React from "react";
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function TextInput(props: InputProps) {
    return (
        <input type="text" className="bg-[#fdfefe] border border-black/10 w-full h-12 rounded-xl px-2 active:outline-none active:border-black/40 focus:border-black/40 focus:outline-none" {...props}/>
    )
}

export default TextInput;