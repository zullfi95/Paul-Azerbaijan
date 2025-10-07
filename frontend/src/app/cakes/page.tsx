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
import styles from './CakesPage.module.css';

interface Cake {
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

const cakes: Cake[] = [
  {
    id: '1',
    name: 'Stuffed croissants, perfect bites',
    description: '20 pcs',
    price: 40,
    image: '/images/cake5.jpg',
    category: 'Savory filled pastries and quiche',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '2',
    name: 'Mini eclairs, savory delights',
    description: '6 pcs',
    price: 20,
    image: '/images/cake6.jpg',
    category: 'Savory filled pastries and quiche',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '3',
    name: 'Fruit tarts, sweet treats',
    description: '25 pcs',
    price: 50,
    image: '/images/pies.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '4',
    name: 'Creamy sweet croissants',
    description: '12 pcs',
    price: 80,
    image: '/images/pies2.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '5',
    name: 'Chocolate cake with macarons',
    description: '1 whole cake',
    price: 45,
    image: '/images/cake5.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '6',
    name: 'Cheesecake with berries',
    description: '1 whole cake',
    price: 35,
    image: '/images/cake6.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '7',
    name: 'Layered raspberry cake',
    description: '1 whole cake',
    price: 42,
    image: '/images/pies.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '8',
    name: 'Vanilla bean cheesecake',
    description: '1 whole cake',
    price: 38,
    image: '/images/pies2.png',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '9',
    name: 'Red velvet cake',
    description: '1 whole cake',
    price: 40,
    image: '/images/cake5.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '10',
    name: 'Lemon meringue pie',
    description: '1 whole pie',
    price: 32,
    image: '/images/cake6.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '11',
    name: 'Opera cake',
    description: '1 whole cake',
    price: 48,
    image: '/images/pies.jpg',
    category: 'Sweet French pastries',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '12',
    name: 'Tiramisu',
    description: '1 whole cake',
    price: 36,
    image: '/images/pies2.png',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '13',
    name: 'Carrot cake',
    description: '1 whole cake',
    price: 34,
    image: '/images/cake5.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '14',
    name: 'Chocolate fudge cake',
    description: '1 whole cake',
    price: 44,
    image: '/images/cake6.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '15',
    name: 'Strawberry shortcake',
    description: '1 whole cake',
    price: 39,
    image: '/images/pies.jpg',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 4
  }
];

const categories = [
  { name: 'Savory filled pastries and quiche', icon: '🥐', image: '/images/category4.png' },
  { name: 'SavBread and savoury pastries', icon: '🍞', image: '/images/category5.png' },
  { name: 'Sweet French pastries', icon: '🥖', image: '/images/category3.png' },
  { name: 'Pies and cakes', icon: '🍰', image: '/images/category2.png' },
  { name: 'Macaroons', icon: '🍪', image: '/images/category1.png' }
];

export default function CakesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredCakes = selectedCategory === 'All' 
    ? cakes 
    : cakes.filter(cake => cake.category === selectedCategory);

  const sortedCakes = [...filteredCakes].sort((a, b) => {
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

  const addToCart = (cake: Cake) => {
    addItem({
      id: cake.id,
      name: cake.name,
      description: cake.description,
      price: cake.price,
      image: cake.image,
      category: cake.category,
      available: cake.available,
      isSet: cake.isSet,
      persons: cake.persons
    });
    showNotification(`${cake.name} səbətə əlavə edildi`);
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
    <div className={styles.cakesPage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Cakes', isActive: true }
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

        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroBackground} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Cakes
            </h1>
            <h2 className={styles.heroTitle}>
              & Pies
            </h2>
          </div>
        </div>

        {/* Hero Divider */}

        {/* Introductory Text */}
        <div className={styles.introSection}>
          <div className="container-paul">
            <p className={styles.introText}>
              PAUL offers an extensive and diverse selection of cakes for all your special occasions, using only the freshest, high-quality ingredients to ensure that your day is truly memorable. We care deeply about making each cake a reflection of your unique celebration, adding a personal touch that makes every bite special.
            </p>
          </div>
        </div>
        <div className={styles.heroDivider} />


        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>

              <button className={styles.filterButton}>
                Filter
                <span className={styles.filterButtonIcon}>⋯</span>
              </button>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {sortedCakes.map((cake) => (
                <div
                  key={cake.id}
                  className={styles.productCard}
                >
                  {/* Product Image */}
                  <div 
                    className={styles.productImage}
                    onClick={() => router.push(`/product/${cake.id}`)}
                  >
                    <Image
                      src={cake.image}
                      alt={cake.name}
                      fill
                    />
                    
                    {/* Add to Cart Button */}
                    <button
                      className={styles.addToCartBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(cake);
                      }}
                    >
                      <BasketIcon size={16} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>
                      {cake.name}
                    </h3>
                    <div className={styles.productPrice}>
                      <span className={styles.priceValue}>
                        {cake.price}
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
              placeholder="Tell us about your experience with our cakes..."
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
