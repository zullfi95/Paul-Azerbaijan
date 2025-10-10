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
import styles from './PatisseriePage.module.css';

interface Patisserie {
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

const patisserie: Patisserie[] = [
  {
    id: 'p1',
    name: 'Éclair au Chocolat',
    description: 'Classic chocolate éclair',
    price: 4.50,
    image: '/images/Patisserie3.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p2',
    name: 'Éclair à la Vanille',
    description: 'Vanilla cream éclair',
    price: 4.50,
    image: '/images/Patisserie2.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p3',
    name: 'Profiteroles',
    description: 'Cream puffs with chocolate sauce',
    price: 6.00,
    image: '/images/Patisserie2.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p4',
    name: 'Mille-feuille',
    description: 'Napoleon pastry with cream',
    price: 5.50,
    image: '/images/Patisserie4.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p5',
    name: 'Tarte Tatin',
    description: 'Upside-down apple tart',
    price: 7.00,
    image: '/images/Patisserie3.jpg',
    category: 'Pies and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p6',
    name: 'Tarte aux Fruits',
    description: 'Fresh fruit tart',
    price: 6.50,
    image: '/images/Patisserie2.jpg',
    category: 'Pies and cakes',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'p7',
    name: 'Lemon Tart',
    description: 'Tangy lemon curd tart',
    price: 5.50,
    image: '/images/Patisserie2.jpg',
    category: 'Pies and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p8',
    name: 'Chocolate Tart',
    description: 'Rich chocolate ganache tart',
    price: 6.00,
    image: '/images/Patisserie4.jpg',
    category: 'Pies and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p9',
    name: 'Paris-Brest',
    description: 'Choux pastry with praline cream',
    price: 7.50,
    image: '/images/Patisserie3.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p10',
    name: 'Saint-Honoré',
    description: 'Crown of choux with cream',
    price: 8.00,
    image: '/images/Patisserie2.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: 'p11',
    name: 'Religieuse',
    description: 'Nun-shaped choux pastry',
    price: 5.50,
    image: '/images/Patisserie2.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: 'p12',
    name: 'Opéra',
    description: 'Layered coffee and chocolate cake',
    price: 6.50,
    image: '/images/Patisserie4.jpg',
    category: 'Pies and cakes',
    available: true,
    isSet: false,
    rating: 5
  }
];


export default function PatisseriePage() {
  const router = useRouter();
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8); // Показываем первые 8 элементов
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const sortedPatisserie = [...patisserie].sort((a, b) => {
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

  const displayedPatisserie = sortedPatisserie.slice(0, visibleItems);
  const hasMoreItems = visibleItems < sortedPatisserie.length;

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 8, sortedPatisserie.length));
  };

  const addToCart = (item: Patisserie) => {
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
    <div className={styles.patisseriePage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Patisserie', isActive: true }
              ]}
            />
          </div>
        </div>



        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>
                Our Patisserie
              </h1>
              <button className={styles.filterButton}
>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {displayedPatisserie.map((item) => (
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
