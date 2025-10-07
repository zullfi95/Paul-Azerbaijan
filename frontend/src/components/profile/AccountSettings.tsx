// Account Settings component with tabs

import React, { useState } from 'react';
import { PasswordForm, EditForm, PasswordErrors, EditErrors } from '../../types/profile';
import { User } from '../../config/api';
import { PasswordFormComponent } from '../forms/PasswordForm';
import { FormField } from '../forms/FormField';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import { validatePassword, validateEdit } from '../../utils/profileValidation';
import { profileApi } from '../../utils/profileApi';
import styles from './AccountSettings.module.css';

interface AccountSettingsProps {
  user: User | null;
  onUserUpdate: (userData: Partial<User>) => Promise<boolean>;
  onNavigate: (section: string) => void;
}

type TabType = 'profile' | 'security' | 'notifications';

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  onUserUpdate,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile form state
  const [editForm, setEditForm] = useState<EditForm>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  
  // Newsletter state
  const [newsletterSubscriptions, setNewsletterSubscriptions] = useState({
    general: true,
    promotions: true,
    order_updates: true
  });
  
  const { isSubmitting, submitForm } = useFormSubmission();

  // Initialize edit form when user changes
  React.useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Profile form handlers
  const handleEditFormChange = (field: keyof EditForm, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (editErrors[field]) {
      setEditErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleEditSubmit = async () => {
    const errors = validateEdit(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    
    const success = await submitForm(
      async () => {
        const success = await onUserUpdate(editForm);
        return { 
          success, 
          message: success ? 'Profile updated successfully' : 'Failed to update profile' 
        };
      },
      'Profile updated successfully',
      'Failed to update profile'
    );
    
    if (success) {
      setEditErrors({});
    }
  };

  // Password form handlers
  const handlePasswordFormChange = (field: keyof PasswordForm, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePassword(passwordForm);
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }
    
    const success = await submitForm(
      () => profileApi.changePassword(passwordForm),
      'Password changed successfully',
      'Failed to change password'
    );
    
    if (success) {
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setPasswordErrors({});
    }
  };

  // Newsletter handlers
  const handleNewsletterChange = (key: keyof typeof newsletterSubscriptions) => {
    setNewsletterSubscriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNewsletterSubmit = async () => {
    await submitForm(
      () => profileApi.updateNewsletterPreferences(newsletterSubscriptions),
      'Newsletter preferences updated successfully',
      'Failed to update newsletter preferences'
    );
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile' },
    { id: 'security' as TabType, label: 'Security' },
    { id: 'notifications' as TabType, label: 'Notifications' }
  ];

  return (
    <div className={styles.accountSettings}>
      <div className={styles.header}>
        <h2 className={styles.title}>Account Settings</h2>
        <p className={styles.subtitle}>Manage your account preferences and security settings</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'profile' && (
          <div className={styles.profileTab}>
            <h3 className={styles.tabTitle}>Personal Information</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} className={styles.form}>
              <FormField
                label="Full Name"
                type="text"
                value={editForm.name}
                onChange={(value) => handleEditFormChange('name', value)}
                error={editErrors.name}
                required
                placeholder="Enter your full name"
              />
              
              <FormField
                label="Email Address"
                type="email"
                value={editForm.email}
                onChange={(value) => handleEditFormChange('email', value)}
                error={editErrors.email}
                required
                placeholder="Enter your email address"
              />
              
              <FormField
                label="Phone Number"
                type="tel"
                value={editForm.phone}
                onChange={(value) => handleEditFormChange('phone', value)}
                error={editErrors.phone}
                placeholder="Enter your phone number"
              />
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => onNavigate('dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className={styles.securityTab}>
            <h3 className={styles.tabTitle}>Change Password</h3>
            <PasswordFormComponent
              form={passwordForm}
              errors={passwordErrors}
              onFieldChange={handlePasswordFormChange}
              onSubmit={handlePasswordSubmit}
              onCancel={() => onNavigate('dashboard')}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className={styles.notificationsTab}>
            <h3 className={styles.tabTitle}>Newsletter Preferences</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleNewsletterSubmit(); }} className={styles.form}>
              <div className={styles.newsletterOptions}>
                <div className={styles.newsletterItem}>
                  <label className={styles.newsletterLabel}>
                    <input
                      type="checkbox"
                      checked={newsletterSubscriptions.general}
                      onChange={() => handleNewsletterChange('general')}
                      className={styles.newsletterCheckbox}
                    />
                    <span className={styles.newsletterText}>
                      <strong>General Newsletter</strong>
                      <span className={styles.newsletterDescription}>
                        Receive updates about our services and company news
                      </span>
                    </span>
                  </label>
                </div>
                
                <div className={styles.newsletterItem}>
                  <label className={styles.newsletterLabel}>
                    <input
                      type="checkbox"
                      checked={newsletterSubscriptions.promotions}
                      onChange={() => handleNewsletterChange('promotions')}
                      className={styles.newsletterCheckbox}
                    />
                    <span className={styles.newsletterText}>
                      <strong>Promotions & Offers</strong>
                      <span className={styles.newsletterDescription}>
                        Get notified about special deals and discounts
                      </span>
                    </span>
                  </label>
                </div>
                
                <div className={styles.newsletterItem}>
                  <label className={styles.newsletterLabel}>
                    <input
                      type="checkbox"
                      checked={newsletterSubscriptions.order_updates}
                      onChange={() => handleNewsletterChange('order_updates')}
                      className={styles.newsletterCheckbox}
                    />
                    <span className={styles.newsletterText}>
                      <strong>Order Updates</strong>
                      <span className={styles.newsletterDescription}>
                        Receive notifications about your order status
                      </span>
                    </span>
                  </label>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => onNavigate('dashboard')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Preferences'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
