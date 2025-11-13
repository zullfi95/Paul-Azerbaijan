"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus } from 'lucide-react';
import DeleteIcon from './DeleteIcon';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../contexts/NotificationContext';
import Image from "next/image";
import styles from './CartModal.module.css';
import { useTranslations } from 'next-intl';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const t = useTranslations('cart');
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems
  } = useCart();
  const { showNotification } = useNotification();

  const removeFromCart = (itemId: string) => {
    const currentQuantity = cartItems.find(item => String(item.id) === String(itemId))?.quantity || 0;
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
      showNotification(t('quantityDecreased'));
    } else {
      removeItem(itemId);
      showNotification(t('itemRemoved'));
    }
  };

  const addToCart = (itemId: string) => {
    const item = cartItems.find(item => String(item.id) === String(itemId));
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
      showNotification(t('quantityIncreased'));
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
      {/* Semi-transparent background */}
      <div
        onClick={onClose}
        className={styles.modalOverlay}
      />

      {/* Cart modal window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={styles.modalContainer}
      >
        {/* Cart header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {t('title')} ({getTotalItems()})
          </h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart content */}
        <div className={styles.modalContent}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <h3 className={styles.emptyCartTitle}>
                {t('empty')}
              </h3>
              <p className={styles.emptyCartText}>
                {t('emptyDescription')}
              </p>
              <p className={styles.emptyCartText}>
                {t('emptyWish')}
              </p>
              <button
                onClick={goToMenu}
                className={styles.emptyCartButton}
              >
                {t('browseMenu')}
              </button>
            </div>
          ) : (
            <div className={styles.cartItemsContainer}>
              {cartItems.map((cartItem) => (
                <div key={cartItem.id} className={styles.cartItem}>
                  {/* Product image */}
                  <div className={styles.productImage}>
                    <Image
                      src={cartItem.image || '/images/placeholder-food.svg'}
                      alt={cartItem.name}
                      fill
                      sizes="80px"
                      style={{
                        objectFit: 'cover'
                      }}
                    />
                  </div>

                  {/* Product information */}
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

                    {/* Quantity controls */}
                  <div className={styles.quantityControlsContainer}>
                    {/* Remove button */}
                    <button
                        onClick={() => removeItem(cartItem.id.toString())}
                        className={styles.removeButton}
                      >
                        <DeleteIcon size={14} className={styles.removeIcon} />
                    </button>
                    
                    <div className={styles.quantityControls}>
                      <button
                        onClick={() => removeFromCart(cartItem.id.toString())}
                        className={styles.quantityButton}
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.quantityValue}>
                        {cartItem.quantity}
                      </span>
                      <button
                        onClick={() => addToCart(cartItem.id.toString())}
                        className={styles.quantityButton}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

 
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal footer */}
        {cartItems.length > 0 && (
          <div className={styles.modalFooter}>
            <div className={styles.totalSection}>
              <span className={styles.totalLabel}>{t('subtotal')}:</span>
              <span className={styles.totalAmount}>
                ₼{getTotalPrice().toFixed(2)}
              </span>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={goToMenu}
                className={styles.buttonSecondary}
              >
                {t('browseMenu')}
              </button>
              <button
                onClick={goToCartPage}
                className={styles.buttonPrimary}
              >
                {t('checkout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartModal;