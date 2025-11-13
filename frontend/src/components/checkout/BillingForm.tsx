"use client";

import { useAuth } from '../../contexts/AuthContext';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('checkout');

  return (
    <div className={styles.billingForm}>
      <div className={styles.sectionHeader}>
        {t('billing')}
      </div>

      {/* Login prompt */}
      {!isAuthenticated && (
        <div className={styles.loginPrompt}>
          <p>
            {t('haveAccount')} <a href="/auth/login">{t('clickToLogin')}</a>
          </p>
        </div>
      )}

      {/* Auto-filled data indicator */}
      {isAuthenticated && (formData.firstName || formData.lastName || formData.email) && (
        <div className={styles.autoFillIndicator}>
          <p>
            ✓ {t('autoFilled')}
          </p>
        </div>
      )}

      <p className={styles.requiredText}>
        {t('requiredFieldsNote')}
      </p>

      <div className={styles.fieldsGrid}>
        <div className={styles.fieldGroup}>
          <input
            type="text"
            placeholder={t('firstName') + ' *'}
            value={formData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            className={styles.inputField}
          />
          {errors.firstName && <span className={styles.errorMessage}>{errors.firstName}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="text"
            placeholder={t('lastName') + ' *'}
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
          placeholder={t('streetAddress') + ' *'}
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
            placeholder={t('phone') + ' *'}
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className={styles.inputField}
          />
          {errors.phone && <span className={styles.errorMessage}>{errors.phone}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <input
            type="email"
            placeholder={t('email') + ' *'}
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
          placeholder={t('companyName')}
          value={formData.companyName}
          onChange={(e) => onInputChange('companyName', e.target.value)}
          className={styles.inputField}
        />
      </div>
    </div>
  );
}
