"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import Breadcrumbs from '../../components/Breadcrumbs';
import { useCart } from '../../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Sample products data
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

  const categories = ['all', 'Pastries', 'Bread', 'Lunch', 'Beverages', 'Desserts'];

  // Initialize search query from URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Filter and sort products
  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory && product.available;
    });

    // Sort products
    filtered.sort((a, b) => {
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

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newUrl = searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search';
    router.push(newUrl);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      available: product.available,
      isSet: false
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFCF8' }}>
      <Header />
      
      {/* Breadcrumbs */}
      <div style={{ paddingTop: '80px', paddingBottom: '20px', backgroundColor: '#FFFCF8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Search', isActive: true }
            ]}
          />
        </div>
      </div>

      {/* Search Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1A1A1A 0%, #4A4A4A 100%)',
        color: 'white',
        padding: '60px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            fontFamily: 'Playfair Display, serif',
            textAlign: 'center'
          }}>
            Search Products
          </h1>
          
          <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                style={{
                  flex: 1,
                  padding: '15px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#EBDCC8',
                  color: '#1A1A1A',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4C4A8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EBDCC8';
                }}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters and Results */}
      <div style={{ padding: '40px 0', backgroundColor: '#FFFCF8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Filters */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '5px',
                  color: '#1A1A1A'
                }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '5px',
                  color: '#1A1A1A'
                }}>
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '2px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="name">Name A-Z</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
            
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Results */}
          {filteredProducts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#1A1A1A' }}>
                No products found
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                Try adjusting your search terms or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                style={{
                  backgroundColor: '#1A1A1A',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '30px' 
            }}>
              {filteredProducts.map(product => (
                <div key={product.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
                >
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: '#EBDCC8',
                      color: '#1A1A1A',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {product.category}
                    </div>
                  </div>
                  
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold', 
                      marginBottom: '8px',
                      color: '#1A1A1A'
                    }}>
                      {product.name}
                    </h3>
                    
                    <p style={{ 
                      color: '#6b7280', 
                      marginBottom: '15px',
                      lineHeight: '1.5',
                      fontSize: '14px'
                    }}>
                      {product.description}
                    </p>
                    
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <span style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 'bold', 
                        color: '#1A1A1A' 
                      }}>
                        ₼{product.price.toFixed(2)}
                      </span>
                      
                      <button
                        onClick={() => handleAddToCart(product)}
                        style={{
                          backgroundColor: '#1A1A1A',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#4A4A4A';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#1A1A1A';
                        }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
