"use client";

import { useCart } from '../../contexts/CartContext';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
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
      <h3 className={styles.heading}>{t('checkout.orderSummary')}</h3>
      {cart.map((item) => (
        <div key={item.id} className={styles.itemRow}>
          <div className={styles.itemImageContainer}>
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                width={60}
                height={60}
                className={styles.itemImage}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
              />
            )}
          </div>
          <div className={styles.itemInfo}>
            <span className={styles.itemName}>{item.name}</span>
            <span className={styles.itemPrice}>{item.quantity} x {item.price} ₼</span>
          </div>
        </div>
      ))}
      
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>{t('cart.subtotal')}</span>
        <span className={styles.totalPrice}>{subtotal.toFixed(2)} ₼</span>
      </div>
    </div>
  );
}
