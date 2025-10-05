"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../Header';
import Footer from '../Footer';
import { buildApiUrl, API_CONFIG } from '../../config/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumbs from '../Breadcrumbs';
import BillingForm from './BillingForm';
import DeliveryOptions from './DeliveryOptions';
import OtherInformation from './OtherInformation';
import OrderSummary from './OrderSummary';
import styles from './CheckoutPage.module.css';

interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  streetAddress: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryDate: string;
  deliveryTime: string;
  notes: string;
  additionalItems: {
    knife: boolean;
    spoon: boolean;
    forks: boolean;
    napkins: boolean;
  };
}

// Типы для дочерних компонентов
type BillingFormData = Pick<OrderFormData, 'firstName' | 'lastName' | 'email' | 'phone' | 'companyName' | 'streetAddress'>;
type DeliveryFormData = Pick<OrderFormData, 'deliveryType' | 'deliveryDate' | 'deliveryTime'>;
type OtherInfoFormData = Pick<OrderFormData, 'notes' | 'additionalItems'>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Проверка авторизации - обязательна для оформления заказа
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const [formData, setFormData] = useState<OrderFormData>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.company_name || '',
    streetAddress: user?.address || '',
    deliveryType: 'delivery',
    deliveryDate: '',
    deliveryTime: '',
    notes: '',
    additionalItems: {
      knife: false,
      spoon: false,
      forks: false,
      napkins: false
    },
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Обновляем форму при изменении данных пользователя
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name?.split(' ') || [];
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: user.last_name || nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.company_name || '',
        streetAddress: user.address || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field: keyof OrderFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleAdditionalItemChange = (item: keyof OrderFormData['additionalItems']) => {
    setFormData(prev => ({
      ...prev,
      additionalItems: {
        ...prev.additionalItems,
        [item]: !prev.additionalItems[item]
      }
    }));
  };

  // Обертки для дочерних компонентов
  const handleBillingChange = (field: keyof BillingFormData, value: string) => {
    handleInputChange(field as keyof OrderFormData, value);
  };

  const handleDeliveryChange = (field: keyof DeliveryFormData, value: string | boolean) => {
    handleInputChange(field as keyof OrderFormData, value);
  };

  const handleOtherInfoChange = (field: keyof OtherInfoFormData, value: string) => {
    handleInputChange(field as keyof OrderFormData, value);
  };


  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Surname is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = 'Delivery date is required';
    }
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = 'Delivery time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        client_type: 'one_time',
        company_name: formData.companyName || `${formData.firstName} ${formData.lastName}`,
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        menu_items: cart,
        comment: formData.notes,
        delivery_date: formData.deliveryDate,
        delivery_time: formData.deliveryTime,
        delivery_type: formData.deliveryType,
        delivery_address: formData.streetAddress,
        additional_items: formData.additionalItems,
        ...(isAuthenticated && user && user.user_type === 'client' && { client_id: user.id })
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.ORDERS), {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        await response.json();
        clearCart();
        setShowSuccessPopup(true);
        
        setTimeout(() => {
          if (isAuthenticated && user) {
            if (user.user_type === 'staff' || user.staff_role) {
              router.push('/dashboard');
            } else {
              router.push('/profile');
            }
          } else {
            router.push('/');
          }
        }, 3000);
      } else {
        let errorMessage = 'An error occurred. Please try again.';
         
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.errors) {
            const errorDetails = Object.values(errorData.errors).flat().join(', ');
            errorMessage = `Validation error: ${errorDetails}`;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
         
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Показываем загрузку, пока данные не загружены
  if (isLoading || !cart) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner} />
          <p className={styles.loadingText}>
            {isLoading ? 'Loading...' : 'Loading cart...'}
          </p>
        </div>
      </div>
    );
  }

  // Если пользователь не авторизован, не показываем контент
  if (!isAuthenticated) {
    return null;
  }

  // Если корзина пуста, показываем сообщение
  if (cart.length === 0) {
    return (
      <div className={styles.emptyCartContainer}>
        <div className={styles.emptyCartContent}>
          <div className={styles.emptyCartIcon}>🛒</div>
          <h2 className={styles.emptyCartTitle}>
            Your cart is empty
          </h2>
          <p className={styles.emptyCartText}>
            Please add items to your cart before proceeding to checkout
          </p>
          <button
            onClick={() => router.push('/catering')}
            className={styles.continueShoppingButton}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.contentWrapper}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsContainer}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Catering Menu', href: '/catering' },
              { label: 'Shopping Cart', href: '/cart' },
              { label: 'Order', isActive: true }
            ]}
          />
        </div>

        {/* Main Title */}
        <div className={styles.titleContainer}>
          <h1 className={`paul-title ${styles.title}`}>
            Order
          </h1>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Billing Information Section */}
          <BillingForm 
            formData={formData}
            errors={errors}
            onInputChange={handleBillingChange}
          />

          {/* Delivery Section */}
          <DeliveryOptions 
            formData={formData}
            errors={errors}
            onInputChange={handleDeliveryChange}
          />

          {/* Other Information Section */}
          <OtherInformation 
            formData={formData}
            onInputChange={handleOtherInfoChange}
            onAdditionalItemChange={handleAdditionalItemChange}
          />

          {/* Order Summary and Payment Section */}
          <div className={styles.orderSummarySection}>
            <div className="paul-section-header">
              Order summary
            </div>

            {/* Order Summary */}
            <OrderSummary deliveryType={formData.deliveryType} />

            {/* Submit Button */}
            <div className={styles.submitButtonContainer}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
            </div>

          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className={styles.successPopupOverlay}>
          <div className={styles.successPopupContent}>
            <div className={styles.successIcon}>
              <span className={styles.successIconSymbol}>✓</span>
            </div>
            
            <h2 className={`paul-success-title ${styles.successTitle}`}>
              Thank you!
            </h2>
            
                    <p className={`paul-success-text ${styles.successText}`}>
                      Your application has been successfully submitted. Our team will contact you soon.
                    </p>
            
            <button
              onClick={() => {
                if (isAuthenticated && user) {
                  if (user.user_type === 'staff' || user.staff_role) {
                    router.push('/dashboard');
                  } else {
                    router.push('/profile');
                  }
                } else {
                  router.push('/');
                }
              }}
              className={styles.successButton}
            >
              {isAuthenticated && user ? 'Go to Dashboard' : 'Return to Home'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
