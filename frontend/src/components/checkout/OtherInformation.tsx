"use client";

import styles from './OtherInformation.module.css';

interface OtherInformationProps {
  formData: {
    notes: string;
    additionalItems: {
      knife: boolean;
      spoon: boolean;
      forks: boolean;
      napkins: boolean;
    };
  };
  onInputChange: (field: keyof OtherInformationProps['formData'], value: string) => void;
  onAdditionalItemChange: (item: keyof OtherInformationProps['formData']['additionalItems']) => void;
}

export default function OtherInformation({ formData, onInputChange, onAdditionalItemChange }: OtherInformationProps) {
  return (
    <div className={styles.otherInformation}>
      <div className={styles.sectionHeader}>
        Other information about order
      </div>

      <div className={styles.notesSection}>
        <textarea
          value={formData.notes}
          onChange={(e) => onInputChange('notes', e.target.value)}
          rows={4}
          className={styles.notesTextarea}
          placeholder="Notes about order"
        />
      </div>

      <p className={styles.checkboxTitle}>
        Check the items you want to include in your order.
      </p>

      <div className={styles.checkboxesContainer}>
        {Object.entries(formData.additionalItems).map(([item, checked]) => (
          <label key={item} className={styles.checkboxItem}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onAdditionalItemChange(item)}
              className={styles.checkboxInput}
            />
            <span className={styles.checkboxLabel}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
