// Profile API utilities

import { API_CONFIG, getAuthHeaders } from '../config/api';
import { AddressData, PasswordForm, EditForm, NewsletterSubscriptions } from '../types/profile';

export const profileApi = {
  // Address operations
  async saveAddress(type: 'billing' | 'shipping', address: AddressData) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/user/address/${type}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(address)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to save ${type} address`);
    }

    return { success: true, message: `${type} address saved successfully` };
  },

  // Password operations
  async changePassword(passwordForm: PasswordForm) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(passwordForm)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to change password');
    }

    return { success: true, message: 'Password changed successfully' };
  },

  // Profile operations
  async updateProfile(profileForm: EditForm) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/user`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileForm)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    return { success: true, message: 'Profile updated successfully' };
  },

  // Newsletter operations
  async updateNewsletterPreferences(preferences: NewsletterSubscriptions) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/user/newsletter`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update newsletter preferences');
    }

    return { success: true, message: 'Newsletter preferences updated successfully' };
  },

  // Load user data with addresses
  async loadUserData() {
    const response = await fetch(`${API_CONFIG.BASE_URL}/user`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to load user data');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('Failed to load user data');
    }

    return data.data.user;
  }
};







