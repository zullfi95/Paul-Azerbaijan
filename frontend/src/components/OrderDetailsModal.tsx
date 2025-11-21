"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Order } from '@/types/unified';
import { getTranslatedStatusLabel } from '@/utils/statusTranslations';
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
  const t = useTranslations();
  const locale = typeof document !== 'undefined' ? document.documentElement.lang || 'ru' : 'ru';
  const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-US', az: 'az-AZ' };
  const dateLocale = localeMap[locale] || 'ru-RU';

  if (!isOpen || !order) return null;

  const orderDate = new Date(order.created_at);
  const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;

  const getOrderStatus = (status: string, paymentStatus?: string) => {
    if (status === 'paid' || paymentStatus === 'paid') {
      return { text: t('orderDetails.status.delivered'), icon: '✅', isDelivered: false, needsPayment: false };
    }
    
    switch (status) {
      case 'completed':
        return { text: t('orderDetails.status.delivered'), icon: '✓', isDelivered: true, needsPayment: false };
      case 'processing':
      case 'in_progress':
        return { text: t('orderDetails.status.inProgress'), icon: '⏳', isDelivered: false, needsPayment: false };
      case 'submitted':
      case 'pending_payment':
        return { text: t('orderDetails.status.paymentPending'), icon: '💳', isDelivered: false, needsPayment: true };
      case 'draft':
        return { text: t('orderDetails.status.draft'), icon: '📝', isDelivered: false, needsPayment: false };
      case 'cancelled':
        return { text: t('orderDetails.status.cancelled'), icon: '❌', isDelivered: false, needsPayment: false };
      default:
        return { text: getTranslatedStatusLabel(status, t), icon: '📋', isDelivered: false, needsPayment: false };
    }
  };

  const orderStatus = getOrderStatus(order.status, order.payment_status);

  const formatCurrency = (amount: number) => {
    return `${amount} ₼`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(dateLocale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{t('orderDetails.title')}</h2>
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
                <h3 className={styles.sectionTitle}>{t('orderDetails.title')}</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('orderDetails.orderId')}</span>
                  <span className={styles.infoValue}>#{order.id}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('orderDetails.dateTime')}</span>
                  <span className={styles.infoValue}>{formatDate(orderDate)} {formatTime(orderDate)}</span>
                </div>
                {deliveryDate && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.delivery')}</span>
                    <span className={styles.infoValue}>
                      {formatDate(deliveryDate)}
                      {order.delivery_time && ` ${order.delivery_time}`}
                    </span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('orderDetails.type')}</span>
                  <span className={styles.infoValue}>
                    {order.delivery_type === 'delivery' ? t('orderDetails.deliveryType.courier') : 
                     order.delivery_type === 'pickup' ? t('orderDetails.deliveryType.pickup') : 
                     order.delivery_type === 'buffet' ? t('orderDetails.deliveryType.buffet') : 
                     t('orderDetails.deliveryType.standard')}
                  </span>
                </div>
                {order.delivery_address && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.address')}</span>
                    <span className={styles.infoValue}>{order.delivery_address}</span>
                  </div>
                )}
                {order.delivery_cost && order.delivery_cost > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.deliveryCost')}</span>
                    <span className={styles.infoValue}>{formatCurrency(order.delivery_cost)}</span>
                  </div>
                )}
                {order.discount_amount && order.discount_amount > 0 && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.discount')}</span>
                    <span className={styles.infoValue}>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
              </div>

              {/* Customer & Payment */}
              <div className={styles.infoSection}>
                <h3 className={styles.sectionTitle}>{t('orderDetails.customerPayment.title')}</h3>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('orderDetails.customerPayment.company')}</span>
                  <span className={styles.infoValue}>{order.company_name}</span>
                </div>
                {order.customer?.name && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.customerPayment.contact')}</span>
                    <span className={styles.infoValue}>{order.customer.name}</span>
                  </div>
                )}
                {order.customer?.phone && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.customerPayment.phone')}</span>
                    <span className={styles.infoValue}>{order.customer.phone}</span>
                  </div>
                )}
                {order.customer?.email && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>{t('orderDetails.customerPayment.email')}</span>
                    <span className={styles.infoValue}>{order.customer.email}</span>
                  </div>
                )}
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>{t('orderDetails.customerPayment.payment')}</span>
                  <span className={styles.infoValue}>
                    {order.payment_status === 'paid' ? t('orderDetails.customerPayment.paid') : 
                     order.status === 'submitted' ? t('orderDetails.customerPayment.pending') : 
                     t('orderDetails.customerPayment.completed')}
                  </span>
                </div>
              </div>

              {/* Comments */}
              {(order.kitchen_comment || order.operation_comment || order.desserts_comment) && (
                <div className={styles.infoSection}>
                  <h3 className={styles.sectionTitle}>{t('orderDetails.comments.title')}</h3>
                  {order.kitchen_comment && (
                    <div className={styles.commentItem}>
                      <strong>{t('orderDetails.comments.kitchen')}</strong>
                      <p className={styles.commentText}>{order.kitchen_comment}</p>
                    </div>
                  )}
                  {order.operation_comment && (
                    <div className={styles.commentItem}>
                      <strong>{t('orderDetails.comments.operation')}</strong>
                      <p className={styles.commentText}>{order.operation_comment}</p>
                    </div>
                  )}
                  {order.desserts_comment && (
                    <div className={styles.commentItem}>
                      <strong>{t('orderDetails.comments.desserts')}</strong>
                      <p className={styles.commentText}>{order.desserts_comment}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Order Items */}
            <div className={styles.rightColumn}>
              <div className={styles.menuItemsSection}>
                <h3 className={styles.sectionTitle}>{t('orderDetails.items.title')} ({order.menu_items.length})</h3>
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
                      +{order.menu_items.length - 8} {t('orderDetails.items.more')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{t('form.itemsTotal')}</span>
              <span className={styles.summaryValue}>{formatCurrency(order.items_total || order.total_amount)}</span>
            </div>
            {order.delivery_cost && order.delivery_cost > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>{t('form.deliveryCostLabel')}</span>
                <span className={styles.summaryValue}>{formatCurrency(order.delivery_cost)}</span>
              </div>
            )}
            {order.discount_amount && order.discount_amount > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>{t('form.discount')}</span>
                <span className={styles.summaryValue}>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span className={styles.summaryLabel}>{t('form.total')}</span>
              <span className={styles.summaryValue}>{formatCurrency(order.final_amount || order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
