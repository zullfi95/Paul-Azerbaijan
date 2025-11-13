"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
    image: '/images/cake1.png',
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
    image: '/images/cake2.png',
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
    image: '/images/cake3.png',
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
    image: '/images/cake4.png',
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
    image: '/images/cake1.png',
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
    image: '/images/cake2.png',
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
    image: '/images/cake3.png',
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
    image: '/images/cake4.png',
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
    image: '/images/cake5.jpg',
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
    image: '/images/cake6.jpg',
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
    image: '/images/cake1.png',
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
    image: '/images/cake2.png',
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
    image: '/images/cake3.png',
    category: 'Desserts and cakes',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '16',
    name: 'Apple Pie',
    description: 'Classic American apple pie with cinnamon',
    price: 28,
    image: '/images/pies.jpg',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '17',
    name: 'Cherry Pie',
    description: 'Sweet cherry pie with lattice crust',
    price: 30,
    image: '/images/pies2.png',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '18',
    name: 'Pumpkin Pie',
    description: 'Traditional pumpkin pie with whipped cream',
    price: 32,
    image: '/images/pies.jpg',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '19',
    name: 'Blueberry Pie',
    description: 'Fresh blueberry pie with buttery crust',
    price: 29,
    image: '/images/pies2.png',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '20',
    name: 'Pecan Pie',
    description: 'Rich pecan pie with caramel filling',
    price: 35,
    image: '/images/pies.jpg',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 5
  },
  {
    id: '21',
    name: 'Key Lime Pie',
    description: 'Tangy key lime pie with graham cracker crust',
    price: 31,
    image: '/images/pies2.png',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 4
  },
  {
    id: '22',
    name: 'French Silk Pie',
    description: 'Decadent chocolate silk pie',
    price: 33,
    image: '/images/pies.jpg',
    category: 'Pies',
    available: true,
    isSet: false,
    rating: 5
  }
];


export default function CakesPage() {
  const router = useRouter();
  const t = useTranslations();
  const [sortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleItems, setVisibleItems] = useState(8);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  // Filter and sort cakes
  const filteredCakes = cakes.filter(cake => {
    const priceMatch = cake.price >= priceRange.min && cake.price <= priceRange.max;
    return priceMatch;
  });

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

  const displayedCakes = sortedCakes.slice(0, visibleItems);
  const hasMoreItems = visibleItems < sortedCakes.length;

  const loadMoreItems = () => {
    setVisibleItems(prev => Math.min(prev + 8, sortedCakes.length));
  };

  const clearFilters = () => {
    setPriceRange({ min: 0, max: 100 });
    setVisibleItems(8);
  };

  // Reset visible items when filters change
  React.useEffect(() => {
    setVisibleItems(8);
  }, [priceRange]);

  const addToCart = (cake: Cake) => {
    addItem({
      id: Number(cake.id),
      name: cake.name,
      description: cake.description,
      price: cake.price,
      image: cake.image,
      category: cake.category,
      available: cake.available,
      isSet: cake.isSet,
      persons: cake.persons
    });
    showNotification(t('cart.itemAdded'));
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
    <div className={styles.cakesPage}>
      <Header />
      
      <div className="navbar-spacing">
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbsSection}>
          <div className="container-paul">
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: t('pages.cakes.breadcrumb'), isActive: true }
              ]}
            />
          </div>
        </div>




        {/* Page Title and Sort Button */}
        <div className={styles.pageHeader}>
          <div className="container-paul">
            <div className={styles.pageHeaderContent}>
              <h1 className={styles.pageTitle}>{t('pages.cakes.title')}</h1>
              
              <div className={styles.filterContainer} data-filter-menu>
                <button 
                  className={styles.filterButton}
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                >
                  {t('common.filter')}
                  <span className={styles.filterButtonIcon}>⋯</span>
                </button>
                
                {showFilterMenu && (
                  <div className={styles.filterMenu}>
                    <div className={styles.filterSection}>
                      <h4>{t('pages.cakes.priceRange')}</h4>
                      <div className={styles.priceRange}>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                        />
                        <span>₼{priceRange.min} - ₼{priceRange.max}</span>
                      </div>
                    </div>
                    
                    <div className={styles.filterActions}>
                      <button onClick={clearFilters} className={styles.clearButton}>
                        {t('pages.cakes.clearAll')}
                      </button>
                      <button onClick={() => setShowFilterMenu(false)} className={styles.applyButton}>
                        {t('pages.cakes.apply')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product Grid */}
            <div className={styles.productGrid}>
              {displayedCakes.map((cake) => (
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

            {/* View More Button */}
            {hasMoreItems && (
              <div className={styles.viewMoreContainer}>
                <button 
                  className={styles.viewMoreButton}
                  onClick={loadMoreItems}
                >
                  {t('pages.cakes.viewMore')}
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
