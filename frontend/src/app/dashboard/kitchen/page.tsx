"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "../../../contexts/AuthContext";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, canViewKitchen } from "../../../utils/authConstants";
import DashboardLayout from "../../../components/DashboardLayout";
import { 
  RefreshIcon,
  CalendarIcon,
  TableIcon,
  ShoppingBagIcon,
  UtensilsIcon
} from "../../../components/Icons";
import "../../../styles/dashboard.css";

interface KitchenItem {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
  orders?: Array<{
    order_id: number;
    company_name: string;
    quantity: number;
  }>;
  total_quantity?: number;
  dates?: string[];
}

interface KitchenDateData {
  date: string;
  date_formatted: string;
  orders: Array<{
    id: number;
    company_name: string;
    delivery_time: string | null;
    status: string;
  }>;
  items: KitchenItem[];
}

interface KitchenViewData {
  items_by_date: KitchenDateData[];
  items_summary: KitchenItem[];
  total_orders: number;
  date_range: {
    from: string | null;
    to: string | null;
  };
}

type ViewMode = 'table' | 'calendar';

export default function KitchenPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [kitchenData, setKitchenData] = useState<KitchenViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Auth guard
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, canViewKitchen, router);

  // Загрузка данных
  const loadKitchenData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await makeApiRequest<KitchenViewData>("/observer/kitchen-view");
      if (result.success && result.data) {
        setKitchenData(extractApiData(result.data));
      } else {
        console.error("Failed to load kitchen data:", handleApiError(result as any));
      }
    } catch (e) {
      console.error("Failed to load kitchen data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasAccess) {
      loadKitchenData();
    }
  }, [isAuthenticated, hasAccess, loadKitchenData]);

  // Получаем уникальные даты для календаря
  const dates = useMemo(() => {
    if (!kitchenData) return [];
    return kitchenData.items_by_date.map(d => d.date);
  }, [kitchenData]);

  // Получаем данные для выбранной даты
  const selectedDateData = useMemo(() => {
    if (!selectedDate || !kitchenData) return null;
    return kitchenData.items_by_date.find(d => d.date === selectedDate) || null;
  }, [selectedDate, kitchenData]);

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
      <div className="dashboard-page">
        {/* Header */}
        <div className="dashboard-page-header">
          <div>
            <h1 className="dashboard-page-title">{t('kitchen.title')}</h1>
            <p className="dashboard-page-subtitle">{t('kitchen.subtitle')}</p>
          </div>
          <div className="dashboard-page-actions">
            <button
              onClick={loadKitchenData}
              className="dashboard-btn dashboard-btn-secondary"
              disabled={loading}
              aria-label={t('common.refresh')}
            >
              <RefreshIcon size={18} />
              {t('common.refresh')}
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="dashboard-view-toggle" style={{ marginBottom: 'var(--space-6)' }}>
          <button
            onClick={() => setViewMode('table')}
            className={`dashboard-view-btn ${viewMode === 'table' ? 'active' : ''}`}
            aria-label={t('kitchen.viewTable')}
          >
            <TableIcon size={18} />
            {t('kitchen.viewTable')}
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`dashboard-view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            aria-label={t('kitchen.viewCalendar')}
          >
            <CalendarIcon size={18} />
            {t('kitchen.viewCalendar')}
          </button>
        </div>

        {/* KPI Cards */}
        {kitchenData && (
          <div className="dashboard-kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-label">{t('kitchen.totalOrders')}</div>
              <div className="dashboard-kpi-value" style={{ color: '#3B82F6' }}>
                {kitchenData.total_orders}
              </div>
            </div>
            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-label">{t('kitchen.totalItems')}</div>
              <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>
                {kitchenData.items_summary.length}
              </div>
            </div>
            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-label">{t('kitchen.dateRange')}</div>
              <div className="dashboard-kpi-value" style={{ color: '#F59E0B', fontSize: '14px' }}>
                {kitchenData.date_range.from && kitchenData.date_range.to
                  ? `${new Date(kitchenData.date_range.from).toLocaleDateString()} - ${new Date(kitchenData.date_range.to).toLocaleDateString()}`
                  : t('kitchen.noDates')}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="dashboard-table-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <div className="loading-title">{t('common.loading')}</div>
              </div>
            ) : kitchenData && kitchenData.items_summary.length > 0 ? (
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>{t('kitchen.itemName')}</th>
                    <th style={{ textAlign: 'center' }}>{t('kitchen.totalQuantity')}</th>
                    <th style={{ textAlign: 'center' }}>{t('kitchen.dates')}</th>
                    <th style={{ textAlign: 'right' }}>{t('kitchen.price')}</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchenData.items_summary.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-primary">{item.total_quantity || item.quantity}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                          {item.dates && item.dates.length > 0 ? (
                            item.dates.map((date) => {
                              const dateData = kitchenData.items_by_date.find(d => d.date === date);
                              return (
                                <span
                                  key={date}
                                  className="badge badge-secondary"
                                  title={dateData?.date_formatted}
                                >
                                  {dateData?.date_formatted || new Date(date).toLocaleDateString()}
                                </span>
                              );
                            })
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {item.price ? `${item.price.toFixed(2)} ₼` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="dashboard-empty-state">
                <ShoppingBagIcon size={48} />
                <h3>{t('kitchen.noItems')}</h3>
                <p>{t('kitchen.noItemsDescription')}</p>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="dashboard-calendar-container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <div className="loading-title">{t('common.loading')}</div>
              </div>
            ) : kitchenData && kitchenData.items_by_date.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Date Selector */}
                <div className="dashboard-filter-group">
                  <label>{t('kitchen.selectDate')}</label>
                  <select
                    value={selectedDate || ''}
                    onChange={(e) => setSelectedDate(e.target.value || null)}
                    className="dashboard-select"
                  >
                    <option value="">{t('kitchen.allDates')}</option>
                    {kitchenData.items_by_date.map((dateData) => (
                      <option key={dateData.date} value={dateData.date}>
                        {dateData.date_formatted} ({dateData.orders.length} {t('kitchen.orders')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Date View */}
                {selectedDate && selectedDateData ? (
                  <div className="dashboard-card">
                    <div className="dashboard-card-header">
                      <h3>{selectedDateData.date_formatted}</h3>
                      <span className="badge badge-primary">
                        {selectedDateData.orders.length} {t('kitchen.orders')}
                      </span>
                    </div>
                    <div className="dashboard-card-body">
                      {/* Orders List */}
                      <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>{t('kitchen.orders')}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                          {selectedDateData.orders.map((order) => (
                            <div
                              key={order.id}
                              className="dashboard-info-card"
                              style={{
                                padding: 'var(--space-4)',
                                border: '1px solid var(--paul-border)',
                                borderRadius: 'var(--radius-md)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong>{order.company_name}</strong>
                                  {order.delivery_time && (
                                    <span style={{ marginLeft: 'var(--space-2)', color: 'var(--paul-gray)' }}>
                                      {t('kitchen.at')} {order.delivery_time}
                                    </span>
                                  )}
                                </div>
                                <span className={`badge badge-${order.status === 'processing' ? 'warning' : 'info'}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Items List */}
                      <div>
                        <h4 style={{ marginBottom: 'var(--space-4)' }}>{t('kitchen.items')}</h4>
                        <table className="dashboard-table">
                          <thead>
                            <tr>
                              <th>{t('kitchen.itemName')}</th>
                              <th style={{ textAlign: 'center' }}>{t('kitchen.quantity')}</th>
                              <th style={{ textAlign: 'right' }}>{t('kitchen.price')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDateData.items.map((item) => (
                              <tr key={item.id}>
                                <td>
                                  <strong>{item.name}</strong>
                                  {item.orders && item.orders.length > 0 && (
                                    <div style={{ fontSize: '12px', color: 'var(--paul-gray)', marginTop: '4px' }}>
                                      {item.orders.map((o, idx) => (
                                        <span key={idx}>
                                          {o.company_name} ({o.quantity})
                                          {idx < item.orders!.length - 1 && ', '}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span className="badge badge-primary">{item.quantity}</span>
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  {item.price ? `${item.price.toFixed(2)} ₼` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : !selectedDate ? (
                  // All Dates View
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {kitchenData.items_by_date.map((dateData) => (
                      <div key={dateData.date} className="dashboard-card">
                        <div className="dashboard-card-header">
                          <h3>{dateData.date_formatted}</h3>
                          <span className="badge badge-primary">
                            {dateData.orders.length} {t('kitchen.orders')}
                          </span>
                        </div>
                        <div className="dashboard-card-body">
                          <div style={{ marginBottom: 'var(--space-4)' }}>
                            <strong>{t('kitchen.orders')}:</strong>
                            <div style={{ marginTop: 'var(--space-2)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                              {dateData.orders.map((order) => (
                                <span
                                  key={order.id}
                                  className="badge badge-secondary"
                                  title={order.delivery_time || ''}
                                >
                                  {order.company_name}
                                  {order.delivery_time && ` (${order.delivery_time})`}
                                </span>
                              ))}
                            </div>
                          </div>
                          <table className="dashboard-table">
                            <thead>
                              <tr>
                                <th>{t('kitchen.itemName')}</th>
                                <th style={{ textAlign: 'center' }}>{t('kitchen.quantity')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dateData.items.map((item) => (
                                <tr key={item.id}>
                                  <td><strong>{item.name}</strong></td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span className="badge badge-primary">{item.quantity}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dashboard-empty-state">
                    <CalendarIcon size={48} />
                    <h3>{t('kitchen.noDataForDate')}</h3>
                  </div>
                )}
              </div>
            ) : (
              <div className="dashboard-empty-state">
                <CalendarIcon size={48} />
                <h3>{t('kitchen.noItems')}</h3>
                <p>{t('kitchen.noItemsDescription')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

