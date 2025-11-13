"use client";

import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  deliveryType: 'pickup' | 'delivery';
}

export default function OrderSummary({ deliveryType }: OrderSummaryProps) {
  const { items: cart, getTotalPrice } = useCart();
  const t = useTranslations();

  const subtotal = getTotalPrice();

  return (
    <div className={styles.summaryContainer}>
      <h3 className={styles.heading}>{t('product.details')}</h3>
      {cart.map((item) => (
        <div key={item.id} className={styles.itemRow}>
          <span className={styles.itemName}>{item.name}</span>
          <span className={styles.itemPrice}>{item.quantity} x {item.price} ₼</span>
        </div>
      ))}
      
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>{t('cart.subtotal')}</span>
        <span className={styles.totalPrice}>{subtotal.toFixed(2)} ₼</span>
      </div>
    </div>
  );
}
