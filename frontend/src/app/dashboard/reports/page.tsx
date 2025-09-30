"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { Order, Application } from "../../../config/api";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, canViewCalendar } from "../../../utils/authConstants";
import { generateOrdersReport } from "../../../utils/beoGenerator";
import { calculateTotalAmountSum, formatTotalAmount } from "../../../utils/numberUtils";

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
        makeApiRequest<Order[]>("orders"),
        makeApiRequest<Application[]>("applications")
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

    let filteredApplications = applications.filter(app => {
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
              Отчеты и аналитика
            </h1>
            <p style={{ color: '#4A4A4A', fontSize: '1rem' }}>
              Анализ заказов, заявок и финансовых показателей
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleExportPDF}
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
              📊 Экспорт PDF
            </button>

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

      {/* Filters */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 2rem 1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#1A1A1A',
            marginBottom: '1rem'
          }}>
            Фильтры отчета
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Дата начала
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Дата окончания
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Статус заказа
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              >
                <option value="all">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="submitted">Отправлен</option>
                <option value="processing">В обработке</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Тип клиента
              </label>
              <select
                value={filters.clientType}
                onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem'
                }}
              >
                <option value="all">Все типы</option>
                <option value="corporate">Корпоративные</option>
                <option value="one_time">Разовые</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem 2rem'
      }}>
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
          }}>
            <div>Загрузка данных...</div>
          </div>
        ) : reportData ? (
          <>
            {/* Основные показатели */}
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
                  {reportData.totalOrders}
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
                  color: '#10B981',
                  marginBottom: '0.5rem'
                }}>
                  {reportData.completedOrders}
                </h3>
                <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
                  Завершенных заказов
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
                  {formatTotalAmount(reportData.totalRevenue)} ₼
                </h3>
                <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
                  Общая выручка
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
                  {formatTotalAmount(reportData.averageOrderValue)} ₼
                </h3>
                <p style={{ color: '#4A4A4A', fontSize: '0.875rem' }}>
                  Средний чек
                </p>
              </div>
            </div>

            {/* Детальная аналитика */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1rem'
            }}>
              {/* Заказы по статусам */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1A1A1A',
                  marginBottom: '1rem'
                }}>
                  Заказы по статусам
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(reportData.ordersByStatus).map(([status, count]) => (
                    <div key={status} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: '#F9F9F6',
                      borderRadius: '0.25rem'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>{status}</span>
                      <span style={{ fontWeight: 'bold' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Заказы по типам клиентов */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1A1A1A',
                  marginBottom: '1rem'
                }}>
                  Заказы по типам клиентов
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(reportData.ordersByClientType).map(([type, count]) => (
                    <div key={type} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: '#F9F9F6',
                      borderRadius: '0.25rem'
                    }}>
                      <span style={{ textTransform: 'capitalize' }}>
                        {type === 'corporate' ? 'Корпоративные' : 
                         type === 'one_time' ? 'Разовые' : type}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Заказы по месяцам */}
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#1A1A1A',
                  marginBottom: '1rem'
                }}>
                  Заказы по месяцам
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(reportData.ordersByMonth).map(([month, count]) => (
                    <div key={month} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: '#F9F9F6',
                      borderRadius: '0.25rem'
                    }}>
                      <span>{month}</span>
                      <span style={{ fontWeight: 'bold' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px'
          }}>
            <div>Нет данных для отображения</div>
          </div>
        )}
      </div>
    </div>
  );
}
