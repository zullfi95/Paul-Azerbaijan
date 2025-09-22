"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import { useCart } from '../../contexts/CartContext';

// Компонент QuantitySelector
const QuantitySelector = ({ quantity, onUpdate }: { quantity: number; onUpdate: (newQuantity: number) => void }) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdate(quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdate(quantity + 1);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      backgroundColor: '#FFFAE6',
      border: '1px solid #000',
      borderRadius: '3px',
      padding: '3px'
    }}>
      <button
        onClick={handleDecrease}
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        –
      </button>
      <span style={{
        fontSize: '14px',
        fontWeight: 'bold',
        minWidth: '17px',
        textAlign: 'center'
      }}>
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        style={{
          width: '24px',
          height: '24px',
          backgroundColor: 'transparent',
          border: 'none',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        +
      </button>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const { 
    items: cartData, 
    removeItem, 
    updateQuantity, 
    getTotalPrice 
  } = useCart();

  // Подсчет общей суммы через reduce
  const totalAmount = getTotalPrice();

  const goToCatering = () => {
    router.push('/catering');
  };

  const goToCheckout = () => {
    router.push('/catering/order');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <main style={{ flex: 1, paddingTop: '10px' }}>
        <div className="container-paul" style={{ padding: '2rem 0' }}>
          {/* Breadcrumbs */}
          <div style={{
            padding: '1rem 0',
            backgroundColor: 'white',
            borderBottom: '1px solid rgba(0,0,0,0.06)'
          }}>
          <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <span 
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => router.push('/')}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Home
              </span>
              <span>/</span>
              <span 
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => router.push('/catering')}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Catering Menu
              </span>
              <span>/</span>
              <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Shopping Cart</span>
            </div>
          </div>

          {/* Заголовок страницы */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem',
            padding: '2rem 0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '600',
              color: '#1A1A1A',
              marginBottom: '1rem',
              fontFamily: '"Sabon Next LT Pro", serif'
            }}>
              Shopping cart
            </h1>
          </div>

          {cartData.length === 0 ? (
            /* Пустая корзина */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              textAlign: 'center',
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              border: '2px dashed #dee2e6'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#6c757d',
                margin: '1.5rem 0 0.5rem 0',
                fontFamily: '"Sabon Next LT Pro", serif'
              }}>
                Your cart is empty
              </h2>
              <p style={{
                fontSize: '1rem',
                color: '#adb5bd',
                margin: '0 0 2rem 0',
                maxWidth: '400px'
              }}>
                Add products to your cart by browsing our catering menu
              </p>
                <button
                  onClick={goToCatering}
                  style={{
                    padding: '1rem 2rem',
                    backgroundColor: '#1A1A1A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  fontFamily: '"Sabon Next LT Pro", serif'
                }}
              >
                Go to Menu
                </button>
            </div>
          ) : (
            /* Корзина с товарами */
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {/* Desktop Table Header */}
              <div className="desktop-only" style={{
              display: 'grid',
                gridTemplateColumns: '1fr auto auto',
              gap: '2rem',
                padding: '1rem 0',
                borderBottom: '2px solid #1A1A1A',
                marginBottom: '2rem',
                alignItems: 'center'
                      }}>
                        <span style={{
                  fontSize: '0.96rem',
                  fontWeight: '600',
                          color: '#1A1A1A',
                          fontFamily: '"Sabon Next LT Pro", serif'
                        }}>
                  Product
                        </span>
                        <span style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1A1A1A',
                  fontFamily: '"Sabon Next LT Pro", serif',
                  textAlign: 'center'
                }}>
                  Quantity
                        </span>
                        <span style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#1A1A1A',
                          fontFamily: '"Sabon Next LT Pro", serif',
                  textAlign: 'right'
                        }}>
                  Total price
                        </span>
                    </div>
                    
              {/* Cart Items */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                {cartData.map((item) => (
                  <div key={item.id} className="cart-item">
                    {/* Desktop Layout */}
                    <div className="desktop-layout" style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto auto',
                      gap: '2rem',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      alignItems: 'center'
                    }}>
                      {/* Product Info */}
                     <div style={{
                       display: 'flex',
                       alignItems: 'center',
                       gap: '1rem'
                     }}>
                       <button
                         onClick={() => removeItem(item.id.toString())}
                         style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#1A1A1A',
                            color: 'white',
                            border: 'none',
                           borderRadius: '50%',
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          🗑️
                       </button>
                        <div style={{
                          width: '173px',
                          height: '173px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={204}
                            height={204}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            margin: '0 0 0.4rem 0',
                            fontFamily: '"Sabon Next LT Pro", serif'
                          }}>
                            {item.name}
                          </h3>
                          <p style={{
                            fontSize: '0.93rem',
                            color: '#6b7280',
                            margin: '0 0 0.4rem 0'
                          }}>
                            {item.description}
                          </p>
                          <p style={{
                            fontSize: '0.93rem',
                            color: '#374151',
                            margin: '0 0 0.64rem 0',
                            fontWeight: 500
                          }}>
                            {item.price} ₼
                          </p>
                          <QuantitySelector 
                            quantity={item.quantity} 
                            onUpdate={(newQuantity) => updateQuantity(item.id.toString(), newQuantity)} 
                          />
                        </div>
                      </div>

                      {/* Quantity - пустая колонка для desktop */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center'
                      }}>
                      </div>

                      {/* Total Price */}
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#1A1A1A',
                        fontFamily: '"Sabon Next LT Pro", serif',
                        textAlign: 'right'
                      }}>
                        {(item.price * item.quantity).toFixed(2)} ₼
                      </div>
                      </div>
                      
                    {/* Tablet Layout */}
                    <div className="tablet-layout" style={{
                      display: 'none',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                      <button
                          onClick={() => removeItem(item.id.toString())}
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#1A1A1A',
                          color: 'white',
                            border: 'none',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          🗑️
                      </button>
                        <div style={{
                          width: '173px',
                          height: '173px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={204}
                            height={204}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div>
                          <h3 style={{
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            margin: '0 0 0.4rem 0',
                            fontFamily: '"Sabon Next LT Pro", serif'
                          }}>
                            {item.name}
                          </h3>
                          <p style={{
                            fontSize: '0.93rem',
                            color: '#6b7280',
                            margin: '0 0 0.4rem 0'
                          }}>
                            {item.description}
                          </p>
                          <p style={{
                            fontSize: '0.93rem',
                            color: '#374151',
                            margin: '0 0 0.64rem 0',
                            fontWeight: 500
                          }}>
                            {item.price} ₼
                          </p>
                          <QuantitySelector 
                            quantity={item.quantity} 
                            onUpdate={(newQuantity) => updateQuantity(item.id.toString(), newQuantity)} 
                          />
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          fontFamily: '"Sabon Next LT Pro", serif'
                        }}>
                          {(item.price * item.quantity).toFixed(2)} ₼
                        </div>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="mobile-layout" style={{
                      display: 'none',
                      padding: '1.5rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                      <button
                          onClick={() => removeItem(item.id.toString())}
                        style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: '#1A1A1A',
                            color: 'white',
                            border: 'none',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                            flexShrink: 0
                          }}
                        >
                          🗑️
                      </button>
                        <div style={{
                          width: '130px',
                          height: '130px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <Image 
                            src={item.image} 
                            alt={item.name}
                            width={153}
                            height={153}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontSize: '1.06rem',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            margin: '0 0 0.21rem 0',
                            fontFamily: '"Sabon Next LT Pro", serif'
                          }}>
                            {item.name}
                          </h3>
                          <p style={{
                            fontSize: '0.8rem',
                            color: '#6b7280',
                            margin: '0 0 0.21rem 0'
                          }}>
                            {item.description}
                          </p>
                          <p style={{
                            fontSize: '0.8rem',
                            color: '#374151',
                            margin: '0 0 0.43rem 0',
                            fontWeight: 500
                          }}>
                            {item.price} ₼
                          </p>
                          <QuantitySelector 
                            quantity={item.quantity} 
                            onUpdate={(newQuantity) => updateQuantity(item.id.toString(), newQuantity)} 
                          />
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          fontFamily: '"Sabon Next LT Pro", serif'
                        }}>
                          {(item.price * item.quantity).toFixed(2)} ₼
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Информационные заметки */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#1A1A1A',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                  alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    i
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    Products purchased from us are intended for direct consumption without storage, except for products that have a shelf life stated on the packaging or on the receipt.
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#1A1A1A',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                  alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    i
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    lineHeight: '1.5',
                    margin: 0
                  }}>
                    In addition to the allergens listed in the composition, all of our products are processed and shipped from facilities where trace amounts of the following allergens may be present: Gluten (all types), eggs, fish (salmon, tuna, anchovies), soy, milk, nuts (almonds, walnuts, pistachios, cashews), celery, mustard, sesame, sulfur dioxide and sulfites.
                  </p>
                </div>
              </div>

              {/* Итоговая информация */}
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <div style={{
                  marginBottom: '2rem'
                }}>
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#1A1A1A',
                    margin: '0 0 1rem 0',
                    fontFamily: '"Sabon Next LT Pro", serif'
                  }}>
                    Total to be paid
                  </h2>
                  <div style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: '#1A1A1A',
                    fontFamily: '"Sabon Next LT Pro", serif'
                  }}>
                    {totalAmount.toFixed(2)} ₼
                  </div>
                </div>
                
                {/* Кнопки действий */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={goToCatering}
                    style={{
                      border: '1px solid #000',
                      background: '#fff',
                      color: '#000',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Sabon Next LT Pro", serif'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                    }}
                  >
                    Go back to menu
                  </button>
                  
                  <button
                    onClick={goToCheckout}
                    style={{
                      background: '#000',
                      color: '#fff',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontFamily: '"Sabon Next LT Pro", serif',
                      marginLeft: '15px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#333';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#000';
                    }}
                  >
                    Go to checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <FeaturesSection />
      <Footer />

      {/* Responsive CSS */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .desktop-only { display: block !important; }
          .desktop-layout { display: grid !important; }
          .tablet-layout { display: none !important; }
          .mobile-layout { display: none !important; }
        }
        
        @media (max-width: 1023px) and (min-width: 768px) {
          .desktop-only { display: none !important; }
          .desktop-layout { display: none !important; }
          .tablet-layout { display: block !important; }
          .mobile-layout { display: none !important; }
        }
        
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .desktop-layout { display: none !important; }
          .tablet-layout { display: none !important; }
          .mobile-layout { display: block !important; }
          
          .container-paul {
            padding: 1rem !important;
          }
          
          h1 {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}
