"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import BasketIcon from '../../components/BasketIcon';
import CartModal from '../../components/CartModal';
import { useCart } from '../../contexts/CartContext';
import { useCartModal } from '../../contexts/CartModalContext';
import { useNotification } from '../../contexts/NotificationContext';
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  isSet: boolean;
  persons?: number;
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Stuffed croissants, perfect bites',
    description: '20 pcs',
    price: 40,
    image: '/images/menuitem1.png',
    category: 'Savory filled pastries and quiche',
    available: true,
    isSet: false
  },
  {
    id: '2',
    name: 'Mini eclairs, savory delights',
    description: '6 pcs',
    price: 20,
    image: '/images/menuitem2.png',
    category: 'Savory filled pastries and quiche',
    available: true,
    isSet: false
  },
  {
    id: '3',
    name: 'Fruit tarts, sweet treats',
    description: '25 pcs',
    price: 50,
    image: '/images/menuitem3.png',
    category: 'Desserts and cakes',
    available: true,
    isSet: false
  },
  {
    id: '4',
    name: 'Creamy sweet croissants',
    description: '12 pcs',
    price: 80,
    image: '/images/menuitem4.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false
  },
  {
    id: '5',
    name: 'Stuffed croissants, perfect bites',
    description: '20 pcs',
    price: 40,
    image: '/images/menuitem1.png',
    category: 'Savory filled pastries and quiche',
    available: true,
    isSet: false
  },
  {
    id: '6',
    name: 'Mini eclairs, savory delights',
    description: '6 pcs',
    price: 20,
    image: '/images/menuitem2.png',
    category: 'Savory filled pastries and quiche',
    available: true,
    isSet: false
  },
  {
    id: '7',
    name: 'Fruit tarts, sweet treats',
    description: '25 pcs',
    price: 50,
    image: '/images/menuitem3.png',
    category: 'Desserts and cakes',
    available: true,
    isSet: false
  },
  {
    id: '8',
    name: 'Creamy sweet croissants',
    description: '12 pcs',
    price: 80,
    image: '/images/menuitem4.png',
    category: 'Sweet French pastries',
    available: true,
    isSet: false
  }
];

const categories = [
  { name: 'Savory filled pastries and quiche', icon: '🥐', image: '/images/category4.png' },
  { name: 'SavBread and savoury pastries', icon: '🍞', image: '/images/category5.png' },
  { name: 'Sweet French pastries', icon: '🥖', image: '/images/category3.png' },
  { name: 'Desserts and cakes', icon: '🍰', image: '/images/category2.png' },
  { name: 'Macaroons', icon: '🍪', image: '/images/category1.png' }
];

export default function CateringPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { showNotification } = useNotification();

  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const sortedItems = [...filteredItems].sort((a, b) => {
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

  const addToCart = (item: MenuItem) => {
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
      // Check if the click is outside the sort menu
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
    <div style={{ minHeight: '100vh' }}>
      <Header />
      
      <div className="navbar-spacing" style={{ paddingTop: '10px' }}>
        {/* Breadcrumbs */}
        <div style={{
          padding: '1rem 0',
          backgroundColor: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
          <div className="container-paul">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <span 
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => router.push('/')}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1A1A1A'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Home
              </span>
              <span>/</span>
              <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Catering Menu</span>
            </div>
          </div>
              </div>

        {/* Category Navigation */}
              <div style={{
          padding: '1.5rem 0',
          backgroundColor: 'white'
        }}>
          <div className="container-paul">
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
              gap: '1rem',
                  justifyContent: 'center'
            }}>
              {categories.map((category) => (
                <div
                  key={category.name}
                      style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1.5rem',
                    backgroundColor: 'transparent',
                    borderRadius: '0.5rem',
                        cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    minWidth: '140px'
                  }}
                  onClick={() => setSelectedCategory(category.name)}
                      onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={60}
                      height={60}
                      style={{
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    lineHeight: '1.2',
                    color: '#4A4A4A',
                    fontWeight: 500
                  }}>
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
                </div>

        {/* Page Title and Sort Button */}
        <div style={{
          padding: '2rem 0',
          backgroundColor: 'white'
        }}>
          <div className="container-paul">
                <div style={{
                  display: 'flex',
              justifyContent: 'space-between',
                  alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontFamily: '"Sabon Next LT Pro", "Playfair Display", serif',
                color: '#1A1A1A',
                margin: 0
              }}>
                Catering Menu
              </h1>
              <div style={{ position: 'relative' }} data-sort-menu>
                <button 
                    style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#F5F5F0',
                    color: '#4A4A4A',
                    border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    fontWeight: 500,
                      cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E8D5B7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F0';
                  }}
                >
                  SORT BY
                  <span>⋯</span>
                </button>
                
                {showSortMenu && (
            <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
              backgroundColor: 'white',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    minWidth: '150px'
                  }}>
                    {[
                      { value: 'name', label: 'Name A-Z' },
                      { value: 'price-low', label: 'Price Low to High' },
                      { value: 'price-high', label: 'Price High to Low' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortMenu(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          backgroundColor: sortBy === option.value ? '#F5F5F0' : 'transparent',
                color: '#4A4A4A',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (sortBy !== option.value) {
                            e.currentTarget.style.backgroundColor = '#F5F5F0';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (sortBy !== option.value) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Product Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem'
            }} className="product-grid">
              {sortedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Product Image */}
                  <div 
                    style={{
                    height: '250px',
                    backgroundColor: '#F5F5F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/product/${item.id}`)}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      layout="fill"
                      style={{
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(item);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1rem',
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'white',
                        color: '#1A1A1A',
                        border: '1px solid #E5E7EB',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '1.25rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#D1D5DB';
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                    >
                      <BasketIcon size={20} />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div style={{ padding: '0.75rem' }}>
                    <h3 style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#1A1A1A',
                      marginBottom: '0.25rem',
                      lineHeight: '1.3'
                    }}>
                      {item.name}
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      fontSize: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      {item.description}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#1A1A1A'
                      }}>
                        {item.price} ₼
                      </span>
                    </div>
                  </div>
                </div>
              ))}
                    </div>

            {/* View More Button */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '3rem'
            }}>
              <button style={{
                padding: '1rem 2rem',
                              backgroundColor: '#1A1A1A',
                              color: 'white',
                              border: 'none',
                              borderRadius: '0.5rem',
                fontSize: '1rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Sabon Next LT Pro", "Playfair Display", serif'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#D4AF37';
                              e.currentTarget.style.color = '#1A1A1A';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1A1A1A';
                              e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                View More
                              </button>
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

      {/* Стили для анимаций */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        * {
          font-family: "Sabon Next LT Pro", "Playfair Display", serif;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        .btn-hover {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        
        .filter-active {
          animation: pulse 2s infinite;
        }
        
        .cart-badge {
          animation: bounce 1s ease-in-out;
        }
        
        .mobile-hidden {
          display: block;
        }
        
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        
        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .container-paul {
            padding: 0 1rem;
          }
          
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          h1 {
            font-size: 2rem !important;
          }
          
          h2 {
            font-size: 1.5rem !important;
          }
          
          .mobile-stack {
            flex-direction: column;
          }
          
          .mobile-full {
            width: 100%;
          }
          
          .mobile-hidden {
            display: none;
          }
        }
        
        
        @media (max-width: 480px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          
          .hero-padding {
            padding: 4rem 0 2rem;
          }
          
          .filter-buttons {
            flex-direction: column;
            align-items: stretch;
          }
          
          .hero-padding h1 {
            font-size: 1.75rem !important;
          }
          
          .hero-padding p {
            font-size: 1rem !important; 
          }
        }
      `}</style>
    </div>
  );
}
