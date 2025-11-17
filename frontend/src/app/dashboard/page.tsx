"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useAuth } from "../../contexts/AuthContext";
import { Application, Order } from "../../types/common";
import { makeApiRequest, extractApiData, handleApiError } from "../../utils/apiHelpers";
import { useAuthGuard, canManageOrders, canViewDashboard, isObserver } from "../../utils/authConstants";
import { getStatusLabel, getStatusColor } from "../../utils/statusTranslations";
import { useDebounce } from "../../utils/useDebounce";
import { useSmoothScroll } from "../../utils/useSmoothScroll";
import { SkeletonCard, SkeletonTableRow, SkeletonStyles } from "../../components/Skeleton";
import DashboardLayout from "../../components/DashboardLayout";
import { 
  SearchIcon, 
  FilterIcon, 
  RefreshIcon, 
  EyeIcon,
  FileTextIcon,
  ShoppingBagIcon,
  CalendarIcon,
  XIcon 
} from "../../components/Icons";
import "../../styles/dashboard.css";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "processing" | "approved" | "rejected">("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Debounced search для производительности
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { scrollToElement } = useSmoothScroll();

  // Auth guard - проверяем тип пользователя
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Если пользователь наблюдатель, редиректим на кухню
      if (isObserver(user)) {
        router.replace('/dashboard/kitchen');
        return;
      }
      // Если пользователь клиент, редиректим на профиль
      if (user.user_type === 'client') {
        router.replace('/profile');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, canViewDashboard, router);

  // Data fetching с оптимизацией
  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const result = await makeApiRequest<Application[]>("/applications");
      if (result.success && result.data) {
        setApplications(extractApiData(result.data));
      } else {
        console.error("Failed to load applications:", handleApiError(result as any));
      }
    } catch (e) {
      console.error("Failed to load applications", e);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    if (!canManageOrders(user || { user_type: '', staff_role: '' })) return;
    try {
      const result = await makeApiRequest<Order[]>("/orders");
      if (result.success && result.data) {
        setOrders(extractApiData(result.data));
      } else {
        console.error("Failed to load orders:", handleApiError(result as any));
      }
    } catch (e) {
      console.error("Failed to load orders", e);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
      loadOrders();
    }
  }, [isAuthenticated, loadApplications, loadOrders]);

  // Обновление времени каждую минуту
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Обновляем каждую минуту

    return () => clearInterval(timer);
  }, []);

  // Filters с мемоизацией для производительности и debounced поиском
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = debouncedSearchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        app.first_name.toLowerCase().includes(q) ||
        (app.last_name && app.last_name.toLowerCase().includes(q)) ||
        String(app.email || "").toLowerCase().includes(q) ||
        String(app.phone || "").toLowerCase().includes(q) ||
        String(app.event_address || "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applications, debouncedSearchTerm, statusFilter]);

  // Actions с улучшенной обработкой ошибок и оптимистичными обновлениями
  const updateApplicationStatus = useCallback(async (
    applicationId: string | number,
    newStatus: "new" | "processing" | "approved" | "rejected",
    comment: string = ""
  ) => {
    // Оптимистичное обновление UI
    const previousApplications = [...applications];
    const optimisticApplications = applications.map(app => 
      app.id === applicationId 
        ? { ...app, status: newStatus, coordinator_comment: comment || app.coordinator_comment }
        : app
    );
    setApplications(optimisticApplications);
    
    // Обновляем selectedApplication для модального окна
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication((prev: Application | null) => prev ? { 
        ...prev, 
        status: newStatus, 
        coordinator_comment: comment || prev.coordinator_comment 
      } : null);
    }

    try {
      const result = await makeApiRequest(`/applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus, coordinator_comment: comment }),
      });
      
      if (result.success) {
        // Успешно - обновляем данные с сервера для синхронизации
        await loadApplications();
        setIsModalOpen(false);
        setSelectedApplication(null);
      } else {
        // Откатываем оптимистичные изменения
        setApplications(previousApplications);
        if (selectedApplication?.id === applicationId) {
          const originalApp = previousApplications.find(app => app.id === applicationId);
          setSelectedApplication(originalApp || null);
        }
        alert(handleApiError(result as any, t('applications.updateStatusError')));
      }
    } catch (e) {
      // Откатываем оптимистичные изменения при ошибке
      setApplications(previousApplications);
      if (selectedApplication?.id === applicationId) {
        const originalApp = previousApplications.find(app => app.id === applicationId);
        setSelectedApplication(originalApp || null);
      }
      console.error("Failed to update status", e);
      alert(t('applications.updateStatusError'));
    }
  }, [applications, selectedApplication, loadApplications]);

  if (isLoading || !isAuthenticated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
      }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <DashboardLayout>

        {/* KPI Cards */}
        <section 
          id="kpi-section"
          className="dashboard-kpi-grid"
        >
          {applicationsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <div 
                className="dashboard-kpi-card"
                onClick={() => scrollToElement('applications-section')}
                role="button"
                aria-label={t('applications.title')}
                tabIndex={0}
              >
                <div className="dashboard-kpi-header">
                  <FileTextIcon size={14} className="dashboard-kpi-icon" />
                  <span className="dashboard-kpi-label">{t('dashboard.applications')}</span>
                </div>
                <div className="dashboard-kpi-value">{applications.length}</div>
                <div className="dashboard-kpi-subtitle">
                  {t('applications.newApplications')}: {applications.filter(a => a.status === "new").length} | 
                  {t('orders.status.processing')}: {applications.filter(a => a.status === "processing").length}
                </div>
              </div>
              <div 
                className="dashboard-kpi-card"
                onClick={() => scrollToElement('applications-section')}
                role="button"
                aria-label={t('applications.newApplications')}
                tabIndex={0}
              >
                <div className="dashboard-kpi-header">
                  <ShoppingBagIcon size={14} className="dashboard-kpi-icon" />
                  <span className="dashboard-kpi-label">{t('dashboard.orders')}</span>
                </div>
                <div className="dashboard-kpi-value">{orders.length}</div>
                <div className="dashboard-kpi-subtitle">
                  {t('orders.status.processing')}: {orders.filter(o => o.status === "processing").length} | 
                  {t('dashboard.completedOrders')}: {orders.filter(o => o.status === "completed").length}
                </div>
                <div className="dashboard-kpi-subtitle" style={{ marginTop: '4px', fontSize: '9px' }}>
                  {t('orders.status.paid')}: {orders.filter(o => o.status === "paid").length} | 
                  {t('orders.status.pendingPayment')}: {orders.filter(o => o.status === "pending_payment").length}
                </div>
                <div className="dashboard-kpi-subtitle" style={{ marginTop: '2px', fontSize: '9px' }}>
                  {t('orders.status.submitted')}: {orders.filter(o => o.status === "submitted").length} | 
                  {t('orders.status.draft')}: {orders.filter(o => o.status === "draft").length} | 
                  {t('orders.status.cancelled')}: {orders.filter(o => o.status === "cancelled").length}
                </div>
              </div>
              <div 
                className="dashboard-kpi-card"
                role="button"
                aria-label={t('common.time')}
                tabIndex={0}
              >
                <div className="dashboard-kpi-header">
                  <CalendarIcon size={14} className="dashboard-kpi-icon" />
                  <span className="dashboard-kpi-label">{t('common.time')}</span>
                </div>
                <div className="dashboard-kpi-value" style={{ fontSize: '1.5rem' }}>
                  {currentTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="dashboard-kpi-subtitle">
                  {currentTime.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}
                </div>
              </div>
            </>
          )}
        </section>

        {/* Quick actions */}
        <section className="dashboard-quick-actions">
          <div className="dashboard-quick-actions-grid">
            <Link 
              href="/dashboard/applications" 
              className="dashboard-quick-action-link"
            >
              {t('applications.title')}
            </Link>
            {canManageOrders(user || { user_type: '', staff_role: '' }) && (
              <Link 
                href="/dashboard/orders/create" 
                className="dashboard-quick-action-link"
              >
                {t('orders.createOrder')}
              </Link>
            )}
            {canManageOrders(user || { user_type: '', staff_role: '' }) && (
              <Link 
                href="/dashboard/users" 
                className="dashboard-quick-action-link"
              >
                {t('dashboard.users')}
              </Link>
            )}
            <Link 
              href="/dashboard/calendar" 
              className="dashboard-quick-action-link"
            >
              {t('calendar.title')}
            </Link>
          </div>
        </section>

        {/* Filters */}
        <section 
          id="filters-section"
          className="dashboard-filters"
        >
          <div className="dashboard-search-container">
            <SearchIcon 
              size={16} 
              className="dashboard-search-icon"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              className="dashboard-search-input"
              aria-label={t('applications.title')}
            />
          </div>
          <div className="dashboard-filter-container">
            <FilterIcon 
              size={16} 
              className="dashboard-filter-icon"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'new' | 'processing' | 'approved' | 'rejected')}
              className="dashboard-filter-select"
              aria-label={t('common.filter')}
            >
              <option value="all">{t('common.all')}</option>
              <option value="new">{t('applications.newApplications')}</option>
              <option value="processing">{t('orders.status.processing')}</option>
              <option value="approved">{t('applications.approved')}</option>
              <option value="rejected">{t('applications.rejected')}</option>
            </select>
          </div>
          <button 
            onClick={loadApplications} 
            className="dashboard-refresh-btn"
            aria-label={t('common.refresh')}
          >
            <RefreshIcon size={16} />
            <span>{t('common.refresh')}</span>
          </button>
        </section>

        {/* Applications table and Mini Calendar */}
        <div className="dashboard-content-grid">
          {/* Applications table */}
          <section 
            id="applications-section"
            className="dashboard-table-container"
          >
            <div className="dashboard-table-header">
              <h2 className="dashboard-table-title">{t('applications.title')}</h2>
              <Link 
                href="/dashboard/applications" 
                className="dashboard-table-link"
              >
                {t('common.all')} →
              </Link>
            </div>

            <div className="responsive-table" style={{ overflowX: "auto" }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>{t('applications.applicant')}</th>
                    <th>{t('applications.contacts')}</th>
                    <th>{t('applications.event')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                {applicationsLoading ? (
                  // Показываем 3 skeleton строки во время загрузки
                  Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonTableRow key={`skeleton-${index}`} />
                  ))
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>
                      {debouncedSearchTerm ? t('common.noData') : t('applications.noApplications')}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.slice(0, 5).map((a) => (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{a.first_name} {a.last_name}</div>
                      </td>
                      <td>
                        <div style={{ color: "#111827" }}>{a.email}</div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>{a.phone}</div>
                      </td>
                      <td>
                        {a.event_address ? (
                          <div>
                            <div style={{ color: "#111827", fontSize: 12, fontWeight: 500 }}>{a.event_address}</div>
                            {a.event_date && (
                              <div style={{ color: "#6b7280", fontSize: 11 }}>
                                {new Date(a.event_date).toLocaleDateString("ru-RU")}
                                {a.event_time && ` ${a.event_time}`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic" }}>{t('applications.notSpecified')}</div>
                        )}
                      </td>
                      <td>
                        <span className="dashboard-status-badge">
                          {a.status === "new" ? t('applications.new') : a.status === "processing" ? t('applications.processing') : a.status === "approved" ? t('applications.approvedStatus') : t('applications.rejectedStatus')}
                        </span>
                      </td>
                      <td>{new Date(a.created_at).toLocaleDateString("ru-RU")}</td>
                      <td>
                        <button
                          onClick={() => { setSelectedApplication(a); setIsModalOpen(true); }}
                          className="dashboard-action-btn"
                          aria-label={t('applications.viewApplication')}
                        >
                          <EyeIcon size={14} />
                          <span>{t('common.view')}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mini Calendar */}
          <section className="dashboard-calendar-container">
            <h3 className="dashboard-calendar-title">
              {t('calendar.title')}
            </h3>
            <MiniCalendar orders={orders} />
          </section>
        </div>


      {/* Modal */}
      {isModalOpen && selectedApplication && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal">
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">{t('applications.title')} {selectedApplication.first_name} {selectedApplication.last_name}</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }} 
                className="dashboard-modal-close"
              >
                {t('common.close')}
              </button>
            </div>
            <div className="dashboard-modal-content">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
                <Info label={t('users.firstName')} value={selectedApplication.first_name} />
                <Info label={t('users.lastName')} value={selectedApplication.last_name} />
                <Info label={t('users.email')} value={selectedApplication.email} />
                <Info label={t('users.phone')} value={selectedApplication.phone} />
                <Info label={t('common.status')} value={selectedApplication.status} />
              </div>

              {/* Информация о мероприятии */}
              {(selectedApplication.event_address || selectedApplication.event_date || selectedApplication.event_time) && (
                <>
                  <div className="dashboard-section-divider">
                    <h3 className="dashboard-section-title">{t('form.eventInformation')}</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                      {selectedApplication.event_address && <Info label={t('common.address')} value={selectedApplication.event_address} />}
                      {selectedApplication.event_date && <Info label={t('common.date')} value={new Date(selectedApplication.event_date).toLocaleDateString("ru-RU")} />}
                      {selectedApplication.event_time && <Info label={t('common.time')} value={selectedApplication.event_time} />}
                      {selectedApplication.event_lat && selectedApplication.event_lng && (
                        <Info label={t('form.coordinates')} value={`${selectedApplication.event_lat}, ${selectedApplication.event_lng}`} />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Комментарий клиента */}
              {selectedApplication.message && (
                <div className="dashboard-section-divider">
                  <h3 className="dashboard-section-title">{t('form.clientComment')}</h3>
                  <div style={{ 
                    padding: 12, 
                    background: '#F9F9F6', 
                    borderRadius: 8, 
                    border: `1px solid var(--paul-border)`,
                    color: 'var(--paul-black)',
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    {selectedApplication.message}
                  </div>
                </div>
              )}

              {/* Позиции корзины */}
              {selectedApplication.cart_items && selectedApplication.cart_items.length > 0 && (
                <div className="dashboard-section-divider">
                  <h3 className="dashboard-section-title">{t('form.orderItems')}</h3>
                  <div style={{ 
                    background: '#F9F9F6', 
                    borderRadius: 8, 
                    border: `1px solid var(--paul-border)`,
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: '#F0F0F0' }}>
                          <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: 'var(--paul-gray)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('form.product')}</th>
                          <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: 'var(--paul-gray)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('common.quantity')}</th>
                          <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: 'var(--paul-gray)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('common.price')}</th>
                          <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 600, color: 'var(--paul-gray)', textTransform: 'uppercase', letterSpacing: 0.6 }}>{t('common.amount')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApplication.cart_items.map((item: any, index: number) => (
                          <tr key={index} style={{ borderBottom: `1px solid var(--paul-border)` }}>
                            <td style={{ padding: "8px 12px", fontSize: 13, color: 'var(--paul-black)' }}>{item.name}</td>
                            <td style={{ padding: "8px 12px", fontSize: 13, color: 'var(--paul-black)' }}>{item.quantity}</td>
                            <td style={{ padding: "8px 12px", fontSize: 13, color: 'var(--paul-black)' }}>{item.price} ₼</td>
                            <td style={{ padding: "8px 12px", fontSize: 13, fontWeight: 600, color: 'var(--paul-black)' }}>{item.price * item.quantity} ₼</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid var(--paul-border)", paddingTop: 12 }}>
                {selectedApplication.status === "new" && (
                  <>
                    <button
                      onClick={() => {
                        router.push(`/dashboard/orders/create?fromApplication=${selectedApplication.id}`);
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                      }}
                      className="dashboard-action-btn"
                    >
                      {t('orders.createOrder')}
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                      className="dashboard-action-btn"
                      style={{ 
                        color: "#dc2626", 
                        borderColor: "#dc2626"
                      }}
                    >
                      {t('applications.reject')}
                    </button>
                  </>
                )}
                <button 
                  onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }} 
                  className="dashboard-action-btn"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Skeleton Styles */}
      <SkeletonStyles />
    </DashboardLayout>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="dashboard-info-item">
      <div className="dashboard-info-label">{label}</div>
      <div className="dashboard-info-value">{String(value ?? "—")}</div>
    </div>
  );
}

// Mini Calendar Component
function MiniCalendar({ orders }: { orders: Order[] }) {
  const t = useTranslations('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Получаем первый день месяца и количество дней
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Создаем массив дней месяца
  const days = [];
  
  // Добавляем пустые ячейки для начала месяца
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  
  // Добавляем дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }
  
  const monthNames = t.raw('months') as string[];
  const dayNames = t.raw('days') as string[];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Функция для получения заказов на определенную дату
  const getOrdersForDate = (day: number) => {
    if (!day) return [];
    const date = new Date(currentYear, currentMonth, day);
    const dateString = date.toISOString().split('T')[0];
    return orders.filter(order => {
      if (!order.delivery_date) return false;
      const orderDate = new Date(order.delivery_date).toISOString().split('T')[0];
      return orderDate === dateString;
    });
  };
  
  // Функция для определения цвета ячейки календаря на основе статусов заказов
  const getCalendarCellColor = (dayOrders: Order[]) => {
    if (dayOrders.length === 0) return "transparent";
    
    // Приоритет статусов для определения цвета ячейки (от наиболее критичных к менее)
    const hasCompleted = dayOrders.some(o => o.status === "completed");
    const hasPaid = dayOrders.some(o => o.status === "paid");
    const hasProcessing = dayOrders.some(o => o.status === "processing");
    const hasPendingPayment = dayOrders.some(o => o.status === "pending_payment");
    const hasCancelled = dayOrders.some(o => o.status === "cancelled");
    const hasSubmitted = dayOrders.some(o => o.status === "submitted");
    const hasDraft = dayOrders.some(o => o.status === "draft");
    
    if (hasCompleted) return "#dcfce7"; // зеленый для завершенных
    if (hasPaid) return "#d1fae5"; // светло-зеленый для оплаченных
    if (hasProcessing) return "#fef3c7"; // желтый для в работе
    if (hasPendingPayment) return "#fed7aa"; // оранжевый для ожидающих оплату
    if (hasCancelled) return "#fee2e2"; // красный для отмененных
    if (hasSubmitted) return "#dbeafe"; // синий для отправленных
    if (hasDraft) return "#f3f4f6"; // серый для черновиков
    
    return "#f0f9ff"; // голубой по умолчанию
  };
  
  return (
    <div>
      {/* Header with month navigation */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: 8 
      }}>
        <button
          onClick={goToPreviousMonth}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: "4px",
            color: "var(--paul-gray)",
            fontSize: "12px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = "var(--paul-black)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--paul-gray)";
          }}
        >
          ←
        </button>
        <div style={{ 
          fontSize: "12px", 
          fontWeight: 600, 
          color: "var(--paul-black)" 
        }}>
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          onClick={goToNextMonth}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: "4px",
            color: "var(--paul-gray)",
            fontSize: "12px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = "var(--paul-black)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--paul-gray)";
          }}
        >
          →
        </button>
      </div>
      
      {/* Day names header */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: "1px", 
        marginBottom: "6px" 
      }}>
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              textAlign: "center",
              fontSize: "9px",
              color: "var(--paul-gray)",
              fontWeight: 600,
              padding: "2px 0"
            }}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(7, 1fr)", 
        gap: "1px" 
      }}>
        {days.map((day, index) => {
          const isToday = day === today.getDate() && 
                         currentMonth === today.getMonth() && 
                         currentYear === today.getFullYear();
          const dayOrders = day ? getOrdersForDate(day) : [];
          const hasOrders = dayOrders.length > 0;
          const cellColor = getCalendarCellColor(dayOrders);
          
          return (
            <div
              key={index}
              style={{
                aspectRatio: "1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                color: day ? (isToday ? "var(--paul-white)" : "var(--paul-black)") : "transparent",
                backgroundColor: isToday ? "var(--paul-black)" : (hasOrders ? cellColor : "transparent"),
                borderRadius: "3px",
                cursor: day ? "pointer" : "default",
                transition: "all 0.2s ease",
                position: "relative",
                minHeight: "24px"
              }}
              onMouseEnter={(e) => {
                if (day && !isToday) {
                  // Darker shades for hover
                  const hoverColors: Record<string, string> = {
                    "#dcfce7": "#bbf7d0", // completed
                    "#d1fae5": "#a7f3d0", // paid
                    "#fef3c7": "#fde68a", // processing
                    "#fed7aa": "#fdba74", // pending_payment
                    "#fee2e2": "#fecaca", // cancelled
                    "#dbeafe": "#bfdbfe", // submitted
                    "#f3f4f6": "#e5e7eb"  // draft
                  };
                  e.currentTarget.style.backgroundColor = hasOrders ? 
                    (hoverColors[cellColor] || "#e0f2fe") : "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (day && !isToday) {
                  e.currentTarget.style.backgroundColor = hasOrders ? cellColor : "transparent";
                }
              }}
              onClick={() => {
                if (day && hasOrders) {
                  setSelectedDay(selectedDay === day ? null : day);
                }
              }}
            >
              {day && (
                <>
                  <div style={{ 
                    fontSize: "8px", 
                    fontWeight: isToday ? 700 : 600,
                    lineHeight: 1
                  }}>
                    {day}
                  </div>
                  {hasOrders && (
                    <div style={{
                      width: "4px",
                      height: "4px",
                      backgroundColor: isToday ? "var(--paul-white)" : "#3b82f6",
                      borderRadius: "50%",
                      marginTop: "1px"
                    }} />
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Orders info for selected day */}
      {selectedDay && getOrdersForDate(selectedDay).length > 0 && (
        <div style={{
          marginTop: "8px",
          padding: "8px",
          backgroundColor: "#f8fafc",
          borderRadius: "6px",
          border: "1px solid #e2e8f0"
        }}>
          <div style={{
            fontSize: "10px",
            fontWeight: 600,
            color: "var(--paul-black)",
            marginBottom: "4px"
          }}>
            {t('dashboard.ordersOn', { day: selectedDay, month: monthNames[currentMonth] })}
          </div>
          {getOrdersForDate(selectedDay).map((order) => (
            <div key={order.id} style={{
              fontSize: "9px",
              color: "var(--paul-gray)",
              marginBottom: "2px",
              padding: "2px 0",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(order.status),
                flexShrink: 0
              }} />
              <span>{order.company_name}</span>
              <span style={{
                fontSize: "8px",
                color: getStatusColor(order.status),
                fontWeight: 600
              }}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
