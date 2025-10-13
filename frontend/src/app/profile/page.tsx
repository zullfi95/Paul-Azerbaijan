"use client";

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import FeaturesSection from '../../components/FeaturesSection';
import Breadcrumbs from '../../components/Breadcrumbs';
import FeedbackModal from '../../components/FeedbackModal';
import { useUserProfile } from '../../hooks/useUserProfile';
import styles from './ProfilePage.module.css';
import { Dashboard } from '@/components/profile/Dashboard';
import { AccountInfoInformation } from '@/components/profile/AccountInfoInformation';
import { OrderStatus, PaymentStatus } from '@/types/unified';

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isAuthLoading,
    logout,
    isSubmitting,
    editForm,
    editError,
    billingAddress,
    setBillingAddress,
    shippingAddress,
    setShippingAddress,
    newsletterSubscriptions,
    setNewsletterSubscriptions,
    passwordForm,
    passwordError,
    activeOrders,
    allOrders,
    loadingOrders,
    loadingAllOrders,
    activeSection,
    setActiveSection,
    formErrors,
    orderFilter,
    setOrderFilter,
    initializeEditForm,
    handleEditFormChange,
    handleEditSubmit,
    handlePasswordSubmit,
    handleEmailFormSubmit,
    handleAddressSubmit,
    handleNewsletterUpdate,
    handleDirectPayment,
    handlePasswordFormChange,
    shippingAddressData,
    loadingShippingAddress
  } = useUserProfile();

  if (isAuthLoading) {
    return (
      <div className={styles.profilePage}>
        <Header />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={styles.profilePage}>
      <Header />
      
      <div style={{
        padding: '1rem 0',
        backgroundColor: '#FFFCF8',
        borderBottom: '1px solid rgba(0,0,0,0.06)'
      }}>
        <div style={{
          maxWidth: '1140px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <Breadcrumbs 
            items={[
              { label: 'Home', href: '/' },
              { label: 'My Account', isActive: true }
            ]}
          />
        </div>
      </div>
      <h2 className={styles.sectionTitle}>
        {{
          'my-account': 'My Account',
          'my-orders': 'My Orders',
          'address-information': 'Address Information',
          'edit-profile': 'Edit Profile',
          'change-password': 'Change Password',
          'newsletter-subscription': 'Newsletter Subscription'
        }[activeSection] || 'My Account'}
      </h2>


      <div className="navbar-spacing">
        <div className={styles.mainContent}>
          <aside className={styles.sidebar} role="navigation" aria-label="Account navigation">
            <nav className={styles.sidebarNav}>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'my-account' ? styles.active : ''}`}
                onClick={() => setActiveSection('my-account')}
                aria-current={activeSection === 'my-account' ? 'page' : undefined}
              >
                My Account
              </button>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'my-orders' ? styles.active : ''}`}
                onClick={() => setActiveSection('my-orders')}
                aria-current={activeSection === 'my-orders' ? 'page' : undefined}
              >
                My Orders
              </button>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'address-information' ? styles.active : ''}`}
                onClick={() => setActiveSection('address-information')}
                aria-current={activeSection === 'address-information' ? 'page' : undefined}
              >
                Address info information
              </button>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'account-info-information' ? styles.active : ''}`}
                onClick={() => setActiveSection('account-info-information')}
                aria-current={activeSection === 'account-info-information' ? 'page' : undefined}
              >
                Account info information
              </button>
              <button
                className={`${styles.sidebarButton} ${activeSection === 'newsletter-subscriptions' ? styles.active : ''}`}
                onClick={() => setActiveSection('newsletter-subscriptions')}
                aria-current={activeSection === 'newsletter-subscriptions' ? 'page' : undefined}
              >
                Newsletter subscriptions
              </button>
              <button 
                className={styles.sidebarButton}
                onClick={() => logout()}
              >
                Log out
              </button>
            </nav>
          </aside>
          

          <main className={styles.content}>
            {activeSection === 'my-account' && (
              <section className={styles.section}>
                <Dashboard
                  user={user}
                  activeOrders={activeOrders}
                  unreadCount={0}
                  shippingAddress={shippingAddressData}
                  onNavigate={setActiveSection}
                />
              </section>
            )}

            {activeSection === 'my-orders' && (
              <section className={styles.section}>
                <div className={styles.orderFilters}>
                <button
                    className={`${styles.filterButton} ${orderFilter === 'all' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('all')}
                  >
                    All Orders
                  </button>
                <button
                    className={`${styles.filterButton} ${orderFilter === 'delivered' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('delivered')}
                  >
                    Delivered
                  </button>
                  <button 
                    className={`${styles.filterButton} ${orderFilter === 'in-progress' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('in-progress')}
                  >
                    Currently in progress
                </button>
                <button 
                    className={`${styles.filterButton} ${orderFilter === 'payment-pending' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('payment-pending')}
                  >
                    Payment Pending
                </button>
                <button 
                    className={`${styles.filterButton} ${orderFilter === 'paid' ? styles.active : ''}`}
                    onClick={() => setOrderFilter('paid')}
                  >
                    Paid
                </button>
              </div>

              {loadingAllOrders ? (
                  <div className={styles.loadingState}>
                    <div className={styles.loadingSpinner} />
                    <span>Loading orders...</span>
                </div>
                ) : allOrders.length > 0 ? (
                  <div className={styles.ordersList}>
                    {allOrders
                      .filter((order) => {
                        if (orderFilter === 'delivered') {
                          return order.status === 'completed';
                        } else if (orderFilter === 'in-progress') {
                          return order.status === 'processing';
                        } else if (orderFilter === 'payment-pending') {
                          return order.status === 'submitted';
                        } else if (orderFilter === 'paid') {
                          return order.status === 'paid' || order.payment_status === 'paid';
                        }
                        return true;
                      })
                      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                      .map((order) => {
                      const firstItem = order.menu_items[0];
                      const orderDate = new Date(order.created_at);
                      
                      const getOrderStatus = (status: string, paymentStatus?: string) => {
                        // Check if order is paid (either by status or payment_status)
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
                      
                      return (
                        <div key={order.id} className={styles.orderCard}>
                          <div className={styles.orderImage}>
                            <Image 
                              src="/images/cake1.png"
                              alt={firstItem?.name || "Order item"} 
                              width={80}
                              height={80}
                              className={styles.productImage}
                            />
                          </div>
                          <div className={styles.orderDetails}>
                            <h3 className={styles.orderProductName}>
                              {firstItem?.name || `Order #${order.id}`}
                              {order.menu_items.length > 1 && ` +${order.menu_items.length - 1} more`}
                          </h3>
                            <div className={styles.orderInfo}>
                              <p className={styles.orderInfoItem}>
                                <span className={styles.orderInfoLabel}>Order date:</span>
                                <span>{orderDate.toLocaleDateString('en-GB')}</span>
                              </p>
                              <p className={styles.orderInfoItem}>
                                <span className={styles.orderInfoLabel}>Delivery type:</span>
                                <span>
                                  {order.delivery_type === 'delivery' ? 'Courier delivery' : 
                                   order.delivery_type === 'pickup' ? 'Pickup' : 
                                   order.delivery_type === 'buffet' ? 'Buffet service' : 
                                   'Standard delivery'}
                        </span>
                              </p>
                              <p className={styles.orderInfoItem}>
                                {order.status === 'submitted' ? 'Payment pending' : 'Payment completed'}
                              </p>
                        </div>
                            <div className={styles.orderTime}>
                              {orderDate.toLocaleTimeString('en-GB', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                        </div>
                      </div>
                          <div className={styles.orderPrice}>
                            <span className={styles.priceAmount}>
                              {order.final_amount || order.total_amount}
                            </span>
                            <span className={styles.currency}>₼</span>
                          </div>
                          <div className={styles.orderStatus}>
                            <div className={`${styles.statusBadge} ${orderStatus.isDelivered ? styles.delivered : styles.pending}`}>
                              <span className={styles.statusText}>{orderStatus.text}</span>
                              <div className={styles.statusIcon}>{orderStatus.icon}</div>
                            </div>
                      {orderStatus.needsPayment && (
                          <button
                                className={styles.completePaymentButton}
                            onClick={() => handleDirectPayment(order.id)}
                              >
                                Complete Payment
                          </button>
                      )}
                    </div>
                </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📋</div>
                    <p className={styles.emptyStateText}>
                      {orderFilter === 'all' 
                        ? 'You have no orders at the moment.'
                        : `You have no ${orderFilter.replace('-', ' ')} orders at the moment.`
                      }
                    </p>
                    <button 
                      className={styles.emptyStateButton}
                      onClick={() => router.push('/catering')}
                    >
                      Browse Menu
                    </button>
                </div>
              )}
        </section>
            )}

            {activeSection === 'address-information' && (
              <section className={styles.section}>
                
                {loadingShippingAddress ? (
                  <p>Loading address...</p>
                ) : (
                  <div className={styles.addressList}>
                    {shippingAddressData ? (
                      <div className={styles.addressCard}>
                        <p>{shippingAddressData.street}, {shippingAddressData.city}, {shippingAddressData.postal_code}</p>
                        <span className={styles.defaultBadge}>Default Shipping Address</span>
                      </div>
                    ) : (
                      <p>No shipping address saved yet.</p>
                    )}
                  </div>
                )}

                <div className={styles.singleColumnGrid}>
                  <div className={styles.infoBlock}>
                    <h3 className={styles.infoTitle}>{shippingAddressData ? 'Update Shipping Address' : 'Add Shipping Address'}</h3>
                    <form onSubmit={handleAddressSubmit} className={styles.addressForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Street Address</label>
                        <input
                          type="text"
                          className={styles.formInput}
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                          placeholder="Enter street address"
                        />
                      </div>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>City</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Enter city"
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Postal Code</label>
                          <input
                            type="text"
                            className={styles.formInput}
                            value={shippingAddress.postal_code}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                      <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : 'Add New Address'}
                      </button>
                    </form>
                  </div>
                </div>

              </section>
            )}

            {activeSection === 'account-info-information' && (
              <section className={styles.section}>
                <AccountInfoInformation
                  user={user}
                  onPasswordSubmit={handlePasswordSubmit}
                  onEmailSubmit={handleEmailFormSubmit}
                  isSubmitting={isSubmitting}
                  passwordError={passwordError}
                  editError={editError}
                />
              </section>
            )}

            {activeSection === 'edit-profile' && (
              <section className={styles.section}>
                <form onSubmit={handleEditSubmit} className={styles.profileForm}>
                  {editError && (
                    <div className={styles.errorMessage}>
                      {editError}
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className={`${styles.formInput} ${formErrors.name ? styles.inputError : ''}`}
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      placeholder="Enter your full name"
                    />
                    {formErrors.name && (
                      <span className={styles.fieldError}>{formErrors.name}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className={`${styles.formInput} ${formErrors.email ? styles.inputError : ''}`}
                      value={editForm.email}
                      onChange={handleEditFormChange}
                      placeholder="Enter your email address"
                    />
                    {formErrors.email && (
                      <span className={styles.fieldError}>{formErrors.email}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className={`${styles.formInput} ${formErrors.phone ? styles.inputError : ''}`}
                      value={editForm.phone}
                      onChange={handleEditFormChange}
                      placeholder="Enter your phone number"
                    />
                    {formErrors.phone && (
                      <span className={styles.fieldError}>{formErrors.phone}</span>
                    )}
                  </div>
                  
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setActiveSection('my-account')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </section>
            )}
            
            {activeSection === 'change-password' && (
              <section className={styles.section}>
                <form onSubmit={handlePasswordSubmit} className={styles.profileForm}>
                  {passwordError && (
                    <div className={styles.errorMessage}>
                      {passwordError}
                    </div>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Current Password *</label>
                    <input
                      type="password"
                      name="current_password"
                      className={`${styles.formInput} ${formErrors.current_password ? styles.inputError : ''}`}
                      value={passwordForm.current_password}
                      onChange={handlePasswordFormChange}
                      placeholder="Enter your current password"
                    />
                    {formErrors.current_password && (
                      <span className={styles.fieldError}>{formErrors.current_password}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Password *</label>
                    <input
                      type="password"
                      name="new_password"
                      className={`${styles.formInput} ${formErrors.new_password ? styles.inputError : ''}`}
                      value={passwordForm.new_password}
                      onChange={handlePasswordFormChange}
                      placeholder="Enter your new password"
                    />
                    {formErrors.new_password && (
                      <span className={styles.fieldError}>{formErrors.new_password}</span>
                    )}
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm New Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      className={`${styles.formInput} ${formErrors.confirm_password ? styles.inputError : ''}`}
                      value={passwordForm.confirm_password}
                      onChange={handlePasswordFormChange}
                      placeholder="Confirm your new password"
                    />
                    {formErrors.confirm_password && (
                      <span className={styles.fieldError}>{formErrors.confirm_password}</span>
                    )}
                  </div>
                  
                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={() => setActiveSection('my-account')}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeSection === 'newsletter-subscriptions' && (
              <section className={styles.section}>
                <div className={styles.newsletterSection}>
                  <div className={styles.infoBlock}>
                    <h3 className={styles.infoTitle}>Email Preferences</h3>
                    <p className={styles.infoText}>
                      Manage your email subscription preferences. You can choose which types of emails you&apos;d like to receive.
                    </p>
                  </div>
                  
                  <form onSubmit={(e) => { e.preventDefault(); handleNewsletterUpdate(); }} className={styles.newsletterForm}>
                    <div className={styles.subscriptionOptions}>
                      <div className={styles.subscriptionItem}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newsletterSubscriptions.general}
                            onChange={(e) => setNewsletterSubscriptions(prev => ({ ...prev, general: e.target.checked }))}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxText}>
                            <strong>General Newsletter</strong>
                            <small>Company news, updates, and general information</small>
                          </span>
                        </label>
                      </div>
                      
                      <div className={styles.subscriptionItem}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={newsletterSubscriptions.promotions}
                            onChange={(e) => setNewsletterSubscriptions(prev => ({ ...prev, promotions: e.target.checked }))}
                            className={styles.checkbox}
                          />
                          <span className={styles.checkboxText}>
                            <strong>Promotional Emails</strong>
                            <small>Special offers, discounts, and promotional content</small>
                          </span>
                        </label>
                      </div>
                      
                    </div>
                    
                    <div className={styles.formActions}>
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Updating...' : 'Update Preferences'}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </main>
          </div>

        <FeaturesSection />
        </div>

      {/* Feedback Modal Component */}
      <FeedbackModal />

      <Footer />
    </div>
  );
}
