// Optimized Addresses component

import React from 'react';
import { AddressForm } from '../forms/AddressForm';
import { useAddressForm } from '../../hooks/useAddressForm';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import { profileApi } from '../../utils/profileApi';
import styles from './Addresses.module.css';

interface AddressesProps {
  onNavigate: (section: string) => void;
}

export const Addresses: React.FC<AddressesProps> = ({ onNavigate }) => {
  // Address forms using custom hooks
  const billingForm = useAddressForm({
    street: '',
    city: '',
    postal_code: '',
    country: 'Azerbaijan'
  });
  const shippingForm = useAddressForm({
    street: '',
    city: '',
    postal_code: '',
    country: 'Azerbaijan'
  });
  
  const { isSubmitting, submitForm } = useFormSubmission();

  // Load existing addresses on component mount
  React.useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        const response = await fetch('/api/user', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.user) {
            const userData = data.data.user;
            
            // Set billing address if exists
            if (userData.billing_street) {
              billingForm.setAddress({
                street: userData.billing_street || '',
                city: userData.billing_city || '',
                postal_code: userData.billing_postal_code || '',
                country: userData.billing_country || 'Azerbaijan'
              });
            }
            
            // Set shipping address if exists
            if (userData.shipping_street) {
              shippingForm.setAddress({
                street: userData.shipping_street || '',
                city: userData.shipping_city || '',
                postal_code: userData.shipping_postal_code || '',
                country: userData.shipping_country || 'Azerbaijan'
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading user addresses:', error);
      }
    };

    loadUserAddresses();
  }, []);

  // Address submission handlers
  const handleAddressSubmit = async (type: 'billing' | 'shipping') => {
    const form = type === 'billing' ? billingForm : shippingForm;
    
    // Validate address
    if (!form.validateForm()) {
      return;
    }
    
    await submitForm(
      () => profileApi.saveAddress(type, form.address),
      `${type === 'billing' ? 'Billing' : 'Shipping'} address saved successfully`,
      `Failed to save ${type} address`
    );
  };

  return (
    <div className={styles.addresses}>
      <div className={styles.header}>
        <h2 className={styles.title}>Address Management</h2>
        <p className={styles.subtitle}>
          Manage your billing and shipping addresses for faster checkout
        </p>
      </div>

      <div className={styles.addressesGrid}>
        {/* Billing Address */}
        <div className={styles.addressCard}>
          <div className={styles.addressHeader}>
            <div className={styles.addressInfo}>
              <h3 className={styles.addressTitle}>Billing Address</h3>
              <p className={styles.addressDescription}>
                Used for payment processing and invoices
              </p>
            </div>
          </div>
          
          <AddressForm
            address={billingForm.address}
            errors={billingForm.errors}
            onFieldChange={billingForm.updateField}
            onSubmit={() => handleAddressSubmit('billing')}
            isSubmitting={isSubmitting}
            type="billing"
          />
        </div>

        {/* Shipping Address */}
        <div className={styles.addressCard}>
          <div className={styles.addressHeader}>
            <div className={styles.addressInfo}>
              <h3 className={styles.addressTitle}>Shipping Address</h3>
              <p className={styles.addressDescription}>
                Where your orders will be delivered
              </p>
            </div>
          </div>
          
          <AddressForm
            address={shippingForm.address}
            errors={shippingForm.errors}
            onFieldChange={shippingForm.updateField}
            onSubmit={() => handleAddressSubmit('shipping')}
            isSubmitting={isSubmitting}
            type="shipping"
          />
        </div>
      </div>

      {/* Address Tips */}
      <div className={styles.tips}>
        <h4 className={styles.tipsTitle}>Address Tips</h4>
        <ul className={styles.tipsList}>
          <li>Make sure your address is complete and accurate for faster delivery</li>
          <li>Include apartment or unit numbers when applicable</li>
          <li>Use the same address format as your local postal service</li>
          <li>Update your addresses if you move to avoid delivery issues</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button 
          className={styles.backButton}
          onClick={() => onNavigate('dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};
