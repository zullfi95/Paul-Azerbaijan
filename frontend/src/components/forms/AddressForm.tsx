// Reusable address form component

import React from 'react';
import { AddressData, AddressErrors } from '../../types/profile';
import { ADDRESS_FIELDS } from '../../constants/profile';
import { FormField } from './FormField';
import styles from './AddressForm.module.css';

interface AddressFormProps {
  address: AddressData;
  errors: AddressErrors;
  onFieldChange: (field: keyof AddressData, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  type: 'billing' | 'shipping';
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  errors,
  onFieldChange,
  onSubmit,
  isSubmitting,
  type
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const title = type === 'billing' ? 'Default Billing Address' : 'Default Shipping Address';
  const buttonText = type === 'billing' ? 'Save Billing Address' : 'Save Shipping Address';

  return (
    <div className={styles.addressFormContainer}>
      <h3 className={styles.formTitle}>{title}</h3>
      <form onSubmit={handleSubmit} className={styles.addressForm} aria-label={`${type} address form`}>
        {ADDRESS_FIELDS.map(field => (
          <div key={field.key} className={field.key === 'street' || field.key === 'country' ? styles.fullWidth : styles.halfWidth}>
            <FormField
              label={field.label}
              type={field.type}
              value={address[field.key]}
              onChange={(value) => onFieldChange(field.key, value)}
              error={errors[field.key]}
              required={field.required}
              placeholder={(field as { placeholder?: string }).placeholder || ''}
              options={(field as { options?: string[] }).options}
            />
          </div>
        ))}
        
        <button 
          type="submit" 
          className={styles.submitButton} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : buttonText}
        </button>
      </form>
    </div>
  );
};



