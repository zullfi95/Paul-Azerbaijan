"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import BasketIcon from '../../components/BasketIcon';
import CartModal from '../../components/CartModal';
import { useCart } from '../../contexts/CartContext';
import { useCartModal } from '../../contexts/CartModalContext';
import { useNotification } from '../../contexts/NotificationContext';
import Image from "next/image";

import { CartItem } from '../../config/api';

const menuItems: CartItem[] = [
  {
    id: '1',
    name: 'Stuffed croissants, perfect bites',
    description: '20 pcs',
    price: 40,
    quantity: 1,
    image: '/images/menuitem1.png',
    category: 'Brunch Menu',
    available: true,
    isSet: false
  },
  {
    id: '2',
    name: 'Mini eclairs, savory delights',
    description: '6 pcs',
    price: 20,
    quantity: 1,
    image: '/images/menuitem2.png',
    category: 'Brunch Menu',
    available: true,
    isSet: false
  },
  {
    id: '3',
    name: 'Fruit tarts, sweet treats',
    description: '25 pcs',
    price: 50,
    quantity: 1,
    image: '/images/menuitem3.png',
    category: 'Coffee Breaks & Afternoon Teas',
    available: true,
    isSet: false
  },
  {
    id: '4',
    name: 'Creamy sweet croissants',
    description: '12 pcs',
    price: 80,
    quantity: 1,
    image: '/images/menuitem4.png',
    category: 'Lunch Menu',
    available: true,
    isSet: false
  },
  {
    id: '5',
    name: 'Stuffed croissants, perfect bites',
    description: '20 pcs',
    price: 40,
    quantity: 1,
    image: '/images/menuitem1.png',
    category: 'Brunch Menu',
    available: true,
    isSet: false
  },
  {
    id: '6',
    name: 'Mini eclairs, savory delights',
    description: '6 pcs',
    price: 20,
    quantity: 1,
    image: '/images/menuitem2.png',
    category: 'Brunch Menu',
    available: true,
    isSet: false
  },
  {
    id: '7',
    name: 'Fruit tarts, sweet treats',
    description: '25 pcs',
    price: 50,
    quantity: 1,
    image: '/images/menuitem3.png',
    category: 'Coffee Breaks & Afternoon Teas',
    available: true,
    isSet: false
  },
  {
    id: '8',
    name: 'Creamy sweet croissants',
    description: '12 pcs',
    price: 80,
    quantity: 1,
    image: '/images/menuitem4.png',
    category: 'Lunch Menu',
    available: true,
    isSet: false
  }
];

const categories = [
  { name: 'Brunch Menu', icon: '🥐', image: '/images/category4.png' },
  { name: 'Lunch Menu', icon: '🥖', image: '/images/category3.png' },
  { name: 'Coffee Breaks & Afternoon Teas', icon: '🍞', image: '/images/category5.png' }
];

export default function CateringPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Brunch Menu');
  const [sortBy, setSortBy] = useState('name');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const addToCart = (item: CartItem) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image,
      category: item.category,
      available: item.available,
      isSet: item.isSet,
      persons: item.persons
    });
    showNotification(`${item.name} səbətə əlavə edildi`);
    openCartModal();
  };


  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the sort menu
      if (!(event.target as Element).closest('[data-sort-menu]')) {
        setShowSortMenu(false);
      }
    };

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="navbar-spacing" style={{ paddingTop: '10px' }}>
        {/* Breadcrumbs */}
        <div style={{
          padding: '1rem 0',
          backgroundColor: '#FFFCF8',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div style={{
            maxWidth: '1140px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '14px',
              color: '#6b7280',
              fontFamily: '"Sabon Next LT Pro"'
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
              <span style={{ color: '#000', fontWeight: 500, fontFamily: '"Sabon Next LT Pro"' }}>Catering Menu</span>
            </div>
          </div>
              </div>
        {/* Page Title */}
        <div style={{
          padding: '2rem 0',
          backgroundColor: '#FFFCF8',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1140px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <h1 style={{
              color: '#000',
              fontFamily: '"Sabon Next LT Pro"',
              fontSize: '20px',
              fontStyle: 'normal',
              fontWeight: '500',
              lineHeight: 'normal',
              marginBottom: '2rem'
            } as React.CSSProperties}>
              Catering Menu
            </h1>
            
            {/* Menu Type Navigation */}
            <div className="menu-type-navigation" style={{
                  display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              <button 
                      style={{
                  fontSize: '17.6px',
                  fontFamily: '"Sabon Next LT Pro"',
                  fontWeight: selectedCategory === 'Brunch Menu' ? 'bold' : '500',
                  color: '#000',
                  background: 'none',
                  border: 'none',
                        cursor: 'pointer',
                  textDecoration: selectedCategory === 'Brunch Menu' ? 'underline' : 'none',
                  padding: '5px 9px',
                  borderRadius: '5px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => setSelectedCategory('Brunch Menu')}
                      onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                Brunch Menu
              </button>
              <button 
                      style={{
                  fontSize: '17.6px',
                  fontFamily: '"Sabon Next LT Pro"',
                  fontWeight: selectedCategory === 'Lunch Menu' ? 'bold' : '500',
                  color: '#000',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: selectedCategory === 'Lunch Menu' ? 'underline' : 'none',
                  padding: '5px 9px',
                  borderRadius: '5px',
                  opacity: selectedCategory === 'Lunch Menu' ? 1 : 0.6,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => setSelectedCategory('Lunch Menu')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Lunch Menu
              </button>
              <button 
                style={{
                  fontSize: '17.6px',
                  fontFamily: '"Sabon Next LT Pro"',
                  fontWeight: selectedCategory === 'Coffee Breaks & Afternoon Teas' ? 'bold' : '500',
                  color: '#000',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: selectedCategory === 'Coffee Breaks & Afternoon Teas' ? 'underline' : 'none',
                  padding: '5px 9px',
                  borderRadius: '5px',
                  opacity: selectedCategory === 'Coffee Breaks & Afternoon Teas' ? 1 : 0.6,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => setSelectedCategory('Coffee Breaks & Afternoon Teas')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(26, 26, 26, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Coffee Breaks & Afternoon Teas
              </button>
                  </div>
            
            {/* Brunch Menu Section */}
            {selectedCategory === 'Brunch Menu' && (
              <div style={{
                backgroundColor: '#FFFCF8',
                padding: '3rem 0',
                marginBottom: '3rem'
              }}>
                <div style={{
                  padding: '0 20px'
                }}>
                  <h2 style={{
                    color: '#000',
                    fontFamily: '"Sabon Next LT Pro"',
                    fontSize: '20px',
                    fontStyle: 'normal',
                    fontWeight: '500',
                    lineHeight: 'normal',
                    textAlign: 'center',
                    marginBottom: '1rem'
                  } as React.CSSProperties}>
                    Brunch Menu
                  </h2>
                  
                  {/* Divider Line */}
                  <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#D1D5DB',
                    margin: '0 auto 1rem auto',
                    maxWidth: '800px'
                  }}></div>
                  
                  {/* Price Text */}
                  <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem'
                  }}>
                    <span style={{
                      color: '#000',
                      fontFamily: '"Sabon Next LT Pro"',
                      fontSize: '17.6px',
                      fontStyle: 'normal',
                      fontWeight: '500',
                      lineHeight: 'normal'
                    } as React.CSSProperties}>
                      Price for 1 person 19 ₼
                    </span>
                  </div>
                  
                  <div className="brunch-menu-grid" style={{
                    display: 'flex',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                    gap: isMobile ? '2rem' : '4rem',
                    alignItems: 'stretch',
                    minHeight: isMobile ? 'auto' : '400px'
                  }}>
                    {/* Menu Content */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}>
                      <div className="brunch-menu-content" style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                        gap: isMobile ? '1.5rem' : '1.5rem',
                        flex: 1
                      }}>
                        {/* Left Column */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{
                              color: '#000',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '17.6px',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              lineHeight: 'normal',
                              marginBottom: '0.5rem'
                            } as React.CSSProperties}>
                              Selection of Canapes
                            </h3>
                            <p style={{
                              color: '#6b7280',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '14px',
                              fontStyle: 'italic',
                              fontWeight: 'normal',
                              lineHeight: 'normal',
                              marginBottom: '0.75rem'
                            } as React.CSSProperties}>
                              (Choose of one)
                            </p>
                            <p style={{
                              fontSize: '16px',
                    color: '#4A4A4A',
                              lineHeight: '1.6',
                              fontFamily: '"Sabon Next LT Pro"'
                            }}>
                              Mini Éclair Selection<br />
                              Mini Tartine Selection<br />
                              Mini Quiche Selection
                            </p>
                </div>
                          
                          <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{
                              color: '#000',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '17.6px',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              lineHeight: 'normal',
                              marginBottom: '0.5rem'
                            } as React.CSSProperties}>
                              Mini Sandwiches
                            </h3>
                            <p style={{
                              color: '#6b7280',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '14px',
                              fontStyle: 'italic',
                              fontWeight: 'normal',
                              lineHeight: 'normal',
                              marginBottom: '0.75rem'
                            } as React.CSSProperties}>
                              (Choose of one)
                            </p>
                            <p style={{
                              color: '#4A4A4A',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '16px',
                              fontStyle: 'normal',
                              fontWeight: 'normal',
                              lineHeight: '1.6'
                            } as React.CSSProperties}>
                              Tomato & Mozzarella<br />
                              Tuna & Sweetcorn<br />
                              Ham and Cheese
                            </p>
            </div>
                          
                          <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{
                              color: '#000',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '17.6px',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              lineHeight: 'normal',
                              marginBottom: '0.5rem'
                            } as React.CSSProperties}>
                              Mini Wrap Rolls
                            </h3>
                            <p style={{
                              color: '#6b7280',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '14px',
                              fontStyle: 'italic',
                              fontWeight: 'normal',
                              lineHeight: 'normal',
                              marginBottom: '0.75rem'
                            } as React.CSSProperties}>
                              (Choose of one)
                            </p>
                            <p style={{
                              color: '#4A4A4A',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '16px',
                              fontStyle: 'normal',
                              fontWeight: 'normal',
                              lineHeight: '1.6'
                            } as React.CSSProperties}>
                              Ham&Cheese<br />
                              Crispy Chicken<br />
                              Beef with Vegetable
                            </p>
          </div>

                        {/* Right Column */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{
                              color: '#000',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '17.6px',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              lineHeight: 'normal',
                              marginBottom: '0.5rem'
                            } as React.CSSProperties}>
                              Salads
                            </h3>
                            <p style={{
                              color: '#6b7280',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '14px',
                              fontStyle: 'italic',
                              fontWeight: 'normal',
                              lineHeight: 'normal',
                              marginBottom: '0.75rem'
                            } as React.CSSProperties}>
                              (Choose of one)
                            </p>
                            <p style={{
                              color: '#4A4A4A',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '16px',
                              fontStyle: 'normal',
                              fontWeight: 'normal',
                              lineHeight: '1.6'
                            } as React.CSSProperties}>
                              Chicken Pasta Salad<br />
                              Greek Salad<br />
                              Smoked Salmon Salad
                            </p>
                          </div>
                          
                          <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{
                              color: '#000',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '17.6px',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              lineHeight: 'normal',
                              marginBottom: '0.5rem'
                            } as React.CSSProperties}>
                              Dessert
                            </h3>
                            <p style={{
                              color: '#6b7280',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '14px',
                              fontStyle: 'italic',
                              fontWeight: 'normal',
                              lineHeight: 'normal',
                              marginBottom: '0.75rem'
                            } as React.CSSProperties}>
                              (Choose of one)
                            </p>
                            <p style={{
                              fontSize: '16px',
                    color: '#4A4A4A',
                              lineHeight: '1.6',
                              fontFamily: '"Sabon Next LT Pro"'
                            }}>
                              Seasonal Fruits<br />
                              Flavored Natural Yoghurt<br />
                              Mini sweets<br />
                              Mini Viennoiseries
                            </p>
                          </div>
                          
                          <div style={{ marginBottom: '1.25rem' }}>
                            <h3 style={{
                              color: '#000',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '17.6px',
                              fontStyle: 'normal',
                              fontWeight: '500',
                              lineHeight: 'normal',
                              marginBottom: '0.5rem'
                            } as React.CSSProperties}>
                              Drinks
                            </h3>
                            <p style={{
                              color: '#6b7280',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '14px',
                              fontStyle: 'italic',
                              fontWeight: 'normal',
                              lineHeight: 'normal',
                              marginBottom: '0.75rem'
                            } as React.CSSProperties}>
                              (Choose of one)
                            </p>
                            <p style={{
                              color: '#4A4A4A',
                              fontFamily: '"Sabon Next LT Pro"',
                              fontSize: '16px',
                              fontStyle: 'normal',
                              fontWeight: 'normal',
                              lineHeight: '1.6'
                            } as React.CSSProperties}>
                              Hot Beverages<br />
                              Soft drinks<br />
                              Fruit juices
                            </p>
                          </div>
                      </div>
                    </div>
                    
                    {/* Brunch Image */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '400px',
                        borderRadius: '0.5rem',
                        overflow: 'hidden',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                      }}>
                        <Image
                          src="/images/brunch.jpg"
                          alt="Brunch Menu"
                          width={500}
                          height={400}
                        style={{
                          width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )}
            
            {/* Product Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem'
            }} className="product-grid">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Product Image */}
                  <div 
                    style={{
                    height: '250px',
                    backgroundColor: '#F5F5F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/product/${item.id}`)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      layout="fill"
                      style={{
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'white',
                        color: '#1A1A1A',
                        border: '1px solid #E5E7EB',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <BasketIcon size={20} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '0.75rem' }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '0.25rem',
                      lineHeight: '1.3'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      {item.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#1A1A1A'
                      }}>
                        {item.price} ₼
                      </span>
                    </div>
                  </div>
                </div>
              ))}
                    </div>

            {/* View More Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '3rem'
            }}>
              <button style={{
                padding: '1rem 2rem',
                              backgroundColor: '#1A1A1A',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                fontSize: '1rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Sabon Next LT Pro", "Playfair Display", serif'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#D4AF37';
                              e.currentTarget.style.color = '#1A1A1A';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1A1A1A';
                              e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                View More
                              </button>
                            </div>
                    </div>
                  </div>

        {/* Features Section */}
        <FeaturesSection />
      </div>

      {/* Глобальная корзина */}
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={closeCartModal} 
      />

      <Footer />

      {/* Стили для анимаций */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        * {
          font-family: "Sabon Next LT Pro", "Playfair Display", serif;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .btn-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .filter-active {
          animation: pulse 2s infinite;
        }
        
        .cart-badge {
          animation: bounce 1s ease-in-out;
        }
        
        .mobile-hidden {
          display: block;
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        
        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .container-paul {
            padding: 0 1rem;
          }
          
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          h1 {
            font-size: 2rem !important;
          }
          
          h2 {
            font-size: 1.5rem !important;
          }
          
          .mobile-stack {
            flex-direction: column;
          }
          
          .mobile-full {
            width: 100%;
          }
          
          .mobile-hidden {
            display: none;
          }
          
          /* Brunch Menu Mobile Styles */
          .brunch-menu-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .brunch-menu-content {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .menu-type-navigation {
            flex-direction: column !important;
            gap: 1rem !important;
          }
        }
        
        
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .hero-padding {
            padding: 4rem 0 2rem;
          }
          
          .filter-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          
          .hero-padding h1 {
            font-size: 1.75rem !important;
          }
          
          .hero-padding p {
            font-size: 1rem !important; 
          }
        }
      `}</style>
    </div>
  );
}
