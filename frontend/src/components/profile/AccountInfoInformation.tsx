// Account Info Information component

import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import styles from './AccountInfoInformation.module.css';
import { User } from '@/types/unified';

interface AccountInfoInformationProps {
  user: User | null;
  onPasswordSubmit: (data: any) => void;
  onEmailSubmit: (data: any) => void;
  isSubmitting: boolean;
  passwordError: string | null;
  editError: string | null;
}

export const AccountInfoInformation: React.FC<AccountInfoInformationProps> = ({
  user,
  onPasswordSubmit,
  onEmailSubmit,
  isSubmitting,
  passwordError,
  editError
}) => {
  const [activeForm, setActiveForm] = useState<'none' | 'password' | 'email'>('password');
  const [nameForm, setNameForm] = useState({
    name: user?.name || '',
    last_name: user?.last_name || '',
    email: user?.email || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: ''
  });

  const handleNameFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNameForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordSubmit(passwordForm);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailSubmit(nameForm); // Using the same handler for now, can be changed to a specific name handler
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEmailSubmit(emailForm);
    setEmailForm({
      newEmail: '',
      confirmEmail: ''
    });
  };

  return (
    <div className={styles.accountInfoContainer}>
      {/* Left Section - Account Info */}
      <div className={styles.accountInfoSection}>
        <div className={styles.userInfo}>
          <form onSubmit={handleNameSubmit} className={styles.nameForm}>
            <div className={styles.nameInputs}>
              <input
                type="text"
                name="name"
                placeholder="First Name"
                value={nameForm.name}
                onChange={handleNameFormChange}
                className={styles.nameInput}
                required
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={nameForm.last_name}
                onChange={handleNameFormChange}
                className={styles.nameInput}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={nameForm.email}
                onChange={handleNameFormChange}
                className={styles.nameInput}
                required
              />
            </div>
          </form>
        </div>
        <div className={styles.actionButtons}>
          <button 
            className={styles.actionButton}
            onClick={() => setActiveForm('password')}
          >
            <Edit size={16} className={styles.changeIcon} />
            Change pass
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => setActiveForm('email')}
          >
            <Edit size={16} className={styles.changeIcon} />
            Change mail
          </button>
        </div>
      </div>

      {/* Right Section - Change Forms */}
      <div className={styles.changeFormSection}>
        {activeForm === 'none' && (
          <div className={styles.placeholder}>
            Select an action to change your password or email
          </div>
        )}

        {activeForm === 'password' && (
          <div className={styles.formContainer}>
            <form onSubmit={handlePasswordSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  className={styles.formInput}
                  required
                />
              </div>
              {passwordError && (
                <div className={styles.errorMessage}>{passwordError}</div>
              )}
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeForm === 'email' && (
          <div className={styles.formContainer}>
            <form onSubmit={handleEmailSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="newEmail"
                  placeholder="New Email"
                  value={emailForm.newEmail}
                  onChange={handleEmailFormChange}
                  className={styles.formInput}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="email"
                  name="confirmEmail"
                  placeholder="Confirm New Email"
                  value={emailForm.confirmEmail}
                  onChange={handleEmailFormChange}
                  className={styles.formInput}
                  required
                />
              </div>
              {editError && (
                <div className={styles.errorMessage}>{editError}</div>
              )}
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
