"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { Application, Order } from "../../config/api";
import { makeApiRequest, extractApiData, handleApiError } from "../../utils/apiHelpers";
import { useAuthGuard, canManageOrders } from "../../utils/authConstants";
import { getStatusLabel, getStatusColor } from "../../utils/statusTranslations";
import { useDebounce } from "../../utils/useDebounce";
import { useSmoothScroll } from "../../utils/useSmoothScroll";
import { SkeletonCard, SkeletonTableRow, SkeletonStyles } from "../../components/Skeleton";
import { 
  SearchIcon, 
  FilterIcon, 
  RefreshIcon, 
  EyeIcon, 
  MenuIcon,
  DashboardIcon,
  FileTextIcon,
  UsersIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
  XIcon 
} from "../../components/Icons";

// PAUL brand palette and typography
const paul = { black: '#1A1A1A', beige: '#EBDCC8', border: '#EDEAE3', gray: '#4A4A4A', white: '#FFFCF8' };
const serifTitle: React.CSSProperties = { fontFamily: 'Playfair Display, serif' };

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "processing" | "approved" | "rejected">("all");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<{ temperature: number; condition: string } | null>(null);
  
  // Debounced search для производительности
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  const { scrollToElement } = useSmoothScroll();

  // Auth guard - проверяем тип пользователя
  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, (user) => {
    // Если пользователь клиент, редиректим на профиль
    if (user.user_type === 'client') {
      router.push('/profile');
      return false;
    }
    return true;
  }, router);

  // Data fetching с оптимизацией
  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const result = await makeApiRequest<Application[]>("/applications");
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

  const loadOrders = useCallback(async () => {
    if (!canManageOrders(user || { user_type: '', staff_role: '' })) return;
    try {
      const result = await makeApiRequest<Order[]>("/orders");
      if (result.success) {
        setOrders(extractApiData(result.data || []));
      } else {
        console.error("Failed to load orders:", handleApiError(result));
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

  // Получение погоды (заглушка - в реальном приложении можно использовать API погоды)
  useEffect(() => {
    // Заглушка для демонстрации - в реальном приложении здесь будет API запрос
    setWeather({
      temperature: 22,
      condition: "Ясно"
    });
  }, []);

  // Filters с мемоизацией для производительности и debounced поиском
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = debouncedSearchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        app.first_name.toLowerCase().includes(q) ||
        app.last_name.toLowerCase().includes(q) ||
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
      setSelectedApplication(prev => prev ? { 
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
        alert(handleApiError(result, "Не удалось обновить статус заявки"));
      }
    } catch (e) {
      // Откатываем оптимистичные изменения при ошибке
      setApplications(previousApplications);
      if (selectedApplication?.id === applicationId) {
        const originalApp = previousApplications.find(app => app.id === applicationId);
        setSelectedApplication(originalApp || null);
      }
      console.error("Failed to update status", e);
      alert("Произошла ошибка при обновлении статуса");
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
        <div style={{ textAlign: "center", color: "#6b7280" }}>Загрузка…</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", display: "flex", position: "relative" }}>
      {/* Mobile menu button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: "fixed",
          top: "1rem",
          left: "1rem",
          zIndex: 60,
          padding: "8px",
          backgroundColor: paul.white,
          border: `2px solid ${paul.black}`,
          borderRadius: "8px",
          cursor: "pointer",
          display: "none",
          transition: "all 0.2s ease",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = paul.black;
          e.currentTarget.style.color = paul.white;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = paul.white;
          e.currentTarget.style.color = paul.black;
        }}
        aria-label="Toggle mobile menu"
      >
        {isMobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
      </button>

      {/* Overlay для мобильного меню */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 50,
            display: "block",
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className="sidebar"
        style={{
          width: 240,
        backgroundColor: paul.white,
        borderRight: `1px solid ${paul.border}`,
        position: "sticky",
        top: 0,
          left: 0,
        height: "100vh",
          zIndex: 51,
          overflowY: "auto",
      }}>
        <div style={{ padding: "1.25rem 1rem", borderBottom: "1px solid #eee" }}>
          <div style={{ ...serifTitle, fontWeight: 800, color: paul.black }}>PAUL Dashboard</div>
          <div style={{ fontSize: 12, color: paul.gray, marginTop: 4 }}>Панель координатора</div>
        </div>

        <nav style={{ padding: "1rem 0" }}>
          <div style={{ padding: "0 1rem", marginBottom: 8, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.6 }}>Основное</div>
          <Link 
            href="/dashboard" 
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
              padding: "12px 16px",
            textDecoration: "none",
            color: pathname === "/dashboard" ? paul.black : paul.gray,
            background: pathname === "/dashboard" ? paul.beige : "transparent",
            borderRight: pathname === "/dashboard" ? `3px solid ${paul.black}` : "3px solid transparent",
              transition: "all 0.2s ease",
              minHeight: "44px", // Touch-friendly
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={(e) => {
              if (pathname !== "/dashboard") {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (pathname !== "/dashboard") {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-label="Обзор дашборда"
          >
            <DashboardIcon size={18} />
            <span>Обзор</span>
          </Link>
          <Link 
            href="/dashboard/applications" 
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
              padding: "12px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/applications") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/applications") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/applications") ? `3px solid ${paul.black}` : "3px solid transparent",
              transition: "all 0.2s ease",
              minHeight: "44px", // Touch-friendly
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={(e) => {
              if (!pathname?.startsWith("/dashboard/applications")) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname?.startsWith("/dashboard/applications")) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-label="Управление заявками"
          >
            <FileTextIcon size={18} />
            <span>Заявки</span>
          </Link>
          <Link 
            href="/dashboard/orders" 
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
              padding: "12px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/orders") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/orders") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/orders") ? `3px solid ${paul.black}` : "3px solid transparent",
              transition: "all 0.2s ease",
              minHeight: "44px", // Touch-friendly
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={(e) => {
              if (!pathname?.startsWith("/dashboard/orders")) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname?.startsWith("/dashboard/orders")) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-label="Управление заказами"
          >
            <ShoppingBagIcon size={18} />
            <span>Заказы</span>
          </Link>
                    <Link 
            href="/dashboard/users" 
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
              padding: "12px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/users") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/users") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/users") ? `3px solid ${paul.black}` : "3px solid transparent",
              transition: "all 0.2s ease",
              minHeight: "44px", // Touch-friendly
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={(e) => {
              if (!pathname?.startsWith("/dashboard/users")) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname?.startsWith("/dashboard/users")) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-label="Управление пользователями"
          >
            <UsersIcon size={18} />
            <span>Пользователи</span>
          </Link>
          <Link 
            href="/dashboard/calendar" 
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
              padding: "12px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/calendar") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/calendar") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/calendar") ? `3px solid ${paul.black}` : "3px solid transparent",
              transition: "all 0.2s ease",
              minHeight: "44px", // Touch-friendly
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={(e) => {
              if (!pathname?.startsWith("/dashboard/calendar")) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname?.startsWith("/dashboard/calendar")) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-label="Календарь заказов"
          >
            <CalendarIcon size={18} />
            <span>Календарь</span>
          </Link>
          <Link 
            href="/dashboard/reports" 
            style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
              padding: "12px 16px",
            textDecoration: "none",
            color: pathname?.startsWith("/dashboard/reports") ? paul.black : paul.gray,
            background: pathname?.startsWith("/dashboard/reports") ? paul.beige : "transparent",
            borderRight: pathname?.startsWith("/dashboard/reports") ? `3px solid ${paul.black}` : "3px solid transparent",
              transition: "all 0.2s ease",
              minHeight: "44px", // Touch-friendly
            }}
            onClick={() => setIsMobileMenuOpen(false)}
            onMouseEnter={(e) => {
              if (!pathname?.startsWith("/dashboard/reports")) {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!pathname?.startsWith("/dashboard/reports")) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            aria-label="Отчеты и аналитика"
          >
            <ChartBarIcon size={18} />
            <span>Отчеты</span>
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
          <button onClick={logout} style={{
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
      <main 
        className="main-content"
        style={{ 
          flex: 1, 
          padding: "2rem", 
          marginLeft: "0px",
          animation: "fadeIn 0.6s ease-out",
          minHeight: "100vh",
        }}>
        {/* Header */}
        <div style={{
          marginBottom: 16,
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
          <span style={{ color: paul.black }}>Дашборд</span>
        </div>

        {/* KPI Cards */}
        <section 
          id="kpi-section"
          className="kpi-grid"
          style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}>
          {applicationsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <div style={{ 
                background: paul.white, 
                border: `1px solid ${paul.border}`, 
                borderRadius: 8, 
                padding: 12,
                transition: "all 0.3s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "default",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
                onClick={() => scrollToElement('applications-section')}
                role="button"
                aria-label="Перейти к заявкам"
                tabIndex={0}
              >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <FileTextIcon size={14} style={{ color: "#6b7280" }} />
              <span style={{ color: "#6b7280", fontSize: 11 }}>Заявки</span>
          </div>
            <div style={{ ...serifTitle, fontSize: 20, fontWeight: 800, color: paul.black, marginBottom: 2 }}>{applications.length}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>
              Новых: {applications.filter(a => a.status === "new").length} | 
              В работе: {applications.filter(a => a.status === "processing").length}
          </div>
            </div>
              <div style={{ 
                background: paul.white, 
                border: `1px solid ${paul.border}`, 
                borderRadius: 8, 
                padding: 12,
                transition: "all 0.3s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "default",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
                onClick={() => scrollToElement('applications-section')}
                role="button"
                aria-label="Перейти к новым заявкам"
                tabIndex={0}
              >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <ShoppingBagIcon size={14} style={{ color: "#6b7280" }} />
              <span style={{ color: "#6b7280", fontSize: 11 }}>Заказы</span>
            </div>
            <div style={{ ...serifTitle, fontSize: 20, fontWeight: 800, color: paul.black, marginBottom: 2 }}>{orders.length}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>
              В работе: {orders.filter(o => o.status === "processing").length} | 
              Завершено: {orders.filter(o => o.status === "completed").length}
            </div>
            <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 2 }}>
              Отправлено: {orders.filter(o => o.status === "submitted").length} | 
              Отменено: {orders.filter(o => o.status === "cancelled").length}
            </div>
          </div>
                <div style={{ 
                  background: paul.white, 
                  border: `1px solid ${paul.border}`, 
                  borderRadius: 8, 
                  padding: 12,
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "default",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                  role="button"
                  aria-label="Время и погода"
                  tabIndex={0}
                >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <CalendarIcon size={14} style={{ color: "#6b7280" }} />
                <span style={{ color: "#6b7280", fontSize: 11 }}>Время & Погода</span>
              </div>
              <div style={{ ...serifTitle, fontSize: 16, fontWeight: 800, color: paul.black, marginBottom: 2 }}>
                {currentTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>
                {currentTime.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "short" })}
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>
                {weather ? `${weather.temperature}°C ${weather.condition}` : "Загрузка..."}
              </div>
            </div>
            </>
          )}
        </section>

        {/* Quick actions */}
        <section style={{ background: paul.white, border: `1px solid ${paul.border}`, borderRadius: 12, padding: 16, marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <div className="quick-actions-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Link 
              href="/dashboard/applications" 
              style={linkCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)";
                e.currentTarget.style.backgroundColor = paul.black;
                e.currentTarget.style.color = paul.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
                e.currentTarget.style.backgroundColor = paul.white;
                e.currentTarget.style.color = paul.black;
              }}
            >
              Просмотр заявок
            </Link>
            {canManageOrders(user || { user_type: '', staff_role: '' }) && (
              <Link 
                href="/dashboard/orders/create" 
                style={linkCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)";
                  e.currentTarget.style.backgroundColor = paul.black;
                  e.currentTarget.style.color = paul.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
                  e.currentTarget.style.backgroundColor = paul.white;
                  e.currentTarget.style.color = paul.black;
                }}
              >
                Создать заказ
              </Link>
            )}
            {canManageOrders(user || { user_type: '', staff_role: '' }) && (
              <Link 
                href="/dashboard/users" 
                style={linkCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)";
                  e.currentTarget.style.backgroundColor = paul.black;
                  e.currentTarget.style.color = paul.white;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
                  e.currentTarget.style.backgroundColor = paul.white;
                  e.currentTarget.style.color = paul.black;
                }}
              >
                Пользователи
              </Link>
            )}
            <Link 
              href="/dashboard/calendar" 
              style={linkCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15), 0 3px 6px rgba(0,0,0,0.1)";
                e.currentTarget.style.backgroundColor = paul.black;
                e.currentTarget.style.color = paul.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
                e.currentTarget.style.backgroundColor = paul.white;
                e.currentTarget.style.color = paul.black;
              }}
            >
              Календарь заказов
            </Link>
          </div>
        </section>

        {/* Filters */}
        <section 
          id="filters-section"
          className="filters-section"
          style={{ 
            display: "flex", 
            gap: 12, 
            alignItems: "center", 
            marginBottom: 12,
            flexWrap: "wrap"
          }}
        >
          <div style={{ 
            position: "relative", 
            flex: 1, 
            minWidth: "250px",
            display: "flex",
            alignItems: "center"
          }}>
            <SearchIcon 
              size={16} 
              style={{ 
                position: "absolute", 
                left: "12px", 
                color: paul.gray,
                pointerEvents: "none"
              }} 
            />
                      <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск (имя, email, телефон, адрес)"
              style={{
                width: "100%",
                padding: "10px 12px 10px 36px",
                border: `1px solid ${paul.border}`,
                borderRadius: 8,
                outline: "none",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                minHeight: "44px", // Touch-friendly
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = paul.black;
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.1), 0 1px 3px rgba(0,0,0,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = paul.border;
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
              aria-label="Поиск заявок"
            />
          </div>
          <div style={{ position: "relative", minWidth: "160px" }}>
            <FilterIcon 
              size={16} 
              style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%",
                transform: "translateY(-50%)",
                color: paul.gray,
                pointerEvents: "none"
              }}
            />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'new' | 'processing' | 'approved' | 'rejected')}
              style={{ 
                width: "100%",
                padding: "10px 12px 10px 36px", 
                border: `1px solid ${paul.border}`, 
                borderRadius: 8,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                cursor: "pointer",
                minHeight: "44px", // Touch-friendly
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "16px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = paul.black;
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,26,26,0.1), 0 1px 3px rgba(0,0,0,0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = paul.border;
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
              aria-label="Фильтр по статусу"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="processing">В обработке</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
          </div>
          <button 
            onClick={loadApplications} 
            style={{ 
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 14px", 
              border: `2px solid ${paul.black}`, 
              borderRadius: 8, 
              background: paul.white, 
              color: paul.black, 
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              transform: "translateY(0)",
              minHeight: "44px", // Touch-friendly
            }}
            onMouseEnter={(e)=>{ 
              e.currentTarget.style.backgroundColor = paul.black; 
              e.currentTarget.style.color = paul.white;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e)=>{ 
              e.currentTarget.style.backgroundColor = paul.white; 
              e.currentTarget.style.color = paul.black;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            aria-label="Обновить список заявок"
          >
            <RefreshIcon size={16} />
            <span>Обновить</span>
          </button>
        </section>

        {/* Applications table and Mini Calendar */}
        <div 
          className="applications-calendar-grid"
          style={{ 
            display: "grid", 
            gridTemplateColumns: "70% 30%", 
            gap: 16,
            marginBottom: 24
          }}>
          {/* Applications table */}
          <section 
            id="applications-section"
            style={{ 
              background: paul.white, 
              border: `1px solid ${paul.border}`, 
              borderRadius: 12, 
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}>
          <div style={{ padding: 16, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 18 }}>Последние заявки</div>
            <Link 
              href="/dashboard/applications" 
              style={{ 
                color: paul.black, 
                textDecoration: "none", 
                fontWeight: 600, 
                border: `1px solid ${paul.black}`, 
                padding: '6px 10px', 
                borderRadius: 6,
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e)=>{ 
                e.currentTarget.style.backgroundColor = paul.black; 
                e.currentTarget.style.color = paul.white;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e)=>{ 
                e.currentTarget.style.backgroundColor = 'transparent'; 
                e.currentTarget.style.color = paul.black;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
            >
              Все →
            </Link>
          </div>

          <div className="responsive-table" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: '#FBF7F0', borderBottom: `1px solid ${paul.border}` }}>
                    <th style={th}>Заявитель</th>
                    <th style={th}>Контакты</th>
                    <th style={th}>Мероприятие</th>
                    <th style={th}>Статус</th>
                    <th style={th}>Дата</th>
                    <th style={th}>Действия</th>
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
                      {debouncedSearchTerm ? 'Ничего не найдено' : 'Заявок пока нет'}
                    </td>
                  </tr>
                ) : (
                  filteredApplications.slice(0, 5).map((a) => (
                    <tr key={a.id} style={{ borderBottom: `1px solid ${paul.border}`, transition: 'background-color 150ms ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F1E8')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={td}>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{a.first_name} {a.last_name}</div>
                      </td>
                      <td style={td}>
                        <div style={{ color: "#111827" }}>{a.email}</div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>{a.phone}</div>
                      </td>
                      <td style={td}>
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
                          <div style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic" }}>Не указано</div>
                        )}
                      </td>
                      <td style={td}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 600,
                          border: `1px solid ${paul.black}`,
                          background: 'transparent',
                          color: paul.black,
                        }}>
                          {a.status === "new" ? "Новая" : a.status === "processing" ? "В обработке" : a.status === "approved" ? "Одобрена" : "Отклонена"}
                        </span>
                      </td>
                      <td style={td}>{new Date(a.created_at).toLocaleDateString("ru-RU")}</td>
                      <td style={td}>
                        <button
                          onClick={() => { setSelectedApplication(a); setIsModalOpen(true); }}
                          style={{ 
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px", 
                            border: `2px solid ${paul.black}`, 
                            borderRadius: 8, 
                            background: paul.white, 
                            color: paul.black, 
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            transform: "translateY(0)",
                            minHeight: "36px", // Touch-friendly
                          }}
                          onMouseEnter={(e)=>{ 
                            e.currentTarget.style.backgroundColor = paul.black; 
                            e.currentTarget.style.color = paul.white;
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.2)";
                          }}
                          onMouseLeave={(e)=>{ 
                            e.currentTarget.style.backgroundColor = paul.white; 
                            e.currentTarget.style.color = paul.black;
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                          }}
                          aria-label={`Просмотреть заявку от ${a.first_name} ${a.last_name}`}
                        >
                          <EyeIcon size={14} />
                          <span>Просмотреть</span>
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
          <section style={{ 
            background: paul.white, 
            border: `1px solid ${paul.border}`, 
            borderRadius: 12, 
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: 12
          }}>
            <div style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>
              Календарь
            </div>
            <MiniCalendar orders={orders} />
          </section>
        </div>
      </main>

      {/* Animations & Responsive Styles */}
      <style jsx>{`
        @keyframes spin { 
          0% { transform: rotate(0deg) } 
          100% { transform: rotate(360deg) } 
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        /* Media Queries для адаптивности */
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .sidebar {
            position: fixed !important;
            left: ${isMobileMenuOpen ? '0' : '-240px'} !important;
            transition: left 0.3s ease !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 1rem !important;
            padding-top: 4rem !important;
          }
          .responsive-table {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .filters-section {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .filters-section > * {
            width: 100% !important;
            min-width: auto !important;
          }
          .kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
          }
          .applications-calendar-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
          .sidebar {
            position: sticky !important;
            left: 0 !important;
          }
          .main-content {
            margin-left: 10px !important;
            padding: 2rem !important;
          }
        }
        
        /* Touch-friendly стили */
        @media (hover: none) and (pointer: coarse) {
          button, [role="button"], a {
            min-height: 44px !important;
            min-width: 44px !important;
          }
        }
      `}</style>

      {/* Modal */}
      {isModalOpen && selectedApplication && (
        <div style={{ 
          position: "fixed", 
          inset: 0, 
          background: "rgba(0,0,0,0.4)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          padding: 16, 
          zIndex: 50,
          animation: "fadeIn 0.2s ease-out",
        }}>
          <div style={{ 
            background: paul.white, 
            borderRadius: 12, 
            maxWidth: 720, 
            width: "100%", 
            maxHeight: "90vh", 
            overflow: "auto", 
            border: `1px solid ${paul.border}`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
            animation: "slideDown 0.3s ease-out",
          }}>
            <div style={{ padding: 16, borderBottom: "1px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ ...serifTitle, fontWeight: 800, color: paul.black }}>Заявка от {selectedApplication.first_name} {selectedApplication.last_name}</div>
              <button 
                onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }} 
                style={{ 
                  border: `2px solid ${paul.black}`, 
                  borderRadius: 8, 
                  background: paul.white, 
                  color: paul.black, 
                  padding: "6px 8px", 
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e)=>{ 
                  e.currentTarget.style.backgroundColor = paul.black; 
                  e.currentTarget.style.color = paul.white;
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 3px 8px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e)=>{ 
                  e.currentTarget.style.backgroundColor = paul.white; 
                  e.currentTarget.style.color = paul.black;
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                }}
              >
                Закрыть
              </button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
                <Info label="Имя" value={selectedApplication.first_name} />
                <Info label="Фамилия" value={selectedApplication.last_name} />
                <Info label="Email" value={selectedApplication.email} />
                <Info label="Телефон" value={selectedApplication.phone} />
                <Info label="Статус" value={selectedApplication.status} />
              </div>

              {/* Информация о мероприятии */}
              {(selectedApplication.event_address || selectedApplication.event_date || selectedApplication.event_time) && (
                <>
                  <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginBottom: 16 }}>
                    <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>Информация о мероприятии</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                      {selectedApplication.event_address && <Info label="Адрес" value={selectedApplication.event_address} />}
                      {selectedApplication.event_date && <Info label="Дата" value={new Date(selectedApplication.event_date).toLocaleDateString("ru-RU")} />}
                      {selectedApplication.event_time && <Info label="Время" value={selectedApplication.event_time} />}
                      {selectedApplication.event_lat && selectedApplication.event_lng && (
                        <Info label="Координаты" value={`${selectedApplication.event_lat}, ${selectedApplication.event_lng}`} />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Комментарий клиента */}
              {selectedApplication.message && (
                <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginBottom: 16 }}>
                  <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>Комментарий клиента</h3>
                  <div style={{ 
                    padding: 12, 
                    background: '#F9F9F6', 
                    borderRadius: 8, 
                    border: `1px solid ${paul.border}`,
                    color: paul.black,
                    fontSize: 14,
                    lineHeight: 1.5
                  }}>
                    {selectedApplication.message}
                  </div>
                </div>
              )}

              {/* Позиции корзины */}
              {selectedApplication.cart_items && selectedApplication.cart_items.length > 0 && (
                <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginBottom: 16 }}>
                  <h3 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 16, marginBottom: 12 }}>Позиции заказа</h3>
                  <div style={{ 
                    background: '#F9F9F6', 
                    borderRadius: 8, 
                    border: `1px solid ${paul.border}`,
                    overflow: 'hidden'
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: '#F0F0F0' }}>
                          <th style={{ ...th, padding: "8px 12px", fontSize: 11 }}>Товар</th>
                          <th style={{ ...th, padding: "8px 12px", fontSize: 11 }}>Количество</th>
                          <th style={{ ...th, padding: "8px 12px", fontSize: 11 }}>Цена</th>
                          <th style={{ ...th, padding: "8px 12px", fontSize: 11 }}>Сумма</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedApplication.cart_items.map((item, index) => (
                          <tr key={index} style={{ borderBottom: `1px solid ${paul.border}` }}>
                            <td style={{ ...td, padding: "8px 12px", fontSize: 13 }}>{item.name}</td>
                            <td style={{ ...td, padding: "8px 12px", fontSize: 13 }}>{item.quantity}</td>
                            <td style={{ ...td, padding: "8px 12px", fontSize: 13 }}>{item.price} ₼</td>
                            <td style={{ ...td, padding: "8px 12px", fontSize: 13, fontWeight: 600 }}>{item.price * item.quantity} ₼</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 12 }}>
                {selectedApplication.status === "new" && (
                  <>
                    <button
                      onClick={() => {
                        router.push(`/dashboard/orders/create?fromApplication=${selectedApplication.id}`);
                        setIsModalOpen(false);
                        setSelectedApplication(null);
                      }}
                      style={{ 
                        padding: "10px 14px", 
                        borderRadius: 8, 
                        background: paul.white, 
                        color: paul.black, 
                        border: `2px solid ${paul.black}`, 
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                      onMouseEnter={(e)=>{ 
                        e.currentTarget.style.backgroundColor = paul.black; 
                        e.currentTarget.style.color = paul.white;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                      }}
                      onMouseLeave={(e)=>{ 
                        e.currentTarget.style.backgroundColor = paul.white; 
                        e.currentTarget.style.color = paul.black;
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                      }}
                    >
                      Создать заказ
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, "rejected")}
                      style={{ 
                        padding: "10px 14px", 
                        borderRadius: 8, 
                        background: paul.white, 
                        color: "#dc2626", 
                        border: `2px solid #dc2626`, 
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                      onMouseEnter={(e)=>{ 
                        e.currentTarget.style.backgroundColor = "#dc2626"; 
                        e.currentTarget.style.color = paul.white;
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(220,38,38,0.3)";
                      }}
                      onMouseLeave={(e)=>{ 
                        e.currentTarget.style.backgroundColor = paul.white; 
                        e.currentTarget.style.color = "#dc2626";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                      }}
                    >
                      Отклонить
                    </button>
                  </>
                )}
                <button 
                  onClick={() => { setIsModalOpen(false); setSelectedApplication(null); }} 
                  style={{ 
                    padding: "10px 14px", 
                    borderRadius: 8, 
                    border: `2px solid ${paul.black}`, 
                    background: paul.white, 
                    color: paul.black, 
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e)=>{ 
                    e.currentTarget.style.backgroundColor = paul.black; 
                    e.currentTarget.style.color = paul.white;
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e)=>{ 
                    e.currentTarget.style.backgroundColor = paul.white; 
                    e.currentTarget.style.color = paul.black;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Skeleton Styles */}
      <SkeletonStyles />
    </div>
  );
}

const linkCardStyle: React.CSSProperties = {
  display: "block",
  textDecoration: "none",
  color: paul.black,
  background: paul.white,
  border: `1px solid ${paul.black}`,
  borderRadius: 10,
  padding: "14px 16px",
  textAlign: "center",
  fontWeight: 600,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
  transform: "translateY(0)",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 12px",
  fontSize: 12,
  color: paul.gray,
  textTransform: "uppercase",
  letterSpacing: 0.6,
};

const td: React.CSSProperties = {
  padding: "12px 12px",
  fontSize: 14,
  color: paul.black,
};

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: paul.gray, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</div>
      <div style={{ fontSize: 14, color: paul.black, marginTop: 4 }}>{String(value ?? "—")}</div>
    </div>
  );
}

// Mini Calendar Component
function MiniCalendar({ orders }: { orders: Order[] }) {
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
  
  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];
  
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
  
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
    
    // Приоритет статусов для определения цвета ячейки
    const hasCompleted = dayOrders.some(o => o.status === "completed");
    const hasProcessing = dayOrders.some(o => o.status === "processing");
    const hasCancelled = dayOrders.some(o => o.status === "cancelled");
    const hasSubmitted = dayOrders.some(o => o.status === "submitted");
    
    if (hasCompleted) return "#dcfce7"; // зеленый для завершенных
    if (hasProcessing) return "#fef3c7"; // желтый для в работе
    if (hasCancelled) return "#fee2e2"; // красный для отмененных
    if (hasSubmitted) return "#dbeafe"; // синий для отправленных
    
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
            color: paul.gray,
            fontSize: "12px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = paul.black;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = paul.gray;
          }}
        >
          ←
        </button>
        <div style={{ 
          fontSize: "12px", 
          fontWeight: 600, 
          color: paul.black 
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
            color: paul.gray,
            fontSize: "12px"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = paul.black;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = paul.gray;
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
              color: paul.gray,
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
                color: day ? (isToday ? paul.white : paul.black) : "transparent",
                backgroundColor: isToday ? paul.black : (hasOrders ? cellColor : "transparent"),
                borderRadius: "3px",
                cursor: day ? "pointer" : "default",
                transition: "all 0.2s ease",
                position: "relative",
                minHeight: "24px"
              }}
              onMouseEnter={(e) => {
                if (day && !isToday) {
                  e.currentTarget.style.backgroundColor = hasOrders ? 
                    (cellColor === "#dcfce7" ? "#bbf7d0" : 
                     cellColor === "#fef3c7" ? "#fde68a" :
                     cellColor === "#fee2e2" ? "#fecaca" :
                     cellColor === "#dbeafe" ? "#bfdbfe" : "#e0f2fe") : "#f3f4f6";
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
                      backgroundColor: isToday ? paul.white : "#3b82f6",
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
            color: paul.black,
            marginBottom: "4px"
          }}>
            Заказы на {selectedDay} {monthNames[currentMonth]}
          </div>
          {getOrdersForDate(selectedDay).map((order) => (
            <div key={order.id} style={{
              fontSize: "9px",
              color: paul.gray,
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
