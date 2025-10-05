// Profile Constants

export const COUNTRIES = ['Azerbaijan', 'Turkey', 'Georgia'] as const;

export const ADDRESS_FIELDS = [
  { 
    key: 'street' as const, 
    label: 'Street Address', 
    type: 'text' as const, 
    required: true,
    placeholder: 'Enter street address'
  },
  { 
    key: 'city' as const, 
    label: 'City', 
    type: 'text' as const, 
    required: true,
    placeholder: 'Enter city'
  },
  { 
    key: 'postal_code' as const, 
    label: 'Postal Code', 
    type: 'text' as const, 
    required: true,
    placeholder: 'Enter postal code'
  },
  { 
    key: 'country' as const, 
    label: 'Country', 
    type: 'select' as const, 
    required: true,
    options: COUNTRIES
  }
] as const;

export const PASSWORD_FIELDS = [
  {
    key: 'current_password' as const,
    label: 'Current Password',
    type: 'password' as const,
    required: true,
    placeholder: 'Enter your current password'
  },
  {
    key: 'new_password' as const,
    label: 'New Password',
    type: 'password' as const,
    required: true,
    placeholder: 'Enter your new password'
  },
  {
    key: 'confirm_password' as const,
    label: 'Confirm New Password',
    type: 'password' as const,
    required: true,
    placeholder: 'Confirm your new password'
  }
] as const;

export const EDIT_FIELDS = [
  {
    key: 'name' as const,
    label: 'Name',
    type: 'text' as const,
    required: true,
    placeholder: 'Enter your name'
  },
  {
    key: 'email' as const,
    label: 'Email',
    type: 'email' as const,
    required: true,
    placeholder: 'Enter your email'
  },
  {
    key: 'phone' as const,
    label: 'Phone',
    type: 'tel' as const,
    required: false,
    placeholder: 'Enter your phone number'
  }
] as const;



