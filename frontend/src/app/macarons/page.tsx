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
import styles from './MacaronsPage.module.css';

interface Macaron {
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

const macarons: Macaron[] = [
  {
    id: 'm1',
    name: 'Vanilla Macaron',
    description: 'Classic vanilla with buttercream',
    price: 2.50,
    image: '/images/Macarons1.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm2',
    name: 'Chocolate Macaron',
    description: 'Rich chocolate ganache filling',
    price: 2.50,
    image: '/images/Macarons2.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm3',
    name: 'Raspberry Macaron',
    description: 'Fresh raspberry with cream',
    price: 2.75,
    image: '/images/Macarons3.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm4',
    name: 'Lemon Macaron',
    description: 'Zesty lemon curd filling',
    price: 2.75,
    image: '/images/Macarons4.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'm5',
    name: 'Pistachio Macaron',
    description: 'Premium pistachio cream',
    price: 3.00,
    image: '/images/Macarons1.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm6',
    name: 'Rose Macaron',
    description: 'Delicate rose petal cream',
    price: 3.00,
    image: '/images/Macarons2.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm7',
    name: 'Salted Caramel Macaron',
    description: 'Sweet and salty perfection',
    price: 2.75,
    image: '/images/Macarons3.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm8',
    name: 'Lavender Macaron',
    description: 'Aromatic lavender cream',
    price: 3.00,
    image: '/images/Macarons4.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'm9',
    name: 'Strawberry Macaron',
    description: 'Fresh strawberry cream',
    price: 2.75,
    image: '/images/Macarons1.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm10',
    name: 'Coffee Macaron',
    description: 'Rich coffee buttercream',
    price: 2.50,
    image: '/images/Macarons2.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'm11',
    name: 'Matcha Macaron',
    description: 'Japanese green tea cream',
    price: 3.00,
    image: '/images/Macarons3.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'm12',
    name: 'Passion Fruit Macaron',
    description: 'Tropical passion fruit cream',
    price: 2.75,
    image: '/images/Macarons4.png',
    category: 'Macarons',
    available: true,
    isSet: false,
    rating: 5
  }
];

const categories = [
  { name: 'Savoury', icon: '🥐', image: '/images/category4.png' },
  { name: 'Sweet French pastries', icon: '🥖', image: '/images/category3.png' },
  { name: 'Pies and cakes', icon: '🍞', image: '/images/category5.png' },
  { name: 'Macarons', icon: '🧁', image: '/images/category2.png' }
];

export default function MacaronsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredMacarons = selectedCategory === 'All' 
    ? macarons 
    : macarons.filter(item => item.category === selectedCategory);

  const sortedMacarons = [...filteredMacarons].sort((a, b) => {
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

  const addToCart = (item: Macaron) => {
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
                { label: 'Macarons', isActive: true }
              ]}
            />
          </div>
        </div>

        {/* Category Navigation */}
        <div className={styles.categorySection}>
          <div className="container-paul">
            <div className={styles.categoryNavigation}>
              {categories.map((category) => (
                <div
                  key={category.name}
                  className={styles.categoryItem}
                  onClick={() => setSelectedCategory(category.name)}

                >
                  <div className={styles.categoryIcon}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={60}
                      height={60}
                      className={styles.categoryImage}
                    />
                  </div>
                  <span className={styles.categoryName}>
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>
                 Macarons
              </h1>
              <button className={styles.filterButton}
>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {sortedMacarons.map((item) => (
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
              placeholder="Tell us about your experience with our macarons..."
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
