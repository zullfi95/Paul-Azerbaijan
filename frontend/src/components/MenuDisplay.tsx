"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getApiUrl } from '@/config/api';
import styles from './MenuDisplay.module.css';

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

interface MenuDisplayProps {
  organizationId: string;
}

export default function MenuDisplay({ organizationId }: MenuDisplayProps) {
  const router = useRouter();
  const t = useTranslations();
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      
      // Используем централизованную конфигурацию API
      const url = getApiUrl(`menu/full?organization_id=${organizationId}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
          if (data.success && Array.isArray(data.data)) {
            setMenu(data.data);
      } else {
        setError(data.message || 'Failed to load menu');
      }
    } catch (err) {
      setError('Failed to connect to server. Please check your connection.');
      console.error('Menu fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchMenu();
  }, [organizationId, fetchMenu]);

  const filteredMenu = menu.filter(category => {
    if (selectedCategory && category.name !== selectedCategory) {
      return false;
    }
    
    // Показываем только категории с элементами меню
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

  const formatPrice = (price: number, currency: string) => {
    return `${price.toFixed(2)} ${currency}`;
  };

  const getMainImage = (images?: string[], itemName?: string) => {
    if (!images || images.length === 0) {
      // Выбираем заглушку в зависимости от названия продукта
      const name = itemName?.toLowerCase() || '';
      if (name.includes('milk') || name.includes('juice') || name.includes('coffee') || name.includes('tea') || name.includes('drink')) {
        return '/images/placeholder-drink.svg';
      }
      return '/images/placeholder-food.svg';
    }
    return images[0];
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        Loading menu...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Statistics */}
      {menu.length > 0 && (
        <div className={styles.stats}>
          <strong>{t('product.menuStatistics')}:</strong> {menu.length} {t('product.categories')}, {menu.reduce((sum: number, cat: MenuCategory) => sum + (cat.activeMenuItems?.length || 0), 0)} {t('product.totalItems')}
        </div>
      )}

      {/* Search and Filter */}
      <div className={styles.searchFilter}>
        <div className={styles.searchInput}>
          <input
            type="text"
            placeholder={t('product.searchMenu')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.filterButtons}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`${styles.filterButton} ${selectedCategory === null ? styles.active : ''}`}
          >
            {t('product.allCategories')}
          </button>
          {menu.filter((cat: MenuCategory) => (cat.activeMenuItems || []).length > 0).map((category: MenuCategory) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              className={`${styles.filterButton} ${selectedCategory === category.name ? styles.active : ''}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
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
              gap: '20px'
            }}>
              {(() => {
                const items = category.activeMenuItems || [];
                const filteredItems = items.filter(item => 
                  !searchQuery || 
                  item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
                );
                
                // Отладочная информация для категории
                if (items.length > 0) {
                }
                
                if (filteredItems.length === 0) {
                  return (
                    <div style={{ 
                      padding: '20px', 
                      textAlign: 'center', 
                      color: '#6b7280',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px'
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
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push(`/product/${item.id}`)}
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
                        disabled={!item.is_available}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart logic here
                        }}
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
                        {item.is_available ? t('product.addToCart') : t('product.outOfStock')}
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
                        <strong>{t('product.allergens')}:</strong> {item.allergens.join(', ')}
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
    </div>
  );
}
