// Custom hook for form submission management

import { useState, useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

export const useFormSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const submitForm = useCallback(async (
    submitFn: () => Promise<{ success: boolean; message?: string }>,
    successMessage: string,
    errorMessage: string = 'An error occurred. Please try again.'
  ) => {
    setIsSubmitting(true);
    
    try {
      const result = await submitFn();
      
      if (result.success) {
        showToast({
          type: 'success',
          title: 'Success',
          message: result.message || successMessage
        });
        return true;
      } else {
        showToast({
          type: 'error',
          title: 'Error',
          message: result.message || errorMessage
        });
        return false;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showToast({
        type: 'error',
        title: 'Network Error',
        message: errorMessage
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [showToast]);

  return {
    isSubmitting,
    submitForm
  };
};



