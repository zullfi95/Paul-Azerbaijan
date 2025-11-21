"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "../../../contexts/AuthContext";
import { Order, Application } from "../../../types/common";
import { makeApiRequest, extractApiData } from "../../../utils/apiHelpers";
import { useAuthGuard, canViewCalendar } from "../../../utils/authConstants";
import { generateOrdersReport } from "../../../utils/beoGenerator";
import DashboardLayout from "../../../components/DashboardLayout";
import { formatTotalAmount } from "../../../utils/numberUtils";
import { getStatusLabel, STATUS_COLORS } from "../../../utils/statusTranslations";
import { 
  ChartBarIcon,
  FileTextIcon,
  ShoppingBagIcon,
  CheckIcon,
  FilterIcon,
  EyeIcon 
} from "../../../components/Icons";
import "../../../styles/dashboard.css";

interface ReportFilters {
  startDate: string;
  endDate: string;
  status: string;
  clientType: string;
}

interface ReportData {
  filteredOrders: Order[];
  totalOrders: number;
  totalApplications: number;
  completedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [filteredOrdersList, setFilteredOrdersList] = useState<Order[]>([]);
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

    // Сортируем заказы по дате доставки (новые сначала)
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.delivery_date || a.created_at).getTime();
      const dateB = new Date(b.delivery_date || b.created_at).getTime();
      return dateB - dateA;
    });

    setFilteredOrdersList(sortedOrders);
    setReportData({
      filteredOrders: sortedOrders,
      totalOrders,
      totalApplications,
      completedOrders,
      totalRevenue,
      averageOrderValue
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
    
    const locale = document.documentElement.lang || 'ru';
    const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-US', az: 'az-AZ' };
    generateOrdersReport(filteredOrders, startDate, endDate, t, localeMap[locale] || 'ru-RU');
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>{t('common.loading')}</div>
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
            {t('reports.exportPDF')}
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="dashboard-quick-action-link"
          >
            ← {t('reports.backToDashboard')}
          </button>
        </div>
      </section>

      {/* Filters */}
      <section className="dashboard-table-container" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-table-header">
          <div>
            <h2 className="dashboard-table-title">{t('reports.filters')}</h2>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--paul-gray)', 
              marginTop: 'var(--space-1)' 
            }}>
              {t('reports.configureParameters')}
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
              <label className="dashboard-info-label">{t('reports.startDate')}</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="dashboard-search-input"
                style={{ minHeight: '40px' }}
              />
            </div>

            <div className="dashboard-info-item">
              <label className="dashboard-info-label">{t('reports.endDate')}</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="dashboard-search-input"
                style={{ minHeight: '40px' }}
              />
            </div>

            <div className="dashboard-info-item">
              <label className="dashboard-info-label">{t('reports.orderStatus')}</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="dashboard-filter-select"
                style={{ minHeight: '40px' }}
              >
                <option value="all">{t('users.allStatuses')}</option>
                <option value="draft">{t('orders.status.draft')}</option>
                <option value="submitted">{t('orders.status.submitted')}</option>
                <option value="processing">{t('orders.status.processing')}</option>
                <option value="completed">{t('orders.status.completed')}</option>
                <option value="cancelled">{t('orders.status.cancelled')}</option>
              </select>
            </div>

            <div className="dashboard-info-item">
              <label className="dashboard-info-label">{t('reports.clientType')}</label>
              <select
                value={filters.clientType}
                onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                className="dashboard-filter-select"
                style={{ minHeight: '40px' }}
              >
                <option value="all">{t('reports.allTypes')}</option>
                <option value="corporate">{t('users.corporate')}</option>
                <option value="one_time">{t('users.oneTime')}</option>
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
            {t('reports.loadingData')}
          </div>
        </div>
      ) : reportData && reportData.filteredOrders && reportData.filteredOrders.length > 0 ? (
        <>
          {/* Таблица с данными */}
          <div className="dashboard-table-container">
            <div className="dashboard-table-header">
              <h2 className="dashboard-table-title">{t('reports.ordersReport')}</h2>
              <p style={{ 
                fontSize: 'var(--text-sm)', 
                color: 'var(--paul-gray)', 
                marginTop: 'var(--space-1)' 
              }}>
                {t('reports.dataForPeriod', { 
                  startDate: new Date(filters.startDate).toLocaleDateString('ru-RU'),
                  endDate: new Date(filters.endDate).toLocaleDateString('ru-RU'),
                  count: reportData.totalOrders
                })}
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
                    }}>{t('reports.date')}</th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'left',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>{t('reports.client')}</th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'right',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>{t('reports.check')}</th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>{t('reports.status')}</th>
                    <th style={{ 
                      padding: 'var(--space-3)', 
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'var(--paul-black)',
                      fontSize: 'var(--text-sm)'
                    }}>{t('reports.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.filteredOrders.map((order) => {
                    const clientName = order.client?.name || order.company_name || order.customer?.first_name 
                      ? `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() || order.company_name
                      : t('reports.notSpecified');
                    const deliveryDate = order.delivery_date 
                      ? new Date(order.delivery_date).toLocaleDateString('ru-RU')
                      : new Date(order.created_at).toLocaleDateString('ru-RU');
                    
                    return (
                      <tr key={order.id} style={{ 
                        borderBottom: '1px solid var(--paul-border)',
                        backgroundColor: 'var(--paul-white)',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--paul-subtle-beige)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--paul-white)';
                      }}
                      >
                        <td style={{ 
                          padding: 'var(--space-3)',
                          color: 'var(--paul-black)',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 500
                        }}>{deliveryDate}</td>
                        <td style={{ 
                          padding: 'var(--space-3)',
                          color: 'var(--paul-black)',
                          fontSize: 'var(--text-sm)'
                        }}>
                          <div style={{ fontWeight: 600, marginBottom: '2px' }}>{clientName}</div>
                          {order.client_type && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--paul-gray)' }}>
                              {order.client_type === 'corporate' ? t('users.corporate') : t('users.oneTime')}
                            </div>
                          )}
                        </td>
                        <td style={{ 
                          padding: 'var(--space-3)',
                          textAlign: 'right',
                          fontWeight: 600,
                          color: 'var(--paul-black)',
                          fontSize: 'var(--text-sm)'
                        }}>{formatTotalAmount(order.total_amount || 0)} ₼</td>
                        <td style={{ 
                          padding: 'var(--space-3)',
                          textAlign: 'center'
                        }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-xs)',
                            fontWeight: 600,
                            backgroundColor: `${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || '#6B7280'}20`,
                            color: STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || '#6B7280',
                            border: `1px solid ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || '#6B7280'}40`
                          }}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td style={{ 
                          padding: 'var(--space-3)',
                          textAlign: 'center'
                        }}>
                          <button
                            onClick={() => router.push(`/dashboard/orders/${order.id}/edit`)}
                            style={{
                              padding: '6px 16px',
                              border: '2px solid var(--paul-black)',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--paul-white)',
                              color: 'var(--paul-black)',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--paul-black)';
                              e.currentTarget.style.color = 'var(--paul-white)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--paul-white)';
                              e.currentTarget.style.color = 'var(--paul-black)';
                            }}
                          >
                            <EyeIcon size={14} />
                            {t('reports.view')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
            {t('reports.noData')}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--paul-gray)' }}>
            {t('reports.changeFilters')}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
