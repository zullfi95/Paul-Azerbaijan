"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Image from 'next/image';
import styles from './SearchDropdown.module.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ isOpen, onClose, isMobile = false }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sample products data - in real app this would come from API
  const products: Product[] = [
    {
      id: '1',
      name: 'Croissant',
      description: 'Fresh baked croissant with buttery layers',
      price: 3.50,
      image: '/images/menuitem1.png',
      category: 'Pastries',
      available: true
    },
    {
      id: '2',
      name: 'Pain au Chocolat',
      description: 'Chocolate filled pastry with flaky layers',
      price: 4.00,
      image: '/images/menuitem2.png',
      category: 'Pastries',
      available: true
    },
    {
      id: '3',
      name: 'Baguette',
      description: 'Traditional French bread with crispy crust',
      price: 2.50,
      image: '/images/menuitem3.png',
      category: 'Bread',
      available: true
    },
    {
      id: '4',
      name: 'Sandwich',
      description: 'Fresh sandwich with premium ingredients',
      price: 5.50,
      image: '/images/menuitem4.png',
      category: 'Lunch',
      available: true
    },
    {
      id: '5',
      name: 'Quiche Lorraine',
      description: 'Classic French quiche with bacon and cheese',
      price: 6.00,
      image: '/images/menuitem1.png',
      category: 'Lunch',
      available: true
    },
    {
      id: '6',
      name: 'Caesar Salad',
      description: 'Fresh salad with romaine lettuce and caesar dressing',
      price: 7.50,
      image: '/images/menuitem2.png',
      category: 'Lunch',
      available: true
    },
    {
      id: '7',
      name: 'Cappuccino',
      description: 'Rich espresso with steamed milk foam',
      price: 2.00,
      image: '/images/menuitem3.png',
      category: 'Beverages',
      available: true
    },
    {
      id: '8',
      name: 'Earl Grey Tea',
      description: 'Classic black tea with bergamot flavor',
      price: 1.50,
      image: '/images/menuitem4.png',
      category: 'Beverages',
      available: true
    },
    {
      id: '9',
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with ganache frosting',
      price: 4.50,
      image: '/images/menuitem1.png',
      category: 'Desserts',
      available: true
    },
    {
      id: '10',
      name: 'Macaron Assortment',
      description: 'Colorful French macarons in various flavors',
      price: 1.50,
      image: '/images/menuitem2.png',
      category: 'Desserts',
      available: true
    }
  ];

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setFilteredProducts([]);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8); // Limit to 8 results
      
      setFilteredProducts(filtered);
      setSelectedIndex(-1);
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredProducts[selectedIndex]) {
        handleProductSelect(filteredProducts[selectedIndex]);
      } else if (searchQuery.trim()) {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleProductSelect = (product: Product) => {
    // Navigate to product page
    router.push(`/product/${product.id}`);
    onClose();
    setSearchQuery('');
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
      setSearchQuery('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.searchDropdown} ${isMobile ? styles.mobile : ''}`} ref={dropdownRef}>
      <div className={styles.searchContainer}>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close search"
          >
            <X size={24} />
          </button>
        )}
        <form onSubmit={handleSubmit} className={styles.searchForm}>
          <div className={styles.inputContainer}>
            <Search className={styles.searchIcon} size={18} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for products..."
              value={searchQuery}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </form>

        {/* Search Results */}
        {searchQuery.trim().length >= 2 && (
          <div className={styles.resultsContainer}>
            {isLoading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner} />
                <span>Searching...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className={styles.resultsList}>
                {filteredProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={`${styles.resultItem} ${index === selectedIndex ? styles.selected : ''}`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className={styles.productImage}>
                      <Image
                        src={product.image || '/images/placeholder-food.svg'}
                        alt={product.name}
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productName}>{product.name}</div>
                      <div className={styles.productCategory}>{product.category}</div>
                    </div>
                    <div className={styles.productPrice}>₼{product.price.toFixed(2)}</div>
                  </div>
                ))}
                
                {/* View All Results */}
                <div className={styles.viewAllResults} onClick={handleSearch}>
                  <Search size={16} />
                  <span>View all results for "{searchQuery}"</span>
                </div>
              </div>
            ) : (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>
                  <Search size={48} strokeWidth={1.5} />
                </div>
                <div className={styles.noResultsText}>No products found</div>
                <div className={styles.noResultsSubtext}>Try a different search term</div>
              </div>
            )}
          </div>
        )}

        {/* Popular Searches */}
        {searchQuery.trim().length < 2 && (
          <div className={styles.popularSearches}>
            <div className={styles.popularTitle}>Popular Searches</div>
            <div className={styles.popularTags}>
              {['Croissant', 'Baguette', 'Cappuccino', 'Chocolate Cake', 'Sandwich'].map((term) => (
                <button
                  key={term}
                  className={styles.popularTag}
                  onClick={() => setSearchQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;
