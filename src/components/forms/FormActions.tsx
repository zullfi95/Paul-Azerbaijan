import React from 'react';
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
  submitLabel = 'Сохранить',
  cancelLabel = 'Отмена',
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      <Button
        type="button"
        variant="secondary"
        onClick={onCancel}
        disabled={isLoading}
      >
        {cancelLabel}
      </Button>
      <Button
        type="submit"
        variant="primary"
        onClick={onSubmit}
        disabled={disabled || isLoading}
        className={isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {isLoading ? 'Сохранение...' : submitLabel}
      </Button>
    </div>
  );
};
