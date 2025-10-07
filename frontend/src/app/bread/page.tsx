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
import styles from './BreadPage.module.css';

interface Bread {
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

const bread: Bread[] = [
  {
    id: 'b1',
    name: 'Baguette Tradition',
    description: 'Classic French baguette',
    price: 2.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'b2',
    name: 'Pain de Campagne',
    description: 'Country-style sourdough',
    price: 3.50,
    image: '/images/Savoury (2).jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'b3',
    name: 'Brioche',
    description: 'Rich, buttery bread',
    price: 4.00,
    image: '/images/cake3.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'b4',
    name: 'Pain aux Noix',
    description: 'Walnut bread',
    price: 4.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'b5',
    name: 'Focaccia',
    description: 'Italian herb bread',
    price: 3.00,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'b6',
    name: 'Pain aux Olives',
    description: 'Olive bread',
    price: 4.00,
    image: '/images/Savoury (2).jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'b7',
    name: 'Challah',
    description: 'Traditional Jewish bread',
    price: 3.50,
    image: '/images/Savoury (3).jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'b8',
    name: 'Pain de Mie',
    description: 'Soft sandwich bread',
    price: 2.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'b9',
    name: 'Pain aux Céréales',
    description: 'Multi-grain bread',
    price: 3.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'b10',
    name: 'Pain aux Raisins',
    description: 'Raisin bread',
    price: 4.00,
    image: '/images/cake2.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'b11',
    name: 'Pain de Seigle',
    description: 'Rye bread',
    price: 3.00,
    image: '/images/Savoury (3).jpg',
    category: 'Savoury',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'b12',
    name: 'Pain aux Figues',
    description: 'Fig bread',
    price: 4.50,
    image: '/images/Savoury.jpg',
    category: 'Savoury',
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

export default function BreadPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredBread = selectedCategory === 'All' 
    ? bread 
    : bread.filter(item => item.category === selectedCategory);

  const sortedBread = [...filteredBread].sort((a, b) => {
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

  const addToCart = (item: Bread) => {
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
    <div className={styles.breadPage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Bread', isActive: true }
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
                Our Bread
              </h1>
              <button className={styles.filterButton}
>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {sortedBread.map((item) => (
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
              placeholder="Tell us about your experience with our bread..."
              className={styles.feedbackTextarea}
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
