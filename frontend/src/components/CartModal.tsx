"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus } from 'lucide-react';
import DeleteIcon from './DeleteIcon';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import Image from "next/image";
import styles from './CartModal.module.css';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useCart();
  const { showNotification } = useNotification();

  const removeFromCart = (itemId: string) => {
    const currentQuantity = cartItems.find(item => item.id === itemId)?.quantity || 0;
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
      showNotification('Количество товара уменьшено');
    } else {
      removeItem(itemId);
      showNotification('Товар удален из корзины');
    }
  };

  const addToCart = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
      showNotification('Количество товара увеличено');
    }
  };

  const goToCartPage = () => {
    onClose();
    router.push('/cart');
  };

  const goToMenu = () => {
    onClose();
    router.push('/viennoiserie');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Полупрозрачный фон */}
      <div
        onClick={onClose}
        className={styles.modalOverlay}
      />

      {/* Модальное окно корзины */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.modalContainer}
      >
        {/* Заголовок корзины */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            Корзина ({getTotalItems()})
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={18} />
          </button>
        </div>

        {/* Контент корзины */}
        <div className={styles.modalContent}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <h3 className={styles.emptyCartTitle}>
                Ваша корзина пуста
              </h3>
              <p className={styles.emptyCartText}>
                Просмотрите наше меню, чтобы добавить товары
              </p>
              <button
                onClick={goToMenu}
                className={styles.emptyCartButton}
              >
                Просмотреть меню
              </button>
            </div>
          ) : (
            <div className={styles.cartItemsContainer}>
              {cartItems.map((cartItem, index) => (
                <div key={cartItem.id} className={styles.cartItem}>
                  {/* Изображение товара */}
                  <div className={styles.productImage}>
                    <Image
                      src={cartItem.image}
                      alt={cartItem.name}
                      fill
                      sizes="80px"
                      style={{
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Информация о товаре */}
                  <div className={styles.productInfo}>
                    <h4 className={styles.productName}>
                      {cartItem.name}
                    </h4>
                    <p className={styles.productDescription}>
                      {cartItem.description}
                    </p>
                    <div className={styles.productPrice}>
                      ₼{cartItem.price}
                    </div>
                  </div>

                  {/* Управление количеством */}
                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => removeFromCart(cartItem.id)}
                      className={styles.quantityButton}
                    >
                      <Minus size={14} />
                    </button>
                    <span className={styles.quantityValue}>
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(cartItem.id)}
                      className={styles.quantityButton}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    onClick={() => removeItem(cartItem.id)}
                    className={styles.removeButton}
                  >
                    <DeleteIcon size={14} className={styles.removeIcon} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Подвал модального окна */}
        {cartItems.length > 0 && (
          <div className={styles.modalFooter}>
            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>Итого:</span>
              <span className={styles.totalAmount}>
                ₼{getTotalPrice().toFixed(2)}
              </span>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={goToMenu}
                className={styles.buttonSecondary}
              >
                Продолжить покупки
              </button>
              <button
                onClick={goToCartPage}
                className={styles.buttonPrimary}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartModal;