// Reusable form field component

import React from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  type: 'text' | 'email' | 'tel' | 'password' | 'select';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  options?: readonly string[];
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  options,
  className = ''
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const inputClassName = `${styles.formInput} ${error ? styles.inputError : ''} ${className}`;

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>
        {label} {required && '*'}
      </label>
      
      {type === 'select' ? (
        <select
          className={inputClassName}
          value={value}
          onChange={handleChange}
          required={required}
        >
          {options?.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className={inputClassName}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
        />
      )}
      
      {error && (
        <span className={styles.fieldError}>{error}</span>
      )}
    </div>
  );
};