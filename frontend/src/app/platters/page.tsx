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
import styles from './PlattersPage.module.css';

interface Platter {
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

const platters: Platter[] = [
  {
    id: 'pl1',
    name: 'Cheese & Charcuterie Platter',
    description: 'Selection of French cheeses and cured meats',
    price: 45.00,
    image: '/images/Platters1.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 4,
    rating: 5
  },
  {
    id: 'pl2',
    name: 'Mediterranean Platter',
    description: 'Olives, hummus, pita bread, and fresh vegetables',
    price: 35.00,
    image: '/images/Platters2.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 3,
    rating: 4
  },
  {
    id: 'pl3',
    name: 'French Breakfast Platter',
    description: 'Croissants, pastries, jams, and coffee',
    price: 25.00,
    image: '/images/Platters3.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: true,
    persons: 2,
    rating: 5
  },
  {
    id: 'pl4',
    name: 'Seafood Platter',
    description: 'Fresh seafood selection with dipping sauces',
    price: 55.00,
    image: '/images/Platters4.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 4,
    rating: 5
  },
  {
    id: 'pl5',
    name: 'Vegetarian Delight',
    description: 'Fresh vegetables, dips, and artisanal breads',
    price: 30.00,
    image: '/images/Platters1.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 3,
    rating: 4
  },
  {
    id: 'pl6',
    name: 'Dessert Platter',
    description: 'Selection of French pastries and desserts',
    price: 40.00,
    image: '/images/Platters2.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 4,
    rating: 5
  },
  {
    id: 'pl7',
    name: 'Wine & Cheese Pairing',
    description: 'Curated cheese selection with wine recommendations',
    price: 65.00,
    image: '/images/Platters3.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 4,
    rating: 5
  },
  {
    id: 'pl8',
    name: 'Kids Platter',
    description: 'Child-friendly selection of snacks and treats',
    price: 20.00,
    image: '/images/Platters4.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: true,
    persons: 2,
    rating: 4
  },
  {
    id: 'pl9',
    name: 'Artisan Bread Platter',
    description: 'Selection of fresh-baked breads with spreads',
    price: 28.00,
    image: '/images/Platters1.png',
    category: 'Savoury',
    available: true,
    isSet: true,
    persons: 3,
    rating: 5
  },
  {
    id: 'pl10',
    name: 'Holiday Special Platter',
    description: 'Seasonal selection for special occasions',
    price: 50.00,
    image: '/images/Platters2.png',
    category: 'Pies and cakes',
    available: true,
    isSet: true,
    persons: 4,
    rating: 5
  },
  {
    id: 'pl11',
    name: 'Light Bites Platter',
    description: 'Small portions perfect for sharing',
    price: 22.00,
    image: '/images/Platters3.png',
    category: 'Savoury',
    available: true,
    isSet: true,
    persons: 2,
    rating: 4
  },
  {
    id: 'pl12',
    name: 'Premium Selection',
    description: 'Our finest ingredients in one platter',
    price: 75.00,
    image: '/images/Platters4.png',
    category: 'Pies and cakes',
    available: true,
    isSet: true,
    persons: 6,
    rating: 5
  },
  {
    id: 'pl13',
    name: 'Macaron Assortment',
    description: 'Selection of colorful French macarons',
    price: 25.00,
    image: '/images/Macarons1.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 2,
    rating: 5
  },
  {
    id: 'pl14',
    name: 'Premium Macaron Box',
    description: 'Luxury macaron collection with exotic flavors',
    price: 35.00,
    image: '/images/Macarons2.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 3,
    rating: 5
  },
  {
    id: 'pl15',
    name: 'Macaron Gift Set',
    description: 'Elegant macaron presentation for special occasions',
    price: 45.00,
    image: '/images/Macarons3.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 4,
    rating: 5
  },
  {
    id: 'pl16',
    name: 'Deluxe Macaron Platter',
    description: 'Our finest macarons with seasonal flavors',
    price: 55.00,
    image: '/images/Macarons4.png',
    category: 'Macarons',
    available: true,
    isSet: true,
    persons: 5,
    rating: 5
  }
];


export default function PlattersPage() {
  const router = useRouter();
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8); // Показываем первые 8 элементов
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const sortedPlatters = [...platters].sort((a, b) => {
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

  const displayedPlatters = sortedPlatters.slice(0, visibleItems);
  const hasMoreItems = visibleItems < sortedPlatters.length;

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 8, sortedPlatters.length));
  };

  const addToCart = (item: Platter) => {
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
    <div className={styles.plattersPage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Platters', isActive: true }
              ]}
            />
          </div>
        </div>




        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>
                 Platters
              </h1>
              <button className={styles.filterButton}
>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {displayedPlatters.map((item) => (
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
