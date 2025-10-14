"use client";

import React from 'react';
import Image from 'next/image';
import { Order } from '@/types/unified';
import styles from './OrderDetailsModal.module.css';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentClick?: (orderId: number) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onPaymentClick
}) => {
  if (!isOpen || !order) return null;

  const orderDate = new Date(order.created_at);
  const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;

  const getOrderStatus = (status: string, paymentStatus?: string) => {
    if (status === 'paid' || paymentStatus === 'paid') {
      return { text: 'Paid', icon: '✅', isDelivered: false, needsPayment: false };
    }
    
    switch (status) {
      case 'completed':
        return { text: 'Delivered', icon: '✓', isDelivered: true, needsPayment: false };
      case 'processing':
        return { text: 'In Progress', icon: '⏳', isDelivered: false, needsPayment: false };
      case 'submitted':
        return { text: 'Payment Pending', icon: '💳', isDelivered: false, needsPayment: true };
      case 'draft':
        return { text: 'Draft', icon: '📝', isDelivered: false, needsPayment: false };
      case 'cancelled':
        return { text: 'Cancelled', icon: '❌', isDelivered: false, needsPayment: false };
      default:
        return { text: status.charAt(0).toUpperCase() + status.slice(1), icon: '📋', isDelivered: false, needsPayment: false };
    }
  };

  const orderStatus = getOrderStatus(order.status, order.payment_status);

  const formatCurrency = (amount: number) => {
    return `${amount} ₼`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Order Details</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalBody}>
          {/* Order Status */}


          {/* Main Content Grid */}
          <div className={styles.mainContentGrid}>
            {/* Left Column - Order Info */}
            <div className={styles.leftColumn}>
              {/* Order Details */}
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Order Details</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Order ID:</span>
                  <span className={styles.infoValue}>#{order.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Date & Time:</span>
                  <span className={styles.infoValue}>{formatDate(orderDate)} {formatTime(orderDate)}</span>
                </div>
                {deliveryDate && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Delivery:</span>
                    <span className={styles.infoValue}>
                      {formatDate(deliveryDate)}
                      {order.delivery_time && ` ${order.delivery_time}`}
                    </span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Type:</span>
                  <span className={styles.infoValue}>
                    {order.delivery_type === 'delivery' ? 'Courier delivery' : 
                     order.delivery_type === 'pickup' ? 'Pickup' : 
                     order.delivery_type === 'buffet' ? 'Buffet service' : 
                     'Standard delivery'}
                  </span>
                </div>
                {order.delivery_address && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Address:</span>
                    <span className={styles.infoValue}>{order.delivery_address}</span>
                  </div>
                )}
                {order.delivery_cost && order.delivery_cost > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Delivery Cost:</span>
                    <span className={styles.infoValue}>{formatCurrency(order.delivery_cost)}</span>
                  </div>
                )}
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Discount:</span>
                    <span className={styles.infoValue}>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
              </div>

              {/* Customer & Payment */}
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>Customer & Payment</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Company:</span>
                  <span className={styles.infoValue}>{order.company_name}</span>
                </div>
                {order.customer?.name && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Contact:</span>
                    <span className={styles.infoValue}>{order.customer.name}</span>
                  </div>
                )}
                {order.customer?.phone && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Phone:</span>
                    <span className={styles.infoValue}>{order.customer.phone}</span>
                  </div>
                )}
                {order.customer?.email && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email:</span>
                    <span className={styles.infoValue}>{order.customer.email}</span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Payment:</span>
                  <span className={styles.infoValue}>
                    {order.payment_status === 'paid' ? 'Paid' : 
                     order.status === 'submitted' ? 'Payment Pending' : 
                     'Payment Completed'}
                  </span>
                </div>
              </div>

              {/* Special Instructions */}
              {order.comment && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>Special Instructions</h3>
                  <p className={styles.commentText}>{order.comment}</p>
                </div>
              )}
            </div>

            {/* Right Column - Order Items */}
            <div className={styles.rightColumn}>
              <div className={styles.menuItemsSection}>
                <h3 className={styles.sectionTitle}>Order Items ({order.menu_items.length})</h3>
                <div className={`${styles.menuItemsList} ${order.menu_items.length === 1 ? styles.singleItem : ''}`}>
                  {order.menu_items.slice(0, 8).map((item, index) => (
                    <div key={index} className={`${styles.menuItem} ${order.menu_items.length === 1 ? styles.singleMenuItem : ''}`}>
                      <div className={styles.menuItemImage}>
                        <Image
                          src="/images/cake1.png"
                          alt={item.name}
                          width={order.menu_items.length === 1 ? 80 : 50}
                          height={order.menu_items.length === 1 ? 80 : 50}
                          className={styles.itemImage}
                        />
                      </div>
                      <div className={styles.menuItemDetails}>
                        <h4 className={styles.itemName}>{item.name}</h4>
                        {order.menu_items.length === 1 && item.description && (
                          <p className={styles.itemDescription}>{item.description}</p>
                        )}
                        <div className={styles.itemPrice}>
                          {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {order.menu_items.length > 8 && (
                    <div className={styles.moreItems}>
                      +{order.menu_items.length - 8} more items
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Items Total:</span>
              <span className={styles.summaryValue}>{formatCurrency(order.items_total || order.total_amount)}</span>
            </div>
            {order.delivery_cost && order.delivery_cost > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Delivery:</span>
                <span className={styles.summaryValue}>{formatCurrency(order.delivery_cost)}</span>
              </div>
            )}
            {order.discount_amount && order.discount_amount > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Discount:</span>
                <span className={styles.summaryValue}>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.summaryLabel}>Total:</span>
              <span className={styles.summaryValue}>{formatCurrency(order.final_amount || order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
