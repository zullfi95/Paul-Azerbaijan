"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import Breadcrumbs from '@/components/Breadcrumbs';
import CartModal from '@/components/CartModal';
import { useCart } from '@/contexts/CartContext';
import { useCartModal } from '@/contexts/CartModalContext';
import { useNotification } from '@/contexts/NotificationContext';
import { getApiUrl } from '@/config/api';

interface MenuCategory {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  activeMenuItems?: MenuItem[];
  iiko_id?: string;
  organization_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  currency: string;
  images?: string[];
  allergens?: string[];
  is_available: boolean;
  sort_order: number;
  iiko_id?: string;
  menu_category_id?: number;
  organization_id?: string;
}

export default function ClickCollectPage() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { addItem } = useCart();
  const { isOpen: isCartModalOpen, closeModal } = useCartModal();
  const { showNotification } = useNotification();

  // ID организации Paul Port Baku из iiko
  const organizationId = '6b7715c7-7e4d-421c-aef4-0ad5f8b588e2';

  useEffect(() => {
    if (showMenu) {
      fetchMenu();
    }
  }, [showMenu, organizationId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(getApiUrl(`menu/full?organization_id=${organizationId}`));
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const processedMenu = data.data.map((category: Record<string, string | number | boolean | object>) => ({
          ...category,
          activeMenuItems: Array.isArray(category.active_menu_items || category.activeMenuItems) 
            ? ((category.active_menu_items || category.activeMenuItems) as object[]).map((item: object) => {
                const itemRecord = item as Record<string, string | number | boolean>;
                return {
                  ...itemRecord,
                  price: parseFloat(itemRecord.price as string) || 0,
                  images: Array.isArray(itemRecord.images) ? itemRecord.images : [],
                  allergens: Array.isArray(itemRecord.allergens) ? itemRecord.allergens : (itemRecord.allergens ? [itemRecord.allergens] : [])
                };
              })
            : []
        }));
        
        setMenu(processedMenu);
      } else {
        setError(data.message || 'Failed to load menu');
      }
    } catch (err) {
      setError('Failed to connect to server. Please make sure the backend is running on port 8000.');
      console.error('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // const goToCatering = () => {
  //   router.push('/catering');
  // };

  const goToLocations = () => {
    router.push('/locations');
  };

  const startOrdering = () => {
    setShowMenu(true);
  };

  const handleAddToCart = (item: MenuItem) => {
    const cartItem = {
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      price: item.price,
      image: getMainImage(item.images, item.name),
      category: 'Click & Collect',
      available: item.is_available,
      isSet: false
    };
    
    addItem(cartItem);
    showNotification(`${item.name} добавлен в корзину!`, 'success');
  };

  const getMainImage = (images?: string[], itemName?: string) => {
    if (!images || images.length === 0) {
      const name = itemName?.toLowerCase() || '';
      if (name.includes('milk') || name.includes('juice') || name.includes('coffee') || name.includes('tea') || name.includes('drink')) {
        return '/images/placeholder-drink.svg';
      }
      return '/images/placeholder-food.svg';
    }
    return images[0];
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const filteredMenu = menu.filter(category => {
    if (selectedCategory && category.name !== selectedCategory) {
      return false;
    }
    
    const hasItems = (category.activeMenuItems || []).length > 0;
    if (!hasItems) {
      return false;
    }
    
    if (searchQuery) {
      const hasMatchingItems = (category.activeMenuItems || []).some(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return hasMatchingItems;
    }
    
    return true;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFCF8' }}>
      <Header />
      <CartModal isOpen={isCartModalOpen} onClose={closeModal} />
      
      {/* Breadcrumbs */}
      <div style={{ paddingTop: '80px', paddingBottom: '20px', backgroundColor: '#FFFCF8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Click & Collect', isActive: true }
            ]}
          />
        </div>
      </div>

      {!showMenu ? (
        <>
          {/* Hero Section */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1A1A1A 0%, #4A4A4A 100%)',
            color: 'white',
            padding: '60px 0',
            textAlign: 'center'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                fontFamily: 'Playfair Display, serif'
              }}>
                Click & Collect
              </h1>
              <p style={{ 
                fontSize: '1.25rem', 
                marginBottom: '40px',
                maxWidth: '600px',
                margin: '0 auto 40px',
                lineHeight: '1.6'
              }}>
                Order your favorite PAUL items online and pick them up at your nearest location. 
                Fresh, delicious, and ready when you are.
              </p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={startOrdering}
                  style={{
                    backgroundColor: '#EBDCC8',
                    color: '#1A1A1A',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D4C4A8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#EBDCC8';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  Start Ordering
                </button>
                <button
                  onClick={goToLocations}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'white',
                    padding: '16px 32px',
                    borderRadius: '8px',
                    border: '2px solid white',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#1A1A1A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'white';
                  }}
                >
                  Find Locations
                </button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div style={{ padding: '80px 0', backgroundColor: '#FFFCF8' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
              <h2 style={{ 
                textAlign: 'center', 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                marginBottom: '60px',
                fontFamily: 'Playfair Display, serif',
                color: '#1A1A1A'
              }}>
                Why Choose Click & Collect?
              </h2>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '40px' 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#EBDCC8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '2rem'
                  }}>
                    ⏰
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                    Quick & Easy
                  </h3>
                  <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                    Order in minutes and pick up at your convenience. No waiting in lines.
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#EBDCC8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '2rem'
                  }}>
                    🥐
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                    Fresh Daily
                  </h3>
                  <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                    All items are baked fresh daily using traditional French techniques.
                  </p>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#EBDCC8',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '2rem'
                  }}>
                    📍
                  </div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                    Multiple Locations
                  </h3>
                  <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                    Pick up from any of our convenient locations across the city.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ paddingTop: '80px', paddingBottom: '40px' }}>
          {/* Menu Header */}
          <div style={{ 
            background: 'linear-gradient(135deg, #EBDCC8 0%, #D4C4A8 100%)',
            padding: '40px 0',
            marginBottom: '40px'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#1A1A1A',
                marginBottom: '10px',
                fontFamily: 'Playfair Display, serif'
              }}>
                Our Menu
              </h1>
              <p style={{
                fontSize: '1.1rem',
                color: '#4A4A4A',
                marginBottom: '20px'
              }}>
                Fresh, delicious items ready for pickup
              </p>
              <button
                onClick={() => setShowMenu(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#1A1A1A',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: '2px solid #1A1A1A',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1A1A1A';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#1A1A1A';
                }}
              >
                ← Back to Info
              </button>
            </div>
          </div>

          {/* Menu Content */}
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            {loading && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                fontSize: '18px',
                color: '#6b7280'
              }}>
                Loading menu...
              </div>
            )}

            {error && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                fontSize: '18px',
                color: '#ef4444'
              }}>
                Error: {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {/* Statistics */}
                {menu.length > 0 && (
                  <div style={{
                    marginBottom: '30px',
                    padding: '20px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd',
                    textAlign: 'center'
                  }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1A1A1A', fontSize: '1.2rem' }}>
                      Menu Statistics
                    </h3>
                    <p style={{ margin: '0', color: '#6b7280' }}>
                      <strong>{menu.length}</strong> categories • <strong>{menu.reduce((sum, cat) => sum + (cat.activeMenuItems?.length || 0), 0)}</strong> total items
                    </p>
                  </div>
                )}

                {/* Search and Filter */}
                <div style={{ 
                  marginBottom: '40px',
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <input
                      type="text"
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'border-color 0.3s ease'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#EBDCC8'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      style={{
                        padding: '8px 16px',
                        border: selectedCategory === null ? '2px solid #EBDCC8' : '2px solid #e5e7eb',
                        backgroundColor: selectedCategory === null ? '#EBDCC8' : 'white',
                        borderRadius: '20px',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      All Categories
                    </button>
                    {menu.filter(cat => (cat.activeMenuItems || []).length > 0).map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        style={{
                          padding: '8px 16px',
                          border: selectedCategory === category.name ? '2px solid #EBDCC8' : '2px solid #e5e7eb',
                          backgroundColor: selectedCategory === category.name ? '#EBDCC8' : 'white',
                          borderRadius: '20px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
                  {filteredMenu.map(category => (
                    <div key={category.id}>
                      <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        color: '#1A1A1A',
                        fontFamily: 'Playfair Display, serif',
                        borderBottom: '2px solid #EBDCC8',
                        paddingBottom: '10px'
                      }}>
                        {category.name} 
                        <span style={{
                          fontSize: '1rem',
                          fontWeight: 'normal',
                          color: '#6b7280',
                          marginLeft: '10px'
                        }}>
                          ({(category.activeMenuItems || []).length} items)
                        </span>
                      </h2>
                      
                      {category.description && (
                        <p style={{
                          color: '#6b7280',
                          marginBottom: '30px',
                          fontSize: '16px',
                          lineHeight: '1.6'
                        }}>
                          {category.description}
                        </p>
                      )}

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '25px'
                      }}>
                        {(() => {
                          const items = category.activeMenuItems || [];
                          const filteredItems = items.filter(item => 
                            !searchQuery || 
                            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                          );
                          
                          if (filteredItems.length === 0) {
                            return (
                              <div style={{ 
                                padding: '20px', 
                                textAlign: 'center', 
                                color: '#6b7280',
                                backgroundColor: '#f9fafb',
                                borderRadius: '8px',
                                gridColumn: '1 / -1'
                              }}>
                                No items found in this category
                              </div>
                            );
                          }
                          
                          return filteredItems.map(item => (
                            <div
                              key={item.id}
                              style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: 'white',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                              }}
                            >
                              <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                <Image
                                  src={getMainImage(item.images, item.name)}
                                  alt={item.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/placeholder-food.svg';
                                  }}
                                />
                                {!item.is_available && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    Unavailable
                                  </div>
                                )}
                              </div>
                              
                              <div style={{ padding: '20px' }}>
                                <h3 style={{
                                  fontSize: '1.25rem',
                                  fontWeight: 'bold',
                                  marginBottom: '8px',
                                  color: '#1A1A1A'
                                }}>
                                  {item.name}
                                </h3>
                                
                                {item.description && (
                                  <p style={{
                                    color: '#6b7280',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    marginBottom: '12px'
                                  }}>
                                    {item.description}
                                  </p>
                                )}
                                
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center'
                                }}>
                                  <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold',
                                    color: '#1A1A1A'
                                  }}>
                                    {formatPrice(item.price, item.currency)}
                                  </span>
                                  
                                  <button
                                    onClick={() => handleAddToCart(item)}
                                    disabled={!item.is_available}
                                    style={{
                                      backgroundColor: item.is_available ? '#EBDCC8' : '#e5e7eb',
                                      color: item.is_available ? '#1A1A1A' : '#9ca3af',
                                      border: 'none',
                                      padding: '8px 16px',
                                      borderRadius: '6px',
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      cursor: item.is_available ? 'pointer' : 'not-allowed',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (item.is_available) {
                                        e.currentTarget.style.backgroundColor = '#D4C4A8';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (item.is_available) {
                                        e.currentTarget.style.backgroundColor = '#EBDCC8';
                                      }
                                    }}
                                  >
                                    {item.is_available ? 'Add to Cart' : 'Unavailable'}
                                  </button>
                                </div>
                                
                                {item.allergens && item.allergens.length > 0 && (
                                  <div style={{
                                    marginTop: '12px',
                                    padding: '8px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#92400e'
                                  }}>
                                    <strong>Allergens:</strong> {item.allergens.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMenu.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#6b7280'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No items found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* How it works section */}
      <div style={{ padding: '80px 0', backgroundColor: '#FFFCF8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '60px',
            fontFamily: 'Playfair Display, serif',
            color: '#1A1A1A'
          }}>
            How Click & Collect Works
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '40px' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EBDCC8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1A1A1A'
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Browse & Order
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Browse our menu online and add your favorite PAUL products to your cart
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EBDCC8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1A1A1A'
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Choose Location
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Select your preferred PAUL location for pickup
              </p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#EBDCC8',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#1A1A1A'
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '15px', color: '#1A1A1A' }}>
                Collect & Enjoy
              </h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Pick up your order at the scheduled time and enjoy fresh PAUL products
              </p>
            </div>
          </div>
        </div>
      </div>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
