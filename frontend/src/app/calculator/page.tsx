"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import Breadcrumbs from '../../components/Breadcrumbs';

interface BudgetItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CalculatorPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<number>(0);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);

  // Sample menu items with prices
  const menuItems = [
    { id: '1', name: 'Croissant', price: 3.50, category: 'Pastries' },
    { id: '2', name: 'Pain au Chocolat', price: 4.00, category: 'Pastries' },
    { id: '3', name: 'Baguette', price: 2.50, category: 'Bread' },
    { id: '4', name: 'Sandwich', price: 5.50, category: 'Lunch' },
    { id: '5', name: 'Quiche', price: 6.00, category: 'Lunch' },
    { id: '6', name: 'Salad', price: 7.50, category: 'Lunch' },
    { id: '7', name: 'Coffee', price: 2.00, category: 'Beverages' },
    { id: '8', name: 'Tea', price: 1.50, category: 'Beverages' },
    { id: '9', name: 'Cake Slice', price: 4.50, category: 'Desserts' },
    { id: '10', name: 'Macaron', price: 1.50, category: 'Desserts' },
  ];

  const addItem = (item: Omit<BudgetItem, 'quantity'>) => {
    const existingItem = items.find(i => i.id === item.id);
    if (existingItem) {
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(i => 
      i.id === id ? { ...i, quantity } : i
    ));
  };

  // Calculate total cost
  React.useEffect(() => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalCost(total);
  }, [items]);

  const goToCatering = () => {
    router.push('/catering');
  };

  const goToCart = () => {
    router.push('/cart');
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFCF8' }}>
      <Header />
      
      {/* Breadcrumbs */}
      <div style={{ paddingTop: '80px', paddingBottom: '20px', backgroundColor: '#FFFCF8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'Budget Calculator', isActive: true }
            ]}
          />
        </div>
      </div>

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
            Budget Calculator
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: '1.6'
          }}>
            Plan your PAUL order and stay within your budget
          </p>
        </div>
      </div>

      <div style={{ padding: '60px 0', backgroundColor: '#FFFCF8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
            
            {/* Menu Items */}
            <div>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '30px',
                fontFamily: 'Playfair Display, serif',
                color: '#1A1A1A'
              }}>
                Menu Items
              </h2>
              
              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <div key={category} style={{ marginBottom: '40px' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    marginBottom: '20px',
                    color: '#1A1A1A',
                    borderBottom: '2px solid #EBDCC8',
                    paddingBottom: '10px'
                  }}>
                    {category}
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {categoryItems.map(item => (
                      <div key={item.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '15px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '5px', color: '#1A1A1A' }}>
                            {item.name}
                          </h4>
                          <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                            ₼{item.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => addItem(item)}
                          style={{
                            backgroundColor: '#EBDCC8',
                            color: '#1A1A1A',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            fontSize: '14px',
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
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div>
              <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: '100px'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  marginBottom: '20px',
                  color: '#1A1A1A'
                }}>
                  Budget Summary
                </h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: '#1A1A1A'
                  }}>
                    Set Budget (₼)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #E5E7EB',
                      borderRadius: '6px',
                      fontSize: '16px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#EBDCC8'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px', color: '#1A1A1A' }}>
                    Selected Items
                  </h4>
                  
                  {items.length === 0 ? (
                    <p style={{ color: '#6b7280', fontStyle: 'italic' }}>No items selected</p>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {items.map(item => (
                        <div key={item.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 0',
                          borderBottom: '1px solid #E5E7EB'
                        }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A1A' }}>
                              {item.name}
                            </p>
                            <p style={{ fontSize: '12px', color: '#6b7280' }}>
                              ₼{item.price.toFixed(2)} × {item.quantity}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#F3F4F6',
                                border: '1px solid #D1D5DB',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px'
                              }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontSize: '14px' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#F3F4F6',
                                border: '1px solid #D1D5DB',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px'
                              }}
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              style={{
                                width: '24px',
                                height: '24px',
                                backgroundColor: '#FEE2E2',
                                border: '1px solid #FECACA',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: '#DC2626'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ 
                  padding: '20px 0', 
                  borderTop: '2px solid #E5E7EB',
                  borderBottom: '2px solid #E5E7EB'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A1A' }}>
                      Total Cost:
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1A1A1A' }}>
                      ₼{totalCost.toFixed(2)}
                    </span>
                  </div>
                  
                  {budget > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Budget:
                        </span>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          ₼{budget.toFixed(2)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          Remaining:
                        </span>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '600',
                          color: budget - totalCost >= 0 ? '#059669' : '#DC2626'
                        }}>
                          ₼{(budget - totalCost).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    onClick={goToCatering}
                    style={{
                      backgroundColor: '#1A1A1A',
                      color: 'white',
                      border: 'none',
                      padding: '12px 20px',
                      borderRadius: '6px',
                      fontSize: '16px',
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
                    Start Order
                  </button>
                  
                  {items.length > 0 && (
                    <button
                      onClick={goToCart}
                      style={{
                        backgroundColor: '#EBDCC8',
                        color: '#1A1A1A',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '6px',
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
                      View Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FeaturesSection />
      <Footer />
    </div>
  );
}
