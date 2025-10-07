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
    image: '/images/Patisserie1.jpg',
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
    image: '/images/Patisserie3.jpg',
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
    image: '/images/Patisserie1.jpg',
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
    image: '/images/Patisserie3.jpg',
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
    image: '/images/Patisserie1.jpg',
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
    image: '/images/Patisserie3.jpg',
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

const categories = [
  { name: 'Savoury', icon: '🥐', image: '/images/category4.png' },
  { name: 'Sweet French pastries', icon: '🥖', image: '/images/category3.png' },
  { name: 'Pies and cakes', icon: '🍞', image: '/images/category5.png' },
  { name: 'Macarons', icon: '🧁', image: '/images/category2.png' }
];

export default function PatisseriePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredPatisserie = selectedCategory === 'All' 
    ? patisserie 
    : patisserie.filter(item => item.category === selectedCategory);

  const sortedPatisserie = [...filteredPatisserie].sort((a, b) => {
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

  const addToCart = (item: Patisserie) => {
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
              {sortedPatisserie.map((item) => (
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
              placeholder="Tell us about your experience with our patisserie..."
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
