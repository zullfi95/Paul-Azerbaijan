"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Order } from "../../../config/api";
import OrderCalendar from "../../../components/OrderCalendar";
import { generateBEOFile } from "../../../utils/beoGenerator";
import { calculateTotalAmountSum, formatTotalAmount } from "../../../utils/numberUtils";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, canViewCalendar } from "../../../utils/authConstants";

export default function CalendarPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);

  // Auth guard с улучшенной проверкой доступа
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, canViewCalendar, router);

  // Загрузка заказов с оптимизацией
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const result = await makeApiRequest<Order[]>("/orders");
      if (result.success) {
        setOrders(extractApiData(result.data || []));
      } else {
        console.error("Failed to load orders:", handleApiError(result));
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9F9F6' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1A1A1A',
              fontFamily: 'Playfair Display, serif',
              marginBottom: '0.5rem'
            }}>
              Календарь заказов
            </h1>
            <p style={{ color: '#4A4A4A', fontSize: '1rem' }}>
              Управление заказами и планирование мероприятий
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Кнопка обновления */}
            <button
              onClick={loadOrders}
              disabled={ordersLoading}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: ordersLoading ? '#6B7280' : '#1A1A1A',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: ordersLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem'
              }}
            >
              {ordersLoading ? 'Обновление...' : 'Обновить'}
            </button>

            {/* Кнопка создания заказа */}
            <button
              onClick={() => router.push('/dashboard/orders/create')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#D4AF37',
                color: '#1A1A1A',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              + Новый заказ
            </button>

            {/* Кнопка назад в dashboard */}
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: '#1A1A1A',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              ← Назад
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* Статистика */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1A1A1A',
              marginBottom: '0.5rem'
            }}>
              {orders.length}
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
              Всего заказов
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#D4AF37',
              marginBottom: '0.5rem'
            }}>
              {(orders || []).filter(order => order.status === 'processing').length}
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
              В обработке
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#10B981',
              marginBottom: '0.5rem'
            }}>
              {(orders || []).filter(order => order.status === 'completed').length}
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
              Завершенных
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#F59E0B',
              marginBottom: '0.5rem'
            }}>
              {calculateTotalAmountSum(orders || []).toFixed(2)}₼
            </h3>
            <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
              Общая сумма
            </p>
          </div>
        </div>

        {/* Календарь */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1A1A1A',
              marginBottom: '1rem'
            }}>
              Создать новый заказ
            </h3>
            <p style={{ color: '#4A4A4A', marginBottom: '1.5rem' }}>
              Дата: {createDate.toLocaleDateString('ru-RU')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  const dateStr = createDate.toISOString().split('T')[0];
                  router.push(`/dashboard/orders/create?date=${dateStr}`);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#D4AF37',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Боковая панель с деталями заказа */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 999,
          padding: '2rem',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1A1A1A'
            }}>
              Заказ #{selectedOrder.id}
            </h3>
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6B7280'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Компания:</strong> {selectedOrder.company_name}
            </div>
            <div>
              <strong>Статус:</strong> {selectedOrder.status}
            </div>
            <div>
              <strong>Дата доставки:</strong> {selectedOrder.delivery_date}
            </div>
            {selectedOrder.total_amount && (
              <div>
                <strong>Сумма:</strong> {formatTotalAmount(selectedOrder.total_amount)} ₼
              </div>
            )}
            {selectedOrder.comment && (
              <div>
                <strong>Комментарий:</strong> {selectedOrder.comment}
              </div>
            )}

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => handleGenerateBEO(selectedOrder)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#D4AF37',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                📄 Скачать BEO файл
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/orders/${selectedOrder.id}`)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#1A1A1A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                Редактировать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
