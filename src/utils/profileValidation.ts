// Profile Validation Utilities

import { AddressData, AddressErrors, PasswordForm, PasswordErrors, EditForm, EditErrors } from '../types/profile';

export const validateAddressField = (field: keyof AddressData, value: string): string | null => {
  switch (field) {
    case 'street':
      if (!value.trim()) return 'Street address is required';
      break;
    case 'city':
      if (!value.trim()) return 'City is required';
      break;
    case 'postal_code':
      if (!value.trim()) return 'Postal code is required';
      if (!/^[0-9]{4,6}$/.test(value.trim())) return 'Please enter a valid postal code';
      break;
    case 'country':
      if (!value) return 'Country is required';
      break;
  }
  return null;
};

export const validateAddress = (address: AddressData): AddressErrors => {
  const errors: AddressErrors = {};
  
  Object.keys(address).forEach(key => {
    const field = key as keyof AddressData;
    const error = validateAddressField(field, address[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export const validatePasswordField = (field: keyof PasswordForm, value: string, form?: PasswordForm): string | null => {
  switch (field) {
    case 'current_password':
      if (!value) return 'Current password is required';
      break;
    case 'new_password':
      if (!value) return 'New password is required';
      if (value.length < 8) return 'Password must be at least 8 characters';
      break;
    case 'confirm_password':
      if (!value) return 'Password confirmation is required';
      if (form && value !== form.new_password) return 'Passwords do not match';
      break;
  }
  return null;
};

export const validatePassword = (form: PasswordForm): PasswordErrors => {
  const errors: PasswordErrors = {};
  
  Object.keys(form).forEach(key => {
    const field = key as keyof PasswordForm;
    const error = validatePasswordField(field, form[field], form);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};

export const validateEditField = (field: keyof EditForm, value: string): string | null => {
  switch (field) {
    case 'name':
      if (!value.trim()) return 'Name is required';
      break;
    case 'email':
      if (!value.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
      break;
    case 'phone':
      if (value && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      break;
  }
  return null;
};

export const validateEdit = (form: EditForm): EditErrors => {
  const errors: EditErrors = {};
  
  Object.keys(form).forEach(key => {
    const field = key as keyof EditForm;
    const error = validateEditField(field, form[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return errors;
};



