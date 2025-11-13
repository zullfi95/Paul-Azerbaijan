"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import CartModal from '../../components/CartModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import FeedbackModal from '../../components/FeedbackModal';
import BrunchMenu from '../../components/catering/BrunchMenu';
import LunchMenu from '../../components/catering/LunchMenu';
import CoffeeBreaksMenu from '../../components/catering/CoffeeBreaksMenu';
import ProductGrid from '../../components/catering/ProductGrid';
import { useCart } from '../../contexts/CartContext';
import { useCartModal } from '../../contexts/CartModalContext';
import { useNotification } from '../../contexts/NotificationContext';
import Image from "next/image";
import styles from './CateringPage.module.css';

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


// Категории меню кейтеринга (вкладки)
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

// Интерфейс для количества по каждой секции Brunch Menu
interface BrunchQuantities {
  canapes: number;
  sandwiches: number;
  wraps: number;
  salads: number;
  desserts: number;
  drinks: number;
}

// Интерфейс для выбранных опций Lunch Menu
interface LunchSelection {
  selectedOption: string | null;
  quantity: number;
}

export default function CateringPage() {
  const router = useRouter();
  const t = useTranslations();
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

  // Состояние для количества по каждой секции Brunch Menu
  const [brunchQuantities, setBrunchQuantities] = useState<BrunchQuantities>({
    canapes: 11,
    sandwiches: 11,
    wraps: 11,
    salads: 11,
    desserts: 11,
    drinks: 11
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

  const updateBrunchQuantity = (category: keyof BrunchQuantities, quantity: number) => {
    if (quantity < 1) return;
    setBrunchQuantities(prev => ({
      ...prev,
      [category]: quantity
    }));
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
    <div className={styles.container}>
      <Header />
      
      
      <div className={styles.navbarSpacing}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsContainer}>
          <div className={styles.breadcrumbsWrapper}>
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: t('pages.catering.title'), isActive: true }
              ]}
            />
          </div>
        </div>

        {/* Page Title */}
        <div className={styles.pageTitleContainer}>
          <div className={styles.pageTitleWrapper}>
            <h1 className={styles.pageTitle}>
              {t('pages.catering.title')}
            </h1>
          </div>
        </div>

        {/* Category Navigation with Sort Button */}
        <div className={styles.categoryNavigationContainer}>
          <div className={styles.categoryNavigationWrapper}>
            <div className={styles.categoryTabsRow}>
              <div className={styles.categoryNavigation}>
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className={`${styles.categoryItem} ${selectedCategory === category.name ? styles.categoryItemActive : ''} ${category.name === 'Sets' ? styles.categoryItemSets : ''}`}
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className={styles.categoryIcon}>
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
                    <span className={`${styles.categoryName} ${selectedCategory === category.name ? styles.categoryNameActive : ''}`}>
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Sort By Button */}
              <button 
                onClick={() => setShowSortMenu(!showSortMenu)}
                data-sort-menu
                className={styles.sortButton}
              >
                {t('pages.catering.sortBy')}
                <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1' }}>...</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className={styles.contentContainer}>
          <div className={styles.contentWrapper}>
            
            {/* Brunch Menu Section */}
            {selectedCategory === 'Brunch Menu' && (
              <BrunchMenu
                brunchSelections={brunchSelections}
                brunchQuantities={brunchQuantities}
                onSelectionChange={toggleBrunchSelection}
                onQuantityChange={updateBrunchQuantity}
                onAddToCart={addBrunchToCart}
                getTotalSelectedItems={getTotalSelectedItems}
              />
            )}

            {/* Lunch Menu Section */}
            {selectedCategory === 'Lunch Menu' && (
              <LunchMenu
                lunchSelections={lunchSelections}
                lunchChoices={lunchChoices}
                onLunchOptionToggle={toggleLunchOption}
                onLunchQuantityUpdate={updateLunchQuantity}
                onLunchChoiceToggle={toggleLunchChoice}
                onLunchChoiceToggleExclusive={toggleLunchChoiceExclusive}
                onAddToCart={addLunchToCart}
              />
            )}

            {/* Coffee Breaks & Afternoon Teas Section */}
            {selectedCategory === 'Coffee Breaks & Afternoon Teas' && (
              <CoffeeBreaksMenu 
                onAddToCart={addToCart}
              />
            )}

            {/* Product Grid - Sets only */}
            {selectedCategory && selectedCategory === 'Sets' && (
              <ProductGrid 
                items={sortedItems}
                onAddToCart={addToCart}
              />
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
    </div>
  );
}