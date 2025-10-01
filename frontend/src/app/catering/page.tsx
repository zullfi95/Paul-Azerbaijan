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

// Интерфейс для выбранных позиций Brunch Menu (только одна позиция из каждой категории)
interface BrunchSelection {
  canapes: string | null;
  sandwiches: string | null;
  wraps: string | null;
  salads: string | null;
  desserts: string | null;
  drinks: string | null;
}

export default function CateringPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Brunch Menu');
  const [sortBy, setSortBy] = useState('name');
  const [isMobile, setIsMobile] = useState(false);
  
  // Состояние для выбранных позиций Brunch Menu
  const [brunchSelections, setBrunchSelections] = useState<BrunchSelection>({
    canapes: null,
    sandwiches: null,
    wraps: null,
    salads: null,
    desserts: null,
    drinks: null
  });

  // Функции для управления выбором позиций Brunch Menu (только одна позиция из каждой категории)
  const toggleBrunchSelection = (category: keyof BrunchSelection, item: string) => {
    setBrunchSelections(prev => ({
      ...prev,
      [category]: prev[category] === item ? null : item
    }));
  };

  const isBrunchItemSelected = (category: keyof BrunchSelection, item: string) => {
    return brunchSelections[category] === item;
  };

  const getTotalSelectedItems = () => {
    return Object.values(brunchSelections).filter(item => item !== null).length;
  };

  const addBrunchToCart = () => {
    const selectedItems = [];
    
    // Собираем все выбранные позиции
    Object.entries(brunchSelections).forEach(([category, item]) => {
      if (item !== null) {
        selectedItems.push({
          id: `${category}-${item.toLowerCase().replace(/\s+/g, '-')}`,
          name: item,
          description: `Brunch Menu - ${category}`,
          price: 0, // Цена фиксированная за весь brunch
          quantity: 1,
          image: '/images/brunch.jpg',
          category: 'Brunch Menu',
          available: true,
          isSet: true
        });
      }
    });

    if (selectedItems.length > 0) {
      // Добавляем brunch как один набор
      const brunchItem = {
        id: 'brunch-set',
        name: 'Brunch Menu Set',
        description: `Selected items: ${selectedItems.map(item => item.name).join(', ')}`,
        price: 19,
        quantity: 1,
        image: '/images/brunch.jpg',
        category: 'Brunch Menu',
        available: true,
        isSet: true,
        selectedItems: selectedItems
      };
      
      addItem(brunchItem);
      showNotification('Brunch Menu добавлен в корзину!', 'success');
    } else {
      showNotification('Пожалуйста, выберите хотя бы одну позицию', 'warning');
    }
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFAE6' }}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div style={{
          padding: '1rem 0',
          backgroundColor: '#FFFAE6',
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
          backgroundColor: '#FFFAE6',
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
              fontSize: '44px',
              fontStyle: 'normal',
              fontWeight: 'bold',
              lineHeight: 'normal',
              marginBottom: '2rem'
            } as React.CSSProperties}>
              Catering Menu
            </h1>
            
            {/* Menu Type Navigation */}
            <div className="menu-type-navigation" style={{
                  display: 'flex',
              justifyContent: 'flex-start',
              gap: '2rem',
              marginBottom: '1rem'
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
                backgroundColor: '#FFFAE6',
                padding: '1rem 0',
                marginBottom: '1rem'
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {['Mini Éclair Selection', 'Mini Tartine Selection', 'Mini Quiche Selection'].map((item) => (
                                <label key={item} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.375rem 0.5rem',
                                  borderRadius: '0',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isBrunchItemSelected('canapes', item) ? '#1A1A1A' : 'transparent',
                                  border: isBrunchItemSelected('canapes', item) ? '1px solid #1A1A1A' : '1px solid transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="canapes"
                                    checked={isBrunchItemSelected('canapes', item)}
                                    onChange={() => toggleBrunchSelection('canapes', item)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      accentColor: '#1A1A1A',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '15px',
                                    color: isBrunchItemSelected('canapes', item) ? '#FFFFFF' : '#1A1A1A',
                                    fontFamily: '"Sabon Next LT Pro"',
                                    fontWeight: isBrunchItemSelected('canapes', item) ? '500' : '400',
                                    lineHeight: '1.4',
                                    flex: 1
                                  }}>
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {['Tomato & Mozzarella', 'Tuna & Sweetcorn', 'Ham and Cheese'].map((item) => (
                                <label key={item} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.375rem 0.5rem',
                                  borderRadius: '0',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isBrunchItemSelected('sandwiches', item) ? '#1A1A1A' : 'transparent',
                                  border: isBrunchItemSelected('sandwiches', item) ? '1px solid #1A1A1A' : '1px solid transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="sandwiches"
                                    checked={isBrunchItemSelected('sandwiches', item)}
                                    onChange={() => toggleBrunchSelection('sandwiches', item)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      accentColor: '#1A1A1A',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '15px',
                                    color: isBrunchItemSelected('sandwiches', item) ? '#FFFFFF' : '#1A1A1A',
                                    fontFamily: '"Sabon Next LT Pro"',
                                    fontWeight: isBrunchItemSelected('sandwiches', item) ? '500' : '400',
                                    lineHeight: '1.4',
                                    flex: 1
                                  }}>
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {['Ham&Cheese', 'Crispy Chicken', 'Beef with Vegetable'].map((item) => (
                                <label key={item} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.375rem 0.5rem',
                                  borderRadius: '0',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isBrunchItemSelected('wraps', item) ? '#1A1A1A' : 'transparent',
                                  border: isBrunchItemSelected('wraps', item) ? '1px solid #1A1A1A' : '1px solid transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="wraps"
                                    checked={isBrunchItemSelected('wraps', item)}
                                    onChange={() => toggleBrunchSelection('wraps', item)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      accentColor: '#1A1A1A',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '15px',
                                    color: isBrunchItemSelected('wraps', item) ? '#FFFFFF' : '#1A1A1A',
                                    fontFamily: '"Sabon Next LT Pro"',
                                    fontWeight: isBrunchItemSelected('wraps', item) ? '500' : '400',
                                    lineHeight: '1.4',
                                    flex: 1
                                  }}>
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {['Chicken Pasta Salad', 'Greek Salad', 'Smoked Salmon Salad'].map((item) => (
                                <label key={item} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.375rem 0.5rem',
                                  borderRadius: '0',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isBrunchItemSelected('salads', item) ? '#1A1A1A' : 'transparent',
                                  border: isBrunchItemSelected('salads', item) ? '1px solid #1A1A1A' : '1px solid transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="salads"
                                    checked={isBrunchItemSelected('salads', item)}
                                    onChange={() => toggleBrunchSelection('salads', item)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      accentColor: '#1A1A1A',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '15px',
                                    color: isBrunchItemSelected('salads', item) ? '#FFFFFF' : '#1A1A1A',
                                    fontFamily: '"Sabon Next LT Pro"',
                                    fontWeight: isBrunchItemSelected('salads', item) ? '500' : '400',
                                    lineHeight: '1.4',
                                    flex: 1
                                  }}>
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {['Seasonal Fruits', 'Flavored Natural Yoghurt', 'Mini sweets', 'Mini Viennoiseries'].map((item) => (
                                <label key={item} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.375rem 0.5rem',
                                  borderRadius: '0',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isBrunchItemSelected('desserts', item) ? '#1A1A1A' : 'transparent',
                                  border: isBrunchItemSelected('desserts', item) ? '1px solid #1A1A1A' : '1px solid transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="desserts"
                                    checked={isBrunchItemSelected('desserts', item)}
                                    onChange={() => toggleBrunchSelection('desserts', item)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      accentColor: '#1A1A1A',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '15px',
                                    color: isBrunchItemSelected('desserts', item) ? '#FFFFFF' : '#1A1A1A',
                                    fontFamily: '"Sabon Next LT Pro"',
                                    fontWeight: isBrunchItemSelected('desserts', item) ? '500' : '400',
                                    lineHeight: '1.4',
                                    flex: 1
                                  }}>
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              {['Hot Beverages', 'Soft drinks', 'Fruit juices'].map((item) => (
                                <label key={item} style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  cursor: 'pointer',
                                  padding: '0.375rem 0.5rem',
                                  borderRadius: '0',
                                  transition: 'all 0.2s ease',
                                  backgroundColor: isBrunchItemSelected('drinks', item) ? '#1A1A1A' : 'transparent',
                                  border: isBrunchItemSelected('drinks', item) ? '1px solid #1A1A1A' : '1px solid transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="drinks"
                                    checked={isBrunchItemSelected('drinks', item)}
                                    onChange={() => toggleBrunchSelection('drinks', item)}
                                    style={{
                                      width: '16px',
                                      height: '16px',
                                      accentColor: '#1A1A1A',
                                      cursor: 'pointer',
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: '15px',
                                    color: isBrunchItemSelected('drinks', item) ? '#FFFFFF' : '#1A1A1A',
                                    fontFamily: '"Sabon Next LT Pro"',
                                    fontWeight: isBrunchItemSelected('drinks', item) ? '500' : '400',
                                    lineHeight: '1.4',
                                    flex: 1
                                  }}>
                                    {item}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                      </div>
                    </div>
                    
                    {/* Brunch Image and Add to Cart */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      gap: '1.5rem'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '100%',
                        maxHeight: '300px',
                        borderRadius: '0',
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
                      
                      
                      {/* Add to Cart Button */}
                      <button
                        onClick={addBrunchToCart}
                        disabled={getTotalSelectedItems() === 0}
                        style={{
                          backgroundColor: getTotalSelectedItems() > 0 ? '#1A1A1A' : '#D1D5DB',
                          color: getTotalSelectedItems() > 0 ? '#FFFFFF' : '#9CA3AF',
                          border: 'none',
                          borderRadius: '0',
                          padding: '0.75rem 1.5rem',
                          fontSize: '15px',
                          fontFamily: '"Sabon Next LT Pro"',
                          fontWeight: '500',
                          cursor: getTotalSelectedItems() > 0 ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          boxShadow: getTotalSelectedItems() > 0 ? '0 2px 8px rgba(26, 26, 26, 0.25)' : 'none',
                          width: '100%',
                          letterSpacing: '0.025em'
                        }}
                        onMouseEnter={(e) => {
                          if (getTotalSelectedItems() > 0) {
                            e.currentTarget.style.backgroundColor = '#000000';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(26, 26, 26, 0.35)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (getTotalSelectedItems() > 0) {
                            e.currentTarget.style.backgroundColor = '#1A1A1A';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 26, 26, 0.25)';
                          }
                        }}
                      >
                        {getTotalSelectedItems() > 0 ? 'Add Brunch to Cart' : 'Select Items First'}
                      </button>
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
                              borderRadius: '0',
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
          
          /* Catering Menu Title Mobile */
          h1 {
            font-size: 28px !important;
          }
          
          .hero-padding p {
            font-size: 1rem !important; 
          }
        }
      `}</style>
    </div>
  );
}
