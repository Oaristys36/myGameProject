import React from 'react';
import '../styles/input.css';

type InputFieldProps = {
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    type?: string;
    name?: string;
    className?: string;
    autoCapitalize?: string;
    autoCorrect?: string;
    autoComplete?: string;
};

export function InputField ({
    value,
    onChange,
    placeholder ='',
    type = 'text',
    name,
    className = 'input',
    autoComplete = ''
}: InputFieldProps) {

    return(
        <input 
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        autoCapitalize='none'
        autoCorrect='off'
        autoComplete={autoComplete}
        className={className}
        />
    );
}