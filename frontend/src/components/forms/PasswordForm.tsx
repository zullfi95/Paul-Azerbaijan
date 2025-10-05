// Reusable password form component

import React from 'react';
import { PasswordForm, PasswordErrors } from '../../types/profile';
import { PASSWORD_FIELDS } from '../../constants/profile';
import { FormField } from './FormField';
import styles from './PasswordForm.module.css';

interface PasswordFormProps {
  form: PasswordForm;
  errors: PasswordErrors;
  onFieldChange: (field: keyof PasswordForm, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const PasswordFormComponent: React.FC<PasswordFormProps> = ({
  form,
  errors,
  onFieldChange,
  onSubmit,
  onCancel,
  isSubmitting
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.passwordFormContainer}>
      <h2 className={styles.formTitle}>Change Password</h2>
      <form onSubmit={handleSubmit} className={styles.passwordForm} aria-label="Change password form">
        {PASSWORD_FIELDS.map(field => (
          <FormField
            key={field.key}
            label={field.label}
            type={field.type}
            value={form[field.key]}
            onChange={(value) => onFieldChange(field.key, value)}
            error={errors[field.key]}
            required={field.required}
            placeholder={field.placeholder}
          />
        ))}
        
        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};



