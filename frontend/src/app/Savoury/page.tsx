"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import BasketIcon from '../../components/BasketIcon';
import CartModal from '../../components/CartModal';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useCart } from '../../contexts/CartContext';
import { useCartModal } from '../../contexts/CartModalContext';
import { useNotification } from '../../contexts/NotificationContext';
import Image from "next/image";
import styles from './SavouryPage.module.css';

interface Savoury {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  isSet: boolean;
  persons?: number;
  rating?: number;
}

const savoury: Savoury[] = [
  {
    id: 's1',
    name: 'Quiche Lorraine',
    description: 'Classic French quiche with bacon and cheese',
    price: 8.50,
    image: '/images/Savoury3.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's2',
    name: 'Spinach & Feta Quiche',
    description: 'Fresh spinach with creamy feta cheese',
    price: 8.50,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's3',
    name: 'Mushroom & Gruyère Quiche',
    description: 'Sautéed mushrooms with aged Gruyère',
    price: 9.00,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's4',
    name: 'Tomato & Basil Quiche',
    description: 'Sun-dried tomatoes with fresh basil',
    price: 8.75,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 's5',
    name: 'Ham & Cheese Croissant',
    description: 'Buttery croissant with premium ham and Swiss',
    price: 6.50,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's6',
    name: 'Chicken & Pesto Sandwich',
    description: 'Grilled chicken with homemade pesto',
    price: 7.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's7',
    name: 'Smoked Salmon Bagel',
    description: 'Cream cheese with smoked salmon and capers',
    price: 9.50,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's8',
    name: 'Vegetarian Wrap',
    description: 'Fresh vegetables with hummus and tahini',
    price: 7.00,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 's9',
    name: 'Turkey & Avocado Panini',
    description: 'Sliced turkey with avocado and arugula',
    price: 8.25,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's10',
    name: 'Caprese Salad',
    description: 'Fresh mozzarella with tomatoes and basil',
    price: 6.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 's11',
    name: 'Greek Salad Bowl',
    description: 'Mixed greens with feta, olives, and olive oil',
    price: 7.50,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 's12',
    name: 'Mediterranean Wrap',
    description: 'Grilled vegetables with tzatziki sauce',
    price: 7.75,
    image: '/images/Savoury2.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  }
];


export default function SavouryPage() {
  const router = useRouter();
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8); // Показываем первые 8 элементов
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const sortedSavoury = [...savoury].sort((a, b) => {
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

  const displayedSavoury = sortedSavoury.slice(0, visibleItems);
  const hasMoreItems = visibleItems < sortedSavoury.length;

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 8, sortedSavoury.length));
  };

  const addToCart = (item: Savoury) => {
    addItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      images: item.image ? [item.image] : [],
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
    <div className={styles.macaronsPage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Savoury', isActive: true }
              ]}
            />
          </div>
        </div>



        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>
                 Savoury
              </h1>
              <button className={styles.filterButton}
>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {displayedSavoury.map((item) => (
                <div
                  key={item.id}
                  className={styles.productCard}

                >
                  {/* Product Image */}
                  <div 
                    className={styles.productImage}
                    onClick={() => router.push(`/product/${item.id}`)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                        />
                      {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      className={styles.addToCartBtn}

                    >
                      <BasketIcon size={16} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>
                      {item.name}
                    </h3>
                    <div className={styles.productPrice}>
                      <span className={styles.priceValue}>
                        {item.price}
                      </span>
                      <span className={styles.priceCurrency}>
                        ₼
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            {hasMoreItems && (
              <div className={styles.viewMoreContainer}>
                <button 
                  className={styles.viewMoreButton}
                  onClick={loadMoreItems}
                >
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

      {/* Fixed Feedback Button */}
      <div >
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className={styles.feedbackButton}
        >
          Feedback
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className={styles.feedbackModal}>
          <div className={styles.feedbackModalContent}>
            <div className={styles.feedbackModalHeader}>
              <h3 className={styles.feedbackModalTitle}>
                Leave Your Feedback
              </h3>
              <button
                onClick={() => setShowFeedback(false)}
                className={styles.feedbackModalClose}
              >
                ×
              </button>
            </div>
            <textarea
              placeholder="Tell us about your experience with our savoury items..."
              className={styles.feedbackTextarea}
            />
            <button className={styles.feedbackSubmit}>
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Стили для анимаций */}
      
    </div>
  );
}
