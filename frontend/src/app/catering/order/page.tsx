"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { buildApiUrl, API_CONFIG } from '../../../config/api';
import { validateOrderData, getMinOrderDate } from '../../../utils/timeValidations';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';



interface OrderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventAddress: string;
  eventDate: string;
  eventTime: string;
  comment: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export default function OrderPage() {
  const router = useRouter();
  const { items: cart, getTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const pathname = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/catering/order';
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const [formData, setFormData] = useState<OrderFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    eventAddress: '',
    eventDate: '',
    eventTime: '',
    comment: ''
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});
  const [timeValidation, setTimeValidation] = useState<{ isValid: boolean; message?: string; warnings?: string[]; errors?: string[]; canProceed?: boolean } | null>(null);



  // Загружаем данные авторизованного клиента
  useEffect(() => {
    if (isAuthenticated && user && user.user_type === 'client') {
      // Если пользователь авторизован как клиент, используем его данные
      const nameParts = user.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    } else {
      // Если не авторизован, пытаемся загрузить из localStorage (для совместимости)
      try {
        const clientData = localStorage.getItem('client_registration_data');
        if (clientData) {
          const parsedData = JSON.parse(clientData);
          setFormData(prev => ({
            ...prev,
            firstName: parsedData.name ? parsedData.name.split(' ')[0] : prev.firstName,
            lastName: parsedData.name ? parsedData.name.split(' ').slice(1).join(' ') : prev.lastName,
            email: parsedData.email || prev.email,
            phone: parsedData.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных клиента:', error);
      }
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Убираем ошибку при вводе
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Проверяем временные ограничения при изменении даты или времени
    if (field === 'eventDate' || field === 'eventTime') {
      const updatedData = { ...formData, [field]: value };
      if (updatedData.eventDate) {
        const validation = validateOrderData({
          eventDate: updatedData.eventDate,
          eventTime: updatedData.eventTime,
          isModification: false
        });
        setTimeValidation(validation);
        // setShowTimeWarning(validation.warnings.length > 0);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Adı daxil edin';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyadı daxil edin';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'E-poçtu daxil edin';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Düzgün e-poçt ünvanı daxil edin';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon nömrəsini daxil edin';
    }
    if (!formData.eventAddress.trim()) {
      newErrors.eventAddress = 'Tədbir ünvanını daxil edin';
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'Tədbir tarixini seçin';
    }
    if (!formData.eventTime) {
      newErrors.eventTime = 'Tədbir vaxtını seçin';
    }


    // Проверяем временные ограничения
    if (formData.eventDate) {
      const validation = validateOrderData({
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        isModification: false
      });

      if (!validation.canProceed) {
        newErrors.eventDate = validation.errors[0] || 'Неверная дата мероприятия';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If the user is not authenticated, redirect to login and return back after successful login
    if (!isAuthenticated) {
      const next = encodeURIComponent(pathname);
      router.push(`/auth/login?next=${next}`);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Подготавливаем данные для отправки
      const orderData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        message: formData.comment,
        event_address: formData.eventAddress,
        event_date: formData.eventDate,
        event_time: formData.eventTime,
        event_lat: selectedLocation?.lat || null,
        event_lng: selectedLocation?.lng || null,
        cart_items: cart,
        // Добавляем client_id если пользователь авторизован как клиент
        ...(isAuthenticated && user && user.user_type === 'client' && { client_id: user.id })
      };

             // Отправляем заявку на сервер
       const headers: Record<string, string> = {
         'Content-Type': 'application/json',
         'Accept': 'application/json',
       };

       // Добавляем токен авторизации если пользователь авторизован
       if (isAuthenticated) {
         const token = localStorage.getItem('auth_token');
         if (token) {
           headers['Authorization'] = `Bearer ${token}`;
         }
       }

       const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.APPLICATIONS), {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        await response.json();
        
        // Очищаем корзину после успешной отправки заказа
        clearCart();
        
        // Показываем красивое попап-окно
        setShowSuccessPopup(true);
        
        // Через 3 секунды перенаправляем в кабинет пользователя
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
         let errorMessage = 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';
         
         try {
           const errorData = await response.json();
           console.error('Ошибка при отправке заявки:', errorData);
           
           if (errorData.message) {
             errorMessage = errorData.message;
           } else if (errorData.errors) {
             const errorDetails = Object.values(errorData.errors).flat().join(', ');
             errorMessage = `Validasiya xətası: ${errorDetails}`;
           }
         } catch (parseError) {
           console.error('Ошибка при парсинге ответа:', parseError);
           errorMessage = `Server xətası: ${response.status} ${response.statusText}`;
         }
         
         alert(errorMessage);
       }
    } catch (error) {
      console.error('Ошибка при отправке заявки:', error);
      alert('Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleMapToggle = () => {
    setIsMapVisible(!isMapVisible);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setFormData(prev => ({
      ...prev,
      coordinates: { lat, lng }
    }));
  };

  // Показываем загрузку, пока корзина не загружена
  if (!cart) {
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
          <p style={{ color: '#4A4A4A' }}>Səbət yüklənir...</p>
        </div>
      </div>
    );
  }

  // Если корзина пуста, показываем сообщение
  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontFamily: 'Playfair Display, serif',
            color: '#1A1A1A',
            marginBottom: '1rem'
          }}>
            Səbət boşdur
          </h2>
          <p style={{ color: '#4A4A4A', marginBottom: '2rem' }}>
            Sifariş vermək üçün əvvəlcə məhsulları səbətə əlavə edin
          </p>
          <button
            onClick={() => router.push('/catering')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#D4AF37',
              color: '#1A1A1A',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F4D03F';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#D4AF37';
            }}
          >
            Katerinq menyusuna keç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="navbar-spacing" style={{ paddingTop: '10px' }}>
        <section style={{
          padding: '3rem 0',
          backgroundColor: '#F9F9F6'
        }}>
          <div className="container-paul">
            {/* Заголовок */}
            <div style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 'bold',
                color: '#1A1A1A',
                marginBottom: '1rem'
              }}>
                Sifarişi təsdiqləyin
              </h1>
              <p style={{
                color: '#4A4A4A',
                fontSize: '1.125rem',
                maxWidth: '48rem',
                margin: '0 auto'
              }}>
                Tədbir üçün məlumatları daxil edin və sifarişi tamamlayın
              </p>
            </div>


            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '3rem',
              alignItems: 'start'
            }} className="mobile-stack">
              
              {/* Форма заказа */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 'bold',
                  color: '#1A1A1A',
                  marginBottom: '1.5rem'
                }}>
                  Əlaqə məlumatları
                </h2>


                {/* Информационное сообщение для авторизованных клиентов */}
                {isAuthenticated && user && user.user_type === 'client' && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span style={{ color: '#16a34a', fontSize: '1.25rem' }}>✓</span>
                    <span style={{
                      color: '#166534',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      Məlumatlar profilinizdən dolduruldu. Lazım olduqda dəyişə bilərsiniz.
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {/* Имя и Фамилия */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                  }} className="mobile-stack">
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#4A4A4A',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        Ad *
                        {isAuthenticated && user && user.user_type === 'client' && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#10b981',
                            marginLeft: '0.5rem',
                            fontWeight: '400'
                          }}>
                            (profil)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${errors.firstName ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '0.875rem',
                          transition: 'border-color 0.2s ease'
                        }}
                        placeholder="Adınızı daxil edin"
                        onFocus={(e) => {
                          if (!errors.firstName) {
                            e.currentTarget.style.borderColor = '#D4AF37';
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.firstName) {
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          }
                        }}
                      />
                      {errors.firstName && (
                        <span style={{
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          display: 'block'
                        }}>
                          {errors.firstName}
                        </span>
                      )}
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        color: '#4A4A4A',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        Soyad *
                        {isAuthenticated && user && user.user_type === 'client' && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#10b981',
                            marginLeft: '0.5rem',
                            fontWeight: '400'
                          }}>
                            (profil)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${errors.lastName ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '0.875rem',
                          transition: 'border-color 0.2s ease'
                        }}
                        placeholder="Soyadınızı daxil edin"
                        onFocus={(e) => {
                          if (!errors.lastName) {
                            e.currentTarget.style.borderColor = '#D4AF37';
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.lastName) {
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          }
                        }}
                      />
                      {errors.lastName && (
                        <span style={{
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          display: 'block'
                        }}>
                          {errors.lastName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#4A4A4A',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      E-poçt *
                      {isAuthenticated && user && user.user_type === 'client' && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#10b981',
                          marginLeft: '0.5rem',
                          fontWeight: '400'
                        }}>
                          (profil)
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: `1px solid ${errors.email ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                        borderRadius: '0.5rem',
                        outline: 'none',
                        fontSize: '0.875rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="example@email.com"
                      onFocus={(e) => {
                        if (!errors.email) {
                          e.currentTarget.style.borderColor = '#D4AF37';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.email) {
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        }
                      }}
                    />
                    {errors.email && (
                      <span style={{
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'block'
                      }}>
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Телефон */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#4A4A4A',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Telefon nömrəsi *
                      {isAuthenticated && user && user.user_type === 'client' && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#10b981',
                          marginLeft: '0.5rem',
                          fontWeight: '400'
                        }}>
                          (profil)
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: `1px solid ${errors.phone ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                        borderRadius: '0.5rem',
                        outline: 'none',
                        fontSize: '0.875rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="+994 50 123 45 67"
                      onFocus={(e) => {
                        if (!errors.phone) {
                          e.currentTarget.style.borderColor = '#D4AF37';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.phone) {
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        }
                      }}
                    />
                    {errors.phone && (
                      <span style={{
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'block'
                      }}>
                        {errors.phone}
                      </span>
                    )}
                  </div>


                  <div style={{
                    height: '1px',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    margin: '1rem 0'
                  }}></div>

                  <h3 style={{
                    fontSize: '1.25rem',
                    fontFamily: 'Playfair Display, serif',
                    fontWeight: 'bold',
                    color: '#1A1A1A',
                    marginBottom: '1rem'
                  }}>
                    Tədbir məlumatları
                  </h3>

                  {/* Адрес мероприятия */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#4A4A4A',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Tədbir ünvanı *
                    </label>
                    <input
                      type="text"
                      value={formData.eventAddress}
                      onChange={(e) => handleInputChange('eventAddress', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        border: `1px solid ${errors.eventAddress ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                        borderRadius: '0.5rem',
                        outline: 'none',
                        fontSize: '0.875rem',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="Tədbirin keçiriləcəyi ünvan"
                      onFocus={(e) => {
                        if (!errors.eventAddress) {
                          e.currentTarget.style.borderColor = '#D4AF37';
                        }
                      }}
                      onBlur={(e) => {
                        if (!errors.eventAddress) {
                          e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                        }
                      }}
                    />
                    {errors.eventAddress && (
                      <span style={{
                        color: '#ef4444',
                        fontSize: '0.75rem',
                        marginTop: '0.25rem',
                        display: 'block'
                      }}>
                        {errors.eventAddress}
                      </span>
                    )}
                    
                    {/* Кнопка карты */}
                    <button
                      type="button"
                      onClick={handleMapToggle}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: 'transparent',
                        color: '#D4AF37',
                        border: '1px solid #D4AF37',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#D4AF37';
                        e.currentTarget.style.color = '#1A1A1A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#D4AF37';
                      }}
                    >
                      📍 {selectedLocation ? 'Yerini dəyiş' : 'Xəritədə göstər'}
                    </button>
                  </div>

                  {/* Простая карта-макет */}
                  {isMapVisible && (
                    <div style={{
                      border: '1px solid rgba(212, 175, 55, 0.3)',
                      borderRadius: '0.5rem',
                      height: '200px',
                      backgroundColor: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onClick={() => handleMapClick(40.4093, 49.8671)} // Координаты Баку
                    >
                      {selectedLocation ? (
                        <div style={{
                          textAlign: 'center',
                          color: '#1A1A1A'
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📍</div>
                          <div style={{ fontSize: '0.875rem' }}>
                            Seçilmiş yer: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: '#6b7280'
                        }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
                          <div style={{ fontSize: '0.875rem' }}>
                            Xəritəyə basaraq yer seçin
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Дата и время */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem'
                  }} className="mobile-stack">
                    <div>
                      <label style={{
                        display: 'block',
                        color: '#4A4A4A',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        Tədbir tarixi *
                      </label>
                      <input
                        type="date"
                        value={formData.eventDate}
                        min={getMinOrderDate()}
                        onChange={(e) => handleInputChange('eventDate', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${errors.eventDate ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '0.875rem',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          if (!errors.eventDate) {
                            e.currentTarget.style.borderColor = '#D4AF37';
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.eventDate) {
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          }
                        }}
                      />
                      {errors.eventDate && (
                        <span style={{
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          display: 'block'
                        }}>
                          {errors.eventDate}
                        </span>
                      )}
                    </div>

                    <div>
                      <label style={{
                        display: 'block',
                        color: '#4A4A4A',
                        fontWeight: 500,
                        marginBottom: '0.5rem',
                        fontSize: '0.875rem'
                      }}>
                        Tədbir vaxtı *
                      </label>
                      <input
                        type="time"
                        value={formData.eventTime}
                        onChange={(e) => handleInputChange('eventTime', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem',
                          border: `1px solid ${errors.eventTime ? '#ef4444' : 'rgba(212, 175, 55, 0.3)'}`,
                          borderRadius: '0.5rem',
                          outline: 'none',
                          fontSize: '0.875rem',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => {
                          if (!errors.eventTime) {
                            e.currentTarget.style.borderColor = '#D4AF37';
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.eventTime) {
                            e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                          }
                        }}
                      />
                      {errors.eventTime && (
                        <span style={{
                          color: '#ef4444',
                          fontSize: '0.75rem',
                          marginTop: '0.25rem',
                          display: 'block'
                        }}>
                          {errors.eventTime}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Предупреждение о временных ограничениях */}
                  {timeValidation && ((timeValidation.warnings?.length || 0) > 0 || (timeValidation.errors?.length || 0) > 0) && (
                    <div style={{
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: (timeValidation.errors?.length || 0) > 0 ? '1px solid #EF4444' : '1px solid #F59E0B',
                      backgroundColor: (timeValidation.errors?.length || 0) > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {(timeValidation.errors?.length || 0) > 0 ? '❌' : '⚠️'}
                        </span>
                        <strong style={{
                          color: (timeValidation.errors?.length || 0) > 0 ? '#EF4444' : '#F59E0B'
                        }}>
                          {(timeValidation.errors?.length || 0) > 0 ? 'Xəta' : 'Xəbərdarlıq'}
                        </strong>
                      </div>
                      {timeValidation.errors?.map((error: string, index: number) => (
                        <div key={index} style={{
                          color: '#EF4444',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem'
                        }}>
                          • {error}
                        </div>
                      ))}
                      {timeValidation.warnings?.map((warning: string, index: number) => (
                        <div key={index} style={{
                          color: '#F59E0B',
                          fontSize: '0.875rem',
                          marginBottom: '0.25rem'
                        }}>
                          • {warning}
                        </div>
                      ))}
                      {(timeValidation.warnings?.length || 0) > 0 && timeValidation.canProceed && (
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: '#6B7280'
                        }}>
                          Sifarişi davam etdirə bilərsiniz, lakin göstərilən məqamları nəzərə almağı tövsiyə edirik.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Общие предупреждения о времени заказа */}
                  <div style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
                      <strong style={{ color: '#3B82F6' }}>
                        Sifariş vaxtı haqqında məlumat
                      </strong>
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#1E40AF',
                      lineHeight: '1.5'
                    }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        • <strong>48 saat əvvəl:</strong> Sifarişi 48 saat əvvəl verməyi tövsiyə edirik
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        • <strong>24 saat əvvəl:</strong> Sifarişi 24 saat əvvəl də verə bilərsiniz
                      </div>
                      <div style={{ color: '#EF4444' }}>
                        • <strong>24 saatdan az:</strong> 24 saatdan az qalan vaxtda sifarişin ləğv edilmə ehtimalı var
                      </div>
                    </div>
                  </div>

                  {/* Комментарий */}
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#4A4A4A',
                      fontWeight: 500,
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Şərh (istəyə görə)
                    </label>
                    <textarea
                      value={formData.comment}
                      onChange={(e) => handleInputChange('comment', e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: 'rgba(212, 175, 55, 0.3)',
                        borderRadius: '0.5rem',
                        outline: 'none',
                        fontSize: '1rem',
                        resize: 'vertical',
                        transition: 'border-color 0.2s ease'
                      }}
                      placeholder="Tədbir haqqında əlavə məlumatlar və ya xüsusi istəklər"
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#D4AF37';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                      }}
                    />
                  </div>

                  {/* Кнопка отправки */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: isSubmitting ? '#6b7280' : '#1A1A1A',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      marginTop: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#D4AF37';
                        e.currentTarget.style.color = '#1A1A1A';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSubmitting) {
                        e.currentTarget.style.backgroundColor = '#1A1A1A';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    {isSubmitting ? 'Göndərilir...' : 'Sifarişi göndər'}
                  </button>
                </form>
              </div>

              {/* Сводка заказа */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                height: 'fit-content',
                position: 'sticky',
                top: '2rem'
              }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 'bold',
                  color: '#1A1A1A',
                  marginBottom: '1.5rem'
                }}>
                  Sifarişin xülasəsi
                </h2>

                {cart && cart.length > 0 ? (
                  <>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      {cart.map((item) => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1rem',
                          backgroundColor: '#F9F9F6',
                          borderRadius: '0.5rem'
                        }}>
                          <div>
                            <div style={{
                              fontWeight: 600,
                              color: '#1A1A1A',
                              marginBottom: '0.25rem'
                            }}>
                              {item.name}
                            </div>
                            <div style={{
                              fontSize: '0.875rem',
                              color: '#4A4A4A'
                            }}>
                              {item.quantity} x {item.price} ₼
                            </div>
                          </div>
                          <div style={{
                            fontWeight: 600,
                            color: '#7B5E3B',
                            fontSize: '1.125rem'
                          }}>
                            {item.price * item.quantity} ₼
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      paddingTop: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: '#1A1A1A'
                        }}>
                          Ümumi:
                        </span>
                        <span style={{
                          fontSize: '1.5rem',
                          fontFamily: 'Playfair Display, serif',
                          fontWeight: 'bold',
                          color: '#D4AF37'
                        }}>
                          {getTotalPrice()} ₼
                        </span>
                      </div>
                    </div>

                    <div style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(212, 175, 55, 0.1)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#7B5E3B',
                        textAlign: 'center'
                      }}>
                        ℹ️ Sifarişinizi təsdiqləyəndən sonra bizim komanda sizinlə əlaqə saxlayacaq
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <div>Səbət boşdur</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>


      {/* Красивое попап-окно успеха */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.4s ease',
            border: '2px solid #D4AF37'
          }}>
            {/* Иконка успеха */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#10B981',
              borderRadius: '50%',
              margin: '0 auto 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'bounceIn 0.6s ease'
            }}>
              <span style={{ fontSize: '3rem', color: 'white' }}>✓</span>
            </div>
            
            {/* Заголовок */}
            <h2 style={{
              fontSize: '2rem',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 'bold',
              color: '#1A1A1A',
              marginBottom: '1rem'
            }}>
              Təşəkkür edirik!
            </h2>
            
            {/* Сообщение */}
            <p style={{
              fontSize: '1.125rem',
              color: '#4A4A4A',
              lineHeight: '1.6',
              marginBottom: '2rem'
            }}>
              Sifarişiniz uğurla qəbul edildi. Tezliklə bizim komanda sizinlə əlaqə saxlayacaq.
            </p>
            
            {/* Дополнительная информация */}
            <div style={{
              padding: '1rem',
              backgroundColor: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              marginBottom: '2rem'
            }}>
              <div style={{
                fontSize: '0.875rem',
                color: '#7B5E3B'
              }}>
                📧 Təsdiqləmə məktubu e-poçt ünvanınıza göndərildi
              </div>
            </div>
            
            {/* Кнопка закрытия */}
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
              style={{
                padding: '1rem 2rem',
                backgroundColor: '#1A1A1A',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#D4AF37';
                e.currentTarget.style.color = '#1A1A1A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
                e.currentTarget.style.color = 'white';
              }}
            >
              {isAuthenticated && user ? 'Kabinetə keç' : 'Ana səhifəyə qayıt'}
            </button>
          </div>
        </div>
      )}

      <Footer />

      <style jsx>{`
        .navbar-spacing {
          padding-top: 10px;
        }

        .container-paul {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        @media (max-width: 768px) {
          .container-paul {
            padding: 0 1rem;
          }
          
          .mobile-stack {
            grid-template-columns: 1fr !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
          
          h2 {
            font-size: 1.25rem !important;
          }
        }

        /* Анимации для попапа */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% { 
            transform: scale(0.3);
            opacity: 0;
          }
          50% { 
            transform: scale(1.05);
          }
          70% { 
            transform: scale(0.9);
          }
          100% { 
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

