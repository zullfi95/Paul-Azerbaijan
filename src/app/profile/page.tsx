"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import FeedbackButton from '../../components/FeedbackButton';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Order, API_CONFIG, getAuthHeaders } from '../../config/api';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  const { items: cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const router = useRouter();
  
  // Состояние для форм редактирования
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editError, setEditError] = useState('');
  
  // Состояние для адресов
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    postal_code: '',
    country: 'Azerbaijan'
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postal_code: '',
    country: 'Azerbaijan'
  });
  
  // Состояние для подписок
  const [newsletterSubscriptions, setNewsletterSubscriptions] = useState({
    general: true,
    promotions: true,
    order_updates: true
  });
  
  // Состояние для смены пароля
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordError, setPasswordError] = useState('');

  // Состояние для активных заказов и уведомлений
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Состояние для активной секции в сайдбаре
  const [activeSection, setActiveSection] = useState('my-account');
  
  // Состояние для валидации форм
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Состояние для фильтра заказов
  const [orderFilter, setOrderFilter] = useState<'all' | 'delivered' | 'in-progress' | 'payment-pending'>('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
  router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Загружаем данные при авторизации
  useEffect(() => {
    // Загрузка активных заказов
    const loadActiveOrders = async () => {
      if (!isAuthenticated || user?.user_type !== 'client') {
        console.log('❌ Not authenticated or not a client:', { isAuthenticated, userType: user?.user_type });
        return;
      }
      
      console.log('🔄 Loading active orders for client:', user?.id);
      const token = localStorage.getItem('auth_token');
      console.log('🎫 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      const authHeaders = getAuthHeaders();
      console.log('🔑 Auth headers:', authHeaders);
      setLoadingOrders(true);
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENT_ORDERS_ACTIVE}`, {
          headers: authHeaders,
        });
        
        console.log('📡 API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📦 API Response data:', data);
          
          if (data.success) {
            console.log('✅ Active orders loaded:', data.data);
            setActiveOrders(data.data);
          } else {
            console.log('❌ API returned success: false');
          }
        } else {
          console.log('❌ API request failed:', response.status, response.statusText);
          const errorText = await response.text();
          console.log('❌ Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Error loading active orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    // Загрузка уведомлений
    const loadNotifications = async () => {
      if (!isAuthenticated || user?.user_type !== 'client') return;
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENT_NOTIFICATIONS}`, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // setNotifications(data.data.data || data.data); // This line was removed
          }
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        // setLoadingNotifications(false); // This line was removed
      }
    };

    // Загрузка количества непрочитанных уведомлений
    const loadUnreadCount = async () => {
      if (!isAuthenticated || user?.user_type !== 'client') return;
      
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENT_NOTIFICATIONS_UNREAD}`, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUnreadCount(data.data.unread_count);
          }
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };


    console.log('🔄 useEffect triggered:', { isAuthenticated, userType: user?.user_type, userId: user?.id });
    if (isAuthenticated && user?.user_type === 'client') {
      console.log('✅ Loading client data...');
      loadActiveOrders();
      loadNotifications();
      loadUnreadCount();
    } else {
      console.log('❌ Not loading client data:', { isAuthenticated, userType: user?.user_type });
    }
  }, [isAuthenticated, user]);

  // Функция для инициализации формы редактирования
  const initializeEditForm = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setEditError('');
    setFormErrors({});
  };

  // Функция для обработки изменений в форме
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку для этого поля
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Функция для валидации формы
  const validateForm = (formData: any, formType: string) => {
    const errors: Record<string, string> = {};
    
    if (formType === 'edit') {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email';
      }
      if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
    } else if (formType === 'password') {
      if (!formData.current_password) {
        errors.current_password = 'Current password is required';
      }
      if (!formData.new_password) {
        errors.new_password = 'New password is required';
      } else if (formData.new_password.length < 8) {
        errors.new_password = 'Password must be at least 8 characters';
      }
      if (formData.new_password !== formData.confirm_password) {
        errors.confirm_password = 'Passwords do not match';
      }
    }
    
    return errors;
  };

  // Функция для форматирования телефона
  const formatAzPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('994')) {
      const formatted = cleaned.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '+$1 $2 $3 $4 $5');
      return formatted;
    } else if (cleaned.startsWith('0')) {
      const withoutZero = cleaned.substring(1);
      const formatted = withoutZero.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '+994 $1 $2 $3 $4');
      return formatted;
    }
    return value;
  };

  // Функция для отправки формы редактирования
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    const errors = validateForm(editForm, 'edit');
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setEditError('');

    try {
      // Подготавливаем данные для отправки
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone
      };

      console.log('🔄 Updating user data:', updateData);

      // Вызываем API для обновления данных пользователя
      const success = await updateUser(updateData);
      
      if (success) {
        // Переключаемся на основную секцию
        setActiveSection('my-account');
        
        // Показываем уведомление об успехе
        alert('Məlumatlar uğurla yeniləndi!');
      } else {
        setEditError('Məlumatları yeniləmək mümkün olmadı. Yenidən cəhd edin.');
      }
      
    } catch (error) {
      console.error('Update user error:', error);
      setEditError('Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Функция для смены пароля
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валидация
    const errors = validateForm(passwordForm, 'password');
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    setPasswordError('');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordForm)
      });
      
      if (response.ok) {
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setActiveSection('my-account');
        alert('Password changed successfully!');
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError('An error occurred while changing password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Функция для сохранения адресов
  const handleAddressSubmit = async (type: 'billing' | 'shipping') => {
    setIsSubmitting(true);
    
    try {
      const addressData = type === 'billing' ? billingAddress : shippingAddress;
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/address/${type}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData)
      });
      
      if (response.ok) {
        alert(`${type === 'billing' ? 'Billing' : 'Shipping'} address saved successfully!`);
      } else {
        alert(`Failed to save ${type} address`);
      }
    } catch (error) {
      console.error('Address save error:', error);
      alert('An error occurred while saving address');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Функция для обновления подписок
  const handleNewsletterUpdate = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/user/newsletter-subscriptions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newsletterSubscriptions)
      });
      
      if (response.ok) {
        alert('Newsletter preferences updated successfully!');
      } else {
        alert('Failed to update newsletter preferences');
      }
    } catch (error) {
      console.error('Newsletter update error:', error);
      alert('An error occurred while updating preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Функция для прямого создания платежа и редиректа на Algoritma
  const handleDirectPayment = async (orderId: number) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/payment/orders/${orderId}/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.payment_url) {
          // Перенаправляем на Payment Page Algoritma
          window.location.href = data.data.payment_url;
        } else {
          alert(data.message || 'Ödəniş yaradıla bilmədi');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Ödəniş yaradıla bilmədi');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ödəniş zamanı xəta baş verdi');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.profilePage}>
        <Header />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // New My Account layout (PAUL design) - two-column, header-width container
  return (
    <div className={styles.profilePage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Account', isActive: true }
          ]}
        />



        {/* Main content: sidebar 405px + content auto */}
        <div className={styles.mainContent}>
          {/* Sidebar */}
          <aside className={styles.sidebar} role="navigation" aria-label="Account navigation">
            <nav className={styles.sidebarNav}>
                  <button
                className={`${styles.sidebarButton} ${activeSection === 'my-account' ? styles.active : ''}`}
                onClick={() => setActiveSection('my-account')}
                aria-current={activeSection === 'my-account' ? 'page' : undefined}
              >
                My Account
                  </button>
                    <button
                className={`${styles.sidebarButton} ${activeSection === 'my-orders' ? styles.active : ''}`}
                onClick={() => setActiveSection('my-orders')}
                aria-current={activeSection === 'my-orders' ? 'page' : undefined}
              >
                My Orders
                    </button>
                    <button
                className={`${styles.sidebarButton} ${activeSection === 'address-information' ? styles.active : ''}`}
                onClick={() => setActiveSection('address-information')}
                aria-current={activeSection === 'address-information' ? 'page' : undefined}
              >
                Address Information
                    </button>
                  <button
                className={`${styles.sidebarButton} ${activeSection === 'account-information' ? styles.active : ''}`}
                onClick={() => setActiveSection('account-information')}
                aria-current={activeSection === 'account-information' ? 'page' : undefined}
              >
                Account Information
                  </button>
                  <button
                className={`${styles.sidebarButton} ${activeSection === 'edit-profile' ? styles.active : ''}`}
                onClick={() => {
                  setActiveSection('edit-profile');
                  initializeEditForm();
                }}
                aria-current={activeSection === 'edit-profile' ? 'page' : undefined}
              >
                Edit Profile
                  </button>
                  <button
                className={`${styles.sidebarButton} ${activeSection === 'change-password' ? styles.active : ''}`}
                onClick={() => setActiveSection('change-password')}
                aria-current={activeSection === 'change-password' ? 'page' : undefined}
              >
                Change Password
                  </button>
                  <button
                className={`${styles.sidebarButton} ${activeSection === 'newsletter-subscription' ? styles.active : ''}`}
                onClick={() => setActiveSection('newsletter-subscription')}
                aria-current={activeSection === 'newsletter-subscription' ? 'page' : undefined}
              >
                Newsletter Subscription
                  </button>
              <button 
                className={styles.sidebarButton}
                onClick={() => logout()}
              >
                Log out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className={styles.content}>
            {/* My Account */}
            {activeSection === 'my-account' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>My Account</h2>
                <div className={styles.infoBlock}>
                  <p className={styles.infoText}>
                    Welcome back, <strong>{user?.name}</strong>! Here you can manage your account settings, 
                    view your order history, and update your personal information.
                  </p>
                  <div className={styles.actionButtons}>
                  <button
                      className={styles.actionButton}
                      onClick={() => {
                        setActiveSection('edit-profile');
                        initializeEditForm();
                      }}
                    >
                      Edit Profile
                    </button>
                    <button 
                      className={styles.actionButton}
                      onClick={() => setActiveSection('change-password')}
                    >
                      Change Password
                  </button>
                </div>
              </div>
              </section>
            )}

            {/* My Orders */}
            {activeSection === 'my-orders' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>My Orders</h2>
                
                {/* Order Filters */}
                <div className={styles.orderFilters}>
                <button
                    className={`${styles.filterButton} ${orderFilter === 'all' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('all')}
                  >
                    All Orders
                  </button>
                <button
                    className={`${styles.filterButton} ${orderFilter === 'delivered' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('delivered')}
                  >
                    Delivered
                  </button>
                  <button 
                    className={`${styles.filterButton} ${orderFilter === 'in-progress' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('in-progress')}
                  >
                    Currently in progress
                </button>
                <button 
                    className={`${styles.filterButton} ${orderFilter === 'payment-pending' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('payment-pending')}
                  >
                    Payment Pending
                </button>
              </div>

              {loadingOrders ? (
                  <div className={styles.loadingState}>
                    <div className={styles.loadingSpinner} />
                    <span>Loading orders...</span>
                </div>
                ) : activeOrders.length > 0 ? (
                  <div className={styles.ordersList}>
                    {activeOrders
                      .filter((order) => {
                        if (orderFilter === 'delivered') {
                          return order.status === 'completed';
                        } else if (orderFilter === 'in-progress') {
                          return order.status === 'processing';
                        } else if (orderFilter === 'payment-pending') {
                          return order.status === 'submitted';
                        }
                        return true; // 'all' - показать все заказы
                      })
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((order) => {
                      // Получаем первый товар для отображения изображения и названия
                      const firstItem = order.menu_items[0];
                      const orderDate = new Date(order.created_at);
                      const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
                      
                      // Определяем статус заказа
                      const getOrderStatus = (status: string) => {
                        switch (status) {
                          case 'completed':
                            return { text: 'Delivered', icon: '✓', isDelivered: true, needsPayment: false };
                          case 'processing':
                            return { text: 'In Progress', icon: '⏳', isDelivered: false, needsPayment: false };
                          case 'submitted':
                            return { text: 'Payment Pending', icon: '💳', isDelivered: false, needsPayment: true };
                          case 'draft':
                            return { text: 'Draft', icon: '📝', isDelivered: false, needsPayment: false };
                          case 'cancelled':
                            return { text: 'Cancelled', icon: '❌', isDelivered: false, needsPayment: false };
                          default:
                            return { text: status.charAt(0).toUpperCase() + status.slice(1), icon: '📋', isDelivered: false, needsPayment: false };
                        }
                      };
                      
                      const orderStatus = getOrderStatus(order.status);
                      
                      return (
                        <div key={order.id} className={styles.orderCard}>
                          <div className={styles.orderImage}>
                            <img 
                              src="/images/cake1.png" 
                              alt={firstItem?.name || "Order item"} 
                              className={styles.productImage}
                            />
                          </div>
                          <div className={styles.orderDetails}>
                            <h3 className={styles.orderProductName}>
                              {firstItem?.name || `Order #${order.id}`}
                              {order.menu_items.length > 1 && ` +${order.menu_items.length - 1} more`}
                          </h3>
                            <div className={styles.orderInfo}>
                              <p className={styles.orderInfoItem}>
                                <span className={styles.orderInfoLabel}>Order date:</span>
                                <span>{orderDate.toLocaleDateString('en-GB')}</span>
                              </p>
                              <p className={styles.orderInfoItem}>
                                <span className={styles.orderInfoLabel}>Delivery type:</span>
                                <span>
                                  {order.delivery_type === 'delivery' ? 'Courier delivery' : 
                                   order.delivery_type === 'pickup' ? 'Pickup' : 
                                   order.delivery_type === 'buffet' ? 'Buffet service' : 
                                   'Standard delivery'}
                        </span>
                              </p>
                              <p className={styles.orderInfoItem}>
                                {order.status === 'submitted' ? 'Payment pending' : 'Payment completed'}
                              </p>
                        </div>
                            <div className={styles.orderTime}>
                              {orderDate.toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                        </div>
                      </div>
                          <div className={styles.orderPrice}>
                            <span className={styles.priceAmount}>
                              {order.final_amount || order.total_amount}
                            </span>
                            <span className={styles.currency}>₼</span>
                          </div>
                          <div className={styles.orderStatus}>
                            <div className={`${styles.statusBadge} ${orderStatus.isDelivered ? styles.delivered : styles.pending}`}>
                              <span className={styles.statusText}>{orderStatus.text}</span>
                              <div className={styles.statusIcon}>{orderStatus.icon}</div>
                            </div>
                      {orderStatus.needsPayment && (
                          <button
                                className={styles.completePaymentButton}
                            onClick={() => handleDirectPayment(order.id)}
                              >
                                Complete Payment
                          </button>
                      )}
                    </div>
                </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📋</div>
                    <p className={styles.emptyStateText}>
                      You have no active orders at the moment.
                    </p>
                    <button 
                      className={styles.emptyStateButton}
                      onClick={() => router.push('/catering')}
                    >
                      Browse Menu
                    </button>
                </div>
              )}
        </section>
            )}

            {/* Address Information */}
            {activeSection === 'address-information' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Address Information</h2>
                <div className={styles.singleColumnGrid}>
                  <div className={styles.infoBlock}>
                    <h3 className={styles.infoTitle}>Default Billing Address</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddressSubmit('billing'); }} className={styles.addressForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Street Address</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={billingAddress.street}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>City</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={billingAddress.city}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Enter city"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Postal Code</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={billingAddress.postal_code}
                            onChange={(e) => setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Country</label>
                        <select
                          className={styles.formInput}
                          value={billingAddress.country}
                          onChange={(e) => setBillingAddress(prev => ({ ...prev, country: e.target.value }))}
                        >
                          <option value="Azerbaijan">Azerbaijan</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Billing Address'}
                      </button>
                    </form>
                  </div>
                  
                  <div className={styles.infoBlock}>
                    <h3 className={styles.infoTitle}>Default Shipping Address</h3>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddressSubmit('shipping'); }} className={styles.addressForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Street Address</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>City</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Enter city"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Postal Code</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={shippingAddress.postal_code}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Country</label>
                        <select
                          className={styles.formInput}
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, country: e.target.value }))}
                        >
                          <option value="Azerbaijan">Azerbaijan</option>
                          <option value="Turkey">Turkey</option>
                          <option value="Georgia">Georgia</option>
                        </select>
                      </div>
                      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Save Shipping Address'}
                      </button>
                    </form>
                  </div>
                </div>
              </section>
            )}

            {/* Account Information */}
            {activeSection === 'account-information' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Account Information</h2>
                <div className={styles.twoColumnGrid}>
                  <div className={styles.infoBlock}>
                    <h3 className={styles.infoTitle}>Personal Details</h3>
                    <p className={styles.infoText}>
                      <strong>Name:</strong> {user?.name}<br />
                      <strong>Email:</strong> {user?.email || 'Not provided'}<br />
                      <strong>Phone:</strong> {user?.phone || 'Not provided'}
                    </p>
                  </div>
                  <div className={styles.actionButtons}>
                  <button
                      className={styles.actionButton}
                      onClick={() => {
                        setActiveSection('edit-profile');
                        initializeEditForm();
                      }}
                    >
                      Edit Details
                  </button>
                  </div>
                </div>
              </section>
            )}
            
            {/* Edit Profile */}
            {activeSection === 'edit-profile' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Edit Profile</h2>
                <form onSubmit={handleEditSubmit} className={styles.profileForm}>
                  {editError && (
                    <div className={styles.errorMessage}>
                      {editError}
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className={`${styles.formInput} ${formErrors.name ? styles.inputError : ''}`}
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <span className={styles.fieldError}>{formErrors.name}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                      value={editForm.email}
                      onChange={handleEditFormChange}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <span className={styles.fieldError}>{formErrors.email}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`${styles.formInput} ${formErrors.phone ? styles.inputError : ''}`}
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      placeholder="Enter your phone number"
                    />
                    {formErrors.phone && (
                      <span className={styles.fieldError}>{formErrors.phone}</span>
                    )}
                  </div>
                  
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setActiveSection('my-account')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            )}
            
            {/* Change Password */}
            {activeSection === 'change-password' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className={styles.profileForm}>
                  {passwordError && (
                    <div className={styles.errorMessage}>
                      {passwordError}
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Current Password *</label>
                    <input
                      type="password"
                      name="current_password"
                      className={`${styles.formInput} ${formErrors.current_password ? styles.inputError : ''}`}
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                      placeholder="Enter your current password"
                    />
                    {formErrors.current_password && (
                      <span className={styles.fieldError}>{formErrors.current_password}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Password *</label>
                    <input
                      type="password"
                      name="new_password"
                      className={`${styles.formInput} ${formErrors.new_password ? styles.inputError : ''}`}
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                      placeholder="Enter your new password"
                    />
                    {formErrors.new_password && (
                      <span className={styles.fieldError}>{formErrors.new_password}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      className={`${styles.formInput} ${formErrors.confirm_password ? styles.inputError : ''}`}
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                      placeholder="Confirm your new password"
                    />
                    {formErrors.confirm_password && (
                      <span className={styles.fieldError}>{formErrors.confirm_password}</span>
                    )}
                  </div>
                  
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setActiveSection('my-account')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {/* Newsletter Subscription */}
            {activeSection === 'newsletter-subscription' && (
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Newsletter Subscription</h2>
                <div className={styles.newsletterSection}>
                  <div className={styles.infoBlock}>
                    <h3 className={styles.infoTitle}>Email Preferences</h3>
                    <p className={styles.infoText}>
                      Manage your email subscription preferences. You can choose which types of emails you'd like to receive.
                    </p>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleNewsletterUpdate(); }} className={styles.newsletterForm}>
                    <div className={styles.subscriptionOptions}>
                      <div className={styles.subscriptionItem}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newsletterSubscriptions.general}
                            onChange={(e) => setNewsletterSubscriptions(prev => ({ ...prev, general: e.target.checked }))}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxText}>
                            <strong>General Newsletter</strong>
                            <small>Company news, updates, and general information</small>
                          </span>
                        </label>
                      </div>
                      
                      <div className={styles.subscriptionItem}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newsletterSubscriptions.promotions}
                            onChange={(e) => setNewsletterSubscriptions(prev => ({ ...prev, promotions: e.target.checked }))}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxText}>
                            <strong>Promotional Emails</strong>
                            <small>Special offers, discounts, and promotional content</small>
                          </span>
                        </label>
                      </div>
                      
                      <div className={styles.subscriptionItem}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newsletterSubscriptions.order_updates}
                            onChange={(e) => setNewsletterSubscriptions(prev => ({ ...prev, order_updates: e.target.checked }))}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxText}>
                            <strong>Order Updates</strong>
                            <small>Order confirmations, shipping notifications, and delivery updates</small>
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div className={styles.formActions}>
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
              </section>
            )}
          </main>
          </div>

        {/* Features section */}
        <FeaturesSection />
        </div>

      {/* Footer */}
      <Footer />

      {/* Feedback Button */}
      <FeedbackButton />
    </div>
  );





}
