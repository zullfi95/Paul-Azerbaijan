"use client";

import React, { useState } from 'react';
import styles from './CoffeeBreaksMenu.module.css';
import { CartItem } from '../../config/api';

interface OptionSelection {
  quantity: number;
}

interface AdditionalItem {
  name: string;
  price: number;
  quantity: number;
}

interface CoffeeBreaksMenuProps {
  onAddToCart: (item: CartItem) => void;
}

export default function CoffeeBreaksMenu({ onAddToCart }: CoffeeBreaksMenuProps) {
  const [options, setOptions] = useState({
    option1: { quantity: 1 },
    option2: { quantity: 1 },
    option3: { quantity: 1 },
    option4: { quantity: 1 }
  });

  const [additionalItems, setAdditionalItems] = useState<{[key: string]: number}>({
    'Mini Viennoiseries': 0,
    'Mini Tartelettes': 0,
    'Mini Sweets': 0,
    'Mini Cakes': 0,
    'Mini Madeleines': 0,
    'Mini Canapes': 0,
    'Mini Wraps': 0,
    'Mini Toasts': 0,
    'Mini Salads': 0,
    'Mini Sandwiches': 0,
    'Mini Croissants': 0,
    'Iced Drinks': 0,
    'Hot Chocolates': 0,
    'Flavored Water': 0,
    'Packaged Juice': 0,
    'Fresh Juices': 0,
    'Soft Drinks': 0
  });

  const updateQuantity = (option: string, quantity: number) => {
    if (quantity < 1) return;
    setOptions(prev => ({
      ...prev,
      [option]: { quantity }
    }));
  };

  const updateAdditionalItem = (item: string, change: number) => {
    setAdditionalItems(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + change)
    }));
  };

  const handleAddOption = (optionKey: string, optionName: string, price: number) => {
    const quantity = options[optionKey as keyof typeof options].quantity;
    
    // Создаем основной элемент меню
    const cartItem: CartItem = {
      id: `coffee-${optionKey}`,
      name: `Coffee Breaks - ${optionName}`,
      description: optionName,
      price: price,
      quantity: quantity,
      image: '/images/coffee-break.png',
      category: 'Coffee Breaks & Afternoon Teas',
      available: true,
      isSet: true
    };
    
    onAddToCart(cartItem);
    
    // Добавляем все дополнительные элементы с количеством > 0
    Object.entries(additionalItems).forEach(([itemName, itemQuantity]) => {
      if (itemQuantity > 0) {
        // Определяем цену для каждого дополнительного элемента
        let itemPrice = 3;
        if (itemName === 'Mini Canapes') itemPrice = 4;
        else if (itemName === 'Mini Salads') itemPrice = 3.5;
        else if (itemName === 'Hot Chocolates' || itemName === 'Flavored Water') itemPrice = 4.5;
        else if (itemName === 'Packaged Juice') itemPrice = 2;
        else if (itemName === 'Fresh Juices' || itemName === 'Soft Drinks') itemPrice = 2.5;
        
        const additionalItem: CartItem = {
          id: `coffee-additional-${optionKey}-${itemName.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${itemName} (${optionName})`,
          description: `Additional item for ${optionName}`,
          price: itemPrice,
          quantity: itemQuantity,
          image: '/images/coffee-break.png',
          category: 'Coffee Breaks & Afternoon Teas',
          available: true,
          isSet: false
        };
        
        onAddToCart(additionalItem);
      }
    });
    
    // Сбрасываем счетчики дополнительных элементов
    setAdditionalItems({
      'Mini Viennoiseries': 0,
      'Mini Tartelettes': 0,
      'Mini Sweets': 0,
      'Mini Cakes': 0,
      'Mini Madeleines': 0,
      'Mini Canapes': 0,
      'Mini Wraps': 0,
      'Mini Toasts': 0,
      'Mini Salads': 0,
      'Mini Sandwiches': 0,
      'Mini Croissants': 0,
      'Iced Drinks': 0,
      'Hot Chocolates': 0,
      'Flavored Water': 0,
      'Packaged Juice': 0,
      'Fresh Juices': 0,
      'Soft Drinks': 0
    });
  };

  const addAllToOrder = () => {
    // TODO: Handle adding all selected items with additional items
    console.log('Adding all to order');
  };

  return (
    <div className={styles.coffeeBreaksSection}>
      <div className={styles.coffeeBreaksWrapper}>
        <h2 className={styles.coffeeBreaksTitle}>
          Coffee Breaks & Afternoon Teas
        </h2>
        
        {/* Divider Line */}
        <div className={styles.dividerLine}></div>
        
        {/* Options Grid */}
        <div className={styles.optionsGrid}>
          
          {/* Option I */}
          <div className={styles.optionCard}>
            <h3 className={styles.optionTitle}>Option I</h3>
            <p className={styles.optionSubtitle}>Cookies + Hot Beverage + Water</p>
            
            <div className={styles.optionContent}>
              <p className={styles.optionItem}>Mini Cookies</p>
              <p className={styles.optionDetail}>2 items per person—selection of your choice</p>
              
              <p className={styles.optionItem}>Hot Beverage</p>
              <p className={styles.optionDetail}>Black Tea with lemon</p>
              <p className={styles.optionDetail}>Coffee, Tea or Coffee with milk</p>
            </div>
            
            <p className={styles.optionPrice}>Price for 1 person 00₼</p>
            
            <div className={styles.quantitySelector}>
              <button onClick={() => updateQuantity('option1', options.option1.quantity - 1)}>-</button>
              <span>{options.option1.quantity}</span>
              <button onClick={() => updateQuantity('option1', options.option1.quantity + 1)}>+</button>
            </div>
            
            <button className={styles.addToCartButton} onClick={() => handleAddOption('option1', 'Option I', 0)}>
              Add to cart
            </button>
          </div>

          {/* Option II */}
          <div className={styles.optionCard}>
            <h3 className={styles.optionTitle}>Option II</h3>
            <p className={styles.optionSubtitle}>Cookies + Viennoiseries + Hot Beverage + Water</p>
            
            <div className={styles.optionContent}>
              <p className={styles.optionItem}>Mini Cookies</p>
              <p className={styles.optionDetail}>2 items per person—selection of your choice</p>
              
              <p className={styles.optionItem}>Hot Beverage</p>
              <p className={styles.optionDetail}>Black Tea with lemon</p>
              <p className={styles.optionDetail}>Coffee, Tea or Coffee with milk</p>
            </div>
            
            <p className={styles.optionPrice}>Price for 1 person 00₼</p>
            
            <div className={styles.quantitySelector}>
              <button onClick={() => updateQuantity('option2', options.option2.quantity - 1)}>-</button>
              <span>{options.option2.quantity}</span>
              <button onClick={() => updateQuantity('option2', options.option2.quantity + 1)}>+</button>
            </div>
            
            <button className={styles.addToCartButton} onClick={() => handleAddOption('option2', 'Option II', 0)}>
              Add to cart
            </button>
          </div>

          {/* Option III */}
          <div className={styles.optionCard}>
            <h3 className={styles.optionTitle}>Option III</h3>
            <p className={styles.optionSubtitle}>Cookies + Cakes + Hot Beverage + Water</p>
            
            <div className={styles.optionContent}>
              <p className={styles.optionItem}>Mini Cookies</p>
              <p className={styles.optionDetail}>2 items per person—selection of your choice</p>
              
              <p className={styles.optionItem}>Hot Beverage</p>
              <p className={styles.optionDetail}>Black Tea with lemon</p>
              <p className={styles.optionDetail}>Coffee, Tea or Coffee with milk</p>
              
              <p className={styles.optionItem}>Hot Beverage</p>
              <p className={styles.optionDetail}>Black Tea with lemon</p>
              <p className={styles.optionDetail}>Coffee, Tea or Coffee with milk</p>
            </div>
            
            <p className={styles.optionPrice}>Price for 1 person 00₼</p>
            
            <div className={styles.quantitySelector}>
              <button onClick={() => updateQuantity('option3', options.option3.quantity - 1)}>-</button>
              <span>{options.option3.quantity}</span>
              <button onClick={() => updateQuantity('option3', options.option3.quantity + 1)}>+</button>
            </div>
            
            <button className={styles.addToCartButton} onClick={() => handleAddOption('option3', 'Option III', 0)}>
              Add to cart
            </button>
          </div>

          {/* Option IV */}
          <div className={styles.optionCard}>
            <h3 className={styles.optionTitle}>Option IV</h3>
            <p className={styles.optionSubtitle}>Cookies + Viennoiseries + Sandwiches + Hot Beverage + Water</p>
            
            <div className={styles.optionContent}>
              <p className={styles.optionItem}>Mini Viennoiseries</p>
              <p className={styles.optionDetail}>2 items per person—selection of your choice</p>
              
              <p className={styles.optionItem}>Mini Sandwiches</p>
              <p className={styles.optionDetail}>2 items per person—selection of your choice</p>
              
              <p className={styles.optionItem}>Hot Beverage</p>
              <p className={styles.optionDetail}>Black Tea with lemon</p>
              <p className={styles.optionDetail}>Coffee, Tea or Coffee with milk</p>
            </div>
            
            <p className={styles.optionPrice}>Price for 1 person 00₼</p>
            
            <div className={styles.quantitySelector}>
              <button onClick={() => updateQuantity('option4', options.option4.quantity - 1)}>-</button>
              <span>{options.option4.quantity}</span>
              <button onClick={() => updateQuantity('option4', options.option4.quantity + 1)}>+</button>
            </div>
            
            <button className={styles.addToCartButton} onClick={() => handleAddOption('option4', 'Option IV', 0)}>
              Add to cart
            </button>
          </div>
        </div>

        {/* Additional Items Section */}
        <div className={styles.additionalItemsSection}>
          <h3 className={styles.additionalItemsTitle}>Additions Items</h3>
          
          <div className={styles.additionalItemsGrid}>
            {/* Sweet Column */}
            <div className={styles.additionalColumn}>
              <h4 className={styles.columnTitle}>Sweet</h4>
              {['Mini Viennoiseries', 'Mini Tartelettes', 'Mini Sweets', 'Mini Cakes', 'Mini Madeleines'].map(item => (
                <div key={item} className={styles.additionalItemRow}>
                  <div className={styles.itemQuantityControl}>
                    <button onClick={() => updateAdditionalItem(item, -1)}>-</button>
                    <span>{additionalItems[item]}</span>
                    <button onClick={() => updateAdditionalItem(item, 1)}>+</button>
                  </div>
                  <span className={styles.itemName}>Add {item} + 3₼</span>
                </div>
              ))}
            </div>

            {/* Savories Column */}
            <div className={styles.additionalColumn}>
              <h4 className={styles.columnTitle}>Savories</h4>
              {['Mini Canapes', 'Mini Wraps', 'Mini Toasts', 'Mini Salads', 'Mini Sandwiches', 'Mini Croissants'].map(item => (
                <div key={item} className={styles.additionalItemRow}>
                  <div className={styles.itemQuantityControl}>
                    <button onClick={() => updateAdditionalItem(item, -1)}>-</button>
                    <span>{additionalItems[item]}</span>
                    <button onClick={() => updateAdditionalItem(item, 1)}>+</button>
                  </div>
                  <span className={styles.itemName}>Add {item} + {item === 'Mini Canapes' ? '4' : item === 'Mini Salads' ? '3.5' : '3'}₼</span>
                </div>
              ))}
            </div>

            {/* Beverages Column */}
            <div className={styles.additionalColumn}>
              <h4 className={styles.columnTitle}>Beverages</h4>
              {['Iced Drinks', 'Hot Chocolates', 'Flavored Water', 'Packaged Juice', 'Fresh Juices', 'Soft Drinks'].map(item => (
                <div key={item} className={styles.additionalItemRow}>
                  <div className={styles.itemQuantityControl}>
                    <button onClick={() => updateAdditionalItem(item, -1)}>-</button>
                    <span>{additionalItems[item]}</span>
                    <button onClick={() => updateAdditionalItem(item, 1)}>+</button>
                  </div>
                  <span className={styles.itemName}>Add {item} + {item === 'Hot Chocolates' || item === 'Flavored Water' ? '4.5' : item === 'Packaged Juice' ? '2' : '2.5'}₼</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.addToOrderButtonContainer}>
            <button className={styles.addToOrderButton} onClick={addAllToOrder}>
              Add to order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
