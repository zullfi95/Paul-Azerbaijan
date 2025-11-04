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
      console.error('Ошибка при генерации BEO файла:', error);
      alert('Ошибка при создании BEO файла');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <div className="loading-title">Загрузка...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-main">
            <div className="page-header-left">
              <button
                onClick={() => router.push('/dashboard')}
                className="back-button"
              >
                <svg className="back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="page-title">
                  Календарь заказов
                </h1>
                <p className="page-description">
                  Управление заказами и планирование мероприятий
                </p>
              </div>
            </div>

            <div className="page-actions">
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className={`action-button refresh-button ${ordersLoading ? 'disabled' : ''}`}
              >
                {ordersLoading ? 'Обновление...' : 'Обновить'}
              </button>

              <button
                onClick={() => router.push('/dashboard/orders/create')}
                className="action-button primary-button"
              >
                + Новый заказ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Статистика */}
        <div className="dashboard-kpi-grid">
          <div className="dashboard-kpi-card">
            <div className="dashboard-kpi-header">
              <span className="dashboard-kpi-icon">📋</span>
              <span className="dashboard-kpi-label">Всего заказов</span>
            </div>
            <div className="dashboard-kpi-value">
              {orders.length}
            </div>
            <div className="dashboard-kpi-subtitle">
              В календаре
            </div>
          </div>

          <div className="dashboard-kpi-card">
            <div className="dashboard-kpi-header">
              <span className="dashboard-kpi-icon status-processing">⏳</span>
              <span className="dashboard-kpi-label">В обработке</span>
            </div>
            <div className="dashboard-kpi-value status-processing">
              {(orders || []).filter(order => order.status === 'processing').length}
            </div>
            <div className="dashboard-kpi-subtitle">
              Требуют внимания
            </div>
          </div>

          <div className="dashboard-kpi-card">
            <div className="dashboard-kpi-header">
              <span className="dashboard-kpi-icon status-approved">✅</span>
              <span className="dashboard-kpi-label">Завершенных</span>
            </div>
            <div className="dashboard-kpi-value status-approved">
              {(orders || []).filter(order => order.status === 'completed').length}
            </div>
            <div className="dashboard-kpi-subtitle">
              Выполнено успешно
            </div>
          </div>

          <div className="dashboard-kpi-card">
            <div className="dashboard-kpi-header">
              <span className="dashboard-kpi-icon">💰</span>
              <span className="dashboard-kpi-label">Общая сумма</span>
            </div>
            <div className="dashboard-kpi-value" style={{ color: '#D4AF37' }}>
              {calculateTotalAmountSum(orders || []).toFixed(2)}₼
            </div>
            <div className="dashboard-kpi-subtitle">
              Общий оборот
            </div>
          </div>
        </div>

        {/* Календарь */}
        <div className={styles.calendarContainer}>
          <OrderCalendar
            orders={orders || []}
            onSelectOrder={handleSelectOrder}
            onCreateOrder={handleCreateOrder}
            isLoading={ordersLoading}
          />
        </div>
      </div>

      {/* Модальное окно создания заказа */}
      {showCreateModal && createDate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                Создать новый заказ
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={styles.modalClose}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.dateInfo}>
                Дата: {createDate.toLocaleDateString('ru-RU')}
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    const dateStr = createDate.toISOString().split('T')[0];
                    router.push(`/dashboard/orders/create?date=${dateStr}`);
                  }}
                  className={styles.createButton}
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Боковая панель с деталями заказа */}
      {selectedOrder && (
        <div className={`${styles.sidebarPreview} ${selectedOrder ? 'open' : ''}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle}>
              Заказ #{selectedOrder.id}
            </h3>
            <button
              onClick={() => setSelectedOrder(null)}
              className={styles.sidebarClose}
            >
              ×
            </button>
          </div>

          <div className={styles.sidebarBody}>
            <div className={styles.sidebarSection}>
              <div className={styles.infoField}>
                <div className={styles.infoLabel}>Компания:</div>
                <div className={styles.infoValue}>{selectedOrder.company_name}</div>
              </div>
              <div className={styles.infoField}>
                <div className={styles.infoLabel}>Статус:</div>
                <div className={styles.infoValue}>{selectedOrder.status}</div>
              </div>
              <div className={styles.infoField}>
                <div className={styles.infoLabel}>Дата доставки:</div>
                <div className={styles.infoValue}>{selectedOrder.delivery_date}</div>
              </div>
              {selectedOrder.total_amount && (
                <div className={styles.infoField}>
                  <div className={styles.infoLabel}>Сумма:</div>
                  <div className={styles.infoValue}>
                    {formatTotalAmount(selectedOrder.total_amount)} ₼
                  </div>
                </div>
              )}
              {selectedOrder.comment && (
                <div className={styles.infoField}>
                  <div className={styles.infoLabel}>Комментарий:</div>
                  <div className={styles.infoValue}>{selectedOrder.comment}</div>
                </div>
              )}

              <div className={styles.actionsList}>
                <button
                  onClick={() => handleGenerateBEO(selectedOrder)}
                  className={styles.actionButton}
                >
                  📄 Скачать BEO файл
                </button>
                
                <button
                  onClick={() => router.push(`/dashboard/orders/${selectedOrder.id}/edit`)}
                  className={styles.actionButton}
                >
                  ✏️ Редактировать
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
