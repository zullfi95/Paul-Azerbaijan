"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeedbackModal from '@/components/FeedbackModal';
import { getApiUrl, API_CONFIG } from '@/config/api';
import type { CartItem } from '@/config/api';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Breadcrumbs from '@/components/Breadcrumbs';
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
  equipment_required: number;
  staff_assigned: number;
}

// Типы для дочерних компонентов
type BillingFormData = Pick<OrderFormData, 'firstName' | 'lastName' | 'email' | 'phone' | 'companyName' | 'streetAddress'>;
type DeliveryFormData = Pick<OrderFormData, 'deliveryType' | 'deliveryDate' | 'deliveryTime'>;
type OtherInfoFormData = Pick<OrderFormData, 'notes' | 'equipment_required' | 'staff_assigned'>;

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('checkout');
  const { items: cart, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Check authorization - required for checkout
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?next=/catering/order');
    }
  }, [isAuthenticated, isLoading, router]);

  const [formData, setFormData] = useState<OrderFormData>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.company_name || '',
    streetAddress: user?.shipping_address || user?.address || '',
    deliveryType: 'delivery',
    deliveryDate: '',
    deliveryTime: '',
    notes: '',
    equipment_required: 0,
    staff_assigned: 0,
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Обновляем форму при изменении данных пользователя
  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name?.split(' ') || [];
      const address = user.shipping_address || user.address || '';
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: user.last_name || nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        companyName: user.company_name || '',
        streetAddress: address || prev.streetAddress,
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

  const handleNumberChange = (field: 'equipment_required' | 'staff_assigned', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(0, numValue)
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
    } else {
      const selectedDate = new Date(formData.deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Бэкенд требует дату в будущем (after:today), поэтому используем строгое сравнение
      if (selectedDate <= today) {
        newErrors.deliveryDate = 'Delivery date must be in the future';
      }
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
      // Создаем заявку, а не заказ
      // equipment_required и staff_assigned не используются в заявках, только в заказах
      
      // Убеждаемся, что дата в формате YYYY-MM-DD, а время в формате HH:MM
      let eventDate = formData.deliveryDate;
      if (eventDate) {
        const date = new Date(eventDate);
        if (!isNaN(date.getTime())) {
          // Форматируем дату в YYYY-MM-DD
          eventDate = date.toISOString().split('T')[0];
        }
      }
      
      let eventTime = formData.deliveryTime;
      if (eventTime && eventTime.length > 5) {
        // Если время содержит секунды, обрезаем до HH:MM
        eventTime = eventTime.substring(0, 5);
      }
      
      const normalizeCartItems = (cartItems: CartItem[]) =>
        cartItems.map(item => ({
          id: String(item.id),
          name: item.name,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          description: item.description || null,
        }));

      const applicationData: Record<string, any> = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName?.trim() || null,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company_name: formData.companyName?.trim() || null,
        message: formData.notes?.trim() || null,
        event_address: formData.streetAddress.trim(),
        event_date: eventDate || null,
        event_time: eventTime || null,
        cart_items: normalizeCartItems(cart || []),
      };
      
      // Добавляем client_id только если пользователь авторизован и является клиентом
      if (isAuthenticated && user?.user_type === 'client' && user.id) {
        applicationData.client_id = user.id;
      }

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

      // Используем эндпоинт для заявок
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.APPLICATIONS), {
        method: 'POST',
        headers,
        body: JSON.stringify(applicationData)
      });

      if (response.ok) {
        await response.json();
        clearCart();
        setShowSuccessPopup(true);
        
        setTimeout(() => {
          // Всегда перенаправляем на главную страницу после успешного оформления заказа
          router.push('/');
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
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Catering Menu', href: '/catering' },
                { label: 'Shopping Cart', href: '/cart' },
                { label: 'Checkout', isActive: true }
              ]}
            />
          </div>
        </div>

        {/* Main Title */}
        <div className={styles.titleContainer}>
          <h1 className={`paul-title ${styles.title}`}>
            Checkout
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
            onNumberChange={handleNumberChange}
          />

          {/* Order Summary and Payment Section */}
          <div className={styles.orderSummarySection}>
            <div className="paul-section-header">
              {t('orderSummary')}
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'black',
            color: 'white',
            padding: '40px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
          }}>
            <img src="/images/logo.png" alt="Paul Logo" style={{ width: '100px', margin: '0 auto 20px' }} />
            
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
              Thank you!
            </h2>
            
            <p style={{ fontSize: '16px', marginBottom: '30px' }}>
              Your application has been successfully submitted. Our team will contact you soon.
            </p>
            
            <button
              onClick={() => {
                setShowSuccessPopup(false); // Сначала скрыть окно
                router.push('/'); // Всегда перенаправляем на главную страницу
              }}
              style={{
                backgroundColor: 'white',
                color: 'black',
                border: '1px solid white',
                padding: '10px 20px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s, color 0.3s',
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      )}

      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}
