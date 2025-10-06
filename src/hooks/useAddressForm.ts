// Custom hook for address form management

import { useState, useCallback } from 'react';
import { AddressData, AddressErrors } from '../types/profile';
import { validateAddress } from '../utils/profileValidation';

export const useAddressForm = (initialAddress: AddressData) => {
  const [address, setAddress] = useState<AddressData>(initialAddress);
  const [errors, setErrors] = useState<AddressErrors>({});

  const updateField = useCallback((field: keyof AddressData, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = validateAddress(address);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [address]);

  const resetForm = useCallback((newAddress?: AddressData) => {
    setAddress(newAddress || initialAddress);
    setErrors({});
  }, [initialAddress]);

  const setFieldError = useCallback((field: keyof AddressData, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  return {
    address,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFieldError,
    setAddress,
    setErrors
  };
};



