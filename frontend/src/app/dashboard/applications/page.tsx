"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { Application } from "../../../config/api";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, isCoordinator } from "../../../utils/authConstants";

// Добавляем типы для новых функций
interface ApplicationHistory {
  id: number;
  application_id: number;
  action: string;
  old_status?: string;
  new_status?: string;
  comment?: string;
  user_name: string;
  created_at: string;
}

interface MassAction {
  type: 'status_change' | 'export' | 'delete';
  status?: 'new' | 'processing' | 'approved' | 'rejected';
}

interface QuickFilter {
  id: string;
  label: string;
  filter: (app: Application) => boolean;
  color?: string;
}

// PAUL brand palette and typography
const paul = { black: '#1A1A1A', beige: '#EBDCC8', border: '#EDEAE3', gray: '#4A4A4A', white: '#FFFFFF' };
const serifTitle: React.CSSProperties = { fontFamily: 'Playfair Display, serif' };

const statusLabels = {
  new: 'Новая',
  processing: 'В обработке',
  approved: 'Одобрена',
  rejected: 'Отклонена'
};

const statusColors = {
  new: '#3B82F6',
  processing: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444'
};

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "processing" | "approved" | "rejected">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "kanban">("table");

  // Новые состояния для улучшенной функциональности
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(new Set());
  const [showMassActions, setShowMassActions] = useState(false);
  const [applicationHistory, setApplicationHistory] = useState<ApplicationHistory[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarApplication, setSidebarApplication] = useState<Application | null>(null);
  
  // Расширенные фильтры
  const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });
  const [eventTypeFilter, setEventTypeFilter] = useState<"all" | "corporate" | "wedding" | "birthday" | "other">("all");
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Drag and drop
  const [draggedApplication, setDraggedApplication] = useState<Application | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  // Auth guard
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, isCoordinator, router);

  // Загрузка заявок - перемещаем выше для правильного порядка деклараций
  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const result = await makeApiRequest<Application[]>("applications");
      if (result.success) {
        setApplications(extractApiData(result.data || []));
      } else {
        console.error("Failed to load applications:", handleApiError(result));
      }
    } catch (e) {
      console.error("Failed to load applications", e);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  // Быстрые фильтры
  const quickFilters: QuickFilter[] = useMemo(() => [
    {
      id: 'new_urgent',
      label: 'Новые срочные',
      filter: (app) => app.status === 'new' && new Date(app.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000),
      color: '#EF4444'
    },
    {
      id: 'high_value',
      label: 'Дорогие заказы',
      filter: (app) => Boolean(app.cart_items && app.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0) > 500),
      color: '#D4AF37'
    },
    {
      id: 'corporate_events',
      label: 'Корпоративы',
      filter: (app) => Boolean(app.event_address && app.event_address.toLowerCase().includes('офис')),
      color: '#3B82F6'
    },
    {
      id: 'pending_approval',
      label: 'Ждут одобрения',
      filter: (app) => app.status === 'processing' && new Date(app.created_at) < new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      color: '#F59E0B'
    }
  ], []);

  // Фильтрация заявок - перемещаем выше
  const filteredApplications = useMemo(() => {
    let filtered = applications.filter((app) => {
      // Поиск
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        app.first_name.toLowerCase().includes(q) ||
        app.last_name.toLowerCase().includes(q) ||
        String(app.email || "").toLowerCase().includes(q) ||
        String(app.phone || "").toLowerCase().includes(q) ||
        String(app.event_address || "").toLowerCase().includes(q);

      // Статус
      const matchesStatus = statusFilter === "all" || app.status === statusFilter;

      // Дата
      let matchesDate = true;
      if (dateFilter !== "all") {
        const createdDate = new Date(app.created_at);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (dateFilter) {
          case "today":
            matchesDate = createdDate >= today;
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = createdDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            matchesDate = createdDate >= monthAgo;
            break;
        }
      }

      // Фильтр по сумме заказа
      let matchesAmount = true;
      if (amountFilter.min || amountFilter.max) {
        const totalAmount = app.cart_items ? 
          app.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0;
        
        if (amountFilter.min && totalAmount < parseFloat(amountFilter.min)) {
          matchesAmount = false;
        }
        if (amountFilter.max && totalAmount > parseFloat(amountFilter.max)) {
          matchesAmount = false;
        }
      }

      // Фильтр по типу мероприятия
      let matchesEventType = true;
      if (eventTypeFilter !== "all") {
        const eventAddress = app.event_address?.toLowerCase() || '';
        switch (eventTypeFilter) {
          case "corporate":
            matchesEventType = eventAddress.includes('офис') || eventAddress.includes('корпоратив');
            break;
          case "wedding":
            matchesEventType = eventAddress.includes('свадьба') || eventAddress.includes('банкет');
            break;
          case "birthday":
            matchesEventType = eventAddress.includes('день рождения') || eventAddress.includes('праздник');
            break;
          case "other":
            matchesEventType = !eventAddress.includes('офис') && 
                             !eventAddress.includes('корпоратив') &&
                             !eventAddress.includes('свадьба') &&
                             !eventAddress.includes('банкет') &&
                             !eventAddress.includes('день рождения') &&
                             !eventAddress.includes('праздник');
            break;
        }
      }

      return matchesSearch && matchesStatus && matchesDate && matchesAmount && matchesEventType;
    });

    // Применяем быстрый фильтр если активен
    if (activeQuickFilter) {
      const quickFilter = quickFilters.find(qf => qf.id === activeQuickFilter);
      if (quickFilter) {
        filtered = filtered.filter(quickFilter.filter);
      }
    }

    return filtered;
  }, [applications, searchTerm, statusFilter, dateFilter, amountFilter, eventTypeFilter, activeQuickFilter, quickFilters]);

  // Функции массовых действий
  const handleSelectAll = useCallback(() => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)));
    }
  }, [selectedApplications.size, filteredApplications]);

  const handleSelectApplication = useCallback((appId: number) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(appId)) {
      newSelected.delete(appId);
    } else {
      newSelected.add(appId);
    }
    setSelectedApplications(newSelected);
  }, [selectedApplications]);

  // Экспорт данных
  const exportToCSV = useCallback((applicationsToExport: Application[]) => {
    const headers = ['ID', 'Имя', 'Фамилия', 'Email', 'Телефон', 'Статус', 'Адрес мероприятия', 'Дата мероприятия', 'Сумма заказа', 'Дата создания'];
    
    const csvData = applicationsToExport.map(app => [
      app.id,
      app.first_name,
      app.last_name,
      app.email,
      app.phone || '',
      statusLabels[app.status],
      app.event_address || '',
      app.event_date || '',
      app.cart_items ? app.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0,
      new Date(app.created_at).toLocaleDateString('ru-RU')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // Загрузка истории изменений - перемещаем выше
  const loadApplicationHistory = useCallback(async (applicationId: number) => {
    try {
      const result = await makeApiRequest<ApplicationHistory[]>(`applications/${applicationId}/history`);
      if (result.success) {
        setApplicationHistory(extractApiData(result.data || []));
      }
    } catch (error) {
      console.error('Ошибка загрузки истории:', error);
    }
  }, []);

  // Обновление статуса заявки - перемещаем выше
  const updateApplicationStatus = useCallback(async (
    applicationId: string | number,
    newStatus: "new" | "processing" | "approved" | "rejected",
    comment: string = ""
  ) => {
    try {
      const result = await makeApiRequest(`applications/${applicationId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ 
          status: newStatus, 
          coordinator_comment: comment,
          send_notification: true // Добавляем флаг для отправки уведомления
        }),
      });
      
      if (result.success) {
        await loadApplications();
        
        // Обновляем историю если приложение открыто в сайдбаре
        if (sidebarApplication && sidebarApplication.id.toString() === applicationId.toString()) {
          await loadApplicationHistory(sidebarApplication.id);
        }
        
        setIsModalOpen(false);
        setSelectedApplication(null);
        
        // Показываем уведомление об успехе
        const app = applications.find(a => a.id.toString() === applicationId.toString());
        if (app) {
          alert(`Статус заявки ${app.first_name} ${app.last_name} изменен на "${statusLabels[newStatus]}". Клиент получит уведомление.`);
        }
      } else {
        alert(handleApiError(result, "Не удалось обновить статус заявки"));
      }
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Произошла ошибка при обновлении статуса");
    }
  }, [loadApplications, sidebarApplication, loadApplicationHistory, applications]);

  // Массовые действия
  const handleMassAction = useCallback(async (action: MassAction) => {
    const selectedApps = applications.filter(app => selectedApplications.has(app.id));
    
    if (action.type === 'export') {
      exportToCSV(selectedApps);
      return;
    }

    if (action.type === 'status_change' && action.status) {
      try {
        const promises = selectedApps.map(app => 
          makeApiRequest(`applications/${app.id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: action.status, coordinator_comment: `Массовое изменение статуса на ${statusLabels[action.status!]}` }),
          })
        );

        const results = await Promise.all(promises);
        const successful = results.filter(result => result.success);
        
        if (successful.length > 0) {
          await loadApplications();
          setSelectedApplications(new Set());
          // Добавляем уведомление о успехе
          alert(`Успешно обновлено ${successful.length} заявок`);
        }
      } catch (error) {
        console.error('Ошибка массового изменения:', error);
        alert('Произошла ошибка при массовом изменении статуса');
      }
    }
  }, [selectedApplications, applications, loadApplications, exportToCSV]);

  // Drag and Drop функции
  const handleDragStart = useCallback((app: Application) => {
    setDraggedApplication(app);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, status: string) => {
    e.preventDefault();
    setDragOverStatus(status);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, newStatus: 'new' | 'processing' | 'approved' | 'rejected') => {
    e.preventDefault();
    setDragOverStatus(null);
    
    if (draggedApplication && draggedApplication.status !== newStatus) {
      await updateApplicationStatus(draggedApplication.id, newStatus, `Перемещено через drag & drop`);
    }
    setDraggedApplication(null);
  }, [draggedApplication, updateApplicationStatus]);

  useEffect(() => {
    if (hasAccess) {
      loadApplications();
    }
  }, [hasAccess, loadApplications]);

  if (isLoading || !hasAccess) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fafafa",
      }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          {isLoading ? "Загрузка..." : "Проверка доступа..."}
        </div>
      </div>
    );
  }

  return (
    <div className="applications-layout" style={{ minHeight: "100vh", backgroundColor: "#fafafa", display: "flex" }}>
      {/* Sidebar */}
      <aside className="sidebar" style={{
        width: 280,
        backgroundColor: paul.white,
        borderRight: `1px solid ${paul.border}`,
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid #eee" }}>
          <div style={{ ...serifTitle, fontWeight: 800, color: paul.black }}>PAUL Dashboard</div>
          <div style={{ fontSize: 12, color: paul.gray, marginTop: 4 }}>Панель координатора</div>
        </div>

        <nav style={{ padding: "1rem 0" }}>
          <div style={{ padding: "0 1rem", marginBottom: 8, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.6 }}>Основное</div>
          
          <Link href="/dashboard" style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            textDecoration: "none",
            color: pathname === "/dashboard" ? paul.black : paul.gray,
            background: pathname === "/dashboard" ? paul.beige : "transparent",
            borderRight: pathname === "/dashboard" ? `3px solid ${paul.black}` : "3px solid transparent",
          }}>
            <span>Обзор</span>
          </Link>
          
          <Link href="/dashboard/applications" style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/applications") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/applications") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/applications") ? `3px solid ${paul.black}` : "3px solid transparent",
          }}>
            <span>Заявки</span>
          </Link>
          
          <Link href="/dashboard/orders" style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/orders") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/orders") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/orders") ? `3px solid ${paul.black}` : "3px solid transparent",
          }}>
            <span>Заказы</span>
          </Link>
          
          <Link href="/dashboard/users" style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/users") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/users") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/users") ? `3px solid ${paul.black}` : "3px solid transparent",
          }}>
            <span>Пользователи</span>
          </Link>
          
          <Link href="/dashboard/calendar" style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/calendar") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/calendar") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/calendar") ? `3px solid ${paul.black}` : "3px solid transparent",
          }}>
            <span>📅 Календарь</span>
          </Link>
        </nav>

        <div style={{ marginTop: "auto", padding: 16, borderTop: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: "#4f46e5",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{user?.staff_role}</div>
            </div>
          </div>
          <button onClick={() => router.push('/auth/login')} style={{
            width: "100%",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            background: "#fff",
            color: "#374151",
            cursor: "pointer",
          }}>Выйти</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: "2rem", marginLeft: 0 }}>
        {/* Header */}
        <div style={{
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: paul.gray
        }}>
          <Link
            href="/"
            style={{ textDecoration: 'none', color: paul.gray }}
            onMouseEnter={(e) => { e.currentTarget.style.color = paul.black; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = paul.gray; }}
          >
            Главная
          </Link>
          <span style={{ color: paul.gray }}>/</span>
          <Link
            href="/dashboard"
            style={{ textDecoration: 'none', color: paul.gray }}
            onMouseEnter={(e) => { e.currentTarget.style.color = paul.black; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = paul.gray; }}
          >
            Дашборд
          </Link>
          <span style={{ color: paul.gray }}>/</span>
          <span style={{ color: paul.black }}>Заявки</span>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: paul.black, marginBottom: 8 }}>
            Заявки
          </h1>
          <p style={{ color: paul.gray, fontSize: 16 }}>
            Управление заявками клиентов на обслуживание
          </p>
        </div>

        {/* Stats Cards */}
        <section className="stats-grid animate-slideInUp" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}>
          <div className="card-elevated hover-scale animate-fadeIn" style={{ 
            background: paul.white, 
            border: `1px solid ${paul.border}`, 
            borderRadius: 12, 
            padding: 20,
            animationDelay: '0.1s'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 12
            }}>
              <div>
                <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Всего заявок</div>
                <div className="animate-pulse" style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: paul.black }}>{applications.length}</div>
              </div>
              <div className="animate-float" style={{
                width: 48,
                height: 48,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24
              }}>
                📊
              </div>
            </div>
          </div>
          
          <div className="card-elevated hover-scale animate-fadeIn" style={{ 
            background: paul.white, 
            border: `1px solid ${paul.border}`, 
            borderRadius: 12, 
            padding: 20,
            animationDelay: '0.2s'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 12
            }}>
              <div>
                <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Новые</div>
                <div className={applications.filter(a => a.status === "new").length > 0 ? "animate-glow" : ""} style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: statusColors.new }}>{applications.filter(a => a.status === "new").length}</div>
              </div>
              <div className="animate-float" style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${statusColors.new}20, ${statusColors.new}40)`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                border: `2px solid ${statusColors.new}30`,
                animationDelay: '0.5s'
              }}>
                ⭐
              </div>
            </div>
          </div>
          
          <div className="card-elevated hover-scale animate-fadeIn" style={{ 
            background: paul.white, 
            border: `1px solid ${paul.border}`, 
            borderRadius: 12, 
            padding: 20,
            animationDelay: '0.3s'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 12
            }}>
              <div>
                <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>В обработке</div>
                <div className={applications.filter(a => a.status === "processing").length > 0 ? "animate-pulse" : ""} style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: statusColors.processing }}>{applications.filter(a => a.status === "processing").length}</div>
              </div>
              <div className="animate-float" style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${statusColors.processing}20, ${statusColors.processing}40)`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                border: `2px solid ${statusColors.processing}30`,
                animationDelay: '1s'
              }}>
                ⏳
              </div>
            </div>
          </div>
          
          <div className="card-elevated hover-scale animate-fadeIn" style={{ 
            background: paul.white, 
            border: `1px solid ${paul.border}`, 
            borderRadius: 12, 
            padding: 20,
            animationDelay: '0.4s'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start',
              marginBottom: 12
            }}>
              <div>
                <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Одобрено</div>
                <div style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: statusColors.approved }}>{applications.filter(a => a.status === "approved").length}</div>
              </div>
              <div className="animate-float" style={{
                width: 48,
                height: 48,
                background: `linear-gradient(135deg, ${statusColors.approved}20, ${statusColors.approved}40)`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                border: `2px solid ${statusColors.approved}30`,
                animationDelay: '1.5s'
              }}>
                ✅
              </div>
            </div>
          </div>
        </section>

        {/* Quick Filters */}
        <section className="quick-filters card-elevated animate-slideInRight" style={{
          background: paul.white,
          border: `1px solid ${paul.border}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 16,
          animationDelay: '0.5s'
        }}>
          <div style={{ marginBottom: 16 }}>
            <h3 className="animate-slideInLeft" style={{ 
              ...serifTitle, 
              fontSize: 16, 
              fontWeight: 700, 
              color: paul.black, 
              marginBottom: 12,
              animationDelay: '0.6s'
            }}>
              ⚡ Быстрые фильтры
            </h3>
            <div className="quick-filters-buttons" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {quickFilters.map((filter, index) => {
                const count = applications.filter(filter.filter).length;
                return (
                  <button
                    key={filter.id}
                    className={`button-interactive hover-scale animate-scaleIn ${count > 0 ? 'animate-pulse' : ''}`}
                    onClick={() => setActiveQuickFilter(activeQuickFilter === filter.id ? null : filter.id)}
                    style={{
                      padding: "8px 12px",
                      border: `2px solid ${filter.color}`,
                      borderRadius: 20,
                      background: activeQuickFilter === filter.id 
                        ? `linear-gradient(135deg, ${filter.color}, ${filter.color}CC)` 
                        : paul.white,
                      color: activeQuickFilter === filter.id ? paul.white : filter.color,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      boxShadow: activeQuickFilter === filter.id 
                        ? `0 4px 12px ${filter.color}40` 
                        : 'none',
                      animationDelay: `${0.7 + index * 0.1}s`,
                      position: 'relative'
                    }}
                  >
                    {filter.label} 
                    <span className={count > 0 ? "animate-glow" : ""} style={{
                      marginLeft: 4,
                      padding: '2px 6px',
                      background: activeQuickFilter === filter.id ? 'rgba(255,255,255,0.3)' : `${filter.color}20`,
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 700
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
              {activeQuickFilter && (
                <button
                  className="button-interactive hover-scale animate-slideInRight"
                  onClick={() => setActiveQuickFilter(null)}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${paul.gray}`,
                    borderRadius: 20,
                    background: paul.white,
                    color: paul.gray,
                    cursor: "pointer",
                    fontSize: 12,
                    animationDelay: '1s'
                  }}
                >
                  ✕ Очистить
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Enhanced Filters */}
        <section className="card-elevated animate-fadeIn" style={{
          background: paul.white,
          border: `1px solid ${paul.border}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          animationDelay: '0.8s'
        }}>
          {/* Search Row */}
          <div style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap"
          }}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по имени, email, телефону, адресу..."
              style={{
                flex: 1,
                minWidth: 300,
                padding: "12px 16px",
                border: `1px solid ${paul.border}`,
                borderRadius: 8,
                outline: "none",
                fontSize: 14,
              }}
            />
            
            <div className="view-toggle animate-slideInRight" style={{ 
              display: "flex", 
              gap: 8,
              animationDelay: '0.9s'
            }}>
              <button
                className="button-interactive hover-lift"
                onClick={() => setViewMode("table")}
                style={{
                  padding: "10px 14px",
                  border: `2px solid ${paul.black}`,
                  borderRadius: 8,
                  background: viewMode === "table" 
                    ? `linear-gradient(135deg, ${paul.black}, #333)` 
                    : paul.white,
                  color: viewMode === "table" ? paul.white : paul.black,
                  cursor: "pointer",
                  fontSize: 14,
                  boxShadow: viewMode === "table" 
                    ? `0 4px 12px ${paul.black}40` 
                    : 'none',
                }}
              >
                📋 Таблица
              </button>
              <button
                className="button-interactive hover-lift"
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "10px 14px",
                  border: `2px solid ${paul.black}`,
                  borderRadius: 8,
                  background: viewMode === "grid" 
                    ? `linear-gradient(135deg, ${paul.black}, #333)` 
                    : paul.white,
                  color: viewMode === "grid" ? paul.white : paul.black,
                  cursor: "pointer",
                  fontSize: 14,
                  boxShadow: viewMode === "grid" 
                    ? `0 4px 12px ${paul.black}40` 
                    : 'none',
                }}
              >
                🔲 Карточки
              </button>
              <button
                className="button-interactive hover-lift"
                onClick={() => setViewMode("kanban")}
                style={{
                  padding: "10px 14px",
                  border: `2px solid ${paul.black}`,
                  borderRadius: 8,
                  background: viewMode === "kanban" 
                    ? `linear-gradient(135deg, ${paul.black}, #333)` 
                    : paul.white,
                  color: viewMode === "kanban" ? paul.white : paul.black,
                  cursor: "pointer",
                  fontSize: 14,
                  boxShadow: viewMode === "kanban" 
                    ? `0 4px 12px ${paul.black}40` 
                    : 'none',
                }}
              >
                📊 Канбан
              </button>
            </div>
          </div>

          {/* Filter Row */}
          <div style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap"
          }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "new" | "processing" | "approved" | "rejected")}
              style={{ 
                padding: "8px 12px", 
                border: `1px solid ${paul.border}`, 
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="all">Все статусы</option>
              <option value="new">Новые</option>
              <option value="processing">В обработке</option>
              <option value="approved">Одобренные</option>
              <option value="rejected">Отклоненные</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "all" | "today" | "week" | "month")}
              style={{ 
                padding: "8px 12px", 
                border: `1px solid ${paul.border}`, 
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="all">Все периоды</option>
              <option value="today">Сегодня</option>
              <option value="week">За неделю</option>
              <option value="month">За месяц</option>
            </select>

            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value as "all" | "corporate" | "wedding" | "birthday" | "other")}
              style={{ 
                padding: "8px 12px", 
                border: `1px solid ${paul.border}`, 
                borderRadius: 8,
                fontSize: 13,
              }}
            >
              <option value="all">Все мероприятия</option>
              <option value="corporate">Корпоративы</option>
              <option value="wedding">Свадьбы</option>
              <option value="birthday">Дни рождения</option>
              <option value="other">Другие</option>
            </select>

            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <label style={{ fontSize: 12, color: paul.gray }}>Сумма:</label>
              <input
                type="number"
                placeholder="От"
                value={amountFilter.min}
                onChange={(e) => setAmountFilter(prev => ({ ...prev, min: e.target.value }))}
                style={{
                  width: 80,
                  padding: "6px 8px",
                  border: `1px solid ${paul.border}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
              <span style={{ color: paul.gray }}>-</span>
              <input
                type="number"
                placeholder="До"
                value={amountFilter.max}
                onChange={(e) => setAmountFilter(prev => ({ ...prev, max: e.target.value }))}
                style={{
                  width: 80,
                  padding: "6px 8px",
                  border: `1px solid ${paul.border}`,
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />
            </div>

            {/* Mass Actions Controls */}
            {selectedApplications.size > 0 && (
              <div className="mass-actions animate-slideInLeft" style={{ 
                display: "flex", 
                gap: 8, 
                alignItems: "center", 
                marginLeft: "auto",
                animationDelay: '1.2s'
              }}>
                <span className="animate-pulse" style={{ 
                  fontSize: 12, 
                  color: paul.gray,
                  padding: '4px 8px',
                  background: '#F0F9FF',
                  borderRadius: 12,
                  fontWeight: 600
                }}>
                  Выбрано: {selectedApplications.size}
                </span>
                <button
                  className="button-interactive hover-scale"
                  onClick={() => handleMassAction({ type: 'export' })}
                  style={{
                    padding: "6px 10px",
                    border: `2px solid #10B981`,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    color: paul.white,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    boxShadow: '0 4px 12px #10B98140'
                  }}
                >
                  📤 Экспорт
                </button>
                <button
                  className="button-interactive hover-scale"
                  onClick={() => setShowMassActions(!showMassActions)}
                  style={{
                    padding: "6px 10px",
                    border: `2px solid #3B82F6`,
                    borderRadius: 6,
                    background: showMassActions 
                      ? "linear-gradient(135deg, #3B82F6, #2563EB)" 
                      : paul.white,
                    color: showMassActions ? paul.white : "#3B82F6",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    boxShadow: showMassActions ? '0 4px 12px #3B82F640' : 'none'
                  }}
                >
                  ⚡ Действия
                </button>
              </div>
            )}

            <button 
              className="button-interactive hover-lift animate-scaleIn"
              onClick={loadApplications} 
              style={{ 
                padding: "8px 12px", 
                border: `2px solid ${paul.gray}`, 
                borderRadius: 8, 
                background: paul.white, 
                color: paul.gray, 
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                animationDelay: '1.3s'
              }}
            >
              🔄 Обновить
            </button>

            <button
              className="button-interactive hover-scale animate-scaleIn"
              onClick={() => exportToCSV(filteredApplications)}
              style={{
                padding: "8px 12px",
                border: `2px solid #10B981`,
                borderRadius: 8,
                background: "linear-gradient(135deg, #10B981, #059669)",
                color: paul.white,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                boxShadow: '0 4px 12px #10B98130',
                animationDelay: '1.4s'
              }}
            >
              📊 Экспорт всех
            </button>
          </div>

          {/* Mass Actions Panel */}
          {showMassActions && selectedApplications.size > 0 && (
            <div className="animate-slideInUp card-elevated" style={{
              marginTop: 16,
              padding: 16,
              background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)',
              borderRadius: 12,
              border: `2px solid ${paul.border}`,
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
            }}>
              <div className="animate-slideInLeft" style={{ 
                marginBottom: 12, 
                fontSize: 14, 
                fontWeight: 700, 
                color: paul.black,
                animationDelay: '0.1s'
              }}>
                ⚡ Массовые действия для <span className="animate-glow" style={{color: '#3B82F6'}}>{selectedApplications.size}</span> заявок:
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

                <button
                  className="button-interactive hover-scale animate-scaleIn"
                  onClick={() => handleMassAction({ type: 'status_change', status: 'rejected' })}
                  style={{
                    padding: "8px 12px",
                    border: `2px solid ${statusColors.rejected}`,
                    borderRadius: 8,
                    background: `linear-gradient(135deg, ${statusColors.rejected}, ${statusColors.rejected}CC)`,
                    color: paul.white,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${statusColors.rejected}40`,
                    animationDelay: '0.4s'
                  }}
                >
                  ❌ Отклонить
                </button>
                <button
                  className="button-interactive hover-lift animate-scaleIn"
                  onClick={() => setShowMassActions(false)}
                  style={{
                    padding: "8px 12px",
                    border: `2px solid ${paul.gray}`,
                    borderRadius: 8,
                    background: paul.white,
                    color: paul.gray,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    animationDelay: '0.5s'
                  }}
                >
                  ✕ Закрыть
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Applications List */}
        <div style={{ display: "flex", gap: 24 }}>
          {/* Main Content */}
          <section style={{ 
            flex: showSidebar ? "0 0 calc(100% - 400px)" : "1", 
            background: paul.white, 
            border: `1px solid ${paul.border}`, 
            borderRadius: 12, 
            overflow: "hidden"
          }}>
            <div style={{ padding: 20, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 20 }}>
                  Заявки ({filteredApplications.length})
                </div>
                <div style={{ color: paul.gray, fontSize: 14 }}>
                  {applicationsLoading ? "Загрузка..." : `Показано ${filteredApplications.length} из ${applications.length} заявок`}
                </div>
              </div>
              
              {/* Select All Checkbox */}
              {filteredApplications.length > 0 && (
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                    onChange={handleSelectAll}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 14, color: paul.gray }}>Выбрать все</span>
                </label>
              )}
            </div>

          {applicationsLoading ? (
            <div className="animate-fadeIn" style={{ 
              padding: 60, 
              textAlign: "center", 
              color: paul.gray,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(248,250,252,0.9))',
              borderRadius: 16,
              margin: 20
            }}>
              <div className="shadow-lg" style={{
                width: 60,
                height: 60,
                border: '4px solid #f1f5f9',
                borderTop: `4px solid ${paul.black}`,
                borderRadius: '50%',
                margin: '0 auto 24px',
                animation: 'spin 1.2s linear infinite',
                boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
              }} />
              <div className="animate-pulse" style={{
                fontSize: 16,
                fontWeight: 600,
                color: paul.black,
                marginBottom: 8
              }}>
                Загрузка заявок...
              </div>
              <div style={{
                fontSize: 14,
                color: paul.gray
              }}>
                Пожалуйста, подождите
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="animate-fadeIn card-elevated" style={{ 
              padding: 60, 
              textAlign: "center", 
              color: paul.gray,
              margin: 20,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,1))',
              borderRadius: 16
            }}>
              <div className="animate-float" style={{
                fontSize: 64,
                marginBottom: 20,
                opacity: 0.6
              }}>
                {applications.length === 0 ? "📋" : "🔍"}
              </div>
              <div className="animate-slideInUp" style={{
                fontSize: 18,
                fontWeight: 600,
                color: paul.black,
                marginBottom: 8
              }}>
                {applications.length === 0 ? "Заявок пока нет" : "Заявки не найдены"}
              </div>
              <div className="animate-slideInUp" style={{
                fontSize: 14,
                color: paul.gray,
                animationDelay: '0.1s'
              }}>
                {applications.length === 0 
                  ? "Новые заявки появятся здесь автоматически" 
                  : "Попробуйте изменить параметры поиска или фильтры"
                }
              </div>
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <div className="table-responsive animate-fadeIn" style={{ 
                  overflowX: "auto",
                  animationDelay: '1s'
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr className="animate-slideInUp" style={{ 
                        background: 'linear-gradient(135deg, #FBF7F0, #F8F6F1)', 
                        borderBottom: `2px solid ${paul.border}`,
                        animationDelay: '1.1s'
                      }}>
                        <th style={{...tableHeaderStyle, width: 40}}>
                          <input
                            type="checkbox"
                            checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                            onChange={handleSelectAll}
                            style={{ cursor: "pointer" }}
                          />
                        </th>
                        <th style={tableHeaderStyle}>Заявитель</th>
                        <th style={tableHeaderStyle}>Контакты</th>
                        <th style={tableHeaderStyle}>Мероприятие</th>
                        <th style={tableHeaderStyle}>Статус</th>
                        <th style={tableHeaderStyle}>Сумма</th>
                        <th style={tableHeaderStyle}>Дата</th>
                        <th style={tableHeaderStyle}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.map((app, index) => (
                        <tr 
                          key={app.id} 
                          className="animate-slideInUp hover-lift"
                          style={{ 
                            borderBottom: `1px solid ${paul.border}`, 
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            backgroundColor: selectedApplications.has(app.id) 
                              ? 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' 
                              : 'transparent',
                            animationDelay: `${1.2 + index * 0.05}s`,
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedApplications.has(app.id)) {
                              e.currentTarget.style.backgroundColor = 'linear-gradient(135deg, #F7F1E8, #FDF4E1)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = selectedApplications.has(app.id) 
                              ? 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' 
                              : 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          draggable
                          onDragStart={() => handleDragStart(app)}
                        >
                          <td style={tableCellStyle}>
                            <input
                              type="checkbox"
                              checked={selectedApplications.has(app.id)}
                              onChange={() => handleSelectApplication(app.id)}
                              style={{ cursor: "pointer" }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 600, color: paul.black }}>{app.first_name} {app.last_name}</div>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ color: paul.black, fontSize: 14 }}>{app.email}</div>
                            <div style={{ color: paul.gray, fontSize: 12 }}>{app.phone}</div>
                          </td>
                          <td style={tableCellStyle}>
                            {app.event_address ? (
                              <div>
                                <div style={{ color: paul.black, fontSize: 12, fontWeight: 500 }}>{app.event_address}</div>
                                {app.event_date && (
                                  <div style={{ color: paul.gray, fontSize: 11 }}>
                                    {new Date(app.event_date).toLocaleDateString("ru-RU")}
                                    {app.event_time && ` ${app.event_time}`}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{ color: paul.gray, fontSize: 12, fontStyle: "italic" }}>Не указано</div>
                            )}
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: "6px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: statusColors[app.status] + '20',
                              color: statusColors[app.status],
                            }}>
                              {statusLabels[app.status]}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ fontWeight: 600, color: '#D4AF37' }}>
                              {app.cart_items ? 
                                `${app.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₼` : 
                                '—'
                              }
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            {new Date(app.created_at).toLocaleDateString("ru-RU")}
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button
                                className="button-interactive hover-scale"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSidebarApplication(app); 
                                  setShowSidebar(true);
                                  loadApplicationHistory(app.id);
                                }}
                                style={{
                                  padding: "6px 8px",
                                  border: `2px solid ${paul.black}`,
                                  borderRadius: 6,
                                  background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                                  color: paul.black,
                                  cursor: "pointer",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                                title="Предпросмотр"
                              >
                                👁
                              </button>
                              <button
                                className="button-interactive hover-scale"
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setSelectedApplication(app); 
                                  setIsModalOpen(true); 
                                }}
                                style={{
                                  padding: "6px 8px",
                                  border: `2px solid #3B82F6`,
                                  borderRadius: 6,
                                  background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                                  color: paul.white,
                                  cursor: "pointer",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
                                }}
                                title="Редактировать"
                              >
                                ✏️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : viewMode === "kanban" ? (
                <KanbanView 
                  applications={filteredApplications}
                  onSelectApplication={handleSelectApplication}
                  selectedApplications={selectedApplications}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  dragOverStatus={dragOverStatus}
                  onOpenSidebar={setSidebarApplication}
                />
              ) : (
                <div className="grid-view animate-fadeIn" style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", 
                  gap: 20, 
                  padding: 20,
                  animationDelay: '1s'
                }}>
                  {filteredApplications.map((app, index) => (
                    <div 
                      key={app.id}
                      className="card-elevated hover-lift animate-scaleIn"
                      style={{
                        background: selectedApplications.has(app.id) 
                          ? 'linear-gradient(135deg, #F0F9FF, #E0F2FE)' 
                          : 'linear-gradient(135deg, #ffffff, #fafafa)',
                        border: `2px solid ${selectedApplications.has(app.id) ? '#3B82F6' : paul.border}`,
                        borderRadius: 16,
                        padding: 20,
                        cursor: "pointer",
                        position: "relative",
                        animationDelay: `${1.1 + index * 0.1}s`,
                        boxShadow: selectedApplications.has(app.id) 
                          ? '0 8px 25px rgba(59, 130, 246, 0.2)' 
                          : '0 4px 6px rgba(0, 0, 0, 0.07)'
                      }}
                      onClick={() => {
                        setSidebarApplication(app);
                        setShowSidebar(true);
                        loadApplicationHistory(app.id);
                      }}
                      draggable
                      onDragStart={() => handleDragStart(app)}
                    >
                      {/* Selection Checkbox */}
                      <input
                        type="checkbox"
                        className="transition-all hover-scale"
                        checked={selectedApplications.has(app.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectApplication(app.id);
                        }}
                        style={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          cursor: "pointer",
                          width: 18,
                          height: 18,
                          accentColor: '#3B82F6'
                        }}
                      />

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingRight: 30 }}>
                        <div>
                          <div style={{ fontWeight: 700, color: paul.black, fontSize: 16 }}>
                            {app.first_name} {app.last_name}
                          </div>
                          <div style={{ color: paul.gray, fontSize: 14 }}>{app.email}</div>
                        </div>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: statusColors[app.status] + '20',
                          color: statusColors[app.status],
                        }}>
                          {statusLabels[app.status]}
                        </span>
                      </div>
                      
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ color: paul.gray, fontSize: 12, marginBottom: 4 }}>Телефон</div>
                        <div style={{ color: paul.black, fontSize: 14 }}>{app.phone}</div>
                      </div>
                      
                      {app.event_address && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ color: paul.gray, fontSize: 12, marginBottom: 4 }}>Мероприятие</div>
                          <div style={{ color: paul.black, fontSize: 14 }}>{app.event_address}</div>
                          {app.event_date && (
                            <div style={{ color: paul.gray, fontSize: 12 }}>
                              {new Date(app.event_date).toLocaleDateString("ru-RU")}
                              {app.event_time && ` в ${app.event_time}`}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <div style={{ color: paul.gray, fontSize: 12 }}>
                          {new Date(app.created_at).toLocaleDateString("ru-RU")}
                        </div>
                        {app.cart_items && app.cart_items.length > 0 && (
                          <div style={{ color: '#D4AF37', fontSize: 12, fontWeight: 600 }}>
                            {app.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₼
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

          {/* Sidebar Preview */}
          {showSidebar && sidebarApplication && (
            <SidebarPreview
              application={sidebarApplication}
              history={applicationHistory}
              onClose={() => {
                setShowSidebar(false);
                setSidebarApplication(null);
                setApplicationHistory([]);
              }}
              onStatusChange={updateApplicationStatus}
              onOpenFullModal={() => {
                setSelectedApplication(sidebarApplication);
                setIsModalOpen(true);
                setShowSidebar(false);
                setSidebarApplication(null);
              }}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => { setIsModalOpen(false); setSelectedApplication(null); }}
          onUpdateStatus={updateApplicationStatus}
          onCreateOrder={() => {
            router.push(`/dashboard/orders/create?fromApplication=${selectedApplication.id}`);
            setIsModalOpen(false);
            setSelectedApplication(null);
          }}
        />
      )}

      <style jsx>{`
        /* Анимации */
        @keyframes spin { 
          0% { transform: rotate(0deg) } 
          100% { transform: rotate(360deg) } 
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
          }
        }
        
        /* Система теней */
        .shadow-none { box-shadow: none; }
        .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .shadow-inner { box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); }
        
        /* Интерактивные тени */
        .shadow-hover-sm { transition: box-shadow 0.3s ease; }
        .shadow-hover-sm:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        
        .shadow-hover-md { transition: box-shadow 0.3s ease; }
        .shadow-hover-md:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        
        .shadow-hover-lg { transition: box-shadow 0.3s ease; }
        .shadow-hover-lg:hover { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        
        /* Анимации элементов */
        .animate-slideInUp { animation: slideInUp 0.3s ease-out; }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-pulse { animation: pulse 2s infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-glow { animation: glow 2s ease-in-out infinite; }
        
        /* Hover анимации */
        .hover-scale { 
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover { 
          transform: scale(1.02);
        }
        
        .hover-lift { 
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover { 
          transform: translateY(-2px);
        }
        
        .hover-tilt { 
          transition: transform 0.2s ease;
        }
        .hover-tilt:hover { 
          transform: rotate(1deg);
        }
        
        /* Переходы для интерактивных элементов */
        .transition-all { transition: all 0.2s ease; }
        .transition-colors { transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease; }
        .transition-transform { transition: transform 0.2s ease; }
        .transition-opacity { transition: opacity 0.2s ease; }
        .transition-shadow { transition: box-shadow 0.2s ease; }
        
        /* Специальные эффекты */
        .glassmorphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .card-elevated {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-elevated:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          transform: translateY(-4px);
        }
        
        .button-interactive {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .button-interactive::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .button-interactive:hover::before {
          left: 100%;
        }
        
        .button-interactive:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .button-interactive:active {
          transform: translateY(0);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        /* Мобильная адаптивность */
        @media (max-width: 768px) {
          .applications-layout {
            flex-direction: column !important;
          }
          
          .sidebar {
            width: 100% !important;
            height: auto !important;
            position: relative !important;
          }
          
          .sidebar nav {
            display: flex !important;
            overflow-x: auto !important;
            padding: 8px 0 !important;
          }
          
          .sidebar nav a {
            white-space: nowrap !important;
            min-width: 120px !important;
          }
          
          .quick-filters {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .quick-filters-buttons {
            flex-wrap: wrap !important;
          }
          
          .enhanced-filters {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .view-toggle {
            justify-content: center !important;
            margin-bottom: 16px !important;
          }
          
          .mass-actions {
            flex-direction: column !important;
            gap: 8px !important;
          }
          
          .table-responsive {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          
          .kanban-view {
            grid-template-columns: 1fr !important;
            height: auto !important;
            gap: 16px !important;
          }
          
          .grid-view {
            grid-template-columns: 1fr !important;
          }
          
          .sidebar-preview {
            width: 100% !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            z-index: 1000 !important;
            background: white !important;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
          
          .amount-filter {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .amount-filter input {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

// Стили для таблицы
const tableHeaderStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "16px 12px",
  fontSize: 12,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: 0.6,
  fontWeight: 600,
};

const tableCellStyle: React.CSSProperties = {
  padding: "16px 12px",
  fontSize: 14,
  color: "#1A1A1A",
  verticalAlign: "top",
};

// Компонент модального окна для заявки
function ApplicationModal({ 
  application, 
  onClose, 
  onUpdateStatus, 
  onCreateOrder 
}: {
  application: Application;
  onClose: () => void;
  onUpdateStatus: (id: number, status: "new" | "processing" | "approved" | "rejected", comment?: string) => void;
  onCreateOrder: () => void;
}) {
  const [comment, setComment] = useState(application.coordinator_comment || "");

  return (
    <div style={{ 
      position: "fixed", 
      inset: 0, 
      background: "rgba(0,0,0,0.4)", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      padding: 16, 
      zIndex: 50 
    }}>
      <div style={{ 
        background: paul.white, 
        borderRadius: 12, 
        maxWidth: 800, 
        width: "100%", 
        maxHeight: "90vh", 
        overflow: "auto", 
        border: `1px solid ${paul.border}` 
      }}>
        <div style={{ 
          padding: 24, 
          borderBottom: "1px solid #eee", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between" 
        }}>
          <div style={{ ...serifTitle, fontWeight: 800, color: paul.black, fontSize: 20 }}>
            Заявка #{application.id}
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              border: "none", 
              background: "none", 
              fontSize: 24, 
              cursor: "pointer", 
              color: paul.gray 
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: 24 }}>
          {/* Основная информация */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 16 }}>
              Информация о заявителе
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <InfoField label="Имя" value={application.first_name} />
              <InfoField label="Фамилия" value={application.last_name} />
              <InfoField label="Email" value={application.email} />
              <InfoField label="Телефон" value={application.phone} />
              <InfoField 
                label="Статус" 
                value={
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: statusColors[application.status] + '20',
                    color: statusColors[application.status],
                  }}>
                    {statusLabels[application.status]}
                  </span>
                } 
              />
              <InfoField label="Дата создания" value={new Date(application.created_at).toLocaleDateString("ru-RU")} />
            </div>
          </div>

          {/* Информация о мероприятии */}
          {(application.event_address || application.event_date || application.event_time) && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 16 }}>
                Информация о мероприятии
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {application.event_address && <InfoField label="Адрес" value={application.event_address} />}
                {application.event_date && <InfoField label="Дата" value={new Date(application.event_date).toLocaleDateString("ru-RU")} />}
                {application.event_time && <InfoField label="Время" value={application.event_time} />}
                {application.event_lat && application.event_lng && (
                  <InfoField label="Координаты" value={`${application.event_lat}, ${application.event_lng}`} />
                )}
              </div>
            </div>
          )}

          {/* Сообщение клиента */}
          {application.message && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>
                Сообщение клиента
              </h3>
              <div style={{ 
                padding: 16, 
                background: '#F9F9F6', 
                borderRadius: 8, 
                border: `1px solid ${paul.border}`,
                color: paul.black,
                fontSize: 14,
                lineHeight: 1.5
              }}>
                {application.message}
              </div>
            </div>
          )}

          {/* Позиции заказа */}
          {application.cart_items && application.cart_items.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>
                Позиции заказа
              </h3>
              <div style={{ 
                background: '#F9F9F6', 
                borderRadius: 8, 
                border: `1px solid ${paul.border}`,
                overflow: 'hidden'
              }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: '#F0F0F0' }}>
                      <th style={{ ...tableHeaderStyle, padding: "12px 16px", fontSize: 12 }}>Товар</th>
                      <th style={{ ...tableHeaderStyle, padding: "12px 16px", fontSize: 12 }}>Количество</th>
                      <th style={{ ...tableHeaderStyle, padding: "12px 16px", fontSize: 12 }}>Цена</th>
                      <th style={{ ...tableHeaderStyle, padding: "12px 16px", fontSize: 12 }}>Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    {application.cart_items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: `1px solid ${paul.border}` }}>
                        <td style={{ ...tableCellStyle, padding: "12px 16px", fontSize: 13 }}>{item.name}</td>
                        <td style={{ ...tableCellStyle, padding: "12px 16px", fontSize: 13 }}>{item.quantity}</td>
                        <td style={{ ...tableCellStyle, padding: "12px 16px", fontSize: 13 }}>{item.price} ₼</td>
                        <td style={{ ...tableCellStyle, padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>
                          {item.price * item.quantity} ₼
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Комментарий координатора */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>
              Комментарий координатора
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Добавьте комментарий к заявке..."
              style={{
                width: "100%",
                minHeight: 100,
                padding: 12,
                border: `1px solid ${paul.border}`,
                borderRadius: 8,
                resize: "vertical",
                fontSize: 14,
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Действия */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 16 }}>
            {application.status === "new" && (
              <>
                <button
                  onClick={() => onUpdateStatus(application.id, "rejected", comment)}
                  style={actionButtonStyle("#EF4444")}
                >
                  Отклонить
                </button>
              </>
            )}
            
            {application.status === "processing" && (
              <>
                <button
                  onClick={() => onUpdateStatus(application.id, "rejected", comment)}
                  style={actionButtonStyle("#EF4444")}
                >
                  Отклонить
                </button>
              </>
            )}

            {(application.status === "new" || application.status === "processing") && application.cart_items && application.cart_items.length > 0 && (
              <button
                onClick={onCreateOrder}
                style={actionButtonStyle(paul.black)}
              >
                Создать заказ
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: "10px 16px",
                border: `1px solid ${paul.border}`,
                borderRadius: 8,
                background: paul.white,
                color: paul.gray,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент для отображения информации
function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: paul.gray, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, color: paul.black }}>
        {value || "—"}
      </div>
    </div>
  );
}

// Стиль для кнопок действий
const actionButtonStyle = (color: string): React.CSSProperties => ({
  padding: "10px 16px",
  border: `2px solid ${color}`,
  borderRadius: 8,
  background: color,
  color: "white",
  cursor: "pointer",
  fontSize: 14,
  fontWeight: 600,
});

// Компонент Kanban View
function KanbanView({
  applications,
  onSelectApplication,
  selectedApplications,
  onDragStart,
  onDragOver,
  onDrop,
  dragOverStatus,
  onOpenSidebar
}: {
  applications: Application[];
  onSelectApplication: (id: number) => void;
  selectedApplications: Set<number>;
  onDragStart: (app: Application) => void;
  onDragOver: (e: React.DragEvent, status: string) => void;
  onDrop: (e: React.DragEvent, status: 'new' | 'processing' | 'approved' | 'rejected') => void;
  dragOverStatus: string | null;
  onOpenSidebar: (app: Application) => void;
}) {
  const statuses: Array<'new' | 'processing' | 'approved' | 'rejected'> = ['new', 'processing', 'approved', 'rejected'];
  
  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <div style={{
      padding: 20,
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 20,
      height: '600px',
      overflow: 'hidden'
    }}>
      {statuses.map(status => {
        const statusApps = getApplicationsByStatus(status);
        return (
          <div
            key={status}
            style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: 16,
              border: dragOverStatus === status ? `2px dashed ${statusColors[status]}` : `1px solid ${paul.border}`,
              transition: 'all 0.2s ease'
            }}
            onDragOver={(e) => onDragOver(e, status)}
            onDrop={(e) => onDrop(e, status)}
          >
            {/* Column Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              padding: '8px 12px',
              background: statusColors[status] + '20',
              borderRadius: 8,
              border: `1px solid ${statusColors[status]}40`
            }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: statusColors[status]
              }}>
                {statusLabels[status]}
              </div>
              <div style={{
                background: statusColors[status],
                color: paul.white,
                borderRadius: 12,
                padding: '2px 8px',
                fontSize: 12,
                fontWeight: 600
              }}>
                {statusApps.length}
              </div>
            </div>

            {/* Applications */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxHeight: '500px',
              overflowY: 'auto'
            }}>
              {statusApps.map(app => (
                <div
                  key={app.id}
                  style={{
                    background: selectedApplications.has(app.id) ? '#F0F9FF' : paul.white,
                    border: `1px solid ${selectedApplications.has(app.id) ? '#3B82F6' : paul.border}`,
                    borderRadius: 8,
                    padding: 12,
                    cursor: 'move',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  draggable
                  onDragStart={() => onDragStart(app)}
                  onClick={() => onOpenSidebar(app)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Selection Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedApplications.has(app.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onSelectApplication(app.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      cursor: 'pointer'
                    }}
                  />

                  <div style={{ paddingRight: 20 }}>
                    <div style={{
                      fontWeight: 600,
                      color: paul.black,
                      fontSize: 14,
                      marginBottom: 4
                    }}>
                      {app.first_name} {app.last_name}
                    </div>
                    
                    <div style={{
                      color: paul.gray,
                      fontSize: 12,
                      marginBottom: 8
                    }}>
                      {app.email}
                    </div>

                    {app.event_address && (
                      <div style={{
                        color: paul.black,
                        fontSize: 11,
                        marginBottom: 8,
                        padding: '4px 6px',
                        background: '#F1F5F9',
                        borderRadius: 4
                      }}>
                        📍 {app.event_address.length > 30 ? app.event_address.substring(0, 30) + '...' : app.event_address}
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: 11,
                      color: paul.gray
                    }}>
                      <span>{new Date(app.created_at).toLocaleDateString('ru-RU')}</span>
                      {app.cart_items && app.cart_items.length > 0 && (
                        <span style={{ color: '#D4AF37', fontWeight: 600 }}>
                          {app.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₼
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {statusApps.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: paul.gray,
                  fontSize: 12,
                  padding: 20,
                  fontStyle: 'italic'
                }}>
                  Нет заявок
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Компонент Sidebar Preview
function SidebarPreview({
  application,
  history,
  onClose,
  onStatusChange,
  onOpenFullModal
}: {
  application: Application;
  history: ApplicationHistory[];
  onClose: () => void;
  onStatusChange: (id: string | number, status: 'new' | 'processing' | 'approved' | 'rejected', comment?: string) => void;
  onOpenFullModal: () => void;
}) {
  const [comment, setComment] = useState('');

  return (
    <div style={{
      width: 380,
      background: paul.white,
      border: `1px solid ${paul.border}`,
      borderRadius: 12,
      height: 'fit-content',
      maxHeight: '80vh',
      overflow: 'auto',
      position: 'sticky',
      top: 20
    }}>
      {/* Header */}
      <div style={{
        padding: 16,
        borderBottom: `1px solid ${paul.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ ...serifTitle, fontWeight: 700, fontSize: 16, color: paul.black }}>
          Заявка #{application.id}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onOpenFullModal}
            style={{
              padding: '6px 8px',
              border: `1px solid #3B82F6`,
              borderRadius: 6,
              background: paul.white,
              color: '#3B82F6',
              cursor: 'pointer',
              fontSize: 11
            }}
            title="Открыть полную версию"
          >
            🔍
          </button>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: 18,
              cursor: 'pointer',
              color: paul.gray
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Basic Info */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: statusColors[application.status],
              color: paul.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: 16
            }}>
              {application.first_name.charAt(0)}{application.last_name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: paul.black, fontSize: 14 }}>
                {application.first_name} {application.last_name}
              </div>
              <div style={{ color: paul.gray, fontSize: 12 }}>
                {application.email}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <span style={{ fontSize: 12, color: paul.gray }}>Статус:</span>
            <span style={{
              padding: '4px 8px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 600,
              background: statusColors[application.status] + '20',
              color: statusColors[application.status]
            }}>
              {statusLabels[application.status]}
            </span>
          </div>
        </div>

        {/* Quick Info */}
        <div style={{ marginBottom: 16 }}>
          <InfoField label="Телефон" value={application.phone} />
          {application.event_address && (
            <InfoField label="Адрес мероприятия" value={application.event_address} />
          )}
          {application.event_date && (
            <InfoField 
              label="Дата мероприятия" 
              value={`${new Date(application.event_date).toLocaleDateString('ru-RU')}${application.event_time ? ` в ${application.event_time}` : ''}`} 
            />
          )}
          {application.cart_items && application.cart_items.length > 0 && (
            <InfoField 
              label="Сумма заказа" 
              value={`${application.cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₼`} 
            />
          )}
        </div>

        {/* Quick Actions */}
        {(application.status === 'new' || application.status === 'processing') && (
          <div style={{ marginBottom: 16 }}>
            <div style={{
              fontSize: 12,
              color: paul.gray,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.6
            }}>
              Быстрые действия
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {application.status === 'new' && (
                <>
                </>
              )}
              {application.status === 'processing' && (
                <>
                  <button
                    onClick={() => onStatusChange(application.id, 'rejected', 'Отклонено после обработки')}
                    style={{
                      padding: '6px 10px',
                      border: `1px solid ${statusColors.rejected}`,
                      borderRadius: 6,
                      background: statusColors.rejected,
                      color: paul.white,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600
                    }}
                  >
                    Отклонить
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Comment */}
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            color: paul.gray,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 0.6
          }}>
            Комментарий
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Добавить комментарий..."
            style={{
              width: '100%',
              height: 60,
              padding: 8,
              border: `1px solid ${paul.border}`,
              borderRadius: 6,
              fontSize: 12,
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
          {comment && (
            <button
              onClick={() => {
                onStatusChange(application.id, application.status, comment);
                setComment('');
              }}
              style={{
                marginTop: 6,
                padding: '4px 8px',
                border: `1px solid ${paul.black}`,
                borderRadius: 4,
                background: paul.black,
                color: paul.white,
                cursor: 'pointer',
                fontSize: 11
              }}
            >
              Сохранить комментарий
            </button>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div>
            <div style={{
              fontSize: 12,
              color: paul.gray,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.6
            }}>
              История изменений
            </div>
            <div style={{
              maxHeight: 200,
              overflowY: 'auto',
              border: `1px solid ${paul.border}`,
              borderRadius: 6,
              padding: 8
            }}>
              {history.map((item, index) => (
                <div
                  key={item.id}
                  style={{
                    fontSize: 11,
                    color: paul.gray,
                    marginBottom: 8,
                    paddingBottom: 8,
                    borderBottom: index < history.length - 1 ? `1px solid ${paul.border}` : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: paul.black }}>{item.user_name}</span>
                    <span>{new Date(item.created_at).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div>{item.action}</div>
                  {item.comment && (
                    <div style={{ fontStyle: 'italic', marginTop: 2 }}>&ldquo;{item.comment}&rdquo;</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
