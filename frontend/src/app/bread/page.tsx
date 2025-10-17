"use client";

import React, { useState } from 'react';
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


export default function BreadPage() {
  const router = useRouter();
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8); // Показываем первые 8 элементов
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const sortedBread = [...bread].sort((a, b) => {
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

  const displayedBread = sortedBread.slice(0, visibleItems);
  const hasMoreItems = visibleItems < sortedBread.length;

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 8, sortedBread.length));
  };

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



        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>
                Breads
              </h1>
              <button className={styles.filterButton}
>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {displayedBread.map((item) => (
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

      {/* Feedback Modal Component */}
      <FeedbackModal />

    </div>
  );
}
