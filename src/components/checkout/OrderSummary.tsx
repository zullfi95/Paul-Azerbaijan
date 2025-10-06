"use client";

import { useCart } from '../../contexts/CartContext';
import styles from './OrderSummary.module.css';

interface OrderSummaryProps {
  deliveryType: 'pickup' | 'delivery';
}

export default function OrderSummary({ deliveryType }: OrderSummaryProps) {
  const { items: cart, getTotalPrice } = useCart();

  const deliveryCost = deliveryType === 'delivery' ? 5 : 0;
  const totalPrice = getTotalPrice() + deliveryCost;

  return (
    <div className={styles.summaryContainer}>
      <h3 className={styles.heading}>Product</h3>
      {cart.map((item) => (
        <div key={item.id} className={styles.itemRow}>
          <span className={styles.itemName}>{item.name}</span>
          <span className={styles.itemPrice}>{item.quantity} x {item.price} ₼</span>
        </div>
      ))}
      
      <div className={styles.subtotalRow}>
        <span>Subtotal</span>
        <span>{getTotalPrice().toFixed(2)} ₼</span>
      </div>

      {deliveryType === 'delivery' && (
        <div className={styles.deliveryRow}>
          <span>Courier delivery:</span>
          <span>5.00 ₼</span>
        </div>
      )}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total price</span>
        <span className={styles.totalPrice}>{totalPrice.toFixed(2)} ₼</span>
      </div>
    </div>
  );
}
