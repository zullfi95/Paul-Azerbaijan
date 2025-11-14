"use client";

import { useTranslations } from 'next-intl';
import styles from './OtherInformation.module.css';

interface OtherInformationProps {
  formData: {
    notes: string;
    equipment_required: number;
    staff_assigned: number;
  };
  onInputChange: (field: keyof OtherInformationProps['formData'], value: string) => void;
  onNumberChange: (field: 'equipment_required' | 'staff_assigned', value: string) => void;
}

export default function OtherInformation({ formData, onInputChange, onNumberChange }: OtherInformationProps) {
  const t = useTranslations('checkout');

  return (
    <div className={styles.otherInformation}>
      <div className={styles.sectionHeader}>
        {t('otherInformation')}
      </div>

      <div className={styles.notesSection}>
        <textarea
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
          rows={4}
          className={styles.notesTextarea}
          placeholder={t('notesPlaceholder')}
        />
      </div>

      <div className={styles.numberInputsContainer}>
        <div className={styles.numberInputGroup}>
          <label className={styles.numberInputLabel}>
            {t('equipmentRequired')}
          </label>
          <input
            type="number"
            min="0"
            value={formData.equipment_required}
            onChange={(e) => onNumberChange('equipment_required', e.target.value)}
            className={styles.numberInput}
            placeholder="0"
          />
        </div>

        <div className={styles.numberInputGroup}>
          <label className={styles.numberInputLabel}>
            {t('staffAssigned')}
          </label>
          <input
            type="number"
            min="0"
            value={formData.staff_assigned}
            onChange={(e) => onNumberChange('staff_assigned', e.target.value)}
            className={styles.numberInput}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
