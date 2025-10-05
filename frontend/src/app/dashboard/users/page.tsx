"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { User } from "../../../config/api";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, canManageUsers } from "../../../utils/authConstants";

// PAUL brand palette and typography
const paul = { black: '#1A1A1A', beige: '#EBDCC8', border: '#EDEAE3', gray: '#4A4A4A', white: '#FFFCF8' };
const serifTitle: React.CSSProperties = { fontFamily: 'Playfair Display, serif' };

interface UserFormData {
  name: string;
  email: string;
  password: string;
  user_group: 'client' | 'staff';
  staff_role: 'coordinator' | 'observer';
  client_category: 'corporate' | 'one_time';
  company_name: string;
  position: string;
  phone: string;
  address: string;
  contact_person: string;
}

const userGroupLabels = {
  staff: 'Персонал',
  client: 'Клиент'
};

const staffRoleLabels = {
  coordinator: 'Координатор',
  observer: 'Наблюдатель'
};

const clientCategoryLabels = {
  corporate: 'Корпоративный',
  one_time: 'Разовый'
};

const statusLabels = {
  active: 'Активен',
  inactive: 'Неактивен',
  suspended: 'Заблокирован'
};

const statusColors = {
  active: '#10B981',
  inactive: '#6B7280',
  suspended: '#EF4444'
};

export default function UsersPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Фильтры и поиск
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState<"all" | "staff" | "client">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    user_group: 'client',
    staff_role: 'observer',
    client_category: 'corporate',
    company_name: '',
    position: '',
    phone: '',
    address: '',
    contact_person: '',
  });

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const result = await makeApiRequest<User[]>('users');
      if (result.success) {
        setUsers(extractApiData(result.data || []));
      } else {
        console.error('Ошибка загрузки пользователей:', handleApiError(result));
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Auth guard с проверкой прав доступа
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, canManageUsers, router);

  useEffect(() => {
    if (hasAccess) {
      loadUsers();
    }
  }, [hasAccess, loadUsers]);

  // Фильтрация пользователей
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Поиск
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        String(u.phone || "").toLowerCase().includes(q);

      // Группа
      const matchesGroup = groupFilter === "all" || (u as { user_group?: string }).user_group === groupFilter;
      
      // Статус
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;

      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [users, searchTerm, groupFilter, statusFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await makeApiRequest('users', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (result.success) {
        setShowCreateForm(false);
        resetForm();
        loadUsers();
      } else {
        alert(handleApiError(result, "Не удалось создать пользователя"));
      }
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
      alert('Произошла ошибка при создании пользователя');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const result = await makeApiRequest(`users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (result.success) {
        setEditingUser(null);
        resetForm();
        loadUsers();
      } else {
        alert(handleApiError(result, "Не удалось обновить пользователя"));
      }
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
      alert('Произошла ошибка при обновлении пользователя');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const result = await makeApiRequest(`users/${userId}`, {
        method: 'DELETE',
      });

      if (result.success) {
        loadUsers();
      } else {
        alert(handleApiError(result, "Не удалось удалить пользователя"));
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
      alert('Произошла ошибка при удалении пользователя');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      user_group: 'client',
      staff_role: 'observer',
      client_category: 'corporate',
      company_name: '',
      position: '',
      phone: '',
      address: '',
      contact_person: '',
    });
  };

  const startEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: '',
      user_group: u.user_group || 'client',
      staff_role: u.staff_role || 'observer',
      client_category: u.client_category || 'corporate',
      company_name: u.company_name || '',
      position: u.position || '',
      phone: u.phone || '',
      address: u.address || '',
      contact_person: u.contact_person || '',
    });
  };

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
    <div style={{ minHeight: "100vh", backgroundColor: "#fafafa", display: "flex" }}>
      {/* Sidebar */}
      <aside style={{
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
          
          {user?.user_type === 'staff' && user?.staff_role === 'coordinator' && (
            <Link href="/dashboard/reset-password" style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              textDecoration: "none",
              color: pathname?.startsWith("/dashboard/reset-password") ? paul.black : paul.gray,
              background: pathname?.startsWith("/dashboard/reset-password") ? paul.beige : "transparent",
              borderRight: pathname?.startsWith("/dashboard/reset-password") ? `3px solid ${paul.black}` : "3px solid transparent",
            }}>
              <span>🔑 Сброс паролей</span>
            </Link>
          )}
          
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
          <span style={{ color: paul.black }}>Пользователи</span>
          </div>

        {/* Page Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: paul.black, marginBottom: 8 }}>
            Пользователи
          </h1>
          <p style={{ color: paul.gray, fontSize: 16 }}>
            Управление пользователями системы
          </p>
        </div>

        {/* Stats Cards */}
        <section style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}>
          <div style={{ background: paul.white, border: `1px solid ${paul.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Всего пользователей</div>
            <div style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: paul.black }}>{users.length}</div>
          </div>
          <div style={{ background: paul.white, border: `1px solid ${paul.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Персонал</div>
            <div style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: "#8B5CF6" }}>{users.filter(u => u.user_group === "staff").length}</div>
          </div>
          <div style={{ background: paul.white, border: `1px solid ${paul.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Клиенты</div>
            <div style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: "#10B981" }}>{users.filter(u => u.user_group === "client").length}</div>
          </div>
          <div style={{ background: paul.white, border: `1px solid ${paul.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ color: paul.gray, fontSize: 12, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Активные</div>
            <div style={{ ...serifTitle, fontSize: 32, fontWeight: 800, color: statusColors.active }}>{users.filter(u => u.status === "active").length}</div>
          </div>
        </section>

        {/* Filters */}
        <section style={{
          background: paul.white,
          border: `1px solid ${paul.border}`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          display: "flex",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap"
        }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по имени, email, компании, должности..."
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
          
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value as 'all' | 'staff' | 'client')}
            style={{ 
              padding: "12px 16px", 
              border: `1px solid ${paul.border}`, 
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <option value="all">Все группы</option>
            <option value="staff">Персонал</option>
            <option value="client">Клиенты</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            style={{ 
              padding: "12px 16px", 
              border: `1px solid ${paul.border}`, 
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="suspended">Заблокированные</option>
          </select>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setViewMode("table")}
              style={{
                padding: "10px 14px",
                border: `2px solid ${paul.black}`,
                borderRadius: 8,
                background: viewMode === "table" ? paul.black : paul.white,
                color: viewMode === "table" ? paul.white : paul.black,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Таблица
            </button>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "10px 14px",
                border: `2px solid ${paul.black}`,
                borderRadius: 8,
                background: viewMode === "grid" ? paul.black : paul.white,
                color: viewMode === "grid" ? paul.white : paul.black,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Карточки
            </button>
          </div>

            <button
              onClick={() => setShowCreateForm(true)}
            style={{
              padding: "12px 16px",
              border: `2px solid ${paul.black}`,
              borderRadius: 8,
              background: paul.black,
              color: paul.white,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            + Добавить
            </button>

          <button 
            onClick={loadUsers} 
            style={{ 
              padding: "12px 16px", 
              border: `2px solid ${paul.black}`, 
              borderRadius: 8, 
              background: paul.white, 
              color: paul.black, 
              cursor: "pointer",
              fontSize: 14,
            }}
            onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor = paul.black; e.currentTarget.style.color = paul.white; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor = paul.white; e.currentTarget.style.color = paul.black; }}
          >
            Обновить
          </button>
        </section>

        {/* Users List */}
        <section style={{ background: paul.white, border: `1px solid ${paul.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: 20, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 20 }}>
                Пользователи ({filteredUsers.length})
              </div>
              <div style={{ color: paul.gray, fontSize: 14 }}>
                {usersLoading ? "Загрузка..." : `Показано ${filteredUsers.length} из ${users.length} пользователей`}
              </div>
            </div>
          </div>

          {usersLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: paul.gray }}>
              <div style={{
                width: 40,
                height: 40,
                border: '3px solid #f3f3f3',
                borderTop: `3px solid ${paul.black}`,
                borderRadius: '50%',
                margin: '0 auto 16px',
                animation: 'spin 1s linear infinite'
              }} />
              Загрузка пользователей...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: paul.gray }}>
              {users.length === 0 ? "Пользователей пока нет" : "Не найдено пользователей по заданным фильтрам"}
            </div>
          ) : (
            <>
              {viewMode === "table" ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: '#FBF7F0', borderBottom: `1px solid ${paul.border}` }}>
                        <th style={tableHeaderStyle}>Пользователь</th>
                        <th style={tableHeaderStyle}>Группа</th>
                        <th style={tableHeaderStyle}>Роль/Категория</th>
                        <th style={tableHeaderStyle}>Компания</th>
                        <th style={tableHeaderStyle}>Статус</th>
                        <th style={tableHeaderStyle}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr 
                          key={u.id} 
                          style={{ borderBottom: `1px solid ${paul.border}`, transition: 'background-color 150ms ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F7F1E8')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={tableCellStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: 9999,
                                background: u.user_group === 'staff' ? "#8B5CF6" : "#10B981",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: 14,
                              }}>{u.name.charAt(0).toUpperCase()}</div>
                  <div>
                                <div style={{ fontWeight: 600, color: paul.black, fontSize: 14 }}>{u.name}</div>
                                <div style={{ color: paul.gray, fontSize: 12 }}>{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: "6px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: u.user_group === 'staff' ? '#8B5CF620' : '#10B98120',
                              color: u.user_group === 'staff' ? '#8B5CF6' : '#10B981',
                            }}>
                              {userGroupLabels[u.user_group || 'client']}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: "6px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: u.user_group === 'staff' 
                                ? (u.staff_role === 'coordinator' ? '#F59E0B20' : '#3B82F620')
                                : (u.client_category === 'corporate' ? '#10B98120' : '#F59E0B20'),
                              color: u.user_group === 'staff' 
                                ? (u.staff_role === 'coordinator' ? '#F59E0B' : '#3B82F6')
                                : (u.client_category === 'corporate' ? '#10B981' : '#F59E0B'),
                            }}>
                              {u.user_group === 'staff' 
                                ? staffRoleLabels[u.staff_role!]
                                : clientCategoryLabels[u.client_category!]
                              }
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div>
                              <div style={{ color: paul.black, fontSize: 14, fontWeight: 500 }}>
                                {u.company_name || "—"}
                              </div>
                              {u.position && (
                                <div style={{ color: paul.gray, fontSize: 12 }}>{u.position}</div>
                              )}
                            </div>
                          </td>
                          <td style={tableCellStyle}>
                            <span style={{
                              padding: "6px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: statusColors[u.status] + '20',
                              color: statusColors[u.status],
                            }}>
                              {statusLabels[u.status]}
                            </span>
                          </td>
                          <td style={tableCellStyle}>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                                style={{
                                  padding: "6px 10px",
                                  border: `1px solid ${paul.black}`,
                                  borderRadius: 6,
                                  background: paul.white,
                                  color: paul.black,
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor = paul.black; e.currentTarget.style.color = paul.white; }}
                                onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor = paul.white; e.currentTarget.style.color = paul.black; }}
                              >
                                Просмотр
                              </button>
                              <button
                                onClick={() => startEdit(u)}
                                style={{
                                  padding: "6px 10px",
                                  border: `1px solid #3B82F6`,
                                  borderRadius: 6,
                                  background: paul.white,
                                  color: "#3B82F6",
                                  cursor: "pointer",
                                  fontSize: 12,
                                }}
                                onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor = "#3B82F6"; e.currentTarget.style.color = paul.white; }}
                                onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor = paul.white; e.currentTarget.style.color = "#3B82F6"; }}
                              >
                                Изменить
                              </button>
                              {u.id !== user?.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  style={{
                                    padding: "6px 10px",
                                    border: `1px solid #EF4444`,
                                    borderRadius: 6,
                                    background: paul.white,
                                    color: "#EF4444",
                                    cursor: "pointer",
                                    fontSize: 12,
                                  }}
                                  onMouseEnter={(e)=>{ e.currentTarget.style.backgroundColor = "#EF4444"; e.currentTarget.style.color = paul.white; }}
                                  onMouseLeave={(e)=>{ e.currentTarget.style.backgroundColor = paul.white; e.currentTarget.style.color = "#EF4444"; }}
                                >
                                  Удалить
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
                  gap: 20, 
                  padding: 20 
                }}>
                  {filteredUsers.map((u) => (
                    <div 
                      key={u.id}
                      style={{
                        background: paul.white,
                        border: `1px solid ${paul.border}`,
                        borderRadius: 12,
                        padding: 20,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(26, 26, 26, 0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                      onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                        <div style={{
                          width: 50,
                          height: 50,
                          borderRadius: 9999,
                          background: u.user_group === 'staff' ? "#8B5CF6" : "#10B981",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 18,
                        }}>{u.name.charAt(0).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: paul.black, fontSize: 16 }}>{u.name}</div>
                          <div style={{ color: paul.gray, fontSize: 14 }}>{u.email}</div>
                        </div>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: statusColors[u.status] + '20',
                          color: statusColors[u.status],
                        }}>
                          {statusLabels[u.status]}
                        </span>
                      </div>
                      
                      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: u.user_group === 'staff' ? '#8B5CF620' : '#10B98120',
                          color: u.user_group === 'staff' ? '#8B5CF6' : '#10B981',
                        }}>
                          {userGroupLabels[u.user_group || 'client']}
                        </span>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 600,
                          background: u.user_group === 'staff' 
                            ? (u.staff_role === 'coordinator' ? '#F59E0B20' : '#3B82F620')
                            : (u.client_category === 'corporate' ? '#10B98120' : '#F59E0B20'),
                          color: u.user_group === 'staff' 
                            ? (u.staff_role === 'coordinator' ? '#F59E0B' : '#3B82F6')
                            : (u.client_category === 'corporate' ? '#10B981' : '#F59E0B'),
                        }}>
                          {u.user_group === 'staff' 
                            ? staffRoleLabels[u.staff_role!]
                            : clientCategoryLabels[u.client_category!]
                          }
                        </span>
                      </div>
                      
                      {u.company_name && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ color: paul.gray, fontSize: 12, marginBottom: 2 }}>Компания</div>
                          <div style={{ color: paul.black, fontSize: 14, fontWeight: 500 }}>{u.company_name}</div>
                          {u.position && (
                            <div style={{ color: paul.gray, fontSize: 12 }}>{u.position}</div>
                          )}
                        </div>
                      )}
                      
                      {u.phone && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ color: paul.gray, fontSize: 12, marginBottom: 2 }}>Телефон</div>
                          <div style={{ color: paul.black, fontSize: 14 }}>{u.phone}</div>
                        </div>
                      )}
                      
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                        <div style={{ color: paul.gray, fontSize: 12 }}>
                          {new Date(u.created_at).toLocaleDateString("ru-RU")}
                        </div>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(u); }}
                            style={{
                              padding: "4px 8px",
                              border: `1px solid #3B82F6`,
                              borderRadius: 4,
                              background: paul.white,
                              color: "#3B82F6",
                              cursor: "pointer",
                              fontSize: 11,
                            }}
                          >
                            Изменить
                          </button>
                          {u.id !== user?.id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteUser(u.id); }}
                              style={{
                                padding: "4px 8px",
                                border: `1px solid #EF4444`,
                                borderRadius: 4,
                                background: paul.white,
                                color: "#EF4444",
                                cursor: "pointer",
                                fontSize: 11,
                              }}
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* User Detail Modal */}
      {isModalOpen && selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => { setIsModalOpen(false); setSelectedUser(null); }}
          onEdit={() => {
            startEdit(selectedUser);
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          onDelete={() => {
            handleDeleteUser(selectedUser.id);
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
          currentUserId={user?.id}
        />
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingUser) && (
        <UserFormModal
          isEditing={!!editingUser}
          formData={formData}
          setFormData={setFormData}
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingUser(null);
            resetForm();
          }}
        />
      )}

      <style jsx>{`
        @keyframes spin { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }
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

// Модальное окно для просмотра пользователя
function UserModal({ 
  user, 
  onClose, 
  onEdit, 
  onDelete,
  currentUserId 
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  currentUserId?: number;
}) {
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
        maxWidth: 600, 
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
            Пользователь
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
          {/* Аватар и основная информация */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: 9999,
              background: user.user_group === 'staff' ? "#8B5CF6" : "#10B981",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 32,
            }}>{user.name.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ ...serifTitle, fontWeight: 700, color: paul.black, fontSize: 24, marginBottom: 4 }}>
                {user.name}
              </h2>
              <div style={{ color: paul.gray, fontSize: 16, marginBottom: 8 }}>{user.email}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: user.user_group === 'staff' ? '#8B5CF620' : '#10B98120',
                  color: user.user_group === 'staff' ? '#8B5CF6' : '#10B981',
                }}>
                  {userGroupLabels[user.user_group || 'client']}
                </span>
                <span style={{
                  padding: "4px 12px",
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: statusColors[user.status] + '20',
                  color: statusColors[user.status],
                }}>
                  {statusLabels[user.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Детальная информация */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            <InfoField label="Роль/Категория" value={
              user.user_group === 'staff' 
                ? staffRoleLabels[user.staff_role!]
                : clientCategoryLabels[user.client_category!]
            } />
            <InfoField label="Компания" value={user.company_name} />
            <InfoField label="Должность" value={user.position} />
            <InfoField label="Телефон" value={user.phone} />
            <InfoField label="Адрес" value={user.address} />
            <InfoField label="Контактное лицо" value={user.contact_person} />
            <InfoField label="Дата регистрации" value={new Date(user.created_at).toLocaleDateString("ru-RU")} />
          </div>

          {/* Действия */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 16 }}>
            <button
              onClick={onEdit}
              style={{
                padding: "10px 16px",
                border: `2px solid #3B82F6`,
                borderRadius: 8,
                background: "#3B82F6",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Редактировать
            </button>
            
            {user.id !== currentUserId && (
              <button
                onClick={onDelete}
                style={{
                  padding: "10px 16px",
                  border: `2px solid #EF4444`,
                  borderRadius: 8,
                  background: "#EF4444",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Удалить
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

// Модальное окно для создания/редактирования пользователя
function UserFormModal({ 
  isEditing, 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel 
}: {
  isEditing: boolean;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}) {
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
            {isEditing ? 'Редактирование пользователя' : 'Создание пользователя'}
          </div>
          <button 
            onClick={onCancel} 
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
        
        <form onSubmit={onSubmit} style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 24 }}>
            {/* Основная информация */}
            <FormField
              label="Имя"
                      type="text"
                      value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
                      required
                    />
            <FormField
              label="Email"
                      type="email"
                      value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
                      required
                    />
            <FormField
              label={`Пароль ${isEditing ? '(оставьте пустым для сохранения)' : ''}`}
                      type="password"
                      value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              required={!isEditing}
                    />
            
            {/* Группа пользователя */}
                  <div>
              <label style={{ display: "block", fontSize: 12, color: paul.gray, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
                      Группа пользователя
                    </label>
                    <select
                      value={formData.user_group}
                      onChange={(e) => setFormData({ ...formData, user_group: e.target.value as 'client' | 'staff' })}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${paul.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                }}
                    >
                      <option value="client">Клиент</option>
                      <option value="staff">Персонал</option>
                    </select>
                  </div>

            {/* Роль персонала */}
                  <div>
              <label style={{ display: "block", fontSize: 12, color: paul.gray, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
                      Роль персонала
                    </label>
                    <select
                      value={formData.staff_role}
                      onChange={(e) => setFormData({ ...formData, staff_role: e.target.value as 'coordinator' | 'observer' })}
                      disabled={formData.user_group !== 'staff'}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${paul.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  opacity: formData.user_group !== 'staff' ? 0.5 : 1,
                }}
                    >
                      <option value="observer">Наблюдатель</option>
                      <option value="coordinator">Координатор</option>
                    </select>
                  </div>

            {/* Категория клиента */}
                  <div>
              <label style={{ display: "block", fontSize: 12, color: paul.gray, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
                      Категория клиента
                    </label>
                    <select
                      value={formData.client_category}
                      onChange={(e) => setFormData({ ...formData, client_category: e.target.value as 'corporate' | 'one_time' })}
                      disabled={formData.user_group !== 'client'}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: `1px solid ${paul.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  opacity: formData.user_group !== 'client' ? 0.5 : 1,
                }}
                    >
                      <option value="corporate">Корпоративный</option>
                      <option value="one_time">Разовый</option>
                    </select>
                  </div>

            {/* Дополнительная информация */}
            <FormField
              label="Компания"
                      type="text"
                      value={formData.company_name}
              onChange={(value) => setFormData({ ...formData, company_name: value })}
            />
            <FormField
              label="Должность"
                      type="text"
                      value={formData.position}
              onChange={(value) => setFormData({ ...formData, position: value })}
            />
            <FormField
              label="Телефон"
                      type="text"
                      value={formData.phone}
              onChange={(value) => setFormData({ ...formData, phone: value })}
            />
            <FormField
              label="Адрес"
                      type="text"
                      value={formData.address}
              onChange={(value) => setFormData({ ...formData, address: value })}
            />
            <FormField
              label="Контактное лицо"
                      type="text"
                      value={formData.contact_person}
              onChange={(value) => setFormData({ ...formData, contact_person: value })}
                    />
                  </div>

          {/* Кнопки */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 16 }}>
                  <button
                    type="submit"
              style={{
                padding: "12px 24px",
                border: `2px solid ${paul.black}`,
                borderRadius: 8,
                background: paul.black,
                color: paul.white,
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {isEditing ? 'Обновить' : 'Создать'}
                  </button>
                  <button
                    type="button"
              onClick={onCancel}
              style={{
                padding: "12px 24px",
                border: `1px solid ${paul.border}`,
                borderRadius: 8,
                background: paul.white,
                color: paul.gray,
                cursor: "pointer",
                fontSize: 14,
              }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
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

// Компонент поля формы
function FormField({ 
  label, 
  type, 
  value, 
  onChange, 
  required = false 
}: { 
  label: string; 
  type: string; 
  value: string; 
  onChange: (value: string) => void; 
  required?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, color: paul.gray, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          width: "100%",
          padding: "12px",
          border: `1px solid ${paul.border}`,
          borderRadius: 8,
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}
