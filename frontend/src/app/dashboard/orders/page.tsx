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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData & { status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' }>({
    company_name: '',
    client_type: 'corporate',
    menu_items: [],
    comment: '',
    delivery_date: '',
    delivery_time: '',
    status: 'pending',
  });

  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'>('all');
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
      const result = await makeApiRequest<Order[]>('orders');
      if (result.success) {
        const ordersData = extractApiData(result.data || []) as Order[];
        console.log('Orders data:', ordersData);
        setOrders(ordersData);
      } else {
        console.error('Failed to load orders:', handleApiError(result));
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

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await makeApiRequest('orders', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (result.success) {
        setShowCreateForm(false);
        setFormData({
          company_name: '',
          client_type: 'corporate',
          menu_items: [],
          comment: '',
          delivery_date: '',
          delivery_time: '',
          status: 'pending',
        });
        loadOrders();
      } else {
        alert(handleApiError(result, 'Error creating order'));
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('An error occurred while creating the order');
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const result = await makeApiRequest(`orders/${editingOrder.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (result.success) {
        setEditingOrder(null);
        setFormData({
          company_name: '',
          client_type: 'corporate',
          menu_items: [],
          comment: '',
          delivery_date: '',
          delivery_time: '',
          status: 'pending',
        });
        loadOrders();
      } else {
        alert(handleApiError(result, 'Error updating order'));
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('An error occurred while updating the order');
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const result = await makeApiRequest(`orders/${orderId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        loadOrders();
      } else {
        alert(handleApiError(result, 'Error deleting order'));
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('An error occurred while deleting the order');
    }
  };

  const startEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      company_name: order.company_name,
      client_type: order.client_type || 'corporate',
      menu_items: order.menu_items.map((item: MenuItem) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity ?? 1,
        price: item.price ?? 0,
        description: (item as CartItem).description ?? '',
        image: (item as CartItem).image ?? '',
        category: (item as CartItem).category ?? '',
        available: (item as CartItem).available ?? true,
        isSet: (item as CartItem).isSet ?? false,
      })),
      comment: order.comment || '',
      delivery_date: order.delivery_date ? order.delivery_date.split(' ')[0] : '',
      delivery_time: order.delivery_time ? order.delivery_time.split(' ')[1] : '',
      status: order.status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | undefined,
    });
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      menu_items: [
        ...formData.menu_items,
        {
          id: '',
          name: '',
          quantity: 1,
          price: 0,
          description: '',
          image: '',
          category: '',
          available: true,
          isSet: false,
        }
      ]
    });
  };

  const removeMenuItem = (index: number) => {
    setFormData({
      ...formData,
      menu_items: formData.menu_items.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index: number, field: string, value: string | number) => {
    const newMenuItems = [...formData.menu_items];
    newMenuItems[index] = { ...newMenuItems[index], [field]: value };
    setFormData({ ...formData, menu_items: newMenuItems });
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
      const result = await makeApiRequest(`orders/${orderId}/copy`, {
        method: 'POST'
      });

      if (result.success) {
        alert('Order successfully copied!');
        loadOrders();
      } else {
        alert(handleApiError(result, 'Error copying order'));
      }
    } catch (error) {
      console.error('Ошибка копирования заказа:', error);
      alert('Произошла ошибка при копировании заказа');
    }
  }, [loadOrders]);

  // Функция для быстрого изменения статуса заказа
  const handleQuickStatusChange = useCallback(async (orderId: number, newStatus: string) => {
    try {
      const result = await makeApiRequest(`orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });

      if (result.success) {
        alert('Статус заказа успешно изменен!');
        loadOrders();
      } else {
        alert(handleApiError(result, 'Ошибка изменения статуса'));
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
        makeApiRequest(`orders/${orderId}/copy`, { method: 'POST' })
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
        itemStats[item.name].quantity += item.quantity;
        itemStats[item.name].revenue += item.quantity * item.price;
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Modern Header */}
      <div style={{
        backgroundColor: paulColors.white,
        borderBottom: `1px solid ${paulColors.border}`,
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: 'white',
                  border: `1px solid ${paulColors.border}`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: paulColors.gray
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = paulColors.beige;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 style={{
                  fontSize: '2rem',
                  fontWeight: '800',
                  color: paulColors.black,
                  fontFamily: 'Playfair Display, serif',
                  margin: 0,
                  letterSpacing: '-0.02em'
                }}>
                  Управление заказами
                </h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: paulColors.gray,
                  margin: '0.25rem 0 0 0',
                  fontWeight: '500'
                }}>
                  PAUL Catering Azerbaijan • {orderStats.total} заказов
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button 
                variant="ghost" 
                size="md"
                onClick={() => setShowCalculator(true)}
                style={{ background: '#EEF2FF', color: '#3B82F6' }}
              >
                🧮 Калькулятор
              </Button>
              <Button 
                variant="ghost" 
                size="md"
                onClick={() => setShowAnalytics(true)}
                style={{ background: '#F0FDF4', color: '#16A34A' }}
              >
                📊 Аналитика
              </Button>
              {selectedOrdersForCopy.size > 0 && (
                <Button 
                  variant="ghost" 
                  size="md"
                  onClick={handleMassCopy}
                  style={{ background: '#FEF3C7', color: '#D97706' }}
                >
                  📋 Копировать ({selectedOrdersForCopy.size})
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="md"
                onClick={() => router.push('/dashboard/orders/create')}
              >
                + Новый заказ
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: paulColors.gray, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    Всего заказов
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: paulColors.black, fontFamily: 'Playfair Display, serif' }}>
                    {orderStats.total}
                  </div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#EEF2FF', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  📋
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: paulColors.gray, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    В обработке
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#F59E0B', fontFamily: 'Playfair Display, serif' }}>
                    {orderStats.byStatus.processing}
                  </div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ⏳
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: paulColors.gray, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    Завершено
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10B981', fontFamily: 'Playfair Display, serif' }}>
                    {orderStats.byStatus.completed}
                  </div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#D1FAE5', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  ✅
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: paulColors.gray, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
                    Общая сумма
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '800', color: '#D4AF37', fontFamily: 'Playfair Display, serif' }}>
                    {formatTotalAmount(orderStats.totalAmount)} ₼
                  </div>
                </div>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  💰
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Filters and Search Bar */}
        <Card variant="default" padding="lg" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Search and View Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Поиск по компании или блюдам..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.5rem',
                      border: `1px solid ${paulColors.border}`,
                      borderRadius: '12px',
                      outline: 'none',
                      fontSize: '0.875rem',
                      backgroundColor: paulColors.white,
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#D4AF37';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = paulColors.border;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <svg 
                    style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      width: '18px', 
                      height: '18px',
                      color: paulColors.gray
                    }} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: viewMode === 'grid' ? paulColors.black : 'transparent',
                    color: viewMode === 'grid' ? paulColors.white : paulColors.gray,
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Карточки"
                >
                  <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: viewMode === 'table' ? paulColors.black : 'transparent',
                    color: viewMode === 'table' ? paulColors.white : paulColors.gray,
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Таблица"
                >
                  <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  style={{
                    padding: '0.5rem',
                    backgroundColor: viewMode === 'kanban' ? paulColors.black : 'transparent',
                    color: viewMode === 'kanban' ? paulColors.white : paulColors.gray,
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  title="Канбан"
                >
                  <svg style={{ width: '18px', height: '18px' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h4v12H4V6zm6-2h4v16h-4V4zm6 4h4v8h-4V8z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: paulColors.gray }}>Статус:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    backgroundColor: paulColors.white,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: paulColors.gray }}>Сортировка:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'created_at' | 'company_name' | 'total_amount')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    backgroundColor: paulColors.white,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="created_at">По дате</option>
                  <option value="company_name">По компании</option>
                  <option value="total_amount">По сумме</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  style={{
                    padding: '0.5rem',
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    backgroundColor: paulColors.white,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <svg 
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease'
                    }} 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 14l5-5 5 5z"/>
                  </svg>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: paulColors.gray }}>Группировка:</label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as 'none' | 'status' | 'date' | 'company')}
                  style={{
                    padding: '0.5rem 0.75rem',
                    border: `1px solid ${paulColors.border}`,
                    borderRadius: '8px',
                    backgroundColor: paulColors.white,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="none">Без группировки</option>
                  <option value="status">По статусу</option>
                  <option value="client">По клиентам</option>
                  <option value="date">По датам</option>
                  <option value="amount">По сумме</option>
                </select>
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: paulColors.gray }}>
                  Найдено: {filteredAndSortedOrders.length} из {orderStats.total}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Orders Display */}
        <LoadingState isLoading={ordersLoading} loadingText="Загрузка заказов...">{null}
          {filteredAndSortedOrders.length === 0 ? (
            <Card variant="default" padding="lg">
              <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.6 }}>📋</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: paulColors.black, marginBottom: '0.5rem' }}>
                  {searchTerm || statusFilter !== 'all' ? 'Заказы не найдены' : 'Пока нет заказов'}
                </h3>
                <p style={{ color: paulColors.gray, fontSize: '0.875rem', marginBottom: '1.5rem' }}>
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
            </Card>
          ) : (
            <>
              {groupedOrders ? (
                <GroupedOrdersDisplay
                  groups={groupedOrders}
                  viewMode={viewMode}
                  onEdit={startEdit}
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
                  onEdit={startEdit}
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
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {filteredAndSortedOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onEdit={startEdit}
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
                  onEdit={startEdit} 
                  onDelete={handleDeleteOrder}
                />
              )}
            </>
          )}
        </LoadingState>

        {/* Modal для создания/редактирования заказа */}
        {(showCreateForm || editingOrder) && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <Card variant="elevated" padding="lg" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
              <CardHeader>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CardTitle size="lg">
                    {editingOrder ? 'Редактирование заказа' : 'Создание нового заказа'}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingOrder(null);
                      setFormData({
                        company_name: '',
                        client_type: 'corporate',
                        menu_items: [],
                        comment: '',
                        delivery_date: '',
                        delivery_time: '',
                        status: 'pending',
                      });
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Название компании *
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        style={{ 
                          width: '100%', 
                          padding: '0.75rem', 
                          border: `1px solid ${paulColors.border}`, 
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Дата доставки
                      </label>
                      <input
                        type="date"
                        value={formData.delivery_date}
                        onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${paulColors.border}`,
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Время доставки
                      </label>
                      <input
                        type="time"
                        value={formData.delivery_time}
                        onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${paulColors.border}`,
                          borderRadius: '8px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Статус заказа
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' })}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${paulColors.border}`,
                          borderRadius: '8px',
                          outline: 'none',
                          backgroundColor: paulColors.white
                        }}
                      >
                        <option value="draft">Черновик</option>
                        <option value="submitted">Отправлен</option>
                        <option value="processing">В обработке</option>
                        <option value="completed">Завершен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        Комментарий
                      </label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        placeholder="Комментарий к заказу..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: `1px solid ${paulColors.border}`,
                          borderRadius: '8px',
                          outline: 'none',
                          resize: 'vertical',
                          backgroundColor: paulColors.white
                        }}
                      />
                    </div>
                  </div>



                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Пункты меню</label>
                      <Button type="button" variant="secondary" size="sm" onClick={addMenuItem}>
                        + Добавить
                      </Button>
                    </div>
                    {formData.menu_items.map((item, index) => (
                      <div key={index} style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '2fr 1fr 1fr auto', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#F9FAFB',
                        borderRadius: '8px'
                      }}>
                        <input
                          type="text"
                          placeholder="Название"
                          value={item.name}
                          onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                          style={{ padding: '0.5rem', border: `1px solid ${paulColors.border}`, borderRadius: '6px' }}
                          required
                        />
                        <input
                          type="number"
                          placeholder="Кол-во"
                          value={item.quantity}
                          onChange={(e) => updateMenuItem(index, 'quantity', parseInt(e.target.value))}
                          style={{ padding: '0.5rem', border: `1px solid ${paulColors.border}`, borderRadius: '6px' }}
                          min="1"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Цена"
                          value={item.price}
                          onChange={(e) => updateMenuItem(index, 'price', parseFloat(e.target.value))}
                          style={{ padding: '0.5rem', border: `1px solid ${paulColors.border}`, borderRadius: '6px' }}
                          min="0"
                          step="0.01"
                          required
                        />
                        <Button type="button" variant="danger" size="sm" onClick={() => removeMenuItem(index)}>
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <Button type="submit" variant="primary" style={{ flex: 1 }}>
                      {editingOrder ? 'Обновить' : 'Создать'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingOrder(null);
                        setFormData({
                          company_name: '',
                          client_type: 'corporate',
                          menu_items: [],
                          comment: '',
                          delivery_date: '',
                          delivery_time: '',
                          status: 'pending',
                        });
                      }}
                      style={{ flex: 1 }}
                    >
                      Отмена
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

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
    </div>
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
  const paulColors = {
    black: '#1A1A1A',
    beige: '#EBDCC8',
    border: '#EDEAE3',
    gray: '#4A4A4A',
    white: '#FFFCF8'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'submitted': return '#3B82F6';
      default: return paulColors.gray;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'processing': return '#FEF3C7';
      case 'completed': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      case 'submitted': return '#DBEAFE';
      default: return '#F3F4F6';
    }
  };

  return (
    <div
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer'
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      }}
    >
      <Card 
        variant="default" 
        padding="lg"
      >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
                style={{
                  marginTop: '0.25rem',
                  cursor: 'pointer',
                  transform: 'scale(1.2)'
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ 
                fontSize: '1.125rem', 
                fontWeight: '700', 
                color: paulColors.black,
                margin: '0 0 0.25rem 0',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}>
                {order.company_name}
              </h3>
              <p style={{ 
                fontSize: '0.75rem', 
                color: paulColors.gray,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Заказ #{order.id}
              </p>
            </div>
          </div>
          <div style={{
            padding: '0.375rem 0.75rem',
            backgroundColor: getStatusBg(order.status),
            color: getStatusColor(order.status),
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'capitalize'
          }}>
            {getStatusLabel(order.status)}
          </div>
        </div>

        {/* Menu Items Preview */}
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: paulColors.black, marginBottom: '0.5rem' }}>
            Блюда ({order.menu_items.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {order.menu_items.slice(0, 3).map((item, index) => (
              <div key={index} style={{ 
                fontSize: '0.75rem', 
                color: paulColors.gray,
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{item.name}</span>
                <span>{item.quantity}x {item.price}₼</span>
              </div>
            ))}
            {order.menu_items.length > 3 && (
              <div style={{ fontSize: '0.75rem', color: paulColors.gray, fontStyle: 'italic' }}>
                +{order.menu_items.length - 3} еще...
              </div>
            )}
          </div>
        </div>

        {/* Total Amount */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: `1px solid ${paulColors.border}`
        }}>
          <span style={{ fontSize: '0.875rem', color: paulColors.gray }}>Общая сумма:</span>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: '800', 
            color: '#D4AF37',
            fontFamily: 'Playfair Display, serif'
          }}>
            {formatTotalAmount(order.total_amount)} ₼
          </span>
        </div>

        {/* Date */}
        <div style={{ fontSize: '0.75rem', color: paulColors.gray }}>
          Создан: {new Date(order.created_at).toLocaleDateString('ru-RU')}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {/* Быстрые действия со статусом */}
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {order.status === 'submitted' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'processing')}
                style={{
                  flex: 1,
                  padding: '0.375rem 0.5rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Начать обработку"
              >
                ▶️ В обработку
              </button>
            )}
            {order.status === 'processing' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'completed')}
                style={{
                  flex: 1,
                  padding: '0.375rem 0.5rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Завершить заказ"
              >
                ✅ Завершить
              </button>
            )}
            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <button
                onClick={() => onQuickStatusChange(order.id, 'cancelled')}
                style={{
                  flex: 1,
                  padding: '0.375rem 0.5rem',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.625rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Отменить заказ"
              >
                ❌ Отменить
              </button>
            )}
          </div>

          {/* Основные действия */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => onEdit(order)} style={{ flex: 1 }}>
              ✏️ Редактировать
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy && onCopy(order.id)}
              style={{
                flex: 1,
                background: '#FEF3C7',
                color: '#D97706',
                border: '1px solid #FCD34D'
              }}
            >
              📋 Копировать
            </Button>
            <Button variant="danger" size="sm" onClick={() => onDelete(order.id)} style={{ flex: 1 }}>
              🗑️ Удалить
            </Button>
          </div>
        </div>
      </div>
      </Card>
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
  const paulColors = {
    black: '#1A1A1A',
    beige: '#EBDCC8',
    border: '#EDEAE3',
    gray: '#4A4A4A',
    white: '#FFFCF8'
  };

  return (
    <Card variant="default" padding="sm">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${paulColors.border}` }}>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: paulColors.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Компания
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: paulColors.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Блюда
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: paulColors.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Сумма
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: paulColors.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Статус
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'left', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: paulColors.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Дата
              </th>
              <th style={{ 
                padding: '1rem', 
                textAlign: 'right', 
                fontSize: '0.75rem', 
                fontWeight: '700', 
                color: paulColors.gray,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Действия
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                style={{ 
                  borderBottom: `1px solid ${paulColors.border}`,
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600', color: paulColors.black, marginBottom: '0.25rem' }}>
                    {order.company_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: paulColors.gray }}>
                    #{order.id}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: paulColors.black }}>
                    {order.menu_items.length} позиций
                  </div>
                  <div style={{ fontSize: '0.75rem', color: paulColors.gray }}>
                    {order.menu_items.slice(0, 2).map(item => item.name).join(', ')}
                    {order.menu_items.length > 2 && '...'}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ 
                    fontSize: '1rem', 
                    fontWeight: '700', 
                    color: '#D4AF37'
                  }}>
                    {formatTotalAmount(order.total_amount)} ₼
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: getStatusBgColor(order.status),
                    color: '#374151'
                  }}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontSize: '0.875rem', color: paulColors.gray }}>
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(order)}>
                      Изменить
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => onDelete(order.id)}>
                      Удалить
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Компонент калькулятора стоимости
interface PriceCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatePrice: (basePrice: number, options: { [key: string]: unknown }) => { basePrice: number; appliedMarkups: Array<{ name: string; amount: number }>; totalPrice: number; deliveryFee: number; savings: number };
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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <Card variant="elevated" padding="lg" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle size="lg">🧮 Калькулятор стоимости</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Базовая стоимость */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Базовая стоимость (₼)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            {/* Опции */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Дополнительные параметры</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={options.isCorporate}
                    onChange={(e) => setOptions({...options, isCorporate: e.target.checked})}
                  />
                  Корпоративный клиент (скидка {Math.abs(pricingRules.markups.corporate_discount * 100)}%)
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={options.isExpress}
                    onChange={(e) => setOptions({...options, isExpress: e.target.checked})}
                  />
                  Срочная доставка (+{pricingRules.markups.express_delivery_markup * 100}%)
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Дата доставки
                </label>
                <input
                  type="date"
                  value={options.deliveryDate}
                  onChange={(e) => setOptions({...options, deliveryDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Время доставки
                </label>
                <input
                  type="time"
                  value={options.deliveryTime}
                  onChange={(e) => setOptions({...options, deliveryTime: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>

            {/* Расстояние */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Расстояние доставки (км)
              </label>
              <input
                type="number"
                value={options.distance}
                onChange={(e) => setOptions({...options, distance: parseFloat(e.target.value) || 0})}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px'
                }}
              />
            </div>

            {/* Результат расчета */}
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
                📊 Результат расчета
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Базовая стоимость:</span>
                  <span style={{ fontWeight: '600' }}>{calculation.basePrice.toFixed(2)} ₼</span>
                </div>

                {calculation.appliedMarkups.map((markup: { name: string; amount: number }, index: number) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    color: markup.amount > 0 ? '#EF4444' : '#10B981'
                  }}>
                    <span>{markup.name}:</span>
                    <span style={{ fontWeight: '600' }}>
                      {markup.amount > 0 ? '+' : ''}{markup.amount.toFixed(2)} ₼
                    </span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Доставка:</span>
                  <span style={{ fontWeight: '600' }}>{calculation.deliveryFee.toFixed(2)} ₼</span>
                </div>

                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #E2E8F0' }} />
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  color: '#D4AF37'
                }}>
                  <span>Итоговая стоимость:</span>
                  <span>{calculation.totalPrice.toFixed(2)} ₼</span>
                </div>

                {calculation.savings > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    color: '#10B981',
                    fontSize: '0.875rem'
                  }}>
                    <span>Экономия:</span>
                    <span style={{ fontWeight: '600' }}>{calculation.savings.toFixed(2)} ₼</span>
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
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <Card variant="elevated" padding="lg" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
        <CardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle size="lg">📊 Аналитика заказов</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Общая статистика */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
                💰 Общие показатели
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#F0FDF4', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#16A34A' }}>
                    {analytics.totalRevenue.toFixed(0)} ₼
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#15803D' }}>Общий доход</div>
                </div>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#EFF6FF', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563EB' }}>
                    {analytics.totalOrders}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1D4ED8' }}>Всего заказов</div>
                </div>
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: '#FEF3C7', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#D97706' }}>
                    {analytics.averageOrderValue.toFixed(0)} ₼
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#B45309' }}>Средний чек</div>
                </div>
              </div>
            </div>

            {/* Топ клиенты */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
                👥 Топ клиенты
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {analytics.topClients.map((client, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600' }}>{client.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                        {client.orderCount} заказов
                      </div>
                    </div>
                    <div style={{ fontWeight: '700', color: '#D4AF37' }}>
                      {client.totalAmount.toFixed(0)} ₼
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Популярные блюда */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
                🍽️ Популярные блюда
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
                {analytics.popularItems.slice(0, 6).map((item, index) => (
                  <div key={index} style={{
                    padding: '0.75rem',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Заказано: {item.quantity} раз
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16A34A' }}>
                      Доход: {item.revenue.toFixed(0)} ₼
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Доходы по месяцам */}
            {analytics.revenueByMonth.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
                  📈 Доходы по месяцам
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {analytics.revenueByMonth.slice(-6).map((month, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.75rem',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontWeight: '600' }}>{month.month}</div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <span style={{ color: '#64748B' }}>{month.orders} заказов</span>
                        <span style={{ fontWeight: '700', color: '#16A34A' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {groups.map(group => (
        <Card key={group.key} variant="default" padding="lg">
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              {group.label}
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                padding: '0.25rem 0.75rem',
                backgroundColor: '#F3F4F6',
                borderRadius: '12px',
                color: '#374151'
              }}>
                {group.count} заказов • {formatTotalAmount(group.totalAmount)} ₼
              </span>
            </h3>
          </div>
          
          {viewMode === 'grid' ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
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
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      alignItems: 'start'
    }}>
      {groupedByStatus.map(column => (
        <Card key={column.key} variant="default" padding="md">
          <div style={{
            padding: '1rem',
            borderBottom: `3px solid ${column.color}`,
            marginBottom: '1rem'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '700',
              color: column.color,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {column.label}
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                padding: '0.25rem 0.5rem',
                backgroundColor: `${column.color}20`,
                borderRadius: '8px'
              }}>
                {column.orders.length}
              </span>
            </h3>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            minHeight: '400px'
          }}>
            {column.orders.map(order => (
              <div
                key={order.id}
                style={{
                  padding: '1rem',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => onToggleSelect(order.id)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      margin: '0 0 0.25rem 0',
                      color: '#1F2937'
                    }}>
                      {order.company_name}
                    </h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: '#6B7280',
                      margin: 0
                    }}>
                      Заказ #{order.id} • {order.menu_items.length} позиций
                    </p>
                  </div>
                </div>
                
                <div style={{
                  fontSize: '1rem',
                  fontWeight: '700',
                  color: '#D4AF37',
                  marginBottom: '0.75rem'
                }}>
                  {formatTotalAmount(order.total_amount)} ₼
                </div>
                
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(order);
                    }}
                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem' }}
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
                    style={{ 
                      flex: 1, 
                      padding: '0.25rem', 
                      fontSize: '0.75rem',
                      background: '#FEF3C7',
                      color: '#D97706'
                    }}
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
                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem' }}
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
