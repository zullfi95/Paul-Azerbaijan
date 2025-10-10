// Profile Types

export interface AddressData {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface AddressErrors {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface PasswordForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordErrors {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface EditForm {
  name: string;
  email: string;
  phone: string;
}

export interface EditErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export interface NewsletterSubscriptions {
  general: boolean;
  promotions: boolean;
}

export type AddressType = 'billing' | 'shipping';
export type FormType = 'edit' | 'password' | 'address';



