"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import BasketIcon from './BasketIcon';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import Image from "next/image";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { 
    items: cartItems, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    getTotalPrice, 
    getTotalItems 
  } = useCart();
  const { showNotification } = useNotification();

  const removeFromCart = (itemId: string) => {
    const currentQuantity = cartItems.find(item => item.id === itemId)?.quantity || 0;
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
      showNotification('Məhsulun miqdarı azaldıldı');
    } else {
      removeItem(itemId);
      showNotification('Məhsul səbətdən silindi');
    }
  };


  const goToCartPage = () => {
    onClose();
    router.push('/cart');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Полупрозрачный фон */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          animation: 'fadeIn 0.3s ease',
          cursor: 'pointer'
        }} 
      />
      
      {/* Модальное окно корзины */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95%',
          maxWidth: '900px',
          maxHeight: '85vh',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%)',
          border: 'none',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 50,
          animation: 'fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Заголовок корзины */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          borderBottom: '1px solid rgba(26, 26, 26, 0.1)',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)',
          color: 'white',
          position: 'relative'
        }}>
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              e.currentTarget.style.borderColor = '#dc3545';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ×
          </button>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginRight: '60px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <BasketIcon size={24} />
            </div>
            <div>
              <h2 style={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.5rem',
                margin: '0 0 0.5rem 0',
                fontFamily: '"Sabon Next LT Pro", serif'
              }}>
                Səbətiniz
              </h2>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1rem',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>{getTotalItems()} məhsul</span>
                <span>•</span>
                <span style={{
                  fontWeight: 600,
                  color: '#D4AF37'
                }}>
                  ₼{getTotalPrice()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Контент корзины */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '0 2rem',
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Список товаров */}
            {cartItems.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 2rem',
                textAlign: 'center'
              }}>
                <ShoppingBag size={64} color="#ccc" />
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#6c757d',
                  margin: '1rem 0 0.5rem 0',
                  fontFamily: '"Sabon Next LT Pro", serif'
                }}>
                  Səbətiniz boşdur
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#adb5bd',
                  margin: '0 0 1.5rem 0'
                }}>
                  Məhsullar əlavə etmək üçün menyuya keçin
                </p>
                <button
                  onClick={() => {
                    showNotification('Katerinq menyusuna keçin və məhsul seçin');
                    onClose();
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1A1A1A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontFamily: '"Sabon Next LT Pro", serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D4AF37';
                    e.currentTarget.style.color = '#1A1A1A';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1A1A';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Məhsul əlavə et
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '1.5rem 0',
                flex: 1
              }}>
                {cartItems.map((cartItem, index) => (
                  <div key={cartItem.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '16px',
                    border: '1px solid rgba(26, 26, 26, 0.08)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `slideInRight 0.5s ease ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(26, 26, 26, 0.08)';
                  }}>
                    {/* Изображение товара */}
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <Image 
                        src={cartItem.image} 
                        alt={cartItem.name}
                        layout="fill"
                        objectFit="cover"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      />
                      {/* Индикатор количества на изображении */}
                      <div style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#1A1A1A',
                        color: 'white',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        {cartItem.quantity}
                      </div>
                    </div>
                    
                    {/* Информация о товаре */}
                    <div style={{
                      flex: 1,
                      minWidth: 0
                    }}>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        margin: '0 0 0.5rem 0',
                        fontFamily: '"Sabon Next LT Pro", serif',
                        lineHeight: '1.3'
                      }}>
                        {cartItem.name}
                      </h4>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#6c757d',
                        margin: '0 0 0.75rem 0',
                        lineHeight: '1.4'
                      }}>
                        {cartItem.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '1.125rem',
                          fontWeight: 700,
                          color: '#1A1A1A',
                          fontFamily: '"Sabon Next LT Pro", serif'
                        }}>
                          ₼{cartItem.price}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#6c757d',
                          fontWeight: 500
                        }}>
                          × {cartItem.quantity}
                        </span>
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: '#D4AF37',
                          fontFamily: '"Sabon Next LT Pro", serif'
                        }}>
                          = ₼{(cartItem.price * cartItem.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Управление количеством */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      {/* Кнопка уменьшения */}
                      <button
                        onClick={() => removeFromCart(cartItem.id)}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '2px solid #e9ecef',
                          backgroundColor: 'white',
                          color: '#6c757d',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#D4AF37';
                          e.currentTarget.style.color = '#D4AF37';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e9ecef';
                          e.currentTarget.style.color = '#6c757d';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                      >
                        −
                      </button>
                      
                      {/* Количество */}
                      <div style={{
                        minWidth: '40px',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#1A1A1A',
                        fontFamily: '"Sabon Next LT Pro", serif',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(212, 175, 55, 0.2)'
                      }}>
                        {cartItem.quantity}
                      </div>
                      
                      {/* Кнопка увеличения */}
                      <button
                        onClick={() => {
                          addItem(cartItem);
                          showNotification('Məhsulun miqdarı artırıldı');
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '2px solid #D4AF37',
                          backgroundColor: '#D4AF37',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f4d03f';
                          e.currentTarget.style.borderColor = '#f4d03f';
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#D4AF37';
                          e.currentTarget.style.borderColor = '#D4AF37';
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
                        }}
                      >
                        +
                      </button>
                      
                      {/* Кнопка удаления */}
                      <button
                        onClick={() => {
                          removeItem(cartItem.id);
                          showNotification('Məhsul səbətdən silindi');
                        }}
                        style={{
                          width: '36px',
                          height: '36px',
                          border: '2px solid #dc3545',
                          backgroundColor: 'white',
                          color: '#dc3545',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          marginLeft: '0.5rem',
                          boxShadow: '0 2px 8px rgba(220, 53, 69, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc3545';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#dc3545';
                          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.2)';
                        }}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Футер корзины */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '2rem',
            borderTop: '2px solid rgba(26, 26, 26, 0.1)',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
          }}>
            {/* Итоговая информация */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1A1A1A',
                  margin: '0 0 0.25rem 0',
                  fontFamily: '"Sabon Next LT Pro", serif'
                }}>
                  Ümumi məbləğ
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6c757d',
                  margin: 0
                }}>
                  {getTotalItems()} məhsul
                </p>
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#D4AF37',
                fontFamily: '"Sabon Next LT Pro", serif'
              }}>
                ₼{getTotalPrice()}
              </div>
            </div>
            
            {/* Кнопки действий */}
            <div style={{
              display: 'flex',
              gap: '1rem'
            }}>
              <button
                onClick={clearCart}
                style={{
                  flex: 1,
                  padding: '1.25rem 2rem',
                  backgroundColor: 'white',
                  color: '#dc3545',
                  border: '2px solid #dc3545',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontFamily: '"Sabon Next LT Pro", serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(220, 53, 69, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(220, 53, 69, 0.4)';
                  e.currentTarget.style.borderColor = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(220, 53, 69, 0.2)';
                  e.currentTarget.style.borderColor = '#dc3545';
                }}
              >
                Təmizlə
              </button>
              <button 
                onClick={() => {
                  showNotification('Səbət saxlanıldı, davam edə bilərsiniz');
                  onClose();
                }}
                style={{
                  flex: 1,
                  padding: '1.25rem 2rem',
                  backgroundColor: 'transparent',
                  color: '#1A1A1A',
                  border: '2px solid #1A1A1A',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontFamily: '"Sabon Next LT Pro", serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(26, 26, 26, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(26, 26, 26, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1A1A1A';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(26, 26, 26, 0.1)';
                }}>
                Davam et
              </button>
              
              <button 
                onClick={goToCartPage}
                style={{
                  flex: 1,
                  padding: '1.25rem 2rem',
                  backgroundColor: 'rgba(212, 175, 55, 0.1)',
                  color: '#1A1A1A',
                  border: '2px solid #D4AF37',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  fontFamily: '"Sabon Next LT Pro", serif',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(212, 175, 55, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4AF37';
                  e.currentTarget.style.color = '#1A1A1A';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(212, 175, 55, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
                  e.currentTarget.style.color = '#1A1A1A';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.2)';
                }}>
                Səbətə keç
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Стили для анимаций */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CartModal;
