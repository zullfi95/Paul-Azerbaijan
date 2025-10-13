"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import BasketIcon from '../../components/BasketIcon';
import CartModal from '../../components/CartModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import FeedbackModal from '../../components/FeedbackModal';
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
  },
  {
    id: '9',
    name: 'Business Meeting Set',
    description: 'Complete set for 10 people',
    price: 150,
    quantity: 1,
    image: '/images/menuitem1.png',
    category: 'Sets',
    available: true,
    isSet: true
  },
  {
    id: '10',
    name: 'Corporate Event Set',
    description: 'Premium set for 20 people',
    price: 280,
    quantity: 1,
    image: '/images/menuitem2.png',
    category: 'Sets',
    available: true,
    isSet: true
  },
  {
    id: '11',
    name: 'Conference Break Set',
    description: 'Light refreshments for 15 people',
    price: 200,
    quantity: 1,
    image: '/images/menuitem3.png',
    category: 'Sets',
    available: true,
    isSet: true
  },
  {
    id: '12',
    name: 'Executive Lunch Set',
    description: 'Elegant lunch for 8 people',
    price: 180,
    quantity: 1,
    image: '/images/menuitem4.png',
    category: 'Sets',
    available: true,
    isSet: true
  }
];

const categories = [
  { name: 'Sets', icon: '🍽️', image: '/images/category4.png' },
  { name: 'Brunch Menu', icon: '🥐', image: '/images/category3.png' },
  { name: 'Lunch Menu', icon: '🥖', image: '/images/category5.png' },
  { name: 'Coffee Breaks & Afternoon Teas', icon: '🍞', image: '/images/category1.png' }
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

// Интерфейс для выбранных опций Lunch Menu
interface LunchSelection {
  selectedOption: string | null;
  quantity: number;
}

export default function CateringPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Sets');
  const [sortBy] = useState('name');
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

  // Состояние для выбранных опций Lunch Menu
  const [lunchSelections, setLunchSelections] = useState<{[key: string]: LunchSelection}>({
    'option1': { selectedOption: null, quantity: 1 },
    'option2': { selectedOption: null, quantity: 1 },
    'option3': { selectedOption: null, quantity: 1 },
    'option4': { selectedOption: null, quantity: 1 },
    'option5': { selectedOption: null, quantity: 1 }
  });

  // Состояние для чекбоксов в опциях с выбором
  const [lunchChoices, setLunchChoices] = useState<{[key: string]: {[key: string]: boolean}}>({
    'option1': { 'salad': false, 'sandwiches': false },
    'option3': { 'salads': false, 'mainDishes': false }
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
    const selectedItems: {
      id: string; name: string; description: string; price: number; // Цена фиксированная за весь brunch
      quantity: number; image: string; category: string; available: boolean; isSet: boolean;
    }[] = [];
    
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
      showNotification('Пожалуйста, выберите хотя бы одну позицию', 'info');
    }
  };

  // Функции для управления Lunch Menu
  const toggleLunchOption = (optionKey: string, optionName: string) => {
    setLunchSelections(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        selectedOption: prev[optionKey].selectedOption === optionName ? null : optionName
      }
    }));
  };

  const updateLunchQuantity = (optionKey: string, quantity: number) => {
    if (quantity < 1) return;
    setLunchSelections(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        quantity: quantity
      }
    }));
  };

  // Функция для управления чекбоксами
  const toggleLunchChoice = (optionKey: string, choiceKey: string) => {
    setLunchChoices(prev => ({
      ...prev,
      [optionKey]: {
        ...prev[optionKey],
        [choiceKey]: !prev[optionKey][choiceKey]
      }
    }));
  };

  const toggleLunchChoiceExclusive = (optionKey: string, choiceKey: string) => {
    setLunchChoices(prev => ({
      ...prev,
      [optionKey]: {
        salads: choiceKey === 'salads',
        mainDishes: choiceKey === 'mainDishes'
      }
    }));
  };

  const addLunchToCart = (optionKey: string, optionName: string, price: number) => {
    const selection = lunchSelections[optionKey];
    const choices = lunchChoices[optionKey];
    
    // Проверяем, есть ли выбранные опции для опций с чекбоксами
    let hasValidSelection = true;
    if (choices) {
      const hasAnyChoice = Object.values(choices).some(choice => choice);
      hasValidSelection = hasAnyChoice;
    }
    
    if (hasValidSelection && selection.quantity > 0) {
      let description = optionName;
      if (choices) {
        const selectedChoices = Object.entries(choices)
          .filter(([, selected]) => selected)
          .map(([key]) => key);
        if (selectedChoices.length > 0) {
          description += ` (${selectedChoices.join(', ')})`;
        }
      }
      
      const lunchItem = {
        id: `lunch-${optionKey}`,
        name: optionName,
        description: description,
        price: price,
        quantity: selection.quantity,
        image: '/images/lunch.jpg',
        category: 'Lunch Menu',
        available: true,
        isSet: true
      };
      
      addItem(lunchItem);
      showNotification(`${optionName} добавлен в корзину!`, 'success');
    } else {
      showNotification('Пожалуйста, выберите опцию', 'info');
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
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFCF8' }}>
      <Header />
      
      <div className="navbar-spacing">
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
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Catering Menu', isActive: true }
              ]}
            />
          </div>
        </div>

        {/* Page Title */}
        <div style={{
          padding: '2rem 0 1rem 0',
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
              fontSize: '44px',
              fontStyle: 'normal',
              fontWeight: 'bold',
              lineHeight: 'normal',
              marginBottom: '0'
            } as React.CSSProperties}>
              Catering Menu
            </h1>
          </div>
        </div>

        {/* Category Navigation */}
        <div style={{
          padding: '1.5rem 0',
          backgroundColor: '#FFFCF8'
        }}>
          <div style={{
            maxWidth: '1140px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            <div className="category-navigation" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'nowrap'
            }}>
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="category-item"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1.5rem',
                    backgroundColor: 'transparent',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '140px',
                    flex: '1'
                  }}
                  onClick={() => setSelectedCategory(category.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={60}
                      height={60}
                      style={{
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    color: selectedCategory === category.name ? '#1A1A1A' : '#4A4A4A',
                    fontWeight: selectedCategory === category.name ? 'bold' : '500',
                    fontFamily: '"Sabon Next LT Pro"'
                  }}>
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div style={{
          backgroundColor: '#FFFCF8'
        }}>
          <div style={{
            maxWidth: '1140px',
            margin: '0 auto',
            padding: '0 20px'
          }}>
            
            {/* Brunch Menu Section */}
            {selectedCategory === 'Brunch Menu' && (
              <div style={{
                backgroundColor: '#FFFCF8',
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

            {/* Lunch Menu Section */}
            {selectedCategory === 'Lunch Menu' && (
              <div style={{
                backgroundColor: '#FFFCF8',
                padding: '2rem 0',
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
                    Lunch Menu
                  </h2>
                  
                  {/* Divider Line */}
                  <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#D1D5DB',
                    margin: '0 auto 2rem auto',
                    maxWidth: '1200px'
                  }}></div>
                  
                  {/* Lunch Options Grid */}
                  <div className="lunch-options-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? (window.innerWidth < 640 ? '1fr' : 'repeat(2, 1fr)') : 'repeat(5, 1fr)',
                    gap: '1.5rem',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '0 1rem'
                  }}>
                    
                    {/* Option I */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'transparent',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: 'none',
                      border: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      height: 'auto',
                      minHeight: '500px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}>
                      
                      {/* Header */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{
                          fontFamily: '"Sabon Next LT Pro"',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1A1A1A',
                          margin: '0',
                          letterSpacing: '0.5px'
                        }}>
                          Option I
                        </h3>
                      </div>

                      {/* Content Area */}
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        
                        {/* Soup Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soup</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Tomato soup</p>
                        </div>

                        {/* Choice Section */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              justifyContent: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              <input
                                type="checkbox"
                                checked={lunchChoices.option1?.salad || false}
                                onChange={() => toggleLunchChoice('option1', 'salad')}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  accentColor: '#1A1A1A',
                                  cursor: 'pointer',
                                  borderRadius: '50%',
                                  appearance: 'none',
                                  border: '2px solid #1A1A1A',
                                  backgroundColor: lunchChoices.option1?.salad ? '#1A1A1A' : 'transparent'
                                }}
                              />
                              <div style={{ textAlign: 'left' }}>
                                <h4 style={{ 
                                  fontFamily: '"Sabon Next LT Pro"',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  color: '#1A1A1A',
                                  margin: '0 0 0.25rem 0'
                                }}>Salad</h4>
                                <p style={{ 
                                  fontFamily: '"Parisine Pro Gris"',
                                  fontSize: '12px',
                                  color: '#666',
                                  margin: '0',
                                  lineHeight: '1.4'
                                }}>Americana salad</p>
                              </div>
                            </label>
                          </div>
                          
                          <p style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '12px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            margin: '0.25rem 0',
                            lineHeight: '1.4'
                          }}>or</p>
                          
                          <div>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              justifyContent: 'center'
                            }}>
                              <input
                                type="checkbox"
                                checked={lunchChoices.option1?.sandwiches || false}
                                onChange={() => toggleLunchChoice('option1', 'sandwiches')}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  accentColor: '#1A1A1A',
                                  cursor: 'pointer',
                                  borderRadius: '50%',
                                  appearance: 'none',
                                  border: '2px solid #1A1A1A',
                                  backgroundColor: lunchChoices.option1?.sandwiches ? '#1A1A1A' : 'transparent'
                                }}
                              />
                              <div style={{ textAlign: 'left' }}>
                                <h4 style={{ 
                                  fontFamily: '"Sabon Next LT Pro"',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  color: '#1A1A1A',
                                  margin: '0 0 0.25rem 0'
                                }}>Sandwiches</h4>
                                <p style={{ 
                                  fontFamily: '"Parisine Pro Gris"',
                                  fontSize: '12px',
                                  color: '#666',
                                  margin: '0',
                                  lineHeight: '1.4'
                                }}>Tartine paulet</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Soft Drinks Section */}
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soft drinks</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>1 glass per person</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                          <p style={{
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            fontWeight: '600',
                            margin: '0'
                          }}>Price for 1 person 25₼</p>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: '#FFFCF8',
                          border: '1px solid #E5E5E5',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem'
                        }}>
                          <button
                            onClick={() => updateLunchQuantity('option1', lunchSelections.option1.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            fontSize: '14px', 
                            minWidth: '20px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1A1A1A'
                          }}>
                            {lunchSelections.option1.quantity}
                          </span>
                          <button
                            onClick={() => updateLunchQuantity('option1', lunchSelections.option1.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addLunchToCart('option1', 'Option I', 25)}
                          style={{
                            backgroundColor: '#1A1A1A',
                            color: '#FEF4E6',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '14px',
                            fontFamily: '"Sabon Next LT Pro"',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1A1A1A';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>

                    {/* Option II */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'transparent',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: 'none',
                      border: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      height: 'auto',
                      minHeight: '500px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}>
                      
                      {/* Header */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{
                          fontFamily: '"Sabon Next LT Pro"',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1A1A1A',
                          margin: '0',
                          letterSpacing: '0.5px'
                        }}>
                          Option II
                        </h3>
                      </div>

                      {/* Content Area */}
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        
                        {/* Soup Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soup</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Tomato soup</p>
                        </div>

                        {/* Main Dishes Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Main Dishes</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Chicken creamy mushroom served with mashed potato</p>
                        </div>

                        {/* Soft Drinks Section */}
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soft drinks</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>1 glass per person</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                          <p style={{
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            fontWeight: '600',
                            margin: '0'
                          }}>Price for 1 person 30₼</p>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: '#FFFCF8',
                          border: '1px solid #E5E5E5',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem'
                        }}>
                          <button
                            onClick={() => updateLunchQuantity('option2', lunchSelections.option2.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            fontSize: '14px', 
                            minWidth: '20px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1A1A1A'
                          }}>
                            {lunchSelections.option2.quantity}
                          </span>
                          <button
                            onClick={() => updateLunchQuantity('option2', lunchSelections.option2.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addLunchToCart('option2', 'Option II', 30)}
                          style={{
                            backgroundColor: '#1A1A1A',
                            color: '#FEF4E6',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '14px',
                            fontFamily: '"Sabon Next LT Pro"',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1A1A1A';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>

                    {/* Option III */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'transparent',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: 'none',
                      border: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      height: 'auto',
                      minHeight: '500px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}>
                      
                      {/* Header */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{
                          fontFamily: '"Sabon Next LT Pro"',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1A1A1A',
                          margin: '0',
                          letterSpacing: '0.5px'
                        }}>
                          Option III
                        </h3>
                      </div>

                      {/* Content Area */}
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        
                        {/* Choice Section */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              justifyContent: 'center',
                              marginBottom: '0.5rem'
                            }}>
                              <input
                                type="checkbox"
                                checked={lunchChoices.option3?.salads || false}
                                onChange={() => toggleLunchChoiceExclusive('option3', 'salads')}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  accentColor: '#1A1A1A',
                                  cursor: 'pointer',
                                  borderRadius: '50%',
                                  appearance: 'none',
                                  border: '2px solid #1A1A1A',
                                  backgroundColor: lunchChoices.option3?.salads ? '#1A1A1A' : 'transparent'
                                }}
                              />
                              <div style={{ textAlign: 'left' }}>
                                <h4 style={{ 
                                  fontFamily: '"Sabon Next LT Pro"',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  color: '#1A1A1A',
                                  margin: '0 0 0.25rem 0'
                                }}>Salads</h4>
                                <p style={{ 
                                  fontFamily: '"Parisine Pro Gris"',
                                  fontSize: '12px',
                                  color: '#666',
                                  margin: '0',
                                  lineHeight: '1.4'
                                }}>Americana salad</p>
                              </div>
                            </label>
                          </div>
                          
                          <p style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '12px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            margin: '0.25rem 0',
                            lineHeight: '1.4'
                          }}>or</p>
                          
                          <div>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              cursor: 'pointer',
                              justifyContent: 'center'
                            }}>
                              <input
                                type="checkbox"
                                checked={lunchChoices.option3?.mainDishes || false}
                                onChange={() => toggleLunchChoiceExclusive('option3', 'mainDishes')}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  accentColor: '#1A1A1A',
                                  cursor: 'pointer',
                                  borderRadius: '50%',
                                  appearance: 'none',
                                  border: '2px solid #1A1A1A',
                                  backgroundColor: lunchChoices.option3?.mainDishes ? '#1A1A1A' : 'transparent'
                                }}
                              />
                              <div style={{ textAlign: 'left' }}>
                                <h4 style={{ 
                                  fontFamily: '"Sabon Next LT Pro"',
                                  fontSize: '14px',
                                  fontWeight: 'bold',
                                  color: '#1A1A1A',
                                  margin: '0 0 0.25rem 0'
                                }}>Main Dishes</h4>
                                <p style={{ 
                                  fontFamily: '"Parisine Pro Gris"',
                                  fontSize: '12px',
                                  color: '#666',
                                  margin: '0',
                                  lineHeight: '1.4'
                                }}>Chicken creamy mushroom served with mashed potato</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* Soft Drinks Section */}
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soft drinks</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>1 glass per person</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                          <p style={{
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            fontWeight: '600',
                            margin: '0'
                          }}>Price for 1 person 28₼</p>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: '#FFFCF8',
                          border: '1px solid #E5E5E5',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem'
                        }}>
                          <button
                            onClick={() => updateLunchQuantity('option3', lunchSelections.option3.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            fontSize: '14px', 
                            minWidth: '20px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1A1A1A'
                          }}>
                            {lunchSelections.option3.quantity}
                          </span>
                          <button
                            onClick={() => updateLunchQuantity('option3', lunchSelections.option3.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => addLunchToCart('option3', 'Option III', 28)}
                          style={{
                            backgroundColor: '#1A1A1A',
                            color: '#FEF4E6',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '14px',
                            fontFamily: '"Sabon Next LT Pro"',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1A1A1A';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>

                    {/* Option IV */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'transparent',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: 'none',
                      border: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      height: 'auto',
                      minHeight: '500px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}>
                      
                      {/* Header */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{
                          fontFamily: '"Sabon Next LT Pro"',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1A1A1A',
                          margin: '0',
                          letterSpacing: '0.5px'
                        }}>
                          Option IV
                        </h3>
                      </div>

                      {/* Content Area */}
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        
                        {/* Soup Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soup</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Tomato soup</p>
                        </div>

                        {/* Salads Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Salads</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Americana salad</p>
                        </div>

                        {/* Main Dishes Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Main Dishes</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Chicken creamy mushroom served with mashed potato</p>
                        </div>

                        {/* Soft Drinks Section */}
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soft drinks</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>1 glass per person</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                          <p style={{
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            fontWeight: '600',
                            margin: '0'
                          }}>Price for 1 person 35₼</p>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: '#FFFCF8',
                          border: '1px solid #E5E5E5',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem'
                        }}>
                          <button
                            onClick={() => updateLunchQuantity('option4', lunchSelections.option4.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            fontSize: '14px', 
                            minWidth: '20px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1A1A1A'
                          }}>
                            {lunchSelections.option4.quantity}
                          </span>
                          <button
                            onClick={() => updateLunchQuantity('option4', lunchSelections.option4.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => {
                            toggleLunchOption('option4', 'Option IV - Soup, Salads, Main Dishes, Soft drinks');
                            addLunchToCart('option4', 'Option IV', 35);
                          }}
                          style={{
                            backgroundColor: '#1A1A1A',
                            color: '#FEF4E6',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '14px',
                            fontFamily: '"Sabon Next LT Pro"',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1A1A1A';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>

                    {/* Option V */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'transparent',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      boxShadow: 'none',
                      border: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      height: 'auto',
                      minHeight: '500px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }}>
                      
                      {/* Header */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{
                          fontFamily: '"Sabon Next LT Pro"',
                          fontSize: '18px',
                          fontWeight: 'bold',
                          color: '#1A1A1A',
                          margin: '0',
                          letterSpacing: '0.5px'
                        }}>
                          Option V
                        </h3>
                      </div>

                      {/* Content Area */}
                      <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        
                        {/* Soup Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soup</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Tomato soup</p>
                        </div>

                        {/* Salads Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Salads</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Americana salad</p>
                        </div>

                        {/* Main Dishes Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Main Dishes</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Chicken creamy mushroom served with mashed potato</p>
                        </div>

                        {/* Sweets Section */}
                        <div style={{ textAlign: 'center' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Sweets</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>Honey cake</p>
                        </div>

                        {/* Soft Drinks Section */}
                        <div style={{ textAlign: 'center', marginTop: 'auto' }}>
                          <h4 style={{ 
                            fontFamily: '"Sabon Next LT Pro"',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#1A1A1A',
                            margin: '0 0 0.5rem 0'
                          }}>Soft drinks</h4>
                          <p style={{ 
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '12px',
                            color: '#666',
                            margin: '0',
                            lineHeight: '1.4'
                          }}>1 glass per person</p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                          <p style={{
                            fontFamily: '"Parisine Pro Gris"',
                            fontSize: '14px',
                            fontStyle: 'italic',
                            color: '#1A1A1A',
                            fontWeight: '600',
                            margin: '0'
                          }}>Price for 1 person 40₼</p>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          backgroundColor: '#FFFCF8',
                          border: '1px solid #E5E5E5',
                          borderRadius: '6px',
                          padding: '0.5rem 1rem'
                        }}>
                          <button
                            onClick={() => updateLunchQuantity('option5', lunchSelections.option5.quantity - 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            -
                          </button>
                          <span style={{ 
                            fontSize: '14px', 
                            minWidth: '20px', 
                            textAlign: 'center',
                            fontWeight: '600',
                            color: '#1A1A1A'
                          }}>
                            {lunchSelections.option5.quantity}
                          </span>
                          <button
                            onClick={() => updateLunchQuantity('option5', lunchSelections.option5.quantity + 1)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              padding: '0.25rem',
                              color: '#1A1A1A'
                            }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Add to Cart Button */}
                        <button
                          onClick={() => {
                            toggleLunchOption('option5', 'Option V - Soup, Salads, Main Dishes, Sweets, Soft drinks');
                            addLunchToCart('option5', 'Option V', 40);
                          }}
                          style={{
                            backgroundColor: '#1A1A1A',
                            color: '#FEF4E6',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 1.5rem',
                            fontSize: '14px',
                            fontFamily: '"Sabon Next LT Pro"',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            width: '100%',
                            letterSpacing: '0.5px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#333';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#1A1A1A';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Lunch Description */}
                  <div style={{
                    textAlign: 'center',
                    marginTop: '3rem',
                    maxWidth: '800px',
                    margin: '3rem auto 0'
                  }}>
                    <h3 style={{
                      color: '#000',
                      fontFamily: '"Sabon Next LT Pro"',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      marginBottom: '1rem'
                    }}>
                      Lunch Menu from PAUL
                    </h3>
                    <p style={{
                      color: '#000',
                      fontFamily: '"Sabon Next LT Pro"',
                      fontSize: '18px',
                      lineHeight: '1.6',
                      textAlign: 'center'
                    }}>
                      At PAUL, we take pride in offering exceptional catering services that bring the delightful flavors of our restaurant directly to your event. Whether it&apos;s a corporate gathering, wedding, or a casual get-together, our team is dedicated to providing a seamless experience tailored to your needs. Our menu features a variety of freshly prepared dishes, showcasing the best of French cuisine. With a focus on quality ingredients and presentation, we ensure that every bite is a memorable one. Let us help you create an unforgettable dining experience for your guests!
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Sort By Button - Only show when category is selected */}
            {selectedCategory && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '1.5rem',
                padding: '0 20px',
                maxWidth: '1140px',
                margin: '0 auto 1.5rem auto'
              }}>
                <button 
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  data-sort-menu
                  style={{
                    backgroundColor: '#1A1A1A',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '0.5rem 1.25rem',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontFamily: '"Sabon Next LT Pro"',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation',
                    minHeight: '36px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1A1A1A';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';
                  }}
                >
                  SORT BY
                  <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>...</span>
                </button>
              </div>
            )}

            {/* Product Grid - Only show when category is selected */}
            {selectedCategory && (
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
                      src={item.image || '/images/placeholder.png'}
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
                        bottom: '0.75rem',
                        right: '0.75rem',
                        width: '36px',
                        height: '36px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        color: '#1A1A1A',
                        border: '1.5px solid rgba(0, 0, 0, 0.15)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                        zIndex: 10,
                        backdropFilter: 'blur(4px)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1A1A1A';
                        e.currentTarget.style.borderColor = '#1A1A1A';
                        e.currentTarget.style.color = 'white';
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                        e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)';
                        e.currentTarget.style.color = '#1A1A1A';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.3)';
                      }}
                    >
                      <BasketIcon 
                        size={18}
                        style={{
                          color: '#1A1A1A',
                          fill: '#1A1A1A'
                        }}
                      />
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
            )}

            {/* View More Button - Only show when category is selected */}
            {selectedCategory && (
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
            )}
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
      
      {/* Feedback Modal Component */}
      <FeedbackModal />

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
        }
        
        .btn-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-hover:hover {
          transform: translateY(-2px);
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
        
        /* Product Add to Cart Button - Global */
        .product-grid > div > div:first-child > button svg {
          color: #1A1A1A;
          fill: #1A1A1A;
        }
        
        .product-grid > div > div:first-child > button svg path {
          fill: #1A1A1A;
        }
        
        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        /* Tablet Adjustments */
        @media (max-width: 900px) and (min-width: 769px) {
          .lunch-options-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
          
          .category-navigation {
            gap: 0.875rem !important;
          }
          
          .category-item {
            min-width: 130px !important;
          }
        }
        
        @media (max-width: 768px) {
          .container-paul {
            padding: 0 1rem;
          }
          
          /* Navbar Spacing */
          .navbar-spacing {
            padding-top: 0 !important;
          }
          
          /* Product Grid */
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          
          /* Product Card */
          .product-grid > div {
            border-radius: 0.375rem !important;
          }
          
          .product-grid > div > div:first-child {
            height: 200px !important;
          }
          
          .product-grid > div > div:nth-child(2) {
            padding: 0.625rem !important;
          }
          
          .product-grid h3 {
            font-size: 0.8125rem !important;
          }
          
          .product-grid p {
            font-size: 0.6875rem !important;
          }
          
          .product-grid span {
            font-size: 0.875rem !important;
          }
          
          /* Product Add to Cart Button - 768px */
          .product-grid > div > div:first-child > button {
            width: 34px !important;
            height: 34px !important;
            bottom: 0.625rem !important;
            right: 0.625rem !important;
            background-color: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35) !important;
            border: 1.5px solid rgba(0, 0, 0, 0.2) !important;
          }
          
          .product-grid > div > div:first-child > button svg {
            width: 17px !important;
            height: 17px !important;
            color: #1A1A1A !important;
            fill: #1A1A1A !important;
          }
          
          .product-grid > div > div:first-child > button svg path {
            fill: #1A1A1A !important;
          }
          
          /* Typography */
          h1 {
            font-size: 32px !important;
            margin-bottom: 0 !important;
            padding: 0 1rem !important;
          }
          
          /* Page Title Section */
          div[style*="padding: '2rem 0 1rem 0'"] {
            padding: 1.5rem 0 0.75rem 0 !important;
          }
          
          h2 {
            font-size: 18px !important;
            margin-bottom: 1rem !important;
          }
          
          h3 {
            font-size: 16px !important;
          }
          
          h4 {
            font-size: 13px !important;
          }
          
          /* Layout Utilities */
          .mobile-stack {
            flex-direction: column;
          }
          
          .mobile-full {
            width: 100%;
          }
          
          .mobile-hidden {
            display: none;
          }
          
          /* Category Navigation Section */
          div[style*="padding: '1.5rem 0'"] {
            padding: 1rem 0 !important;
          }
          
          /* Category Navigation - All 4 visible without scroll */
          .category-navigation {
            flex-wrap: nowrap !important;
            gap: 0.5rem !important;
            padding: 0 0.5rem !important;
            justify-content: space-between !important;
          }
          
          .category-item {
            min-width: 0 !important;
            flex: 1 1 23% !important;
            padding: 0.75rem 0.375rem !important;
            max-width: 25% !important;
          }
          
          .category-item div {
            width: 50px !important;
            height: 50px !important;
            margin: 0 auto !important;
          }
          
          .category-item span {
            font-size: 11px !important;
            white-space: normal !important;
            text-align: center !important;
            line-height: 1.2 !important;
            display: block !important;
          }
          
          /* Brunch Menu Mobile Styles */
          .brunch-menu-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          
          .brunch-menu-content {
            display: flex !important;
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          /* Brunch Menu Items */
          .brunch-menu-content > div {
            margin-bottom: 0.75rem !important;
          }
          
          .brunch-menu-content h3 {
            font-size: 15px !important;
            margin-bottom: 0.375rem !important;
          }
          
          .brunch-menu-content p {
            font-size: 12px !important;
            margin-bottom: 0.5rem !important;
          }
          
          /* Brunch Menu Labels */
          .brunch-menu-content label {
            padding: 0.375rem 0.5rem !important;
            margin-bottom: 0.25rem !important;
          }
          
          .brunch-menu-content label span {
            font-size: 13px !important;
          }
          
          .brunch-menu-content input[type="radio"] {
            width: 14px !important;
            height: 14px !important;
          }
          
          /* Brunch Image Container */
          .brunch-menu-grid > div:last-child {
            order: -1 !important;
            margin-bottom: 1rem !important;
          }
          
          .brunch-menu-grid > div:last-child > div:first-child {
            max-height: 220px !important;
            border-radius: 8px !important;
          }
          
          /* Brunch Add to Cart Button */
          .brunch-menu-grid button {
            padding: 0.75rem 1.25rem !important;
            font-size: 14px !important;
            width: 100% !important;
            margin-top: 0.75rem !important;
          }
          
          /* Sort By Button - Mobile */
          div:has(button[data-sort-menu]) {
            padding: 0 0.75rem !important;
          }
          
          button[data-sort-menu] {
            padding: 0.5rem 1.125rem !important;
            font-size: 12.5px !important;
          }
          
          /* Lunch Menu Options Grid */
          .lunch-options-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
            padding: 0 0.5rem !important;
          }
          
          /* Lunch Menu Option Cards */
          .lunch-options-grid > div {
            padding: 1.25rem !important;
            min-height: auto !important;
          }
          
          /* Menu Type Navigation */
          .menu-type-navigation {
            flex-direction: column !important;
            gap: 1rem !important;
          }
          
          /* Section Paddings */
          div[style*="padding: '1.5rem 0'"] {
            padding: 1rem 0 !important;
          }
          
          div[style*="padding: '2rem 0'"] {
            padding: 1.25rem 0 !important;
          }
          
          div[style*="padding: '1rem 0'"] {
            padding: 0.75rem 0 !important;
          }
          
          /* Brunch Menu Container */
          div[style*="backgroundColor: '#FFFCF8'"][style*="padding: '1rem 0'"] {
            padding: 1rem 0.5rem !important;
          }
          
          /* Brunch Menu Divider */
          .brunch-menu-grid + div + div {
            margin-bottom: 2rem !important;
          }
          
          /* Brunch Image Container */
          .brunch-menu-grid > div:last-child {
            margin-top: 0 !important;
          }
          
          .brunch-menu-grid img {
            max-height: 220px !important;
            object-fit: cover !important;
          }
          
          /* iOS Safari Touch Improvements */
          button, a, label {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            touch-action: manipulation;
            -webkit-transform: translateZ(0);
            min-height: 44px;
            min-width: 44px;
          }
          
          input[type="radio"],
          input[type="checkbox"] {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
        }
        
        
        /* Small Tablet / Large Phone */
        @media (max-width: 640px) and (min-width: 481px) {
          /* Product Grid */
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1rem !important;
          }
          
          /* Typography */
          h1 {
            font-size: 30px !important;
          }
          
          h2 {
            font-size: 17px !important;
          }
          
          /* Category Navigation - All 4 visible */
          .category-navigation {
            flex-wrap: nowrap !important;
            gap: 0.375rem !important;
            padding: 0 0.375rem !important;
            justify-content: space-between !important;
          }
          
          .category-item {
            min-width: 0 !important;
            flex: 1 1 23% !important;
            padding: 0.75rem 0.25rem !important;
            max-width: 25% !important;
          }
          
          .category-item div {
            width: 48px !important;
            height: 48px !important;
          }
          
          .category-item span {
            font-size: 11px !important;
            line-height: 1.15 !important;
          }
          
          /* Page Title & Category Navigation - 640px */
          div[style*="padding: '2rem 0 1rem 0'"] {
            padding: 1.375rem 0 0.625rem 0 !important;
          }
          
          div[style*="padding: '1.5rem 0'"] {
            padding: 1.125rem 0 !important;
          }
          
          /* Sort By Button - 640px */
          div:has(button[data-sort-menu]) {
            padding: 0 0.5rem !important;
          }
          
          button[data-sort-menu] {
            padding: 0.5rem 1.125rem !important;
            font-size: 12.5px !important;
          }
          
          /* Product Add to Cart Button - 640px */
          .product-grid > div > div:first-child > button {
            width: 33px !important;
            height: 33px !important;
            background-color: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 3px 10px rgba(0,0,0,0.38) !important;
            border: 1.5px solid rgba(0, 0, 0, 0.22) !important;
          }
          
          .product-grid > div > div:first-child > button svg {
            width: 16px !important;
            height: 16px !important;
            color: #1A1A1A !important;
            fill: #1A1A1A !important;
          }
          
          .product-grid > div > div:first-child > button svg path {
            fill: #1A1A1A !important;
          }
          
          /* Lunch Options - 2 columns for this range */
          .lunch-options-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1.25rem !important;
          }
          
          /* Brunch Menu Styles for 640px */
          .brunch-menu-grid {
            gap: 1.375rem !important;
          }
          
          .brunch-menu-content > div {
            margin-bottom: 0.625rem !important;
          }
          
          .brunch-menu-content h3 {
            font-size: 14.5px !important;
          }
          
          .brunch-menu-content p {
            font-size: 11.5px !important;
          }
          
          .brunch-menu-content label span {
            font-size: 12.5px !important;
          }
          
          .brunch-menu-grid > div:last-child > div:first-child {
            max-height: 210px !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Product Grid - KEEP 2 columns even on smallest screens */
          .product-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.75rem !important;
            padding: 0 0.5rem !important;
          }
          
          /* Product Card Adjustments */
          .product-grid > div {
            border-radius: 0.5rem !important;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08) !important;
          }
          
          .product-grid > div > div:first-child {
            height: 180px !important;
          }
          
          .product-grid > div > div:nth-child(2) {
            padding: 0.625rem !important;
          }
          
          .product-grid h3 {
            font-size: 0.8125rem !important;
            line-height: 1.2 !important;
            margin-bottom: 0.125rem !important;
          }
          
          .product-grid p {
            font-size: 0.6875rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          .product-grid span {
            font-size: 0.875rem !important;
          }
          
          /* Product Add to Cart Button */
          .product-grid > div > div:first-child > button {
            width: 32px !important;
            height: 32px !important;
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            background-color: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 3px 10px rgba(0,0,0,0.4) !important;
            border: 1.5px solid rgba(0, 0, 0, 0.25) !important;
          }
          
          .product-grid > div > div:first-child > button svg {
            width: 16px !important;
            height: 16px !important;
            color: #1A1A1A !important;
            fill: #1A1A1A !important;
          }
          
          .product-grid > div > div:first-child > button svg path {
            fill: #1A1A1A !important;
          }
          
          /* Sort By Button */
          div:has(button[data-sort-menu]) {
            padding: 0 0.5rem !important;
          }
          
          button[data-sort-menu] {
            padding: 0.5rem 1rem !important;
            font-size: 12px !important;
            border-radius: 18px !important;
            min-height: 36px !important;
          }
          
          button[data-sort-menu] span {
            font-size: 14px !important;
          }
          
          /* View More Button Container */
          div[style*="marginTop: '3rem'"] {
            margin-top: 2rem !important;
            padding: 0 0.5rem !important;
          }
          
          /* Page Title Section */
          div[style*="padding: '2rem 0 1rem 0'"] {
            padding: 1.25rem 0 0.625rem 0 !important;
          }
          
          /* Hero Section */
          .hero-padding {
            padding: 3rem 0 1.5rem !important;
          }
          
          .hero-padding h1 {
            font-size: 26px !important;
          }
          
          .hero-padding p {
            font-size: 15px !important; 
          }
          
          /* Filter Buttons */
          .filter-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          
          /* Typography */
          h1 {
            font-size: 26px !important;
            margin-bottom: 0 !important;
            padding: 0 0.75rem !important;
          }
          
          /* Category Navigation Spacing */
          div[style*="padding: '1.5rem 0'"] {
            padding: 0.875rem 0 !important;
          }
          
          h2 {
            font-size: 16px !important;
          }
          
          h3 {
            font-size: 15px !important;
          }
          
          h4 {
            font-size: 12px !important;
          }
          
          /* Category Navigation - All 4 visible in one row */
          .category-navigation {
            flex-wrap: nowrap !important;
            gap: 0.375rem !important;
            padding: 0 0.375rem !important;
            justify-content: space-between !important;
          }
          
          .category-item {
            min-width: 0 !important;
            flex: 1 1 24% !important;
            padding: 0.625rem 0.25rem !important;
            max-width: 25% !important;
          }
          
          .category-item div {
            width: 45px !important;
            height: 45px !important;
            margin: 0 auto !important;
          }
          
          .category-item span {
            font-size: 10px !important;
            line-height: 1.15 !important;
            word-break: break-word !important;
          }
          
          /* Brunch Menu Spacing */
          .brunch-menu-grid {
            gap: 1.25rem !important;
            padding: 0 !important;
          }
          
          .brunch-menu-content {
            gap: 1rem !important;
          }
          
          /* Brunch Menu Items */
          .brunch-menu-content > div {
            margin-bottom: 0.625rem !important;
          }
          
          .brunch-menu-content h3 {
            font-size: 14px !important;
            margin-bottom: 0.325rem !important;
          }
          
          .brunch-menu-content p {
            font-size: 11px !important;
            margin-bottom: 0.425rem !important;
          }
          
          /* Brunch Menu Labels - Smaller */
          .brunch-menu-content label {
            padding: 0.3rem 0.425rem !important;
            gap: 0.375rem !important;
          }
          
          .brunch-menu-content label span {
            font-size: 12px !important;
            line-height: 1.3 !important;
          }
          
          .brunch-menu-content input[type="radio"] {
            width: 13px !important;
            height: 13px !important;
          }
          
          /* Brunch Image Container */
          .brunch-menu-grid > div:last-child > div:first-child {
            max-height: 200px !important;
            border-radius: 6px !important;
          }
          
          /* Brunch Add to Cart Button */
          .brunch-menu-grid button {
            padding: 0.625rem 1rem !important;
            font-size: 13px !important;
          }
          
          /* Brunch Menu Title */
          div[style*="backgroundColor: '#FFFCF8'"] h2 {
            font-size: 16px !important;
            margin-bottom: 0.75rem !important;
          }
          
          /* Brunch Price Text */
          div[style*="marginBottom: '3rem'"] {
            margin-bottom: 1.5rem !important;
          }
          
          div[style*="marginBottom: '3rem'"] span {
            font-size: 14px !important;
          }
          
          /* Brunch Divider Line */
          div[style*="maxWidth: '800px'"][style*="height: '2px'"] {
            margin-bottom: 0.75rem !important;
          }
          
          /* Radio/Checkbox Labels */
          label {
            padding: 0.25rem 0.375rem !important;
          }
          
          label span {
            font-size: 14px !important;
          }
          
          /* Buttons */
          button {
            font-size: 14px !important;
            padding: 0.625rem 1.25rem !important;
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            touch-action: manipulation;
          }
          
          /* Lunch Options Grid */
          .lunch-options-grid {
            gap: 1.25rem !important;
            padding: 0 0.25rem !important;
          }
          
          /* Lunch Option Cards */
          .lunch-options-grid > div {
            padding: 1rem !important;
            border-radius: 8px !important;
          }
          
          .lunch-options-grid h3 {
            font-size: 16px !important;
          }
          
          .lunch-options-grid h4 {
            font-size: 12.5px !important;
          }
          
          .lunch-options-grid p {
            font-size: 11px !important;
          }
          
          /* View More Button Container */
          div[style*="display: flex"][style*="justify-content: center"] {
            padding: 0 1rem !important;
          }
          
          /* Container Paddings */
          div[style*="maxWidth: '1140px'"] {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
          }
          
          /* Brunch Image */
          .brunch-menu-grid > div:last-child > div:first-child {
            max-height: 220px !important;
          }
          
          /* Section Spacing */
          div[style*="padding: '1rem 0'"] {
            padding: 0.75rem 0 !important;
          }
          
          /* Breadcrumbs */
          div[style*="borderBottom"] {
            padding: 0.75rem 0 !important;
          }
          
          /* Price Text */
          span[style*="fontSize: '17.6px'"] {
            font-size: 15px !important;
          }
          
          /* Lunch Description Section */
          div[style*="maxWidth: '800px'"] {
            padding: 0 1rem !important;
          }
          
          div[style*="maxWidth: '800px'"] h3 {
            font-size: 18px !important;
          }
          
          div[style*="maxWidth: '800px'"] p {
            font-size: 15px !important;
            line-height: 1.5 !important;
          }
        }
        
        /* Mobile Landscape Orientation */
        @media (max-height: 500px) and (orientation: landscape) {
          /* Reduce vertical spacing in landscape */
          h1 {
            font-size: 24px !important;
            margin-bottom: 0.75rem !important;
          }
          
          h2 {
            font-size: 16px !important;
            margin-bottom: 0.5rem !important;
          }
          
          .category-navigation {
            gap: 0.5rem !important;
            padding: 0.5rem 0 !important;
          }
          
          .category-item {
            padding: 0.5rem !important;
            min-width: 80px !important;
          }
          
          .category-item div {
            width: 40px !important;
            height: 40px !important;
          }
          
          .category-item span {
            font-size: 11px !important;
          }
          
          div[style*="padding: '2rem 0'"] {
            padding: 1rem 0 !important;
          }
          
          div[style*="padding: '1.5rem 0'"] {
            padding: 0.75rem 0 !important;
          }
          
          .product-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          
          .brunch-menu-grid {
            gap: 1rem !important;
          }
          
          .lunch-options-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        
        /* Extra Small Screens */
        @media (max-width: 360px) {
          h1 {
            font-size: 24px !important;
          }
          
          /* Page Title Section */
          div[style*="padding: '2rem 0 1rem 0'"] {
            padding: 1rem 0 0.5rem 0 !important;
          }
          
          /* Category Navigation Spacing */
          div[style*="padding: '1.5rem 0'"] {
            padding: 0.75rem 0 !important;
          }
          
          .category-item {
            min-width: 0 !important;
            flex: 1 1 24% !important;
            padding: 0.5rem 0.125rem !important;
            max-width: 25% !important;
          }
          
          .category-item div {
            width: 40px !important;
            height: 40px !important;
            margin: 0 auto !important;
          }
          
          .category-item span {
            font-size: 9px !important;
            line-height: 1.1 !important;
            word-break: break-word !important;
          }
          
          .product-grid {
            gap: 0.625rem !important;
          }
          
          .product-grid > div > div:first-child {
            height: 160px !important;
          }
          
          .product-grid h3 {
            font-size: 0.75rem !important;
          }
          
          .product-grid p {
            font-size: 0.625rem !important;
          }
          
          .product-grid span {
            font-size: 0.8125rem !important;
          }
          
          /* Product Add to Cart Button - 360px */
          .product-grid > div > div:first-child > button {
            width: 30px !important;
            height: 30px !important;
            bottom: 0.5rem !important;
            right: 0.5rem !important;
            background-color: rgba(255, 255, 255, 0.95) !important;
            box-shadow: 0 3px 10px rgba(0,0,0,0.45) !important;
            border: 1.5px solid rgba(0, 0, 0, 0.3) !important;
          }
          
          .product-grid > div > div:first-child > button svg {
            width: 15px !important;
            height: 15px !important;
            color: #1A1A1A !important;
            fill: #1A1A1A !important;
          }
          
          .product-grid > div > div:first-child > button svg path {
            fill: #1A1A1A !important;
          }
          
          button {
            font-size: 13px !important;
            padding: 0.5rem 1rem !important;
          }
          
          /* Sort By Button - Extra Small */
          div:has(button[data-sort-menu]) {
            padding: 0 0.375rem !important;
          }
          
          button[data-sort-menu] {
            padding: 0.425rem 0.875rem !important;
            font-size: 11.5px !important;
            border-radius: 16px !important;
          }
          
          button[data-sort-menu] span {
            font-size: 13px !important;
          }
          
          .lunch-options-grid > div {
            padding: 0.875rem !important;
          }
          
          /* Brunch Menu - Extra Small */
          .brunch-menu-grid {
            gap: 1rem !important;
          }
          
          .brunch-menu-content h3 {
            font-size: 13px !important;
          }
          
          .brunch-menu-content p {
            font-size: 10px !important;
          }
          
          .brunch-menu-content label span {
            font-size: 11px !important;
          }
          
          .brunch-menu-content input[type="radio"] {
            width: 12px !important;
            height: 12px !important;
          }
          
          .brunch-menu-grid > div:last-child > div:first-child {
            max-height: 180px !important;
          }
          
          .brunch-menu-grid button {
            font-size: 12px !important;
            padding: 0.5rem 0.875rem !important;
          }
        }
      `}</style>
    </div>
  );
}