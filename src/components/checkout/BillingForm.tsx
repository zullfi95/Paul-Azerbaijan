"use client";

import { useAuth } from '../../contexts/AuthContext';
import styles from './BillingForm.module.css';

interface BillingFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    streetAddress: string;
  };
  errors: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    streetAddress: string;
  }>;
  onInputChange: (field: keyof BillingFormProps['formData'], value: string) => void;
}

export default function BillingForm({ formData, errors, onInputChange }: BillingFormProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.billingForm}>
      <div className={styles.sectionHeader}>
        Billing information
      </div>

      {/* Login prompt */}
      {!isAuthenticated && (
        <div className={styles.loginPrompt}>
          <p>
            Have you shopped with us before? <a href="/auth/login">Click here to log in</a>
          </p>
        </div>
      )}

      {/* Auto-filled data indicator */}
      {isAuthenticated && (formData.firstName || formData.lastName || formData.email) && (
        <div className={styles.autoFillIndicator}>
          <p>
            ✓ Your information has been automatically filled from your account
          </p>
        </div>
      )}

      <p className={styles.requiredText}>
        All lines marked with <span>*</span> are required to be filled out.
      </p>

      <div className={styles.fieldsGrid}>
        <div className={styles.fieldGroup}>
          <input
            type="text"
            placeholder="Name *"
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            className={styles.inputField}
          />
          {errors.firstName && <span className={styles.errorMessage}>{errors.firstName}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            placeholder="Surname *"
            value={formData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            className={styles.inputField}
          />
          {errors.lastName && <span className={styles.errorMessage}>{errors.lastName}</span>}
        </div>
      </div>

      <div className={styles.fullWidthField}>
        <input
          type="text"
          placeholder="Street name, descriptive and orientation number *"
          value={formData.streetAddress}
          onChange={(e) => onInputChange('streetAddress', e.target.value)}
          className={styles.inputField}
        />
        {errors.streetAddress && <span className={styles.errorMessage}>{errors.streetAddress}</span>}
      </div>

      <div className={styles.fieldsGrid}>
        <div className={styles.fieldGroup}>
          <input
            type="tel"
            placeholder="Phone number *"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className={styles.inputField}
          />
          {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="email"
            placeholder="E-mail address *"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className={styles.inputField}
          />
          {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
        </div>
      </div>

      <div className={styles.fullWidthField}>
        <input
          type="text"
          placeholder="Company name"
          value={formData.companyName}
          onChange={(e) => onInputChange('companyName', e.target.value)}
          className={styles.inputField}
        />
      </div>
    </div>
  );
}
