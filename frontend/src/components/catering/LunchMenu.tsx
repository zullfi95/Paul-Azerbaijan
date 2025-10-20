"use client";

import React from 'react';
import Image from "next/image";
import styles from './LunchMenu.module.css';

// Интерфейс для выбранных опций Lunch Menu
interface LunchSelection {
  selectedOption: string | null;
  quantity: number;
}

interface LunchChoices {
  [key: string]: {[key: string]: boolean};
}

interface LunchMenuProps {
  lunchSelections: {[key: string]: LunchSelection};
  lunchChoices: LunchChoices;
  onLunchOptionToggle: (optionKey: string, optionName: string) => void;
  onLunchQuantityUpdate: (optionKey: string, quantity: number) => void;
  onLunchChoiceToggle: (optionKey: string, choiceKey: string) => void;
  onLunchChoiceToggleExclusive: (optionKey: string, choiceKey: string) => void;
  onAddToCart: (optionKey: string, optionName: string, price: number) => void;
}

export default function LunchMenu({
  lunchSelections,
  lunchChoices,
  onLunchQuantityUpdate,
  onLunchChoiceToggle,
  onLunchChoiceToggleExclusive,
  onLunchOptionToggle,
  onAddToCart
}: LunchMenuProps) {

  return (
    <div className={styles.lunchMenuSection}>
      <div className={styles.lunchMenuWrapper}>
        <h2 className={styles.lunchMenuTitle}>
          Lunch Menu
        </h2>
        
        {/* Divider Line */}
        <div className={styles.dividerLine}></div>
        
        {/* Lunch Options Grid */}
        <div className={styles.lunchOptionsGrid}>
          
          {/* Option I */}
          <div className={styles.lunchOptionCard}>
            <div className={styles.lunchOptionHeader}>
              <h3 className={styles.lunchOptionHeaderTitle}>
                Option I
              </h3>
            </div>

            <div className={styles.lunchOptionContent}>
              {/* Soup Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Soup</h4>
                <p className={styles.lunchOptionSectionText}>Tomato soup</p>
              </div>

              {/* Choice Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionWithChoices}`}>
                <div className={styles.lunchChoiceWrapper}>
                  <label className={styles.lunchChoiceLabel}>
                    <input
                      type="checkbox"
                      checked={lunchChoices.option1?.salad || false}
                      onChange={() => onLunchChoiceToggle('option1', 'salad')}
                      className={styles.lunchCheckbox}
                    />
                    <div className={styles.lunchChoiceContent}>
                      <h4 className={styles.lunchOptionSectionTitle}>Salad</h4>
                      <p className={styles.lunchOptionSectionText}>Americana salad</p>
                    </div>
                  </label>
                </div>
                
                <p className={styles.orText}>or</p>
                
                <div>
                  <label className={styles.lunchChoiceLabel}>
                    <input
                      type="checkbox"
                      checked={lunchChoices.option1?.sandwiches || false}
                      onChange={() => onLunchChoiceToggle('option1', 'sandwiches')}
                      className={styles.lunchCheckbox}
                    />
                    <div className={styles.lunchChoiceContent}>
                      <h4 className={styles.lunchOptionSectionTitle}>Sandwiches</h4>
                      <p className={styles.lunchOptionSectionText}>Tartine paulet</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Soft Drinks Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionAuto}`}>
                <h4 className={styles.lunchOptionSectionTitle}>Soft drinks</h4>
                <p className={styles.lunchOptionSectionText}>1 glass per person</p>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.lunchOptionFooter}>
              <div className={styles.lunchOptionPrice}>
                <p className={styles.lunchOptionPriceText}>Price for 1 person 25₼</p>
              </div>
              
              {/* Quantity Selector */}
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => onLunchQuantityUpdate('option1', lunchSelections.option1.quantity - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>
                  {lunchSelections.option1.quantity}
                </span>
                <button
                  onClick={() => onLunchQuantityUpdate('option1', lunchSelections.option1.quantity + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart('option1', 'Option I', 25)}
                className={styles.addToCartButton}
              >
                Add to cart
              </button>
            </div>
          </div>

          {/* Option II */}
          <div className={styles.lunchOptionCard}>
            <div className={styles.lunchOptionHeader}>
              <h3 className={styles.lunchOptionHeaderTitle}>
                Option II
              </h3>
            </div>

            <div className={styles.lunchOptionContent}>
              {/* Soup Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Soup</h4>
                <p className={styles.lunchOptionSectionText}>Tomato soup</p>
              </div>

              {/* Main Dishes Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Main Dishes</h4>
                <p className={styles.lunchOptionSectionText}>Chicken creamy mushroom served with mashed potato</p>
              </div>

              {/* Soft Drinks Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionAuto}`}>
                <h4 className={styles.lunchOptionSectionTitle}>Soft drinks</h4>
                <p className={styles.lunchOptionSectionText}>1 glass per person</p>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.lunchOptionFooter}>
              <div className={styles.lunchOptionPrice}>
                <p className={styles.lunchOptionPriceText}>Price for 1 person 30₼</p>
              </div>
              
              {/* Quantity Selector */}
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => onLunchQuantityUpdate('option2', lunchSelections.option2.quantity - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>
                  {lunchSelections.option2.quantity}
                </span>
                <button
                  onClick={() => onLunchQuantityUpdate('option2', lunchSelections.option2.quantity + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart('option2', 'Option II', 30)}
                className={styles.addToCartButton}
              >
                Add to cart
              </button>
            </div>
          </div>

          {/* Option III */}
          <div className={styles.lunchOptionCard}>
            <div className={styles.lunchOptionHeader}>
              <h3 className={styles.lunchOptionHeaderTitle}>
                Option III
              </h3>
            </div>

            <div className={styles.lunchOptionContent}>
              {/* Choice Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionWithChoices}`}>
                <div className={styles.lunchChoiceWrapper}>
                  <label className={styles.lunchChoiceLabel}>
                    <input
                      type="checkbox"
                      checked={lunchChoices.option3?.salads || false}
                      onChange={() => onLunchChoiceToggleExclusive('option3', 'salads')}
                      className={styles.lunchCheckbox}
                    />
                    <div className={styles.lunchChoiceContent}>
                      <h4 className={styles.lunchOptionSectionTitle}>Salads</h4>
                      <p className={styles.lunchOptionSectionText}>Americana salad</p>
                    </div>
                  </label>
                </div>
                
                <p className={styles.orText}>or</p>
                
                <div>
                  <label className={styles.lunchChoiceLabel}>
                    <input
                      type="checkbox"
                      checked={lunchChoices.option3?.mainDishes || false}
                      onChange={() => onLunchChoiceToggleExclusive('option3', 'mainDishes')}
                      className={styles.lunchCheckbox}
                    />
                    <div className={styles.lunchChoiceContent}>
                      <h4 className={styles.lunchOptionSectionTitle}>Main Dishes</h4>
                      <p className={styles.lunchOptionSectionText}>Chicken creamy mushroom served with mashed potato</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Soft Drinks Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionAuto}`}>
                <h4 className={styles.lunchOptionSectionTitle}>Soft drinks</h4>
                <p className={styles.lunchOptionSectionText}>1 glass per person</p>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.lunchOptionFooter}>
              <div className={styles.lunchOptionPrice}>
                <p className={styles.lunchOptionPriceText}>Price for 1 person 28₼</p>
              </div>
              
              {/* Quantity Selector */}
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => onLunchQuantityUpdate('option3', lunchSelections.option3.quantity - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>
                  {lunchSelections.option3.quantity}
                </span>
                <button
                  onClick={() => onLunchQuantityUpdate('option3', lunchSelections.option3.quantity + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart('option3', 'Option III', 28)}
                className={styles.addToCartButton}
              >
                Add to cart
              </button>
            </div>
          </div>

          {/* Option IV */}
          <div className={styles.lunchOptionCard}>
            <div className={styles.lunchOptionHeader}>
              <h3 className={styles.lunchOptionHeaderTitle}>
                Option IV
              </h3>
            </div>

            <div className={styles.lunchOptionContent}>
              {/* Soup Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Soup</h4>
                <p className={styles.lunchOptionSectionText}>Tomato soup</p>
              </div>

              {/* Salads Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Salads</h4>
                <p className={styles.lunchOptionSectionText}>Americana salad</p>
              </div>

              {/* Main Dishes Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Main Dishes</h4>
                <p className={styles.lunchOptionSectionText}>Chicken creamy mushroom served with mashed potato</p>
              </div>

              {/* Soft Drinks Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionAuto}`}>
                <h4 className={styles.lunchOptionSectionTitle}>Soft drinks</h4>
                <p className={styles.lunchOptionSectionText}>1 glass per person</p>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.lunchOptionFooter}>
              <div className={styles.lunchOptionPrice}>
                <p className={styles.lunchOptionPriceText}>Price for 1 person 35₼</p>
              </div>
              
              {/* Quantity Selector */}
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => onLunchQuantityUpdate('option4', lunchSelections.option4.quantity - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>
                  {lunchSelections.option4.quantity}
                </span>
                <button
                  onClick={() => onLunchQuantityUpdate('option4', lunchSelections.option4.quantity + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  onLunchOptionToggle('option4', 'Option IV - Soup, Salads, Main Dishes, Soft drinks');
                  onAddToCart('option4', 'Option IV', 35);
                }}
                className={styles.addToCartButton}
              >
                Add to cart
              </button>
            </div>
          </div>

          {/* Option V */}
          <div className={styles.lunchOptionCard}>
            <div className={styles.lunchOptionHeader}>
              <h3 className={styles.lunchOptionHeaderTitle}>
                Option V
              </h3>
            </div>

            <div className={styles.lunchOptionContent}>
              {/* Soup Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Soup</h4>
                <p className={styles.lunchOptionSectionText}>Tomato soup</p>
              </div>

              {/* Salads Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Salads</h4>
                <p className={styles.lunchOptionSectionText}>Americana salad</p>
              </div>

              {/* Main Dishes Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Main Dishes</h4>
                <p className={styles.lunchOptionSectionText}>Chicken creamy mushroom served with mashed potato</p>
              </div>

              {/* Sweets Section */}
              <div className={styles.lunchOptionSection}>
                <h4 className={styles.lunchOptionSectionTitle}>Sweets</h4>
                <p className={styles.lunchOptionSectionText}>Honey cake</p>
              </div>

              {/* Soft Drinks Section */}
              <div className={`${styles.lunchOptionSection} ${styles.lunchOptionSectionAuto}`}>
                <h4 className={styles.lunchOptionSectionTitle}>Soft drinks</h4>
                <p className={styles.lunchOptionSectionText}>1 glass per person</p>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.lunchOptionFooter}>
              <div className={styles.lunchOptionPrice}>
                <p className={styles.lunchOptionPriceText}>Price for 1 person 40₼</p>
              </div>
              
              {/* Quantity Selector */}
              <div className={styles.quantitySelector}>
                <button
                  onClick={() => onLunchQuantityUpdate('option5', lunchSelections.option5.quantity - 1)}
                  className={styles.quantityButton}
                >
                  -
                </button>
                <span className={styles.quantityDisplay}>
                  {lunchSelections.option5.quantity}
                </span>
                <button
                  onClick={() => onLunchQuantityUpdate('option5', lunchSelections.option5.quantity + 1)}
                  className={styles.quantityButton}
                >
                  +
                </button>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => {
                  onLunchOptionToggle('option5', 'Option V - Soup, Salads, Main Dishes, Sweets, Soft drinks');
                  onAddToCart('option5', 'Option V', 40);
                }}
                className={styles.addToCartButton}
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
        
        {/* Lunch Menu Image and Description */}
        <div className={styles.lunchMenuImageSection}>
          <div className={styles.lunchMenuImage}>
            <Image
              src="/images/Lunch Menu.png"
              alt="Lunch Menu"
              width={1200}
              height={400}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          <div className={styles.lunchMenuDescription}>
            <h3>Lunch Menu from PAUL</h3>
            <p>
              At PAUL, we take pride in offering exceptional catering services that bring the delightful flavors of our restaurant directly to your event. Whether it&apos;s a corporate gathering, wedding, or a casual get-together, our team is dedicated to providing a seamless experience tailored to your needs. Our menu features a variety of freshly prepared dishes, showcasing the best of French cuisine. With a focus on quality ingredients and presentation, we ensure that every bite is a memorable one. Let us help you create an unforgettable dining experience for your guests!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
