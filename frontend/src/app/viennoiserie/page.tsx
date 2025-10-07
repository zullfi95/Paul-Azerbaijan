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
import styles from './ViennoiseriePage.module.css';

interface Viennoiserie {
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

const viennoiserie: Viennoiserie[] = [
  {
    id: 'v1',
    name: 'Classic Croissant',
    description: 'Buttery French croissant',
    price: 3.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'v2',
    name: 'Chocolate Croissant',
    description: 'Croissant with chocolate filling',
    price: 4.50,
    image: '/images/Viennoiserie2.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'v3',
    name: 'Almond Croissant',
    description: 'Croissant with almond cream',
    price: 5.00,
    image: '/images/Viennoiserie3.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v4',
    name: 'Pain au Chocolat',
    description: 'Chocolate-filled pastry',
    price: 4.00,
    image: '/images/Viennoiserie4.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'v5',
    name: 'Danish Pastry',
    description: 'Sweet layered pastry',
    price: 4.50,
    image: '/images/Viennoiserie1.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v6',
    name: 'Apple Danish',
    description: 'Danish with apple filling',
    price: 5.50,
    image: '/images/Viennoiserie2.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'v7',
    name: 'Cheese Danish',
    description: 'Danish with cream cheese',
    price: 5.00,
    image: '/images/Savoury (2).jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v8',
    name: 'Cinnamon Roll',
    description: 'Sweet cinnamon pastry',
    price: 4.50,
    image: '/images/Viennoiserie4.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'v9',
    name: 'Brioche',
    description: 'Rich French bread',
    price: 3.50,
    image: '/images/Savoury (3).jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v10',
    name: 'Chocolate Brioche',
    description: 'Brioche with chocolate chips',
    price: 4.00,
    image: '/images/Viennoiserie2.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'v11',
    name: 'Raspberry Danish',
    description: 'Danish with raspberry filling',
    price: 5.50,
    image: '/images/Viennoiserie3.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v12',
    name: 'Pecan Roll',
    description: 'Sweet roll with pecans',
    price: 5.00,
    image: '/images/Viennoiserie4.png',
    category: 'Sweet French pastries',
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

export default function ViennoiseriePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredViennoiserie = selectedCategory === 'All' 
    ? viennoiserie 
    : viennoiserie.filter(item => item.category === selectedCategory);

  const sortedViennoiserie = [...filteredViennoiserie].sort((a, b) => {
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

  const addToCart = (item: Viennoiserie) => {
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
    <div className={styles.viennoiseriePage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Viennoiserie', isActive: true }
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
                 Viennoiserie
              </h1>
              <button className={styles.filterButton}>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
              </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {sortedViennoiserie.map((item) => (
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
                      className={styles.addToCartBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
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
      <div>
        <button
          className={styles.feedbackButton}
          onClick={() => setShowFeedback(!showFeedback)}
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
                className={styles.feedbackModalClose}
                onClick={() => setShowFeedback(false)}
              >
                ×
              </button>
            </div>
            <textarea
              className={styles.feedbackTextarea}
              placeholder="Tell us about your experience with our viennoiserie..."
            />
            <button className={styles.feedbackSubmit}>
              Submit Feedback
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
