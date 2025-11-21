import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/Button';

interface FormActionsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const t = useTranslations();
  const defaultSubmitLabel = submitLabel || t('forms.actions.save');
  const defaultCancelLabel = cancelLabel || t('forms.actions.cancel');
  const savingText = t('forms.actions.save'); // Можно добавить отдельный ключ для "Сохранение..."
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isLoading}
      >
        {defaultCancelLabel}
      </Button>
      <Button
        type="submit"
        variant="primary"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {isLoading ? t('forms.menuItem.saving') : defaultSubmitLabel}
      </Button>
    </div>
  );
};
