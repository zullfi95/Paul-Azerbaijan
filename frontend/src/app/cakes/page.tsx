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
  const [sortBy, setSortBy] = useState('name');
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
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFCF8' }}>
      <Header />
      
      <div className="navbar-spacing" style={{ paddingTop: '10px' }}>
        {/* Breadcrumbs */}
        <div style={{
          padding: '1rem 0',
          backgroundColor: '#FFFCF8',
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
              <span style={{ color: '#1A1A1A', fontWeight: 500 }}>Cakes</span>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div style={{
          padding: '1.5rem 0',
          backgroundColor: '#FFFCF8'
        }}>
          <div className="container-paul">
            <div className="category-navigation" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'nowrap'
            }}>
              {categories.map((category) => (
                <div
                  key={category.name}
                  className="category-item"
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
                    minWidth: '140px',
                    flex: '1'
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

        {/* Hero Section */}
        <div style={{
          position: 'relative',
          height: '440px',
          backgroundColor: '#FFFCF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1140px',
          height: '100%',
          backgroundImage: 'url(/images/cakeHero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.9
        }} />
          <div style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'left',
            color: '#FFFAE6',
            paddingLeft: '100px',
            maxWidth: '1140px',
            width: '100%',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: '56px',
              fontFamily: '"Sabon Next LT Pro", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#FFFAE6',
              margin: 0,
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              lineHeight: 'normal'
            }}>
              Cakes
            </h1>
            <h2 style={{
              fontSize: '56px',
              fontFamily: '"Sabon Next LT Pro", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              color: '#FFFAE6',
              margin: 0,
              marginBottom: '20px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              lineHeight: 'normal'
            }}>
              & Pies
            </h2>
          </div>
        </div>

        {/* Introductory Text */}
        <div style={{
          padding: '3rem 0',
          backgroundColor: '#FFFCF8',
          textAlign: 'center'
        }}>
          <div className="container-paul">
            <p style={{
              fontSize: '18px',
              lineHeight: '1.6',
              color: '#000000',
              maxWidth: '859px',
              margin: '0 auto',
              fontFamily: '"Sabon Next LT Pro", serif'
            }}>
              PAUL offers an extensive and diverse selection of cakes for all your special occasions, using only the freshest, high-quality ingredients to ensure that your day is truly memorable. We care deeply about making each cake a reflection of your unique celebration, adding a personal touch that makes every bite special.
            </p>
          </div>
        </div>

        {/* Page Title and Sort Button */}
        <div style={{
          padding: '2rem 0',
          backgroundColor: '#FFFCF8'
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
                Our Cakes
              </h1>
              <button style={{
                padding: '12px 24px',
                backgroundColor: '#000000',
                color: '#FFFAE6',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 400,
                    cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: '"Sabon Next LT Pro", serif',
                    display: 'flex',
                    alignItems: 'center',
                gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                Filter
                <span style={{ fontSize: '12px' }}>⋯</span>
                      </button>
            </div>

            {/* Product Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '24px',
              maxWidth: '1140px',
              margin: '0 auto'
            }} className="product-grid">
              {sortedCakes.map((cake) => (
                <div
                  key={cake.id}
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
                      height: '300px',
                      backgroundColor: '#FFFCF8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}
                    onClick={() => router.push(`/product/${cake.id}`)}
                  >
                    <Image
                      src={cake.image}
                      alt={cake.name}
                      width={300}
                      height={300}
                      style={{
                        objectFit: 'cover'
                      }}
                    />
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(cake);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '15px',
                        right: '15px',
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'white',
                        color: '#000000',
                        border: 'none',
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
                  <div style={{ padding: '15px' }}>
                    <h3 style={{
                      fontSize: '12px',
                      fontWeight: 400,
                      color: 'rgba(0,0,0,0.8)',
                      lineHeight: '1.3',
                      fontFamily: '"Parisine Pro Gris", serif'
                    }}>
                      {cake.name}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                    }}>
                      <span style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000000',
                        fontFamily: '"Parisine Pro Gris", serif'
                      }}>
                        {cake.price}
                      </span>
                      <span style={{
                        fontSize: '16px',
                        color: '#000000',
                        marginLeft: '8px'
                      }}>
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
      <div style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000
      }}>
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            padding: '1rem 0.5rem',
            backgroundColor: '#1A1A1A',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#D4AF37';
            e.currentTarget.style.color = '#1A1A1A';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1A1A1A';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Feedback
        </button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#1A1A1A',
                margin: 0
              }}>
                Leave Your Feedback
              </h3>
              <button
                onClick={() => setShowFeedback(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>
            <textarea
              placeholder="Tell us about your experience with our cakes..."
              style={{
                width: '100%',
                height: '120px',
                padding: '1rem',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical',
                marginBottom: '1rem',
                fontFamily: 'inherit'
              }}
            />
            <button style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#1A1A1A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4AF37';
              e.currentTarget.style.color = '#1A1A1A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A1A';
              e.currentTarget.style.color = 'white';
            }}
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

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
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
        }
        
        @media (max-width: 1200px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr);
          }
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
          
          .category-navigation {
            flex-wrap: wrap !important;
          }
          
          .category-item {
            min-width: 120px !important;
            flex: 0 0 calc(50% - 0.5rem) !important;
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
          
          .category-navigation {
            flex-wrap: wrap !important;
          }
          
          .category-item {
            min-width: 100px !important;
            flex: 0 0 calc(50% - 0.5rem) !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
