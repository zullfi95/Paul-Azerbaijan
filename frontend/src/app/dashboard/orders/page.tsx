"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { Order as ApiOrder, MenuItem, CartItem } from "../../../config/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { formatTotalAmount } from "../../../utils/numberUtils";
import { getStatusLabel, getStatusBgColor } from "../../../utils/statusTranslations";
import { useAuthGuard, canManageOrders } from "../../../utils/authConstants";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { OrderCreateRequest } from "../../../types/api";
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingState } from "../../../components/ui";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/dashboard.css";
import styles from './page.module.css';

// Types for pricing calculator
interface PricingRules {
  markups: {
    corporate_discount: number; // Corporate client discount
    peak_hours_markup: number; // Peak hours markup
    weekend_markup: number; // Weekend markup
    express_delivery_markup: number; // Express delivery markup
    catering_service_markup: number; // Catering service markup
  };
  delivery_rates: {
    base_rate: number; // Base delivery rate
    per_km: number; // Per kilometer
    free_delivery_threshold: number; // Free delivery threshold
  };
  time_based_pricing: {
    peak_hours: string[]; // Peak hours
    peak_days: string[]; // Days with high demand
  };
}

// Types for order grouping
interface OrderGroup {
  key: string;
  label: string;
  orders: Order[];
  totalAmount: number;
  count: number;
}

// Types for reports
interface OrderAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topClients: Array<{
    name: string;
    totalAmount: number;
    orderCount: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  popularItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

// Using Order from API config
type Order = ApiOrder;

type OrderFormData = OrderCreateRequest;

function OrdersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'pending_payment' | 'processing' | 'completed' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'company_name' | 'total_amount'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'kanban'>('grid');
  
  // State for grouping and analytics
  const [groupBy, setGroupBy] = useState<'none' | 'status' | 'client' | 'date' | 'company' | 'amount'>('none');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedOrdersForCopy, setSelectedOrdersForCopy] = useState<Set<number>>(new Set());
  
  // Pricing rules
  const pricingRules: PricingRules = useMemo(() => ({
    markups: {
      corporate_discount: -0.1, // 10% discount for corporate clients
      peak_hours_markup: 0.15, // 15% markup for peak hours
      weekend_markup: 0.2, // 20% markup for weekends
      express_delivery_markup: 0.25, // 25% markup for express delivery
      catering_service_markup: 0.1, // 10% markup for catering service
    },
    delivery_rates: {
      base_rate: 15, // Base delivery rate
      per_km: 2, // Per kilometer
      free_delivery_threshold: 100, // Free delivery threshold from 100 AZN
    },
    time_based_pricing: {
      peak_hours: ['08:00', '09:00', '12:00', '13:00', '18:00', '19:00'], // Peak hours
      peak_days: ['friday', 'saturday', 'sunday'], // Days with high demand
    },
  }), []);



  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const result = await makeApiRequest<Order[]>('/orders');
      if (result.success) {
        const ordersData = extractApiData(result.data || []) as Order[];
        setOrders(ordersData);
      } else {
        console.error('Failed to load orders:', handleApiError(result as any));
      }
    } catch (error) {
        console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Auth guard with access rights check
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', position: '', staff_role: '' }, canManageOrders, router);

  useEffect(() => {
    if (hasAccess) {
      loadOrders();
    }
  }, [hasAccess, loadOrders]);



  const handleEditOrder = useCallback((order: Order) => {
    router.push(`/dashboard/orders/${order.id}/edit`);
  }, [router]);

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) return;

    try {
      const result = await makeApiRequest(`/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        loadOrders();
      } else {
        alert(handleApiError(result as any, 'Ошибка удаления заказа'));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Произошла ошибка при удалении заказа');
    }
  };



  // Memoized filtering and sorting of orders
  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter(order => {
      const matchesSearch = !searchTerm || 
        order.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.menu_items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'company_name':
          aValue = a.company_name.toLowerCase();
          bValue = b.company_name.toLowerCase();
          break;
        case 'total_amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy, sortOrder]);

  // Pricing calculator functions
  const calculatePriceWithMarkups = useCallback((
    basePrice: number, 
    options: {
      isCorporate?: boolean;
      deliveryDate?: string;
      deliveryTime?: string;
      isExpress?: boolean;
      needsCatering?: boolean;
      distance?: number;
    } = {}
  ) => {
    let finalPrice = basePrice;
    const appliedMarkups: Array<{ name: string; rate: number; amount: number }> = [];

    // Corporate client discount
    if (options.isCorporate) {
      const markup = pricingRules.markups.corporate_discount;
      const amount = basePrice * markup;
      finalPrice += amount;
      appliedMarkups.push({ name: 'Corporate discount', rate: markup, amount });
    }

    // Peak hours markup
    if (options.deliveryTime && pricingRules.time_based_pricing.peak_hours.includes(options.deliveryTime)) {
      const markup = pricingRules.markups.peak_hours_markup;
      const amount = basePrice * markup;
      finalPrice += amount;
      appliedMarkups.push({ name: 'Peak hours', rate: markup, amount });
    }

    // Weekend markup
    if (options.deliveryDate) {
      const dayOfWeek = new Date(options.deliveryDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (pricingRules.time_based_pricing.peak_days.includes(dayOfWeek)) {
        const markup = pricingRules.markups.weekend_markup;
        const amount = basePrice * markup;
        finalPrice += amount;
        appliedMarkups.push({ name: 'Weekend', rate: markup, amount });
      }
    }

    // Express delivery markup
    if (options.isExpress) {
      const markup = pricingRules.markups.express_delivery_markup;
      const amount = basePrice * markup;
      finalPrice += amount;
      appliedMarkups.push({ name: 'Express delivery', rate: markup, amount });
    }

    // Catering service markup
    if (options.needsCatering) {
      const markup = pricingRules.markups.catering_service_markup;
      const amount = basePrice * markup;
      finalPrice += amount;
      appliedMarkups.push({ name: 'Catering service', rate: markup, amount });
    }

    // Delivery calculation
    let deliveryFee = 0;
    if (options.distance && finalPrice < pricingRules.delivery_rates.free_delivery_threshold) {
      deliveryFee = pricingRules.delivery_rates.base_rate + (options.distance * pricingRules.delivery_rates.per_km);
    }

    return {
      basePrice,
      finalPrice: Math.max(0, finalPrice),
      deliveryFee,
      totalPrice: Math.max(0, finalPrice) + deliveryFee,
      appliedMarkups: appliedMarkups.map(m => ({ name: m.name, amount: m.amount })),
      savings: finalPrice < basePrice ? basePrice - finalPrice : 0
    };
  }, [pricingRules]);

  // Function for copying order
  const handleCopyOrder = useCallback(async (orderId: number) => {
    try {
      const result = await makeApiRequest(`/orders/${orderId}/copy`, {
        method: 'POST'
      });

      if (result.success) {
        alert('Order successfully copied!');
        loadOrders();
      } else {
        alert(handleApiError(result as any, 'Error copying order'));
      }
    } catch (error) {
      console.error('Ошибка копирования заказа:', error);
      alert('Произошла ошибка при копировании заказа');
    }
  }, [loadOrders]);

  // Функция для быстрого изменения статуса заказа
  const handleQuickStatusChange = useCallback(async (orderId: number, newStatus: string) => {
    try {
      const result = await makeApiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (result.success) {
        alert('Статус заказа успешно изменен!');
        loadOrders();
      } else {
        alert(handleApiError(result as any, 'Ошибка изменения статуса'));
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      alert('Произошла ошибка при изменении статуса');
    }
  }, [loadOrders]);

  // Функция массового копирования
  const handleMassCopy = useCallback(async () => {
    if (selectedOrdersForCopy.size === 0) return;

    try {
      const promises = Array.from(selectedOrdersForCopy).map(orderId =>
        makeApiRequest(`/orders/${orderId}/copy`, { method: 'POST' })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      
      alert(`Успешно скопировано заказов: ${successful} из ${selectedOrdersForCopy.size}`);
      setSelectedOrdersForCopy(new Set());
      loadOrders();
    } catch (error) {
      console.error('Ошибка массового копирования:', error);
      alert('Произошла ошибка при копировании заказов');
    }
  }, [selectedOrdersForCopy, loadOrders]);

  // Группировка заказов
  const groupedOrders = useMemo(() => {
    if (groupBy === 'none') return null;

    const groups: { [key: string]: OrderGroup } = {};

    filteredAndSortedOrders.forEach(order => {
      let groupKey = '';
      let groupLabel = '';

      switch (groupBy) {
        case 'status':
          groupKey = order.status;
          groupLabel = getStatusLabel(order.status);
          break;
        case 'client':
          groupKey = order.company_name;
          groupLabel = order.company_name;
          break;
        case 'date':
          groupKey = new Date(order.created_at).toDateString();
          groupLabel = new Date(order.created_at).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
          break;
        case 'amount':
          if (order.total_amount < 50) {
            groupKey = 'small';
            groupLabel = 'До 50₼';
          } else if (order.total_amount < 200) {
            groupKey = 'medium';
            groupLabel = '50-200₼';
          } else {
            groupKey = 'large';
            groupLabel = 'Свыше 200₼';
          }
          break;
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          key: groupKey,
          label: groupLabel,
          orders: [],
          totalAmount: 0,
          count: 0
        };
      }

      groups[groupKey].orders.push(order);
      groups[groupKey].totalAmount += order.total_amount;
      groups[groupKey].count += 1;
    });

    return Object.values(groups);
  }, [filteredAndSortedOrders, groupBy]);

  // Аналитика заказов
  const orderAnalytics = useMemo((): OrderAnalytics => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Топ клиенты
    const clientStats: { [key: string]: { totalAmount: number; orderCount: number } } = {};
    orders.forEach(order => {
      if (!clientStats[order.company_name]) {
        clientStats[order.company_name] = { totalAmount: 0, orderCount: 0 };
      }
      clientStats[order.company_name].totalAmount += order.total_amount;
      clientStats[order.company_name].orderCount += 1;
    });

    const topClients = Object.entries(clientStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    // Доходы по месяцам
    const monthlyStats: { [key: string]: { revenue: number; orders: number } } = {};
    orders.forEach(order => {
      const month = new Date(order.created_at).toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!monthlyStats[month]) {
        monthlyStats[month] = { revenue: 0, orders: 0 };
      }
      monthlyStats[month].revenue += order.total_amount;
      monthlyStats[month].orders += 1;
    });

    const revenueByMonth = Object.entries(monthlyStats)
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Популярные блюда
    const itemStats: { [key: string]: { quantity: number; revenue: number } } = {};
    orders.forEach(order => {
      order.menu_items.forEach(item => {
        if (!itemStats[item.name]) {
          itemStats[item.name] = { quantity: 0, revenue: 0 };
        }
        itemStats[item.name].quantity += (item as any).quantity || 0;
        itemStats[item.name].revenue += ((item as any).quantity || 0) * item.price;
      });
    });

    const popularItems = Object.entries(itemStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topClients,
      revenueByMonth,
      popularItems
    };
  }, [orders]);

  // Статистика заказов
  const orderStats = useMemo(() => {
    const total = orders.length;
    const byStatus = {
      processing: orders.filter(o => o.status === 'processing').length,
      completed: orders.filter(o => o.status === 'completed').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
    const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
    
    return { total, byStatus, totalAmount };
  }, [orders]);



  if (isLoading) {
    return <LoadingState isLoading={true} loadingText="Загрузка заказов...">{null}</LoadingState>;
  }

  if (!hasAccess) {
    return null;
  }

  // PAUL brand colors
  const paulColors = {
    black: '#1A1A1A',
    beige: '#EBDCC8',
    border: '#EDEAE3',
    gray: '#4A4A4A',
    white: '#FFFCF8'
  };

  return (
    <DashboardLayout>
      {/* Modern Header */}
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
                  Управление заказами
                </h1>
                <p className="page-description">
                  PAUL Catering Azerbaijan • {orderStats.total} заказов
                </p>
              </div>
            </div>
            
            <div className="page-actions">
              <Button 
                variant="ghost" 
                size="md"
                onClick={() => setShowCalculator(true)}
                className="action-button calculator-button"
              >
                🧮 Калькулятор
              </Button>
              <Button 
                variant="ghost" 
                size="md"
                onClick={() => setShowAnalytics(true)}
                className="action-button analytics-button"
              >
                📊 Аналитика
              </Button>
              {selectedOrdersForCopy.size > 0 && (
                <Button 
                  variant="ghost" 
                  size="md"
                  onClick={handleMassCopy}
                  className="action-button copy-button"
                >
                  📋 Копировать ({selectedOrdersForCopy.size})
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => router.push('/dashboard/orders/create')}
                className="action-button primary-button"
              >
                + Новый заказ
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="dashboard-kpi-grid">
            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-header">
                <span className="dashboard-kpi-icon">📋</span>
                <span className="dashboard-kpi-label">Всего заказов</span>
              </div>
              <div className="dashboard-kpi-value">
                {orderStats.total}
              </div>
              <div className="dashboard-kpi-subtitle">
                В системе
              </div>
            </div>

            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-header">
                <span className="dashboard-kpi-icon status-processing">⏳</span>
                <span className="dashboard-kpi-label">В обработке</span>
              </div>
              <div className="dashboard-kpi-value status-processing">
                {orderStats.byStatus.processing}
              </div>
              <div className="dashboard-kpi-subtitle">
                Требуют внимания
              </div>
            </div>

            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-header">
                <span className="dashboard-kpi-icon status-approved">✅</span>
                <span className="dashboard-kpi-label">Завершено</span>
              </div>
              <div className="dashboard-kpi-value status-approved">
                {orderStats.byStatus.completed}
              </div>
              <div className="dashboard-kpi-subtitle">
                Выполненных заказов
              </div>
            </div>

            <div className="dashboard-kpi-card">
              <div className="dashboard-kpi-header">
                <span className="dashboard-kpi-icon">💰</span>
                <span className="dashboard-kpi-label">Общая сумма</span>
              </div>
              <div className="dashboard-kpi-value" style={{ color: '#D4AF37' }}>
                {formatTotalAmount(orderStats.totalAmount)} ₼
              </div>
              <div className="dashboard-kpi-subtitle">
                Общий оборот
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Filters and Search Bar */}
        <div className="enhanced-filters">
          <div className="search-row">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Поиск по компании или блюдам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                title="Карточки"
              >
                <svg className="view-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                title="Таблица"
              >
                <svg className="view-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`view-button ${viewMode === 'kanban' ? 'active' : ''}`}
                title="Канбан"
              >
                <svg className="view-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h4v12H4V6zm6-2h4v16h-4V4zm6 4h4v8h-4V8z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Filters Row */}
          <div className="filter-row">
            <div className="filter-group">
              <label className="filter-label">Статус:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="filter-select"
              >
                <option value="all">Все статусы</option>
                <option value="draft">Черновик</option>
                <option value="submitted">Отправлен</option>
                <option value="pending_payment">Ожидает оплаты</option>
                <option value="processing">В обработке</option>
                <option value="completed">Завершен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Сортировка:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'created_at' | 'company_name' | 'total_amount')}
                className="filter-select"
              >
                <option value="created_at">По дате</option>
                <option value="company_name">По компании</option>
                <option value="total_amount">По сумме</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-button"
              >
                <svg 
                  className={`sort-icon ${sortOrder === 'desc' ? 'desc' : 'asc'}`}
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M7 14l5-5 5 5z"/>
                </svg>
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">Группировка:</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as 'none' | 'status' | 'date' | 'company')}
                className="filter-select"
              >
                <option value="none">Без группировки</option>
                <option value="status">По статусу</option>
                <option value="client">По клиентам</option>
                <option value="date">По датам</option>
                <option value="amount">По сумме</option>
              </select>
            </div>

            <div className="filter-results">
              <span className="results-text">
                Найдено: {filteredAndSortedOrders.length} из {orderStats.total}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Display */}
        <LoadingState isLoading={ordersLoading} loadingText="Загрузка заказов...">{null}
          {filteredAndSortedOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">
                {searchTerm || statusFilter !== 'all' ? 'Заказы не найдены' : 'Пока нет заказов'}
              </h3>
              <p className="empty-subtitle">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить параметры поиска или фильтры'
                  : 'Создайте первый заказ для начала работы'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button variant="primary" onClick={() => router.push('/dashboard/orders/create')}>
                  Создать первый заказ
                </Button>
              )}
            </div>
          ) : (
            <>
              {groupedOrders ? (
                <GroupedOrdersDisplay
                  groups={groupedOrders}
                  viewMode={viewMode}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onCopy={handleCopyOrder}
                  onQuickStatusChange={handleQuickStatusChange}
                  selectedOrders={selectedOrdersForCopy}
                  onToggleSelect={(orderId) => {
                    const newSelected = new Set(selectedOrdersForCopy);
                    if (newSelected.has(orderId)) {
                      newSelected.delete(orderId);
                    } else {
                      newSelected.add(orderId);
                    }
                    setSelectedOrdersForCopy(newSelected);
                  }}
                />
              ) : viewMode === 'kanban' ? (
                <KanbanOrdersView
                  orders={filteredAndSortedOrders}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onCopy={handleCopyOrder}
                  selectedOrders={selectedOrdersForCopy}
                  onToggleSelect={(orderId) => {
                    const newSelected = new Set(selectedOrdersForCopy);
                    if (newSelected.has(orderId)) {
                      newSelected.delete(orderId);
                    } else {
                      newSelected.add(orderId);
                    }
                    setSelectedOrdersForCopy(newSelected);
                  }}
                />
              ) : viewMode === 'grid' ? (
                <div className="grid-view">
                  {filteredAndSortedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onEdit={handleEditOrder}
                      onDelete={handleDeleteOrder}
                      onCopy={handleCopyOrder}
                      onQuickStatusChange={handleQuickStatusChange}
                      isSelected={selectedOrdersForCopy.has(order.id)}
                      onToggleSelect={() => {
                        const newSelected = new Set(selectedOrdersForCopy);
                        if (newSelected.has(order.id)) {
                          newSelected.delete(order.id);
                        } else {
                          newSelected.add(order.id);
                        }
                        setSelectedOrdersForCopy(newSelected);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <OrderTable 
                  orders={filteredAndSortedOrders} 
                  onEdit={handleEditOrder} 
                  onDelete={handleDeleteOrder}
                />
              )}
            </>
          )}
        </LoadingState>


        {/* Калькулятор стоимости */}
        {showCalculator && (
          <PriceCalculatorModal 
            isOpen={showCalculator}
            onClose={() => setShowCalculator(false)}
            calculatePrice={calculatePriceWithMarkups}
            pricingRules={pricingRules}
          />
        )}

        {/* Аналитика */}
        {showAnalytics && (
          <AnalyticsModal 
            isOpen={showAnalytics}
            onClose={() => setShowAnalytics(false)}
            analytics={orderAnalytics}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

// Компонент карточки заказа для Grid режима
interface OrderCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete: (orderId: number) => void;
  onCopy: (orderId: number) => void;
  onQuickStatusChange: (orderId: number, newStatus: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onEdit, onDelete, onCopy, onQuickStatusChange, isSelected, onToggleSelect }) => {
  return (
    <div className="application-card">
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <div className="card-header-left">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                className="card-checkbox"
              />
            )}
            <div className="card-header-info">
              <h3 className="card-name">
                {order.company_name}
              </h3>
              <p className="card-email">
                Заказ #{order.id}
              </p>
            </div>
          </div>
          <div className={`card-status status-${order.status}`}>
            {getStatusLabel(order.status)}
          </div>
        </div>

        {/* Menu Items Preview */}
        <div className="card-field">
          <div className="field-label">
            Блюда ({order.menu_items.length})
          </div>
          <div className="field-value">
            {order.menu_items.slice(0, 3).map((item, index) => (
              <div key={index} className="field-subvalue">
                <span>{item.name}</span>
                <span>{(item as any).quantity || 0}x {item.price}₼</span>
              </div>
            ))}
            {order.menu_items.length > 3 && (
              <div className="field-subvalue">
                +{order.menu_items.length - 3} еще...
              </div>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div className="card-footer">
          <span className="field-label">Общая сумма:</span>
          <span className="card-amount">
            {formatTotalAmount(order.total_amount)} ₼
          </span>
        </div>

        {/* Date */}
        <div className="card-date">
          Создан: {new Date(order.created_at).toLocaleDateString('ru-RU')}
        </div>

        {/* Actions */}
        <div className="card-actions">
          {/* Быстрые действия со статусом */}
          <div className="quick-actions">
            {order.status === 'submitted' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'processing')}
                className="quick-action-button approve"
                title="Начать обработку"
              >
                ▶️ В обработку
              </button>
            )}
            {order.status === 'processing' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'completed')}
                className="quick-action-button approve"
                title="Завершить заказ"
              >
                ✅ Завершить
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'cancelled')}
                className="quick-action-button reject"
                title="Отменить заказ"
              >
                ❌ Отменить
              </button>
            )}
          </div>

          {/* Основные действия */}
          <div className="main-actions">
            <Button variant="secondary" size="sm" onClick={() => onEdit(order)} className="action-button">
              ✏️ Редактировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy && onCopy(order.id)}
              className="action-button copy"
            >
              📋 Копировать
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(order.id)} className="action-button">
              🗑️ Удалить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент таблицы заказов для Table режима
interface OrderTableProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: number) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="applications-table">
        <thead>
          <tr className="table-header">
            <th className="table-header-cell">
              Компания
            </th>
            <th className="table-header-cell">
              Блюда
            </th>
            <th className="table-header-cell">
              Сумма
            </th>
            <th className="table-header-cell">
              Статус
            </th>
            <th className="table-header-cell">
              Дата
            </th>
            <th className="table-header-cell">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="table-row">
              <td className="table-cell">
                <div className="applicant-name">
                  {order.company_name}
                </div>
                <div className="contact-phone">
                  #{order.id}
                </div>
              </td>
              <td className="table-cell">
                <div className="contact-email">
                  {order.menu_items.length} позиций
                </div>
                <div className="contact-phone">
                  {order.menu_items.slice(0, 2).map(item => item.name).join(', ')}
                  {order.menu_items.length > 2 && '...'}
                </div>
              </td>
              <td className="table-cell">
                <div className="amount-value">
                  {formatTotalAmount(order.total_amount)} ₼
                </div>
              </td>
              <td className="table-cell">
                <span className={`status-badge status-${order.status}`}>
                  {getStatusLabel(order.status)}
                </span>
              </td>
              <td className="table-cell">
                <div className="event-date">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </div>
              </td>
              <td className="table-cell">
                <div className="action-buttons">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(order)} className="preview-button">
                    Изменить
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(order.id)} className="edit-button">
                    Удалить
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Компонент калькулятора стоимости
interface PriceCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatePrice: (basePrice: number, options: { [key: string]: string | number | boolean }) => { basePrice: number; appliedMarkups: Array<{ name: string; amount: number }>; totalPrice: number; deliveryFee: number; savings: number };
  pricingRules: PricingRules;
}

const PriceCalculatorModal: React.FC<PriceCalculatorModalProps> = ({ 
  isOpen, 
  onClose, 
  calculatePrice, 
  pricingRules 
}) => {
  const [basePrice, setBasePrice] = useState(100);
  const [options, setOptions] = useState({
    isCorporate: false,
    deliveryDate: '',
    deliveryTime: '',
    isExpress: false,
    needsCatering: false,
    distance: 5
  });

  const calculation = calculatePrice(basePrice, options);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <Card variant="elevated" padding="lg" className={styles.calculatorCard}>
        <CardHeader>
          <div className={styles.calculatorHeader}>
            <CardTitle size="lg">🧮 Калькулятор стоимости</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.calculatorContent}>
            {/* Базовая стоимость */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Базовая стоимость (₼)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className={styles.inputField}
              />
            </div>

            {/* Опции */}
            <div className={styles.optionsSection}>
              <h3 className={styles.optionsTitle}>Дополнительные параметры</h3>
              <div className={styles.optionsGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.isCorporate}
                    onChange={(e) => setOptions({...options, isCorporate: e.target.checked})}
                  />
                  Корпоративный клиент (скидка {Math.abs(pricingRules.markups.corporate_discount * 100)}%)
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.isExpress}
                    onChange={(e) => setOptions({...options, isExpress: e.target.checked})}
                  />
                  Срочная доставка (+{pricingRules.markups.express_delivery_markup * 100}%)
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.needsCatering}
                    onChange={(e) => setOptions({...options, needsCatering: e.target.checked})}
                  />
                  Обслуживание (+{pricingRules.markups.catering_service_markup * 100}%)
                </label>
              </div>
            </div>

            {/* Дата и время */}
            <div className={styles.dateTimeGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Дата доставки
                </label>
                <input
                  type="date"
                  value={options.deliveryDate}
                  onChange={(e) => setOptions({...options, deliveryDate: e.target.value})}
                  className={styles.inputField}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  Время доставки
                </label>
                <input
                  type="time"
                  value={options.deliveryTime}
                  onChange={(e) => setOptions({...options, deliveryTime: e.target.value})}
                  className={styles.inputField}
                />
              </div>
            </div>

            {/* Расстояние */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                Расстояние доставки (км)
              </label>
              <input
                type="number"
                value={options.distance}
                onChange={(e) => setOptions({...options, distance: parseFloat(e.target.value) || 0})}
                className={styles.inputField}
              />
            </div>

            {/* Результат расчета */}
            <div className={styles.calculationResult}>
              <h3 className={styles.resultTitle}>
                📊 Результат расчета
              </h3>
              
              <div className={styles.resultRows}>
                <div className={styles.resultRow}>
                  <span>Базовая стоимость:</span>
                  <span className={styles.resultValue}>{calculation.basePrice.toFixed(2)} ₼</span>
                </div>

                {calculation.appliedMarkups.map((markup: { name: string; amount: number }, index: number) => (
                  <div key={index} className={`${styles.markupRow} ${markup.amount > 0 ? styles.markupPositive : styles.markupNegative}`}>
                    <span>{markup.name}:</span>
                    <span className={styles.resultValue}>
                      {markup.amount > 0 ? '+' : ''}{markup.amount.toFixed(2)} ₼
                    </span>
                  </div>
                ))}

                <div className={styles.resultRow}>
                  <span>Доставка:</span>
                  <span className={styles.resultValue}>{calculation.deliveryFee.toFixed(2)} ₼</span>
                </div>

                <hr className={styles.resultDivider} />
                
                <div className={styles.totalRow}>
                  <span>Итоговая стоимость:</span>
                  <span>{calculation.totalPrice.toFixed(2)} ₼</span>
                </div>

                {calculation.savings > 0 && (
                  <div className={styles.savingsRow}>
                    <span>Экономия:</span>
                    <span className={styles.resultValue}>{calculation.savings.toFixed(2)} ₼</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Компонент аналитики
interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: OrderAnalytics;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ 
  isOpen, 
  onClose, 
  analytics 
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <Card variant="elevated" padding="lg" className={styles.analyticsCard}>
        <CardHeader>
          <div className={styles.analyticsHeader}>
            <CardTitle size="lg">📊 Аналитика заказов</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.analyticsContent}>
            {/* Общая статистика */}
            <div className={styles.analyticsSection}>
              <h3 className={styles.sectionTitle}>
                💰 Общие показатели
              </h3>
              <div className={styles.statsGrid}>
                <div className={`${styles.statCard} ${styles.statCardGreen}`}>
                  <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                    {analytics.totalRevenue.toFixed(0)} ₼
                  </div>
                  <div className={`${styles.statLabel} ${styles.statLabelGreen}`}>Общий доход</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardBlue}`}>
                  <div className={`${styles.statValue} ${styles.statValueBlue}`}>
                    {analytics.totalOrders}
                  </div>
                  <div className={`${styles.statLabel} ${styles.statLabelBlue}`}>Всего заказов</div>
                </div>
                <div className={`${styles.statCard} ${styles.statCardYellow}`}>
                  <div className={`${styles.statValue} ${styles.statValueYellow}`}>
                    {analytics.averageOrderValue.toFixed(0)} ₼
                  </div>
                  <div className={`${styles.statLabel} ${styles.statLabelYellow}`}>Средний чек</div>
                </div>
              </div>
            </div>

            {/* Топ клиенты */}
            <div className={styles.analyticsSection}>
              <h3 className={styles.sectionTitle}>
                👥 Топ клиенты
              </h3>
              <div className={styles.clientsList}>
                {analytics.topClients.map((client, index) => (
                  <div key={index} className={styles.clientCard}>
                    <div className={styles.clientInfo}>
                      <div className={styles.clientName}>{client.name}</div>
                      <div className={styles.clientOrders}>
                        {client.orderCount} заказов
                      </div>
                    </div>
                    <div className={styles.clientAmount}>
                      {client.totalAmount.toFixed(0)} ₼
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Популярные блюда */}
            <div className={styles.analyticsSection}>
              <h3 className={styles.sectionTitle}>
                🍽️ Популярные блюда
              </h3>
              <div className={styles.itemsGrid}>
                {analytics.popularItems.slice(0, 6).map((item, index) => (
                  <div key={index} className={styles.itemCard}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemQuantity}>
                      Заказано: {item.quantity || 0} раз
                    </div>
                    <div className={styles.itemRevenue}>
                      Доход: {item.revenue.toFixed(0)} ₼
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Доходы по месяцам */}
            {analytics.revenueByMonth.length > 0 && (
              <div className={styles.analyticsSection}>
                <h3 className={styles.sectionTitle}>
                  📈 Доходы по месяцам
                </h3>
                <div className={styles.monthsList}>
                  {analytics.revenueByMonth.slice(-6).map((month, index) => (
                    <div key={index} className={styles.monthCard}>
                      <div className={styles.monthName}>{month.month}</div>
                      <div className={styles.monthStats}>
                        <span className={styles.monthOrders}>{month.orders} заказов</span>
                        <span className={styles.monthRevenue}>
                          {month.revenue.toFixed(0)} ₼
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Компонент группированного отображения заказов
interface GroupedOrdersDisplayProps {
  groups: OrderGroup[];
  viewMode: 'grid' | 'table' | 'kanban';
  onEdit: (order: Order) => void;
  onDelete: (orderId: number) => void;
  onCopy: (orderId: number) => void;
  onQuickStatusChange: (orderId: number, newStatus: string) => void;
  selectedOrders: Set<number>;
  onToggleSelect: (orderId: number) => void;
}

const GroupedOrdersDisplay: React.FC<GroupedOrdersDisplayProps> = ({
  groups,
  viewMode,
  onEdit,
  onDelete,
  onCopy,
  onQuickStatusChange,
  selectedOrders,
  onToggleSelect
}) => {
  return (
    <div className={styles.groupedContainer}>
      {groups.map(group => (
        <Card key={group.key} variant="default" padding="lg">
          <div className={styles.groupHeader}>
            <h3 className={styles.groupTitle}>
              {group.label}
              <span className={styles.groupBadge}>
                {group.count} заказов • {formatTotalAmount(group.totalAmount)} ₼
              </span>
            </h3>
          </div>
          
          {viewMode === 'grid' ? (
            <div className={styles.groupGrid}>
              {group.orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onCopy={onCopy}
                  onQuickStatusChange={onQuickStatusChange}
                  isSelected={selectedOrders.has(order.id)}
                  onToggleSelect={() => onToggleSelect(order.id)}
                />
              ))}
            </div>
          ) : (
            <OrderTable
              orders={group.orders}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        </Card>
      ))}
    </div>
  );
}

// Компонент Kanban отображения заказов
interface KanbanOrdersViewProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (orderId: number) => void;
  onCopy: (orderId: number) => void;
  selectedOrders: Set<number>;
  onToggleSelect: (orderId: number) => void;
}

const KanbanOrdersView: React.FC<KanbanOrdersViewProps> = ({
  orders,
  onEdit,
  onDelete,
  onCopy,
  selectedOrders,
  onToggleSelect
}) => {
  const statuses = [
    { key: 'draft', label: 'Черновики', color: '#64748B' },
    { key: 'submitted', label: 'Отправлены', color: '#3B82F6' },
    { key: 'processing', label: 'В обработке', color: '#F59E0B' },
    { key: 'completed', label: 'Завершены', color: '#10B981' },
    { key: 'cancelled', label: 'Отменены', color: '#EF4444' },
  ];

  const groupedByStatus = statuses.map(status => ({
    ...status,
    orders: orders.filter(order => order.status === status.key)
  }));

  return (
    <div className={styles.kanbanGrid}>
      {groupedByStatus.map(column => (
        <Card key={column.key} variant="default" padding="md" className={styles.kanbanColumn}>
          <div className={styles.kanbanHeader} style={{ borderBottom: `3px solid ${column.color}` }}>
            <h3 className={styles.kanbanTitle} style={{ color: column.color }}>
              {column.label}
              <span className={styles.kanbanBadge} style={{ backgroundColor: `${column.color}20` }}>
                {column.orders.length}
              </span>
            </h3>
          </div>
          
          <div className={styles.kanbanList}>
            {column.orders.map(order => (
              <div key={order.id} className={styles.kanbanCard}>
                <div className={styles.kanbanCardHeader}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => onToggleSelect(order.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={styles.kanbanCardCheckbox}
                  />
                  <div className={styles.kanbanCardInfo}>
                    <h4 className={styles.kanbanCardTitle}>
                      {order.company_name}
                    </h4>
                    <p className={styles.kanbanCardSubtitle}>
                      Заказ #{order.id} • {order.menu_items.length} позиций
                    </p>
                  </div>
                </div>
                
                <div className={styles.kanbanCardPrice}>
                  {formatTotalAmount(order.total_amount)} ₼
                </div>
                
                <div className={styles.kanbanCardActions}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(order);
                    }}
                    className={styles.kanbanActionButton}
                  >
                    ✏️
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopy(order.id);
                    }}
                    className={`${styles.kanbanActionButton} ${styles.kanbanCopyButton}`}
                  >
                    📋
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(order.id);
                    }}
                    className={styles.kanbanActionButton}
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrdersPage;
