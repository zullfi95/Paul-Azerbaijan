"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Order } from "../../../types/common";
import OrderCalendar from "../../../components/OrderCalendar";
import { generateBEOFile } from "../../../utils/beoGenerator";
import { calculateTotalAmountSum, formatTotalAmount } from "../../../utils/numberUtils";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, canViewCalendar } from "../../../utils/authConstants";
import DashboardLayout from "../../../components/DashboardLayout";
import { 
  RefreshIcon,
  CalendarIcon,
  ShoppingBagIcon,
  FileTextIcon,
  CheckIcon 
} from "../../../components/Icons";
import "../../../styles/dashboard.css";
import styles from './page.module.css';

export default function CalendarPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // Auth guard с улучшенной проверкой доступа
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', position: '', staff_role: '' }, canViewCalendar, router);

  // Загрузка заказов с оптимизацией
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const result = await makeApiRequest<Order[]>("/orders");
      if (result.success) {
        setOrders(extractApiData(result.data || []));
      } else {
        console.error("Failed to load orders:", handleApiError(result as any));
      }
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, loadOrders]);

  // Обработчик выбора заказа
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  // Обработчик создания нового заказа
  const handleCreateOrder = (date: Date) => {
    setCreateDate(date);
    setShowCreateModal(true);
  };

  // Генерация BEO файла
  const handleGenerateBEO = async (order: Order) => {
    try {
      generateBEOFile(order);
    } catch (error) {
      console.error('Error generating BEO file:', error);
      alert(t('calendar.errorCreatingBEO'));
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <div className="loading-title">{t('common.loading')}</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* Quick Actions */}
      <section className="dashboard-quick-actions" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="dashboard-quick-actions-grid">
          <button
            onClick={loadOrders}
            disabled={ordersLoading}
            className="dashboard-quick-action-link"
            style={{
              opacity: ordersLoading ? 0.6 : 1,
              cursor: ordersLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {ordersLoading ? t('calendar.refreshing') : t('calendar.refresh')}
          </button>
          <button
            onClick={() => router.push('/dashboard/orders/create')}
            className="dashboard-quick-action-link"
            style={{
              background: 'var(--paul-black)',
              color: 'var(--paul-white)'
            }}
          >
            + {t('calendar.newOrder')}
          </button>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="dashboard-kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <CalendarIcon size={16} className="dashboard-kpi-icon" />
            <span className="dashboard-kpi-label">{t('calendar.totalOrders')}</span>
          </div>
          <div className="dashboard-kpi-value">
            {orders.length}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('calendar.inCalendar')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <FileTextIcon size={16} className="dashboard-kpi-icon" style={{ color: '#F59E0B' }} />
            <span className="dashboard-kpi-label">{t('orders.status.processing')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>
            {(orders || []).filter(order => order.status === 'processing').length}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('calendar.requireAttention')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <CheckIcon size={16} className="dashboard-kpi-icon" style={{ color: '#10B981' }} />
            <span className="dashboard-kpi-label">{t('dashboard.completedOrders')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>
            {(orders || []).filter(order => order.status === 'completed').length}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('calendar.completedSuccessfully')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <ShoppingBagIcon size={16} className="dashboard-kpi-icon" style={{ color: '#D4AF37' }} />
            <span className="dashboard-kpi-label">{t('orders.totalAmount')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#D4AF37' }}>
            {calculateTotalAmountSum(orders || []).toFixed(2)}₼
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('calendar.totalRevenue')}
          </div>
        </div>
      </section>

      {/* Календарь */}
      <div className="dashboard-table-container">
        <div className="dashboard-table-header">
          <h2 className="dashboard-table-title">{t('calendar.title')}</h2>
          <p style={{ 
            fontSize: 'var(--text-sm)', 
            color: 'var(--paul-gray)', 
            marginTop: 'var(--space-1)' 
          }}>
            {t('calendar.description')}
          </p>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <OrderCalendar
            orders={orders || []}
            onSelectOrder={handleSelectOrder}
            onCreateOrder={handleCreateOrder}
            isLoading={ordersLoading}
          />
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && createDate && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal" style={{ maxWidth: '500px' }}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">
                {t('calendar.createNew')}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="dashboard-modal-close"
              >
                {t('common.close')}
              </button>
            </div>
            <div className="dashboard-modal-content">
              <div className="dashboard-info-item" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="dashboard-info-label">{t('common.date')}</div>
                <div className="dashboard-info-value">
                  {createDate.toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                gap: 'var(--space-3)', 
                justifyContent: 'flex-end',
                borderTop: '1px solid var(--paul-border)',
                paddingTop: 'var(--space-4)'
              }}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="dashboard-action-btn"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    const dateStr = createDate.toISOString().split('T')[0];
                    router.push(`/dashboard/orders/create?date=${dateStr}`);
                  }}
                  className="dashboard-action-btn"
                  style={{
                    background: 'var(--paul-black)',
                    color: 'var(--paul-white)'
                  }}
                >
                  {t('common.create')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Sidebar */}
      {selectedOrder && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal" style={{ maxWidth: '600px' }}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">
                {t('orders.orderNumber')}{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="dashboard-modal-close"
              >
                {t('common.close')}
              </button>
            </div>

            <div className="dashboard-modal-content">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                <div className="dashboard-info-item">
                  <div className="dashboard-info-label">{t('calendar.company')}</div>
                  <div className="dashboard-info-value">{selectedOrder.company_name}</div>
                </div>
                <div className="dashboard-info-item">
                  <div className="dashboard-info-label">{t('common.status')}</div>
                  <div className="dashboard-info-value">
                    <span className="dashboard-status-badge">{selectedOrder.status}</span>
                  </div>
                </div>
                <div className="dashboard-info-item">
                  <div className="dashboard-info-label">{t('orders.deliveryDate')}</div>
                  <div className="dashboard-info-value">{selectedOrder.delivery_date}</div>
                </div>
                {selectedOrder.total_amount && (
                  <div className="dashboard-info-item">
                    <div className="dashboard-info-label">{t('common.amount')}</div>
                    <div className="dashboard-info-value" style={{ color: '#D4AF37', fontWeight: 600 }}>
                      {formatTotalAmount(selectedOrder.total_amount)} ₼
                    </div>
                  </div>
                )}
              </div>

              {selectedOrder.comment && (
                <div className="dashboard-section-divider">
                  <h3 className="dashboard-section-title">{t('calendar.comment')}</h3>
                  <div style={{ 
                    padding: 'var(--space-3)', 
                    background: '#F9F9F6', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--paul-border)',
                    color: 'var(--paul-black)',
                    fontSize: 'var(--text-sm)'
                  }}>
                    {selectedOrder.comment}
                  </div>
                </div>
              )}

              <div style={{ 
                display: 'flex', 
                gap: 'var(--space-2)', 
                justifyContent: 'flex-end',
                borderTop: '1px solid var(--paul-border)',
                paddingTop: 'var(--space-4)',
                marginTop: 'var(--space-4)'
              }}>
                <button
                  onClick={() => handleGenerateBEO(selectedOrder)}
                  className="dashboard-action-btn"
                >
                  {t('calendar.createBEO')}
                </button>
                <button
                  onClick={() => router.push(`/dashboard/orders/${selectedOrder.id}/edit`)}
                  className="dashboard-action-btn"
                  style={{
                    background: 'var(--paul-black)',
                    color: 'var(--paul-white)'
                  }}
                >
                  {t('common.edit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
