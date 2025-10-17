"use client";

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import Breadcrumbs from '../../components/Breadcrumbs';
import FeedbackModal from '../../components/FeedbackModal';
import { useCart } from '../../contexts/CartContext';
import styles from './CartPage.module.css';

// Компонент QuantitySelector
const QuantitySelector = ({ quantity, onUpdate }: { quantity: number; onUpdate: (newQuantity: number) => void }) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdate(quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdate(quantity + 1);
  };

  return (
    <div className={styles.quantitySelector}>
      <button
        onClick={handleDecrease}
        className={styles.quantityButton}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className={styles.quantityValue}>
        {quantity}
      </span>
      <button
        onClick={handleIncrease}
        className={styles.quantityButton}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
};

export default function CartPage() {
  const router = useRouter();
  const { 
    items: cartData, 
    removeItem, 
    updateQuantity, 
    getTotalPrice 
  } = useCart();

  // Валидация и фильтрация данных корзины
  const validatedCartData = useMemo(() => {
    return cartData.filter(item => {
      // Проверяем обязательные поля
      if (!item.id || !item.name || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
        console.warn('Invalid cart item detected:', item);
        return false;
      }
      // Проверяем корректность значений
      if (item.price < 0 || item.quantity <= 0) {
        console.warn('Invalid cart item values:', item);
        return false;
      }
      return true;
    });
  }, [cartData]);

  // Подсчет общей суммы через useMemo для оптимизации
  const totalAmount = useMemo(() => getTotalPrice(), [getTotalPrice]);

  const goToCatering = useCallback(() => {
    try {
      router.push('/catering');
    } catch (error) {
      console.error('Error navigating to catering:', error);
    }
  }, [router]);

  const goToCheckout = useCallback(() => {
    try {
      router.push('/catering/order');
    } catch (error) {
      console.error('Error navigating to checkout:', error);
    }
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <Header />
      
      <main className={styles.mainContent}>
        <div className={styles.containerPaul}>
          {/* Breadcrumbs */}
          <div className={styles.breadcrumbsSection}>
            <Breadcrumbs 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Catering Menu', href: '/catering' },
                { label: 'Shopping Cart', isActive: true }
              ]}
            />
          </div>

          {/* Заголовок страницы */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>
              Shopping cart
            </h1>
          </div>

          {validatedCartData.length === 0 ? (
            /* Пустая корзина */
            <div className={styles.emptyCart}>
              <h2 className={styles.emptyCartTitle}>
                Your cart is empty
              </h2>
              <p className={styles.emptyCartText}>
                Add products to your cart by browsing our catering menu
              </p>
              <button
                onClick={goToCatering}
                className={styles.emptyCartButton}
              >
                Go to Menu
              </button>
            </div>
          ) : (
            /* Корзина с товарами */
            <div className={styles.cartContainer}>
              {/* Table Header */}
              <div className={styles.tableHeader}>
                <span className={styles.tableHeaderLabel}>
                  Product
                </span>
                <span className={styles.tableHeaderLabel}>
                  {/* Пустая колонка для количества */}
                </span>
                <span className={`${styles.tableHeaderLabel} ${styles.tableHeaderLabelRight}`}>
                  Total price
                </span>
              </div>
                    
              {/* Cart Items */}
              <div className={styles.cartItems}>
                {validatedCartData.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <button
                      onClick={() => {
                        try {
                          removeItem(item.id.toString());
                        } catch (error) {
                          console.error('Error removing item from cart:', error);
                        }
                      }}
                      className={styles.deleteButton}
                      aria-label="Remove item"
                    >
                      <svg className={styles.deleteIcon} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4V12H10V4H5Z" fill="currentColor"/>
                      </svg>
                    </button>

                    {/* Изображение товара */}
                    <div className={styles.productImage}>
                      <Image 
                        src={item.image || '/images/placeholder-food.svg'} 
                        alt={item.name || 'Product image'}
                        width={170}
                        height={165}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>

                    {/* Информация о товаре */}
                    <div className={styles.productInfo}>
                      <h3 className={styles.productName}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className={styles.productDescription}>
                          {item.description}
                        </p>
                      )}
                      <p className={styles.productPrice}>
                        {typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'} ₼
                      </p>
                      <QuantitySelector 
                        quantity={item.quantity} 
                        onUpdate={(newQuantity) => {
                          try {
                            updateQuantity(item.id.toString(), newQuantity);
                          } catch (error) {
                            console.error('Error updating item quantity:', error);
                          }
                        }} 
                      />
                    </div>

                    {/* Пустая колонка для выравнивания */}
                    <div></div>

                    {/* Общая цена товара */}
                    <div className={styles.itemTotalPrice}>
                      {(() => {
                        const price = typeof item.price === 'number' ? item.price : 0;
                        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
                        return (price * quantity).toFixed(2);
                      })()} ₼
                    </div>
                  </div>
                ))}
              </div>

              {/* Информационные заметки */}
              <div className={styles.infoSection}>
                <div className={styles.infoBlock}>
                  <div className={styles.infoIcon}>
                    i
                  </div>
                  <p className={styles.infoText}>
                    Products purchased from us are intended for direct consumption without storage, except for products that have a shelf life stated on the packaging or on the receipt.
                  </p>
                </div>
                
                <div className={styles.infoBlock}>
                  <div className={styles.infoIcon}>
                    i
                  </div>
                  <p className={styles.infoText}>
                    In addition to the allergens listed in the composition, all of our products are processed and shipped from facilities where trace amounts of the following allergens may be present: Gluten (all types), eggs, fish (salmon, tuna, anchovies), soy, milk, nuts (almonds, walnuts, pistachios, cashews), celery, mustard, sesame, sulfur dioxide and sulfites.
                  </p>
                </div>
              </div>

              {/* Итоговая информация */}
              <div className={styles.totalSection}>
                <h2 className={styles.totalLabel}>
                  Total to be paid
                </h2>
                <div className={styles.totalAmount}>
                  {totalAmount.toFixed(2)} ₼
                </div>
                
                {/* Кнопки действий */}
                <div className={styles.actionButtons}>
                  <button
                    onClick={goToCatering}
                    className={styles.buttonBack}
                  >
                    Go back to menu
                  </button>
                  
                  <button
                    onClick={goToCheckout}
                    className={styles.buttonCheckout}
                  >
                    Go to checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <FeaturesSection />
      <Footer />
      
      {/* Feedback Modal Component */}
      <FeedbackModal />
    </div>
  );
}