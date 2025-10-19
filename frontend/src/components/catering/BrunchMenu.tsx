"use client";

import React from 'react';
import Image from "next/image";
import styles from './BrunchMenu.module.css';

// Интерфейс для выбранных позиций Brunch Menu
interface BrunchSelection {
  canapes: string | null;
  sandwiches: string | null;
  wraps: string | null;
  salads: string | null;
  desserts: string | null;
  drinks: string | null;
}

// Интерфейс для количества по каждой секции
interface BrunchQuantities {
  canapes: number;
  sandwiches: number;
  wraps: number;
  salads: number;
  desserts: number;
  drinks: number;
}

interface BrunchMenuProps {
  brunchSelections: BrunchSelection;
  brunchQuantities: BrunchQuantities;
  onSelectionChange: (category: keyof BrunchSelection, item: string) => void;
  onQuantityChange: (category: keyof BrunchQuantities, quantity: number) => void;
  onAddToCart: () => void;
  getTotalSelectedItems: () => number;
}

export default function BrunchMenu({
  brunchSelections,
  brunchQuantities,
  onSelectionChange,
  onQuantityChange,
  onAddToCart,
  getTotalSelectedItems
}: BrunchMenuProps) {
  
  const isBrunchItemSelected = (category: keyof BrunchSelection, item: string) => {
    return brunchSelections[category] === item;
  };

  return (
    <div className={styles.brunchMenuSection}>
      <div className={styles.brunchMenuWrapper}>
        <h2 className={styles.brunchMenuTitle}>
          Brunch Menu
        </h2>
        
        {/* Divider Line */}
        <div className={styles.dividerLine}></div>
        
        {/* Price Text */}
        <div className={styles.priceText}>
          <span className={styles.priceSpan}>
            Price for 1 person 19 ₼
          </span>
        </div>
        
        <div className={styles.brunchMenuGrid}>
          {/* Menu Content */}
          <div className={styles.menuContent}>
            <div className={styles.brunchMenuContent}>
              {/* Selection of Canapes */}
              <div className={styles.leftColumn}>
                <h3 className={styles.sectionTitle}>
                  Selection of Canapes
                </h3>
                <p className={styles.sectionDescription}>
                  (Choose of one)
                </p>
                <div className={styles.optionsContainer}>
                  {['Mini Eclair Selection', 'Mini Tartine Selection', 'Mini Quiche Selection'].map((item) => (
                    <label key={item} className={`${styles.optionLabel} ${isBrunchItemSelected('canapes', item) ? styles.optionLabelSelected : ''}`}>
                      <input
                        type="radio"
                        name="canapes"
                        checked={isBrunchItemSelected('canapes', item)}
                        onChange={() => onSelectionChange('canapes', item)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.optionText} ${isBrunchItemSelected('canapes', item) ? styles.optionTextSelected : ''}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Quantity Selector */}
                <div className={styles.brunchQuantitySelector}>
                  <button
                    onClick={() => onQuantityChange('canapes', brunchQuantities.canapes - 1)}
                    className={styles.brunchQuantityButton}
                  >
                    -
                  </button>
                  <span className={styles.brunchQuantityDisplay}>
                    {brunchQuantities.canapes}
                  </span>
                  <button
                    onClick={() => onQuantityChange('canapes', brunchQuantities.canapes + 1)}
                    className={styles.brunchQuantityButton}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Mini Sandwiches */}
              <div className={styles.leftColumn}>
                <h3 className={styles.sectionTitle}>
                  Mini Sandwiches
                </h3>
                <p className={styles.sectionDescription}>
                  (Choose of one)
                </p>
                <div className={styles.optionsContainer}>
                  {['Tomato & Mozzarella', 'Tuna & Sweetcorn', 'Ham and Cheese'].map((item) => (
                    <label key={item} className={`${styles.optionLabel} ${isBrunchItemSelected('sandwiches', item) ? styles.optionLabelSelected : ''}`}>
                      <input
                        type="radio"
                        name="sandwiches"
                        checked={isBrunchItemSelected('sandwiches', item)}
                        onChange={() => onSelectionChange('sandwiches', item)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.optionText} ${isBrunchItemSelected('sandwiches', item) ? styles.optionTextSelected : ''}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Quantity Selector */}
                <div className={styles.brunchQuantitySelector}>
                  <button
                    onClick={() => onQuantityChange('sandwiches', brunchQuantities.sandwiches - 1)}
                    className={styles.brunchQuantityButton}
                  >
                    -
                  </button>
                  <span className={styles.brunchQuantityDisplay}>
                    {brunchQuantities.sandwiches}
                  </span>
                  <button
                    onClick={() => onQuantityChange('sandwiches', brunchQuantities.sandwiches + 1)}
                    className={styles.brunchQuantityButton}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Mini Wrap Rolls */}
              <div className={styles.leftColumn}>
                <h3 className={styles.sectionTitle}>
                  Mini Wrap Rolls
                </h3>
                <p className={styles.sectionDescription}>
                  (Choose of one)
                </p>
                <div className={styles.optionsContainer}>
                  {['Ham&Cheese', 'Crispy Chicken', 'Beef with Vegetable'].map((item) => (
                    <label key={item} className={`${styles.optionLabel} ${isBrunchItemSelected('wraps', item) ? styles.optionLabelSelected : ''}`}>
                      <input
                        type="radio"
                        name="wraps"
                        checked={isBrunchItemSelected('wraps', item)}
                        onChange={() => onSelectionChange('wraps', item)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.optionText} ${isBrunchItemSelected('wraps', item) ? styles.optionTextSelected : ''}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Quantity Selector */}
                <div className={styles.brunchQuantitySelector}>
                  <button
                    onClick={() => onQuantityChange('wraps', brunchQuantities.wraps - 1)}
                    className={styles.brunchQuantityButton}
                  >
                    -
                  </button>
                  <span className={styles.brunchQuantityDisplay}>
                    {brunchQuantities.wraps}
                  </span>
                  <button
                    onClick={() => onQuantityChange('wraps', brunchQuantities.wraps + 1)}
                    className={styles.brunchQuantityButton}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Salads */}
              <div className={styles.leftColumn}>
                <h3 className={styles.sectionTitle}>
                  Salads
                </h3>
                <p className={styles.sectionDescription}>
                  (Choose of one)
                </p>
                <div className={styles.optionsContainer}>
                  {['Chicken Pasta Salad', 'Greek Salad', 'Smoked Salmon Salad'].map((item) => (
                    <label key={item} className={`${styles.optionLabel} ${isBrunchItemSelected('salads', item) ? styles.optionLabelSelected : ''}`}>
                      <input
                        type="radio"
                        name="salads"
                        checked={isBrunchItemSelected('salads', item)}
                        onChange={() => onSelectionChange('salads', item)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.optionText} ${isBrunchItemSelected('salads', item) ? styles.optionTextSelected : ''}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Quantity Selector */}
                <div className={styles.brunchQuantitySelector}>
                  <button
                    onClick={() => onQuantityChange('salads', brunchQuantities.salads - 1)}
                    className={styles.brunchQuantityButton}
                  >
                    -
                  </button>
                  <span className={styles.brunchQuantityDisplay}>
                    {brunchQuantities.salads}
                  </span>
                  <button
                    onClick={() => onQuantityChange('salads', brunchQuantities.salads + 1)}
                    className={styles.brunchQuantityButton}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Dessert */}
              <div className={styles.leftColumn}>
                <h3 className={styles.sectionTitle}>
                  Dessert
                </h3>
                <p className={styles.sectionDescription}>
                  (Choose of one)
                </p>
                <div className={styles.optionsContainer}>
                  {['Seasonal Fruits', 'Flavored Natural Yoghurt', 'Mini sweets', 'Mini Viennoiseries'].map((item) => (
                    <label key={item} className={`${styles.optionLabel} ${isBrunchItemSelected('desserts', item) ? styles.optionLabelSelected : ''}`}>
                      <input
                        type="radio"
                        name="desserts"
                        checked={isBrunchItemSelected('desserts', item)}
                        onChange={() => onSelectionChange('desserts', item)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.optionText} ${isBrunchItemSelected('desserts', item) ? styles.optionTextSelected : ''}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Quantity Selector */}
                <div className={styles.brunchQuantitySelector}>
                  <button
                    onClick={() => onQuantityChange('desserts', brunchQuantities.desserts - 1)}
                    className={styles.brunchQuantityButton}
                  >
                    -
                  </button>
                  <span className={styles.brunchQuantityDisplay}>
                    {brunchQuantities.desserts}
                  </span>
                  <button
                    onClick={() => onQuantityChange('desserts', brunchQuantities.desserts + 1)}
                    className={styles.brunchQuantityButton}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Drinks */}
              <div className={styles.leftColumn}>
                <h3 className={styles.sectionTitle}>
                  Drinks
                </h3>
                <p className={styles.sectionDescription}>
                  (Choose of one)
                </p>
                <div className={styles.optionsContainer}>
                  {['Hot Beverages', 'Soft drinks', 'Fruit juices'].map((item) => (
                    <label key={item} className={`${styles.optionLabel} ${isBrunchItemSelected('drinks', item) ? styles.optionLabelSelected : ''}`}>
                      <input
                        type="radio"
                        name="drinks"
                        checked={isBrunchItemSelected('drinks', item)}
                        onChange={() => onSelectionChange('drinks', item)}
                        className={styles.radioInput}
                      />
                      <span className={`${styles.optionText} ${isBrunchItemSelected('drinks', item) ? styles.optionTextSelected : ''}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
                
                {/* Quantity Selector */}
                <div className={styles.brunchQuantitySelector}>
                  <button
                    onClick={() => onQuantityChange('drinks', brunchQuantities.drinks - 1)}
                    className={styles.brunchQuantityButton}
                  >
                    -
                  </button>
                  <span className={styles.brunchQuantityDisplay}>
                    {brunchQuantities.drinks}
                  </span>
                  <button
                    onClick={() => onQuantityChange('drinks', brunchQuantities.drinks + 1)}
                    className={styles.brunchQuantityButton}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Brunch Image */}
          <div className={styles.brunchImageColumn}>
            <div className={styles.brunchImageWrapper}>
              <Image
                src="/images/brunch.jpg"
                alt="Brunch Menu"
                width={500}
                height={400}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Add to Cart Button - Below Grid */}
        <div className={styles.addToCartButtonContainer}>
          <button
            onClick={onAddToCart}
            disabled={getTotalSelectedItems() === 0}
            className={styles.brunchAddButton}
          >
            {getTotalSelectedItems() > 0 ? 'Add to cart' : 'Select Items First'}
          </button>
        </div>
      </div>
    </div>
  );
}
