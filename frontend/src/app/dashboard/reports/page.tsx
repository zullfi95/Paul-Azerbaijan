"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Order, Application } from "../../../types/common";
import { makeApiRequest, extractApiData } from "../../../utils/apiHelpers";
import { useAuthGuard, canViewCalendar } from "../../../utils/authConstants";
import { generateOrdersReport } from "../../../utils/beoGenerator";
import DashboardLayout from "../../../components/DashboardLayout";
import { formatTotalAmount } from "../../../utils/numberUtils";
import { 
  ChartBarIcon,
  FileTextIcon,
  ShoppingBagIcon,
  CheckIcon,
  FilterIcon 
} from "../../../components/Icons";
import "../../../styles/dashboard.css";

interface ReportFilters {
  startDate: string;
  endDate: string;
  status: string;
  clientType: string;
}

interface ReportData {
  totalOrders: number;
  totalApplications: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  ordersByClientType: Record<string, number>;
  ordersByMonth: Record<string, number>;
}

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'all',
    clientType: 'all'
  });

  // Auth guard
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, canViewCalendar, router);

  // Загрузка данных
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersResult, applicationsResult] = await Promise.all([
        makeApiRequest<Order[]>("/orders"),
        makeApiRequest<Application[]>("/applications")
      ]);

      if (ordersResult.success) {
        setOrders(extractApiData(ordersResult.data || []));
      }
      if (applicationsResult.success) {
        setApplications(extractApiData(applicationsResult.data || []));
      }
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Генерация отчета
  const generateReport = useCallback(() => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    
    // Фильтрация данных
    let filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const filteredApplications = applications.filter(app => {
      const appDate = new Date(app.created_at);
      return appDate >= startDate && appDate <= endDate;
    });

    // Дополнительные фильтры
    if (filters.status !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    if (filters.clientType !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.client_type === filters.clientType);
    }

    // Расчет статистики
    const totalOrders = filteredOrders.length;
    const totalApplications = filteredApplications.length;
    const completedOrders = filteredOrders.filter(order => order.status === 'completed').length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Группировка по статусам
    const ordersByStatus = filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Группировка по типам клиентов
    const ordersByClientType = filteredOrders.reduce((acc, order) => {
      const clientType = order.client_type || 'unknown';
      acc[clientType] = (acc[clientType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Группировка по месяцам
    const ordersByMonth = filteredOrders.reduce((acc, order) => {
      const month = new Date(order.created_at).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setReportData({
      totalOrders,
      totalApplications,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      ordersByClientType,
      ordersByMonth
    });
  }, [orders, applications, filters]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  useEffect(() => {
    if (orders.length > 0 || applications.length > 0) {
      generateReport();
    }
  }, [orders, applications, generateReport]);

  // Экспорт отчета в PDF
  const handleExportPDF = () => {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate >= startDate && orderDate <= endDate;
    });
    
    generateOrdersReport(filteredOrders, startDate, endDate);
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
    <DashboardLayout>
      {/* Quick Actions */}
      <section className="dashboard-quick-actions" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="dashboard-quick-actions-grid">
          <button
            onClick={handleExportPDF}
            className="dashboard-quick-action-link"
            style={{
              background: 'var(--paul-black)',
              borderColor: 'var(--paul-black)',
              color: 'var(--paul-white)'
            }}
          >
            Экспорт PDF
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="dashboard-quick-action-link"
          >
            ← Назад к дашборду
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="dashboard-table-container" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-table-header">
          <div>
            <h2 className="dashboard-table-title">Фильтры отчета</h2>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--paul-gray)', 
              marginTop: 'var(--space-1)' 
            }}>
              Настройте параметры для генерации отчета
            </p>
          </div>
        </div>
        <div style={{ padding: 'var(--space-4)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)'
          }}>
            <div className="dashboard-info-item">
              <label className="dashboard-info-label">Дата начала</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="dashboard-search-input"
                style={{ minHeight: '40px' }}
              />
            </div>

            <div className="dashboard-info-item">
              <label className="dashboard-info-label">Дата окончания</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="dashboard-search-input"
                style={{ minHeight: '40px' }}
              />
            </div>

            <div className="dashboard-info-item">
              <label className="dashboard-info-label">Статус заказа</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="dashboard-filter-select"
                style={{ minHeight: '40px' }}
              >
                <option value="all">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="submitted">Отправлен</option>
                <option value="processing">В обработке</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            <div className="dashboard-info-item">
              <label className="dashboard-info-label">Тип клиента</label>
              <select
                value={filters.clientType}
                onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                className="dashboard-filter-select"
                style={{ minHeight: '40px' }}
              >
                <option value="all">Все типы</option>
                <option value="corporate">Корпоративные</option>
                <option value="one_time">Разовые</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Report Content */}
      {loading ? (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center',
          color: 'var(--paul-gray)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid #f1f5f9',
            borderTop: '4px solid var(--paul-black)',
            borderRadius: '50%',
            margin: '0 auto 24px',
            animation: 'spin 1.2s linear infinite'
          }}></div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: 'var(--paul-black)',
            marginBottom: '8px'
          }}>
            Загрузка данных...
          </div>
        </div>
      ) : reportData ? (
        <>
          {/* Таблица с данными */}
          <div className="dashboard-table-container">
            <div className="dashboard-table-header">
              <h2 className="dashboard-table-title">Отчет по заказам</h2>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--paul-gray)', 
                marginTop: 'var(--space-1)' 
              }}>
                Данные за период: {new Date(filters.startDate).toLocaleDateString('ru-RU')} - {new Date(filters.endDate).toLocaleDateString('ru-RU')}
              </p>
            </div>
            <div style={{ padding: 'var(--space-4)', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: 'var(--paul-subtle-beige)',
                    borderBottom: '2px solid var(--paul-border)'
                  }}>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>Статус</th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>Тип клиента</th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>Количество</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Строки по статусам */}
                  {Object.entries(reportData.ordersByStatus).map(([status, count]) => (
                    <tr key={`status-${status}`} style={{ 
                      borderBottom: '1px solid var(--paul-border)',
                      backgroundColor: 'var(--paul-white)'
                    }}>
                      <td style={{ 
                        padding: 'var(--space-3)',
                        color: 'var(--paul-black)',
                        fontSize: 'var(--text-sm)',
                        textTransform: 'capitalize'
                      }}>{status}</td>
                      <td style={{ 
                        padding: 'var(--space-3)',
                        color: 'var(--paul-gray)',
                        fontSize: 'var(--text-sm)'
                      }}>—</td>
                      <td style={{ 
                        padding: 'var(--space-3)',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--paul-black)',
                        fontSize: 'var(--text-sm)'
                      }}>{count}</td>
                    </tr>
                  ))}
                  {/* Строки по типам клиентов */}
                  {Object.entries(reportData.ordersByClientType).map(([type, count]) => (
                    <tr key={`type-${type}`} style={{ 
                      borderBottom: '1px solid var(--paul-border)',
                      backgroundColor: 'var(--paul-white)'
                    }}>
                      <td style={{ 
                        padding: 'var(--space-3)',
                        color: 'var(--paul-gray)',
                        fontSize: 'var(--text-sm)'
                      }}>—</td>
                      <td style={{ 
                        padding: 'var(--space-3)',
                        color: 'var(--paul-black)',
                        fontSize: 'var(--text-sm)'
                      }}>
                        {type === 'corporate' ? 'Корпоративные' : 
                         type === 'one_time' ? 'Разовые' : type}
                      </td>
                      <td style={{ 
                        padding: 'var(--space-3)',
                        textAlign: 'right',
                        fontWeight: 600,
                        color: 'var(--paul-black)',
                        fontSize: 'var(--text-sm)'
                      }}>{count}</td>
                    </tr>
                  ))}
                  {/* Итоговая строка */}
                  <tr style={{ 
                    backgroundColor: 'var(--paul-subtle-beige)',
                    borderTop: '2px solid var(--paul-border)',
                    fontWeight: 700
                  }}>
                    <td colSpan={2} style={{ 
                      padding: 'var(--space-3)',
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-base)'
                    }}>Всего заказов</td>
                    <td style={{ 
                      padding: 'var(--space-3)',
                      textAlign: 'right',
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-base)'
                    }}>{reportData.totalOrders}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center',
          color: 'var(--paul-gray)'
        }}>
          <div style={{ 
            fontSize: '64px', 
            marginBottom: '20px', 
            opacity: 0.6 
          }}>
            📊
          </div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            color: 'var(--paul-black)',
            marginBottom: '8px'
          }}>
            Нет данных для отображения
          </div>
          <div style={{ fontSize: '14px', color: 'var(--paul-gray)' }}>
            Измените параметры фильтров для получения отчета
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
