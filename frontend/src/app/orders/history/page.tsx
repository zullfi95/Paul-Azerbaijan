"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// TODO: Fix import path if necessary
import { useAuth } from '@/contexts/AuthContext';

// Интерфейс для заказа
interface Order {
  id: number;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
  router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrderHistory();
    }
  }, [isAuthenticated]);

  const loadOrderHistory = async () => {
    setIsLoadingOrders(true);
    try {
      // Здесь будет реальный API вызов
      // Пока что используем моковые данные
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrders: Order[] = [
        {
          id: 1,
          order_number: 'ORD-2024-001',
          status: 'delivered',
          total_amount: 45.50,
          created_at: '2024-01-15T10:30:00Z',
          items: [
            { id: 1, name: 'Kruassan', quantity: 2, price: 3.50, total: 7.00 },
            { id: 2, name: 'Sandviç', quantity: 1, price: 8.50, total: 8.50 },
            { id: 3, name: 'Makaron', quantity: 3, price: 10.00, total: 30.00 }
          ]
        },
        {
          id: 2,
          order_number: 'ORD-2024-002',
          status: 'preparing',
          total_amount: 28.75,
          created_at: '2024-01-20T14:15:00Z',
          items: [
            { id: 4, name: 'Kruassan', quantity: 5, price: 3.50, total: 17.50 },
            { id: 5, name: 'Çay', quantity: 2, price: 2.50, total: 5.00 },
            { id: 6, name: 'Kofe', quantity: 2, price: 3.125, total: 6.25 }
          ]
        },
        {
          id: 3,
          order_number: 'ORD-2024-003',
          status: 'pending',
          total_amount: 15.00,
          created_at: '2024-01-22T09:45:00Z',
          items: [
            { id: 7, name: 'Sandviç', quantity: 1, price: 8.50, total: 8.50 },
            { id: 8, name: 'Kofe', quantity: 2, price: 3.25, total: 6.50 }
          ]
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error loading order history:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Gözləyir',
      'confirmed': 'Təsdiqləndi',
      'preparing': 'Hazırlanır',
      'ready': 'Hazırdır',
      'delivered': 'Çatdırıldı',
      'cancelled': 'Ləğv edildi'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'pending': '#F59E0B',
      'confirmed': '#3B82F6',
      'preparing': '#8B5CF6',
      'ready': '#10B981',
      'delivered': '#059669',
      'cancelled': '#EF4444'
    };
    return colorMap[status] || '#6B7280';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '200px'
      }}>
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
    <div style={{ 
      padding: '2rem',
      backgroundColor: 'white',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
              {isLoadingOrders ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem 0' 
                }}>
                  <div style={{ 
                    width: '3rem', 
                    height: '3rem', 
                    border: '4px solid #f3f3f3', 
                    borderTop: '4px solid #D4AF37', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 2rem'
                  }} />
                  <p style={{ 
                    color: '#4A4A4A', 
                    fontSize: '1.125rem' 
                  }}>
                    Sifariş tarixçəsi yüklənir...
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '4rem 0' 
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    margin: '0 auto 2rem',
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 2s ease-in-out infinite'
                  }}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6.5" />
                      <circle cx="9" cy="19" r="1" />
                      <circle cx="20" cy="19" r="1" />
                    </svg>
                  </div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontFamily: 'Playfair Display, serif',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    marginBottom: '1rem'
                  }}>
                    Hələ sifariş yoxdur
                  </h3>
                  <p style={{
                    color: '#4A4A4A',
                    fontSize: '1rem',
                    marginBottom: '2rem'
                  }}>
                    İlk sifarişinizi vermək üçün katerinq menyusuna keçin
                  </p>
                  <button
                    onClick={() => router.push('/catering')}
                    style={{
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%)',
                      color: '#1A1A1A',
                      border: 'none',
                      borderRadius: '1rem',
                      fontWeight: 600,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                    }}
                  >
                    Sifariş et
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem'
                }}>
                  {orders.map((order, index) => (
                    <div
                      key={order.id}
                      style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #F9F9F6 100%)',
                        padding: '2rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(0,0,0,0.08)',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: 0,
                        animation: `fadeInUp 0.8s ease-out ${0.6 + index * 0.1}s forwards`,
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => openOrderModal(order)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15), 0 1px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1), 0 1px 8px rgba(0,0,0,0.05)';
                      }}
                    >
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
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <h3 style={{
                            fontSize: '1.5rem',
                            fontFamily: 'Playfair Display, serif',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            {order.order_number}
                          </h3>
                          <p style={{
                            color: '#4A4A4A',
                            fontSize: '0.875rem',
                            margin: 0
                          }}>
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: '0.5rem'
                        }}>
                          <div style={{
                            padding: '0.5rem 1rem',
                            background: getStatusColor(order.status),
                            color: 'white',
                            borderRadius: '2rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            boxShadow: `0 4px 12px ${getStatusColor(order.status)}40`
                          }}>
                            {getStatusText(order.status)}
                          </div>
                          <p style={{
                            color: '#1A1A1A',
                            fontSize: '1.25rem',
                            fontFamily: 'Playfair Display, serif',
                            fontWeight: 'bold',
                            margin: 0,
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                          }}>
                            {order.total_amount} ₼
                          </p>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <p style={{
                          color: '#4A4A4A',
                          fontSize: '0.875rem',
                          margin: 0
                        }}>
                          {order.items.length} məhsul
                        </p>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#D4AF37',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}>
                          <span>Detalları gör</span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
      </div>

      {/* Модальное окно деталей заказа */}
      {isModalOpen && selectedOrder && (
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
        onClick={closeOrderModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            width: '100%',
            maxWidth: '600px',
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
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h6.5" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="20" cy="19" r="1" />
                  </svg>
                </div>
                {selectedOrder.order_number}
              </h2>
              <button
                onClick={closeOrderModal}
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

            {/* Информация о заказе */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Статус и дата */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '1rem',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <div>
                  <p style={{
                    color: '#4A4A4A',
                    fontSize: '0.875rem',
                    margin: '0 0 0.5rem 0',
                    fontWeight: 500
                  }}>
                    Tarix
                  </p>
                  <p style={{
                    color: '#1A1A1A',
                    fontSize: '1rem',
                    margin: 0,
                    fontWeight: 600
                  }}>
                    {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
                <div>
                  <p style={{
                    color: '#4A4A4A',
                    fontSize: '0.875rem',
                    margin: '0 0 0.5rem 0',
                    fontWeight: 500
                  }}>
                    Status
                  </p>
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: getStatusColor(selectedOrder.status),
                    color: 'white',
                    borderRadius: '2rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: `0 4px 12px ${getStatusColor(selectedOrder.status)}40`
                  }}>
                    {getStatusText(selectedOrder.status)}
                  </div>
                </div>
              </div>

              {/* Список товаров */}
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  margin: '0 0 1rem 0'
                }}>
                  Məhsullar
                </h3>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: '0.75rem',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}
                    >
                      <div>
                        <p style={{
                          color: '#1A1A1A',
                          fontSize: '1rem',
                          fontWeight: 600,
                          margin: '0 0 0.25rem 0'
                        }}>
                          {item.name}
                        </p>
                        <p style={{
                          color: '#D4AF37',
                          fontSize: '0.875rem',
                          margin: 0,
                          fontWeight: 500
                        }}>
                          {item.quantity} ədəd × {item.price} ₼
                        </p>
                      </div>
                      <p style={{
                        color: '#1A1A1A',
                        fontSize: '1rem',
                        fontWeight: 600,
                        margin: 0
                      }}>
                        {item.total} ₼
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Общая сумма */}
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(244, 208, 63, 0.1) 100%)',
                borderRadius: '1rem',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                textAlign: 'center'
              }}>
                <p style={{
                  color: '#4A4A4A',
                  fontSize: '0.875rem',
                  margin: '0 0 0.5rem 0',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Ümumi Məbləğ
                </p>
                <p style={{
                  color: '#1A1A1A',
                  fontSize: '2rem',
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 'bold',
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {selectedOrder.total_amount} ₼
                </p>
              </div>
            </div>
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
      `}</style>
    </div>
  );
}
