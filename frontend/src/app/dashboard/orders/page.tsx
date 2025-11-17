"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { useTranslations } from 'next-intl';
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
import { 
  SearchIcon, 
  FilterIcon, 
  RefreshIcon, 
  EyeIcon,
  FileTextIcon,
  ShoppingBagIcon,
  CheckIcon,
  XIcon 
} from "../../../components/Icons";
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
  const t = useTranslations();
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
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, canManageOrders, router);

  useEffect(() => {
    if (hasAccess) {
      loadOrders();
    }
  }, [hasAccess, loadOrders]);



  const handleEditOrder = useCallback((order: Order) => {
    router.push(`/dashboard/orders/${order.id}/edit`);
  }, [router]);

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm(t('orders.confirmDelete'))) return;

    try {
      const result = await makeApiRequest(`/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        loadOrders();
      } else {
        alert(handleApiError(result as any, t('orders.deleteError')));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert(t('orders.deleteError'));
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
      customDiscountPercent?: number;
      customDeliveryCost?: number;
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

    // Custom discount percent (применяется после всех наценок)
    let customDiscountAmount = 0;
    if (options.customDiscountPercent && options.customDiscountPercent > 0) {
      customDiscountAmount = finalPrice * (options.customDiscountPercent / 100);
      finalPrice -= customDiscountAmount;
      appliedMarkups.push({ 
        name: t('orders.customDiscount', { percent: options.customDiscountPercent }), 
        rate: -options.customDiscountPercent / 100, 
        amount: -customDiscountAmount 
      });
    }

    // Delivery calculation
    let deliveryFee = 0;
    // Если указана пользовательская стоимость доставки, используем её
    if (options.customDeliveryCost !== undefined && options.customDeliveryCost > 0) {
      deliveryFee = options.customDeliveryCost;
    } else if (options.distance && finalPrice < pricingRules.delivery_rates.free_delivery_threshold) {
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
        alert(t('orders.createSuccess'));
        loadOrders();
      } else {
        alert(handleApiError(result as any, t('orders.createError')));
      }
    } catch (error) {
      console.error('Error copying order:', error);
      alert(t('orders.createError'));
    }
  }, [loadOrders, t]);

  // Функция для быстрого изменения статуса заказа
  const handleQuickStatusChange = useCallback(async (orderId: number, newStatus: string) => {
    try {
      const result = await makeApiRequest(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (result.success) {
        alert(t('orders.updateSuccess'));
        loadOrders();
      } else {
        alert(handleApiError(result as any, t('orders.updateError')));
      }
    } catch (error) {
      console.error('Error changing status:', error);
      alert(t('orders.updateError'));
    }
  }, [loadOrders, t]);

  // Функция массового копирования
  const handleMassCopy = useCallback(async () => {
    if (selectedOrdersForCopy.size === 0) return;

    try {
      const promises = Array.from(selectedOrdersForCopy).map(orderId =>
        makeApiRequest(`/orders/${orderId}/copy`, { method: 'POST' })
      );

      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      
      alert(`${t('common.success')}: ${successful} / ${selectedOrdersForCopy.size}`);
      setSelectedOrdersForCopy(new Set());
      loadOrders();
    } catch (error) {
      console.error('Error bulk copying:', error);
      alert(t('common.error'));
    }
  }, [selectedOrdersForCopy, loadOrders, t]);

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
            groupLabel = t('orders.amountGroup.small');
          } else if (order.total_amount < 200) {
            groupKey = 'medium';
            groupLabel = t('orders.amountGroup.medium');
          } else {
            groupKey = 'large';
            groupLabel = t('orders.amountGroup.large');
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
    return <LoadingState isLoading={true} loadingText={t('orders.loadingOrders')}>{null}</LoadingState>;
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
      {/* Quick Actions */}
      <section className="dashboard-quick-actions" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="dashboard-quick-actions-grid">
          <button
            onClick={() => setShowCalculator(true)}
            className="dashboard-quick-action-link"
          >
            {t('dashboard.calculator')}
          </button>
          <button
            onClick={() => setShowAnalytics(true)}
            className="dashboard-quick-action-link"
          >
            {t('dashboard.analytics')}
          </button>
          {selectedOrdersForCopy.size > 0 && (
            <button
              onClick={handleMassCopy}
              className="dashboard-quick-action-link"
              style={{
                background: '#FEF3C7',
                borderColor: '#D97706',
                color: '#D97706'
              }}
            >
              {t('common.copy')} ({selectedOrdersForCopy.size})
            </button>
          )}
          <button
            onClick={() => router.push('/dashboard/orders/create')}
            className="dashboard-quick-action-link"
            style={{
              background: 'var(--paul-black)',
              color: 'var(--paul-white)'
            }}
          >
            + {t('orders.createOrder')}
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
            <ShoppingBagIcon size={16} className="dashboard-kpi-icon" />
            <span className="dashboard-kpi-label">{t('dashboard.totalOrders')}</span>
          </div>
          <div className="dashboard-kpi-value">
            {orderStats.total}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('dashboard.inSystem')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('processing')}
        >
          <div className="dashboard-kpi-header">
            <FileTextIcon size={16} className="dashboard-kpi-icon" style={{ color: '#F59E0B' }} />
            <span className="dashboard-kpi-label">{t('orders.status.processing')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>
            {orderStats.byStatus.processing}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('orders.requireAttention')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('completed')}
        >
          <div className="dashboard-kpi-header">
            <CheckIcon size={16} className="dashboard-kpi-icon" style={{ color: '#10B981' }} />
            <span className="dashboard-kpi-label">{t('dashboard.completedOrders')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>
            {orderStats.byStatus.completed}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('dashboard.completedOrders')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <ShoppingBagIcon size={16} className="dashboard-kpi-icon" style={{ color: 'var(--paul-black)' }} />
            <span className="dashboard-kpi-label">{t('orders.totalAmount')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: 'var(--paul-black)' }}>
            {formatTotalAmount(orderStats.totalAmount)} ₼
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('dashboard.totalRevenue')}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="dashboard-filters" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-search-container">
          <SearchIcon size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder={t('dashboard.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
            aria-label={t('dashboard.searchPlaceholder')}
          />
        </div>
        
        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="dashboard-filter-select"
            aria-label={t('orders.statusFilter')}
          >
            <option value="all">{t('users.allStatuses')}</option>
            <option value="draft">{t('orders.status.draft')}</option>
            <option value="submitted">{t('orders.status.submitted')}</option>
            <option value="pending_payment">{t('orders.status.pendingPayment')}</option>
            <option value="processing">{t('orders.status.processing')}</option>
            <option value="completed">{t('orders.status.completed')}</option>
            <option value="cancelled">{t('orders.status.cancelled')}</option>
          </select>
        </div>

        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'created_at' | 'company_name' | 'total_amount')}
            className="dashboard-filter-select"
            aria-label={t('common.sort')}
          >
            <option value="created_at">{t('orders.sortByDate')}</option>
            <option value="company_name">{t('orders.sortByCompany')}</option>
            <option value="total_amount">{t('orders.sortByAmount')}</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="dashboard-action-btn"
          aria-label={t('common.sort') + ' ' + (sortOrder === 'asc' ? t('common.sortAscending') : t('common.sortDescending'))}
          style={{ minWidth: '48px' }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'none' | 'status' | 'date' | 'company')}
            className="dashboard-filter-select"
            aria-label={t('orders.grouping')}
          >
            <option value="none">{t('orders.noGrouping')}</option>
            <option value="status">{t('orders.groupByStatus')}</option>
            <option value="client">{t('orders.groupByClient')}</option>
            <option value="date">{t('orders.groupByDate')}</option>
            <option value="amount">{t('orders.groupByAmount')}</option>
          </select>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          marginLeft: 'auto',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-2)',
            borderLeft: '1px solid var(--paul-border)',
            paddingLeft: 'var(--space-3)'
          }}>
            <button
              className={`dashboard-action-btn`}
              onClick={() => setViewMode('grid')}
              style={{ 
                background: viewMode === 'grid' ? 'var(--paul-black)' : 'var(--paul-white)',
                color: viewMode === 'grid' ? 'var(--paul-white)' : 'var(--paul-black)',
                minWidth: 'auto',
                padding: '6px 10px'
              }}
              title={t('orders.viewGrid')}
            >
              {t('orders.viewGrid')}
            </button>
            <button
              className={`dashboard-action-btn`}
              onClick={() => setViewMode('table')}
              style={{ 
                background: viewMode === 'table' ? 'var(--paul-black)' : 'var(--paul-white)',
                color: viewMode === 'table' ? 'var(--paul-white)' : 'var(--paul-black)',
                minWidth: 'auto',
                padding: '6px 10px'
              }}
              title={t('orders.viewTable')}
            >
              {t('orders.viewTable')}
            </button>
            <button
              className={`dashboard-action-btn`}
              onClick={() => setViewMode('kanban')}
              style={{ 
                background: viewMode === 'kanban' ? 'var(--paul-black)' : 'var(--paul-white)',
                color: viewMode === 'kanban' ? 'var(--paul-white)' : 'var(--paul-black)',
                minWidth: 'auto',
                padding: '6px 10px'
              }}
              title={t('orders.viewKanban')}
            >
              {t('orders.viewKanban')}
            </button>
          </div>
          <button
            onClick={loadOrders}
            className="dashboard-refresh-btn"
            aria-label={t('common.refresh')}
          >
            <RefreshIcon size={16} />
            <span>{t('common.refresh')}</span>
          </button>
        </div>
        
        <div style={{ 
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          color: 'var(--paul-gray)'
        }}>
          <span>
            {t('orders.showingOrders', { count: filteredAndSortedOrders.length, total: orderStats.total })}
          </span>
        </div>
      </section>

      {/* Main Content */}
      <div className="main-content">

        {/* Orders Display */}
        <LoadingState isLoading={ordersLoading} loadingText={t('orders.loadingOrders')}>{null}
          {filteredAndSortedOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">
                {searchTerm || statusFilter !== 'all' ? t('orders.noOrders') : t('orders.noOrders')}
              </h3>
              <p className="empty-subtitle">
                {searchTerm || statusFilter !== 'all' 
                  ? t('applications.tryChangingFilters')
                  : t('applications.createFirst')}
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button variant="primary" onClick={() => router.push('/dashboard/orders/create')}>
                  {t('orders.createOrder')}
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
  const t = useTranslations();
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
                {t('orders.orderNumber')}{order.id}
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
            {t('form.orderItems')} ({order.menu_items.length})
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
                +{order.menu_items.length - 3}...
              </div>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div className="card-footer">
          <span className="field-label">{t('orders.totalAmount')}:</span>
          <span className="card-amount">
            {formatTotalAmount(order.total_amount)} ₼
          </span>
        </div>

        {/* Date */}
        <div className="card-date">
          {t('orders.created')}: {new Date(order.created_at).toLocaleDateString('ru-RU')}
        </div>

        {/* Actions */}
        <div className="card-actions">
          {/* Быстрые действия со статусом */}
          <div className="quick-actions">
            {order.status === 'submitted' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'processing')}
                className="quick-action-button approve"
                title={t('orders.startProcessing')}
              >
                ▶️ {t('orders.toProcessing')}
              </button>
            )}
            {order.status === 'processing' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'completed')}
                className="quick-action-button approve"
                title={t('orders.completeOrder')}
              >
                ✅ {t('orders.complete')}
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'cancelled')}
                className="quick-action-button reject"
                title={t('orders.cancelOrder')}
              >
                ❌ {t('orders.cancel')}
              </button>
            )}
          </div>

          {/* Основные действия */}
          <div className="main-actions">
            <Button variant="secondary" size="sm" onClick={() => onEdit(order)} className="action-button">
              ✏️ {t('orders.edit')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy && onCopy(order.id)}
              className="action-button copy"
            >
              📋 {t('orders.copy')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(order.id)} className="action-button">
              🗑️ {t('orders.delete')}
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
  const t = useTranslations('orders');
  return (
    <div className="table-responsive">
      <table className="applications-table">
        <thead>
          <tr className="table-header">
            <th className="table-header-cell">
              {t('orders.company')}
            </th>
            <th className="table-header-cell">
              {t('orders.dishes')}
            </th>
            <th className="table-header-cell">
              {t('orders.totalAmount')}
            </th>
            <th className="table-header-cell">
              {t('orders.status')}
            </th>
            <th className="table-header-cell">
              {t('orders.date')}
            </th>
            <th className="table-header-cell">
              {t('orders.actions')}
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
                  {t('orders.itemsCount', { count: order.menu_items.length })}
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
                    {t('orders.edit')}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDelete(order.id)} className="edit-button">
                    {t('orders.delete')}
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
  calculatePrice: (
    basePrice: number, 
    options: {
      isCorporate?: boolean;
      deliveryDate?: string;
      deliveryTime?: string;
      isExpress?: boolean;
      needsCatering?: boolean;
      distance?: number;
      customDiscountPercent?: number;
      customDeliveryCost?: number;
    }
  ) => { 
    basePrice: number; 
    appliedMarkups: Array<{ name: string; amount: number }>; 
    totalPrice: number; 
    deliveryFee: number; 
    savings: number;
    finalPrice: number;
  };
  pricingRules: PricingRules;
}

const PriceCalculatorModal: React.FC<PriceCalculatorModalProps> = ({ 
  isOpen, 
  onClose, 
  calculatePrice, 
  pricingRules 
}) => {
  const t = useTranslations('orders');
  const [basePrice, setBasePrice] = useState(100);
  const [options, setOptions] = useState({
    isCorporate: false,
    deliveryDate: '',
    deliveryTime: '',
    isExpress: false,
    needsCatering: false,
    distance: 5,
    customDiscountPercent: 0,
    customDeliveryCost: 0
  });

  const calculation = calculatePrice(basePrice, options);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <Card variant="elevated" padding="lg" className={styles.calculatorCard}>
        <CardHeader>
          <div className={styles.calculatorHeader}>
            <CardTitle size="lg">🧮 {t('orders.priceCalculator')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.calculatorContent}>
            {/* Базовая стоимость */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                {t('orders.basePrice')} (₼)
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
              <h3 className={styles.optionsTitle}>{t('orders.additionalOptions')}</h3>
              <div className={styles.optionsGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.isCorporate}
                    onChange={(e) => setOptions({...options, isCorporate: e.target.checked})}
                  />
                  {t('orders.corporateClient')} ({t('orders.discount')} {Math.abs(pricingRules.markups.corporate_discount * 100)}%)
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.isExpress}
                    onChange={(e) => setOptions({...options, isExpress: e.target.checked})}
                  />
                  {t('orders.expressDelivery')} (+{pricingRules.markups.express_delivery_markup * 100}%)
                </label>
                
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={options.needsCatering}
                    onChange={(e) => setOptions({...options, needsCatering: e.target.checked})}
                  />
                  {t('orders.cateringService')} (+{pricingRules.markups.catering_service_markup * 100}%)
                </label>
              </div>
            </div>

            {/* Дата и время */}
            <div className={styles.dateTimeGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>
                  {t('orders.deliveryDate')}
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
                  {t('orders.deliveryTime')}
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
                {t('orders.deliveryDistance')} (км)
              </label>
              <input
                type="number"
                value={options.distance}
                onChange={(e) => setOptions({...options, distance: parseFloat(e.target.value) || 0})}
                className={styles.inputField}
                min="0"
                step="0.1"
              />
            </div>

            {/* Пользовательская скидка */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                {t('orders.discountPercent')} (%)
              </label>
              <input
                type="number"
                value={options.customDiscountPercent}
                onChange={(e) => setOptions({...options, customDiscountPercent: parseFloat(e.target.value) || 0})}
                className={styles.inputField}
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
              />
            </div>

            {/* Пользовательская стоимость доставки */}
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>
                {t('orders.deliveryCost')} (₼)
              </label>
              <input
                type="number"
                value={options.customDeliveryCost}
                onChange={(e) => setOptions({...options, customDeliveryCost: parseFloat(e.target.value) || 0})}
                className={styles.inputField}
                min="0"
                step="0.01"
                placeholder="0"
              />
              <small style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'block' }}>
                {t('orders.leaveZeroForAuto')}
              </small>
            </div>

            {/* Результат расчета */}
            <div className={styles.calculationResult}>
              <h3 className={styles.resultTitle}>
                📊 {t('orders.calculationResult')}
              </h3>
              
              <div className={styles.resultRows}>
                <div className={styles.resultRow}>
                  <span>{t('orders.basePrice')}:</span>
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
                  <span>{t('orders.delivery')}:</span>
                  <span className={styles.resultValue}>{calculation.deliveryFee.toFixed(2)} ₼</span>
                </div>

                <hr className={styles.resultDivider} />
                
                <div className={styles.totalRow}>
                  <span>{t('orders.finalPrice')}:</span>
                  <span>{calculation.totalPrice.toFixed(2)} ₼</span>
                </div>

                {calculation.savings > 0 && (
                  <div className={styles.savingsRow}>
                    <span>{t('orders.savings')}:</span>
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
  const t = useTranslations('orders');
  const statuses = [
    { key: 'draft', label: t('orders.status.draft'), color: '#64748B' },
    { key: 'submitted', label: t('orders.status.submitted'), color: '#3B82F6' },
    { key: 'processing', label: t('orders.status.processing'), color: '#F59E0B' },
    { key: 'completed', label: t('orders.status.completed'), color: '#10B981' },
    { key: 'cancelled', label: t('orders.status.cancelled'), color: '#EF4444' },
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
                      {t('orders.order')} #{order.id} • {t('orders.itemsCount', { count: order.menu_items.length })}
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
