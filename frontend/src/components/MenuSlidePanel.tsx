"use client";

import { useState, useMemo } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { CartItem } from '../types/common';
import styles from './MenuSlidePanel.module.css';

interface MenuCategory {
  id: number;
  name: string;
  items: CartItem[];
}

type CategoryId = number | string | 'all';

interface MenuSlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: CartItem[];
  onAddItem: (item: CartItem) => void;
  loading?: boolean;
}

export default function MenuSlidePanel({ 
  isOpen, 
  onClose, 
  menuItems, 
  onAddItem,
  loading = false 
}: MenuSlidePanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<CategoryId>('all');

  // Группируем товары по категориям
  const categorizedMenu = useMemo(() => {
    const categories = new Map<string, MenuCategory>();
    
    menuItems.forEach(item => {
      // Используем название категории как ключ, чтобы избежать дублирования
      const categoryName = item.category || 'Без категории';
      const categoryId = item.menu_category_id || 0;
      
      if (!categories.has(categoryName)) {
        categories.set(categoryName, {
          id: categoryId,
          name: categoryName,
          items: []
        });
      }
      
      categories.get(categoryName)!.items.push(item);
    });
    
    return Array.from(categories.values()).sort((a, b) => 
      a.name.localeCompare(b.name, 'ru')
    );
  }, [menuItems]);

  // Фильтрация товаров
  const filteredItems = useMemo(() => {
    let items = menuItems;
    
    // Фильтр по категории
    if (selectedCategoryId !== 'all') {
      items = items.filter(item => {
        const categoryName = item.category || 'Без категории';
        return categoryName === selectedCategoryId;
      });
    }
    
    // Фильтр по поиску
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search)) ||
        (item.category && item.category.toLowerCase().includes(search))
      );
    }
    
    return items;
  }, [menuItems, selectedCategoryId, searchTerm]);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={onClose}
        />
      )}

      {/* Slide Panel */}
      <div className={`${styles.panel} ${isOpen ? styles.open : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>Выбор товаров</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={styles.searchClear}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Categories Filter */}
        <div className={styles.categoriesContainer}>
          <div className={styles.categoriesScroll}>
            <button
              onClick={() => setSelectedCategoryId('all')}
              className={`${styles.categoryChip} ${selectedCategoryId === 'all' ? styles.active : ''}`}
            >
              Все ({menuItems.length})
            </button>
            {categorizedMenu.map(category => (
              <button
                key={category.name}
                onClick={() => setSelectedCategoryId(category.name)}
                className={`${styles.categoryChip} ${selectedCategoryId === category.name ? styles.active : ''}`}
              >
                {category.name} ({category.items.length})
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className={styles.itemsContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Загрузка товаров...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className={styles.empty}>
              {menuItems.length === 0 ? (
                <>
                  <p className={styles.emptyTitle}>Меню пусто</p>
                  <p className={styles.emptyText}>Загрузите товары из iiko</p>
                </>
              ) : (
                <>
                  <p className={styles.emptyTitle}>Ничего не найдено</p>
                  <p className={styles.emptyText}>
                    {searchTerm ? `По запросу "${searchTerm}"` : 'В выбранной категории'}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.itemsList}>
              {filteredItems.map(item => (
                <div key={item.id} className={styles.menuItem}>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    {item.description && (
                      <p className={styles.itemDescription}>{item.description}</p>
                    )}
                    <div className={styles.itemFooter}>
                      <span className={styles.itemCategory}>{item.category}</span>
                      <span className={styles.itemPrice}>{item.price} ₼</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onAddItem(item);
                      // Можно добавить тост-уведомление
                    }}
                    className={styles.addButton}
                    aria-label={`Добавить ${item.name}`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer с информацией */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            Показано {filteredItems.length} из {menuItems.length} товаров
          </p>
        </div>
      </div>
    </>
  );
}

