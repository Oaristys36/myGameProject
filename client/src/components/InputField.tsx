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
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    disabled?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

type CheckboxFieldProps = {
    checked: boolean;
    onChange: (e:React.ChangeEvent<HTMLInputElement>) => void;
    label: string | React.ReactNode;
    name?: string;
    className?: string;
    required?: boolean;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
    ({ value, onChange, placeholder = '', type = 'text', name, className = 'input', autoComplete = '', autoCapitalize = 'none', autoCorrect = 'off', minLength, maxLength, required, disabled, onFocus, onBlur }, ref) => {
        return (
        <input
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        className={className}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
        onFocus={onFocus}
        onBlur={onBlur}
      />
        );
    }
);

export const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
    ({ checked, onChange, label, name, className = '', required = false }, ref) => { 
        return (
            <label className={`checkbox-container ${className}`}>
                <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                name={name}
                required={required}
                className={className}
                ref={ref}
                />
                <span className="checkbox-label">{label}</span>
            </label>
        ); 
    }
);