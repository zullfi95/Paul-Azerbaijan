// Dashboard component for profile overview

import React from 'react';
import { User, Order } from '../../config/api';
import styles from './Dashboard.module.css';

interface DashboardProps {
  user: User | null;
  activeOrders: Order[];
  unreadCount: number;
  onNavigate: (section: string) => void;
  onInitializeEditForm: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  activeOrders,
  unreadCount,
  onNavigate,
  onInitializeEditForm
}) => {
  const getOrderStatusCount = (status: string) => {
    return activeOrders.filter(order => order.status === status).length;
  };

  const getRecentOrders = () => {
    return activeOrders
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return '#10b981';
      case 'in-progress': return '#f59e0b';
      case 'payment-pending': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Recent Orders */}
      {getRecentOrders().length > 0 && (
        <div className={styles.recentOrders}>
          <h3 className={styles.sectionTitle}>Recent Orders</h3>
          <div className={styles.ordersList}>
            {getRecentOrders().map((order) => (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderInfo}>
                  <div className={styles.orderId}>Order #{order.id}</div>
                  <div className={styles.orderDate}>{formatDate(order.created_at)}</div>
                </div>
                <div className={styles.orderStatus}>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status.replace('-', ' ')}
                  </span>
                </div>
                <div className={styles.orderTotal}>
                  ${order.total_amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
          <button 
            className={styles.viewAllButton}
            onClick={() => onNavigate('my-orders')}
          >
            View All Orders
          </button>
        </div>
      )}

      {/* Account Summary */}
      <div className={styles.accountSummary}>
        <h3 className={styles.sectionTitle}>Account Summary</h3>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Email</div>
            <div className={styles.summaryValue}>{user?.email || 'Not provided'}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Phone</div>
            <div className={styles.summaryValue}>{user?.phone || 'Not provided'}</div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Member Since</div>
            <div className={styles.summaryValue}>
              {user?.created_at ? formatDate(user.created_at) : 'Unknown'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
