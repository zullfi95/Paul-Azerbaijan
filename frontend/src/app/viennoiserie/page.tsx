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
    image: '/images/Viennoiserie1.png',
    category: 'Sweet French pastries',
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
    image: '/images/Viennoiserie1.png',
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
    image: '/images/Viennoiserie3.png',
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
    image: '/images/Viennoiserie4.png',
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
    image: '/images/Viennoiserie1.png',
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
    image: '/images/Viennoiserie2.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v8',
    name: 'Cinnamon Roll',
    description: 'Sweet cinnamon pastry',
    price: 4.50,
    image: '/images/Viennoiserie3.png',
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
    image: '/images/Viennoiserie4.png',
    category: 'Sweet French pastries',

    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'v10',
    name: 'Chocolate Brioche',
    description: 'Brioche with chocolate chips',
    price: 4.00,
    image: '/images/Viennoiserie1.png',
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
    image: '/images/Viennoiserie2.png',
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
    image: '/images/Viennoiserie3.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  }
];


export default function ViennoiseriePage() {
  const router = useRouter();
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8); // Показываем первые 8 элементов
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10 });
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  // Filter and sort viennoiserie
  const filteredViennoiserie = viennoiserie.filter(item => {
    const priceMatch = item.price >= priceRange.min && item.price <= priceRange.max;
    return priceMatch;
  });

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

  const displayedViennoiserie = sortedViennoiserie.slice(0, visibleItems);
  const hasMoreItems = visibleItems < sortedViennoiserie.length;

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 8, sortedViennoiserie.length));
  };

  const clearFilters = () => {
    setPriceRange({ min: 0, max: 10 });
    setVisibleItems(8);
  };

  // Reset visible items when filters change
  React.useEffect(() => {
    setVisibleItems(8);
  }, [priceRange]);

  const addToCart = (item: Viennoiserie) => {
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
      if (!(event.target as Element).closest('[data-filter-menu]')) {
        setShowFilterMenu(false);
      }
    };

    if (showSortMenu || showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu, showFilterMenu]);

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




        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>
                 Viennoiserie
              </h1>
              
              <div className={styles.filterContainer} data-filter-menu>
                <button 
                  className={styles.filterButton}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  Filter
                  <span className={styles.filterButtonIcon}>⋯</span>
                </button>
                
                {showFilterMenu && (
                  <div className={styles.filterMenu}>
                    <div className={styles.filterSection}>
                      <h4>Price Range</h4>
                      <div className={styles.priceRange}>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                        />
                        <span>₼{priceRange.min} - ₼{priceRange.max}</span>
                      </div>
                    </div>
                    
                    <div className={styles.filterActions}>
                      <button onClick={clearFilters} className={styles.clearButton}>
                        Clear All
                      </button>
                      <button onClick={() => setShowFilterMenu(false)} className={styles.applyButton}>
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {displayedViennoiserie.map((item) => (
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
