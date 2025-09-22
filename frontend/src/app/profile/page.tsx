"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Order, API_CONFIG, getAuthHeaders } from '../../config/api';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, updateUser, logout } = useAuth();
  const { items: cartItems, getTotalPrice, getTotalItems, clearCart } = useCart();
  const router = useRouter();
  
  // Состояние для модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editError, setEditError] = useState('');

  // Состояние для активных заказов и уведомлений
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  // Функция для открытия модального окна редактирования
  const openEditModal = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  // Функция для закрытия модального окна
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditError('');
    setIsSubmitting(false);
  };

  // Функция для обработки изменений в форме
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
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
        // Закрываем модальное окно
        closeEditModal();
        
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

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '2rem', 
            height: '2rem', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid #D4AF37', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#4A4A4A' }}>Yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Заголовок */}
        <section style={{
          padding: '4rem 0',
          background: 'linear-gradient(135deg, #F9F9F6 0%, #F5F1EB 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Декоративные элементы */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 6s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 8s ease-in-out infinite reverse'
          }} />
          
          <div className="container-paul">
            <div style={{ 
              textAlign: 'center',
              position: 'relative',
              zIndex: 1
            }}>
              <h1 style={{
                fontSize: '3rem',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 'bold',
                color: '#1A1A1A',
                marginBottom: '1.5rem',
                opacity: 0,
                animation: 'fadeInUp 1s ease-out 0.2s forwards',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Şəxsi Kabinet
              </h1>
              <p style={{
                color: '#4A4A4A',
                fontSize: '1.25rem',
                maxWidth: '48rem',
                margin: '0 auto',
                opacity: 0,
                animation: 'fadeInUp 1s ease-out 0.4s forwards',
                lineHeight: 1.6
              }}>
                Salam, <span style={{ 
                  color: '#D4AF37', 
                  fontWeight: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>{user?.name}</span>! Burada sizin sifarişlərinizi və hesab məlumatlarınızı idarə edə bilərsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* Основной контент */}
        <section style={{
          padding: '5rem 0',
          backgroundColor: 'white',
          position: 'relative'
        }}>
          <div className="container-paul">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Информация о пользователе */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #F9F9F6 100%)',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0,
                animation: 'fadeInUp 0.8s ease-out 0.6s forwards',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 1px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)';
              }}>
                {/* Декоративная полоска */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
                  borderRadius: '1.5rem 1.5rem 0 0'
                }} />
                <h2 style={{
                  fontSize: '1.75rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
                    </svg>
                  </div>
                  Şəxsi Məlumatlar
                </h2>
                
                {/* Кнопка редактирования */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginBottom: '1.5rem' 
                }}>
                  <button
                    onClick={openEditModal}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                      color: '#1A1A1A',
                      border: 'none',
                      borderRadius: '0.75rem',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Redaktə et
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#D4AF37', 
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Ad və Soyad
                    </label>
                    <p style={{ 
                      color: '#1A1A1A', 
                      fontSize: '1.125rem', 
                      fontWeight: 500,
                      margin: 0,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {user?.name}
                    </p>
                  </div>
                  <div style={{
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#D4AF37', 
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      E-poçt
                    </label>
                    <p style={{ 
                      color: '#1A1A1A', 
                      fontSize: '1.125rem',
                      margin: 0,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {user?.email}
                    </p>
                  </div>
                  <div style={{
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '1rem',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: 600, 
                      color: '#D4AF37', 
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Telefon
                    </label>
                    <p style={{ 
                      color: '#1A1A1A', 
                      fontSize: '1.125rem',
                      margin: 0,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {user?.phone || 'Təyin edilməyib'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Текущая корзина */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #F9F9F6 100%)',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0,
                animation: 'fadeInUp 0.8s ease-out 0.8s forwards',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 1px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)';
              }}>
                {/* Декоративная полоска */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
                  borderRadius: '1.5rem 1.5rem 0 0'
                }} />
                <h2 style={{
                  fontSize: '1.75rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6.5" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="20" cy="19" r="1" />
                    </svg>
                  </div>
                  Cari Səbət
                </h2>
                
                {cartItems.length > 0 ? (
                  <div>
                    <div style={{ 
                      marginBottom: '2rem',
                      padding: '1.5rem',
                      background: 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '1rem',
                      border: '1px solid rgba(0,0,0,0.05)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                      <p style={{ 
                        color: '#4A4A4A', 
                        fontSize: '0.875rem',
                        marginBottom: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {getTotalItems()} məhsul səbətdə
                      </p>
                      <p style={{ 
                        color: '#1A1A1A', 
                        fontSize: '1.75rem',
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 'bold',
                        margin: 0,
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        Ümumi: <span style={{ color: '#D4AF37' }}>{getTotalPrice()} ₼</span>
                      </p>
                    </div>
                    
                    <div style={{ marginBottom: '2rem' }}>
                      {cartItems.slice(0, 3).map((cartItem, index) => (
                        <div key={cartItem.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          marginBottom: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '0.75rem',
                          border: '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease',
                          animation: `fadeInUp 0.5s ease-out ${1 + index * 0.1}s forwards`,
                          opacity: 0
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                          <div>
                            <p style={{ 
                              color: '#1A1A1A', 
                              fontSize: '1rem',
                              fontWeight: 600,
                              margin: 0,
                              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              {cartItem.name}
                            </p>
                            <p style={{ 
                              color: '#D4AF37', 
                              fontSize: '0.875rem',
                              margin: 0,
                              fontWeight: 500
                            }}>
                              {cartItem.quantity} ədəd
                            </p>
                          </div>
                          <p style={{ 
                            color: '#1A1A1A', 
                            fontSize: '1rem',
                            fontWeight: 600,
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            {cartItem.price * cartItem.quantity} ₼
                          </p>
                        </div>
                      ))}
                      {cartItems.length > 3 && (
                        <div style={{
                          textAlign: 'center',
                          padding: '0.75rem',
                          background: 'rgba(212, 175, 55, 0.1)',
                          borderRadius: '0.75rem',
                          border: '1px solid rgba(212, 175, 55, 0.2)'
                        }}>
                          <p style={{ 
                            color: '#D4AF37', 
                            fontSize: '0.875rem',
                            margin: 0,
                            fontWeight: 600
                          }}>
                            +{cartItems.length - 3} əlavə məhsul
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => router.push('/catering')}
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)';
                        e.currentTarget.style.color = '#1A1A1A';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }}
                    >
                      Səbəti gör
                    </button>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center',
                    padding: '2rem 1rem'
                  }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 1.5rem',
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6.5" />
                        <circle cx="9" cy="19" r="1" />
                        <circle cx="20" cy="19" r="1" />
                      </svg>
                    </div>
                    <p style={{ 
                      color: '#4A4A4A', 
                      fontSize: '1rem',
                      marginBottom: '2rem',
                      fontWeight: 500
                    }}>
                      Səbətdə məhsul yoxdur
                    </p>
                    <button
                      onClick={() => router.push('/catering')}
                      style={{
                        width: '100%',
                        padding: '1rem 1.5rem',
                        background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '1rem',
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)';
                        e.currentTarget.style.color = '#1A1A1A';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                      }}
                    >
                      Sifariş et
                    </button>
                  </div>
                )}
              </div>

              {/* Быстрые действия */}
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #F9F9F6 100%)',
                padding: '2.5rem',
                borderRadius: '1.5rem',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: 0,
                animation: 'fadeInUp 0.8s ease-out 1s forwards',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 1px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)';
              }}>
                {/* Декоративная полоска */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #D4AF37 0%, #F4D03F 50%, #D4AF37 100%)',
                  borderRadius: '1.5rem 1.5rem 0 0'
                }} />
                <h2 style={{
                  fontSize: '1.75rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  </div>
                  Sürətli Əməliyyatlar
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <button
                    onClick={() => router.push('/catering')}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)';
                      e.currentTarget.style.color = '#1A1A1A';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6.5" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="20" cy="19" r="1" />
                    </svg>
                    Katerinq Menyusu
                  </button>
                  
                  <button
                    onClick={() => router.push('/orders/history')}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                      color: '#1A1A1A',
                      border: 'none',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)';
                      e.currentTarget.style.color = '#1A1A1A';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                      <path d="M9 1v6M15 1v6M9 17v6M15 17v6"/>
                    </svg>
                    Sifariş Tarixçəsi
                  </button>
                  
                  <button
                    onClick={() => router.push('/')}
                    style={{
                      width: '100%',
                      padding: '1rem 1.5rem',
                      background: 'transparent',
                      color: '#1A1A1A',
                      border: '2px solid #1A1A1A',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1A1A1A';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#1A1A1A';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                    Ana Səhifə
                  </button>
                </div>
              </div>
            </div>

            {/* Активные за-orders */}
            <div style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
              borderRadius: '1.5rem',
              padding: '2rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              animation: 'fadeInUp 0.6s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  onClick={async () => {
                    try {
                      await logout();
                    } catch (err) {
                      console.error('Logout failed', err);
                    }
                    try { clearCart(); } catch (_e) {}
                    router.push('/');
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '220px',
                    padding: '1rem 1.5rem',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '1rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Çıxış
                </button>
              </div>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1A1A1A',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontFamily: 'Playfair Display, serif'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11H5a2 2 0 0 0-2 2v3c0 1.1.9 2 2 2h4m0-7v7m0-7h10a2 2 0 0 1 2 2v3c0 1.1-.9 2-2 2H9m0-7V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                  </svg>
                </div>
                Aktiv Sifarişlər
                {unreadCount > 0 && (
                  <span style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.5rem',
                    minWidth: '20px',
                    textAlign: 'center',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </h2>

              {loadingOrders ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  color: '#6B7280'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '2px solid #E5E7EB',
                    borderTop: '2px solid #3B82F6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '0.5rem'
                  }}></div>
                  Yüklənir...
                </div>
              ) : (() => {
                console.log('🎯 Rendering active orders:', { activeOrdersCount: activeOrders.length, activeOrders });
                return activeOrders.length > 0;
              })() ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeOrders.map((order) => (
                    <div key={order.id} style={{
                      background: 'white',
                      borderRadius: '1rem',
                      padding: '1.5rem',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      border: '1px solid #E5E7EB',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1A1A1A',
                            margin: '0 0 0.25rem 0'
                          }}>
                            Sifariş #{order.id}
                          </h3>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6B7280',
                            margin: 0
                          }}>
                            {order.company_name}
                          </p>
                        </div>
                        <span style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          background: order.status === 'submitted' ? '#FEF3C7' : '#D1FAE5',
                          color: order.status === 'submitted' ? '#D97706' : '#059669'
                        }}>
                          {order.status === 'submitted' ? 'Ödəniş gözlənilir' : 'Hazırlanır'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            color: '#6B7280',
                            margin: '0 0 0.25rem 0'
                          }}>
                            {order.menu_items.length} məhsul
                          </p>
                          {order.delivery_date && (
                            <p style={{
                              fontSize: '0.875rem',
                              color: '#6B7280',
                              margin: 0
                            }}>
                              Çatdırılma: {new Date(order.delivery_date).toLocaleDateString('az-AZ')}
                            </p>
                          )}
                        </div>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: '#D4AF37',
                          fontFamily: 'Playfair Display, serif'
                        }}>
                          {order.total_amount.toFixed(2)} ₼
                        </div>
                      </div>

                      {order.status === 'submitted' && (
                        <div style={{ marginTop: '1rem' }}>
                          <button
                            onClick={() => router.push(`/payment/${order.id}`)}
                            style={{
                              width: '100%',
                              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.75rem',
                              padding: '0.75rem 1rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            💳 Ödəniş Et
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6B7280'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.6
                  }}>
                    📋
                  </div>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    Hal-hazırda aktiv sifariş yoxdur
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <Footer />

      {/* Модальное окно редактирования */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem',
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={closeEditModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            animation: 'slideInUp 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}>
            
            {/* Заголовок модального окна */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #F9F9F6'
            }}>
              <h2 style={{
                fontSize: '1.75rem',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 600,
                color: '#1A1A1A',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  padding: '0.5rem',
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                Məlumatları Redaktə Et
              </h2>
              <button
                onClick={closeEditModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#4A4A4A',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F5F5F5';
                  e.currentTarget.style.color = '#1A1A1A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#4A4A4A';
                }}
              >
                ×
              </button>
            </div>

            {/* Форма редактирования */}
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Поле имени */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#D4AF37',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Ad və Soyad
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#FAFAFA'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#FAFAFA';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="Ad və soyadınızı daxil edin"
                  />
                </div>

                {/* Поле email */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#D4AF37',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    E-poçt
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#FAFAFA'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#FAFAFA';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="E-poçt ünvanınızı daxil edin"
                  />
                </div>

                {/* Поле телефона */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#D4AF37',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Telefon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={editForm.phone}
                    onChange={(e) => {
                      const formatted = formatAzPhone(e.target.value);
                      setEditForm(prev => ({ ...prev, phone: formatted }));
                    }}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      border: '2px solid #E5E7EB',
                      borderRadius: '0.75rem',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      backgroundColor: '#FAFAFA'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.backgroundColor = '#FAFAFA';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder="+994 XX XXX XX XX"
                  />
                </div>

                {/* Ошибка */}
                {editError && (
                  <div style={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.875rem',
                    border: '1px solid #FECACA'
                  }}>
                    {editError}
                  </div>
                )}

                {/* Кнопки */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    style={{
                      flex: 1,
                      padding: '1rem 1.5rem',
                      background: 'transparent',
                      color: '#4A4A4A',
                      border: '2px solid #E5E7EB',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#4A4A4A';
                      e.currentTarget.style.color = '#1A1A1A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#4A4A4A';
                    }}
                  >
                    Ləğv et
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '1rem 1.5rem',
                      background: isSubmitting 
                        ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                        : 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                      color: isSubmitting ? '#E5E7EB' : '#1A1A1A',
                      border: 'none',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: isSubmitting 
                        ? '0 4px 12px rgba(156, 163, 175, 0.3)'
                        : '0 4px 12px rgba(212, 175, 55, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                      }
                    }}
                  >
                    {isSubmitting ? 'Yenilənir...' : 'Yenilə'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Стили для анимаций */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Плавные переходы для всех элементов */
        * {
          transition: all 0.2s ease;
        }
        
        /* Улучшенные тени */
        .card-shadow {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05);
        }
        
        .card-shadow:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.15), 0 1px 8px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
