import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Order,
  Address,
  User,
  Application,
  CartItem,
} from '@/types/unified';
import { API_CONFIG, getAuthHeaders } from '@/config/api';
import { makeApiRequest } from '@/utils/apiHelpers';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { getToken } from '@/utils/tokenManager';

const fetchActiveOrders = async (): Promise<Order[]> => {
    const data = await makeApiRequest<Order[]>(API_CONFIG.ENDPOINTS.CLIENT_ORDERS_ACTIVE);
    return data.success && data.data ? data.data : [];
};

const fetchUnreadCount = async (): Promise<number> => {
    const data = await makeApiRequest<{unread_count: number}>(API_CONFIG.ENDPOINTS.CLIENT_NOTIFICATIONS_UNREAD);
    return data.success && data.data ? data.data.unread_count : 0;
};

const fetchAddresses = async (): Promise<Address[]> => {
    const data = await makeApiRequest<Address[]>('/user/addresses');
    return data.success && data.data ? data.data : [];
};


export const useUserProfile = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading, updateUser, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

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
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postal_code: '',
    type: 'shipping' as const,
    user_id: user?.id || 0,
    country: 'Azerbaijan',
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

  const { data: activeOrders = [], isLoading: loadingOrders } = useQuery<Order[]>({
    queryKey: queryKeys.orders.active(user?.id),
    queryFn: fetchActiveOrders,
    enabled: !!user && user.user_type === 'client',
    staleTime: 1 * 60 * 1000, // 1 минута
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: queryKeys.notifications.unreadCount(user?.id),
    queryFn: fetchUnreadCount,
    enabled: !!user && user.user_type === 'client',
    staleTime: 30 * 1000, // 30 секунд
    refetchInterval: 60 * 1000, // Обновление каждую минуту
  });

  const { data: addresses = [], isLoading: loadingAddresses } = useQuery<Address[]>({
    queryKey: queryKeys.user.addresses(user?.id),
    queryFn: fetchAddresses,
    enabled: !!user,
  });


  // Состояние для активной секции в сайдбаре
  const [activeSection, setActiveSection] = useState('my-account');

  // Состояние для валидации форм
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Состояние для фильтра заказов
  const [orderFilter, setOrderFilter] = useState<'all' | 'delivered' | 'in-progress' | 'payment-pending'>('all');

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);


  // Функция для инициализации формы редактирования
  const initializeEditForm = useCallback(() => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setEditError('');
    setFormErrors({});
  }, [user]);
  
  // Инициализация при первой загрузке user
  useEffect(() => {
    if (user) {
      initializeEditForm();
    }
  }, [user, initializeEditForm]);

  // Функция для обработки изменений в форме
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (formData: Record<string, string | number | boolean>, formType: string) => {
    const errors: Record<string, string> = {};
    if (formType === 'edit') {
        if (!(formData.name as string).trim()) errors.name = 'Name is required';
        if (!(formData.email as string).trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email as string)) {
            errors.email = 'Please enter a valid email';
        }
        if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone as string)) {
            errors.phone = 'Please enter a valid phone number';
        }
    } else if (formType === 'password') {
        if (!formData.current_password) errors.current_password = 'Current password is required';
        if (!formData.new_password) {
            errors.new_password = 'New password is required';
        } else if (typeof formData.new_password === 'string' && formData.new_password.length < 8) {
            errors.new_password = 'Password must be at least 8 characters';
        }
        if (formData.new_password !== formData.confirm_password) {
            errors.confirm_password = 'Passwords do not match';
        }
    }
    return errors;
  };

  const { mutate: mutateUser, isPending: isUserUpdating } = useMutation({
    mutationFn: (userData: Parameters<typeof updateUser>[0]) => updateUser(userData),
    onSuccess: (success) => {
      if (success) {
        setActiveSection('my-account');
        alert('Məlumatlar uğurla yeniləndi!');
        queryClient.invalidateQueries({ queryKey: ['user', user?.id] }); 
      } else {
        setEditError('Məlumatları yeniləmək mümkün olmadı. Yenidən cəhd edin.');
      }
    },
    onError: (error) => {
      // console.error('Update user error:', error); // Removed for production
      setEditError('Xəta baş verdi. Yenidən cəhd edin.');
    }
  });

  const { mutate: addAddress } = useMutation({
    mutationFn: async (addressData: Omit<Address, 'id' | 'is_default' | 'created_at' | 'updated_at'>) => {
      const url = `${API_CONFIG.BASE_URL}/user/addresses`;
      const headers = getAuthHeaders();
      

      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(addressData),
      });
      
      // console.log('Response status:', response.status); // Removed for production
      // console.log('Response headers:', Object.fromEntries(response.headers.entries())); // Removed for production
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // console.error('Error response:', errorData); // Removed for production
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to add address`);
      }
      
      const result = await response.json();
      // console.log('Success response:', result); // Removed for production
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses(user?.id) });
      alert('Address added successfully!');
      // Reset shipping address form
      setShippingAddress({ 
        street: '', 
        city: '', 
        postal_code: '',
        type: 'shipping' as const,
        user_id: user?.id || 0,
        country: 'Azerbaijan',
      });
    },
    onError: (error: Error) => {
      // console.error('Add address error:', error); // Removed for production
      alert(`Failed to add address: ${error.message}`);
    }
  });

  const { mutate: setDefaultAddress } = useMutation({
    mutationFn: async (addressId: number) => {
      const response = await makeApiRequest(`/user/addresses/${addressId}/default`, {
        method: 'POST',
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to set default address');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses(user?.id) });
      alert('Default address updated!');
    },
    onError: (error: Error) => {
      // console.error('Set default address error:', error); // Removed for production
      alert(`Failed to set default address: ${error.message}`);
    }
  });

  const { mutate: deleteAddress } = useMutation({
    mutationFn: async (addressId: number) => {
      const response = await makeApiRequest(`/user/addresses/${addressId}`, {
        method: 'DELETE',
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete address');
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.addresses(user?.id) });
      alert('Address deleted successfully!');
    },
    onError: (error: Error) => {
      // console.error('Delete address error:', error); // Removed for production
      alert(`Failed to delete address: ${error.message}`);
    }
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(editForm, 'edit');
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    mutateUser(editForm);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm(passwordForm, 'password');
    if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
    }
    setIsSubmitting(true);
    setPasswordError('');
    try {
      const response = await makeApiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordForm)
      });
      if (response.success) {
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setActiveSection('my-account');
        alert('Password changed successfully!');
      } else {
        setPasswordError(response.message || 'Failed to change password');
      }
    } catch (error) {
      // console.error('Password change error:', error); // Removed for production
      setPasswordError('An error occurred while changing password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postal_code) {
      alert('Please fill in all fields for the shipping address.');
      return;
    }
    
    // Check if user is authenticated
    if (!user) {
      alert('You must be logged in to add an address.');
      return;
    }
    
    // Check if token exists
    const token = getToken();
    if (!token) {
      alert('Authentication token not found. Please log in again.');
      return;
    }
    
    // console.log('Submitting address:', shippingAddress); // Removed for production
    // console.log('User ID:', user.id); // Removed for production
    console.log('Token exists:', !!token);
    
    addAddress(shippingAddress);
  };

  const handleNewsletterUpdate = async () => {
    setIsSubmitting(true);
    try {
      const response = await makeApiRequest('/user/newsletter-subscriptions', {
        method: 'POST',
        body: JSON.stringify(newsletterSubscriptions)
      });
      if (response.success) {
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

  const handleDirectPayment = async (orderId: number) => {
    try {
      const response = await makeApiRequest<{payment_url: string}>(`/payment/orders/${orderId}/create`, {
        method: 'POST',
      });
      if (response.success && response.data?.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        alert(response.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Ödəniş zamanı xəta baş verdi');
    }
  };

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return {
    user,
    isAuthenticated,
    isAuthLoading,
    logout,
    isSubmitting: isSubmitting || isUserUpdating,
    editForm,
    editError,
    billingAddress,
    setBillingAddress,
    shippingAddress,
    setShippingAddress,
    newsletterSubscriptions,
    setNewsletterSubscriptions,
    passwordForm,
    passwordError,
    activeOrders,
    unreadCount,
    loadingOrders,
    addresses,
    loadingAddresses,
    setDefaultAddress,
    deleteAddress,
    activeSection,
    setActiveSection,
    formErrors,
    orderFilter,
    setOrderFilter,
    initializeEditForm,
    handleEditFormChange,
    handleEditSubmit,
    handlePasswordSubmit,
    handleAddressSubmit,
    handleNewsletterUpdate,
    handleDirectPayment,
    handlePasswordFormChange
  };
};
