// Dashboard component for profile overview

import React from 'react';
import { Edit } from 'lucide-react';
import styles from './Dashboard.module.css';
import { User, Order, ShippingAddress } from '@/types/unified';

interface DashboardProps {
  user: User | null;
  activeOrders: Order[];
  unreadCount: number;
  shippingAddress?: ShippingAddress | null;
  onNavigate: (section: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  activeOrders,
  unreadCount,
  shippingAddress,
  onNavigate
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

      {/* Account Information */}
      <div className={styles.accountInfo}>
        {/* Top Row - Contact Information and Newsletters */}
        <div className={styles.topRow}>
          {/* Contact Information */}
          <div className={styles.contactSection}>
          <h3 className={styles.sectionTitle}>Contact Information</h3>
            <div className={styles.contactInfo}>
              <div className={styles.infoValue}>
                {user?.name} {user?.last_name}
              </div>
              <div className={styles.infoValue}>{user?.email || 'Not provided'}</div>
              <div className={styles.infoValue}>{user?.phone || 'Not provided'}</div>
            </div>
            <div className={styles.contactButtons}>
              <button 
                className={styles.editButton}
                onClick={() => onNavigate('edit-profile')}
              >
                <Edit size={16} className={styles.editIcon} />
                Edit
              </button>
              <button 
                className={styles.changePasswordButton}
                onClick={() => onNavigate('change-password')}
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Newsletters */}
          <div className={styles.newslettersSection}>
            <h3 className={styles.sectionTitle}>Newsletters</h3>
            <div className={styles.newsletterInfo}>
              <div className={styles.subscriptionText}>
                You are subscribed to "General Subscription".
              </div>
            </div>
            <div className={styles.newsletterButtons}>
              <button 
                className={styles.editButton}
                onClick={() => onNavigate('newsletter-subscriptions')}
              >
                <Edit size={16} className={styles.editIcon} />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Address Information */}
        <div className={styles.bottomRow}>
          <div className={styles.addressSection}>
            <h3 className={styles.sectionTitle}>Address Information</h3>
            <div className={styles.addressInfo}>
              <div className={styles.infoItem}>
                <div className={styles.infoLabel}>Address</div>
                <div className={styles.infoValue}>
                  {shippingAddress 
                    ? `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.postal_code}`
                    : 'Not provided'
                  }
                </div>
              </div>
            </div>
            <div className={styles.addressButtons}>
              <button 
                className={styles.editButton}
                onClick={() => onNavigate('address-information')}
              >
                <Edit size={16} className={styles.editIcon} />
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
