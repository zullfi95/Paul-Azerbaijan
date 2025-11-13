"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { User } from "../../../types/common";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, canManageUsers } from "../../../utils/authConstants";
import DashboardLayout from "../../../components/DashboardLayout";
import { 
  SearchIcon, 
  FilterIcon, 
  RefreshIcon, 
  EyeIcon,
  UsersIcon,
  CheckIcon,
  XIcon 
} from "../../../components/Icons";
import "../../../styles/dashboard.css";

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
  status: 'active' | 'inactive' | 'suspended';
}

const staffRoleLabels: Record<string, string> = {
  coordinator: 'Координатор',
  observer: 'Наблюдатель'
};

const clientCategoryLabels: Record<string, string> = {
  corporate: 'Корпоративный',
  one_time: 'Разовый'
};

const statusLabels: Record<string, string> = {
  active: 'Активный',
  inactive: 'Неактивный',
  suspended: 'Заблокирован'
};

export default function UsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [userGroupFilter, setUserGroupFilter] = useState<"all" | "client" | "staff">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "cards">("table");
  const [sortBy, setSortBy] = useState<"name" | "email" | "created_at" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    status: 'active'
  });

  // Auth guard
  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', position: '', staff_role: '' }, canManageUsers, router);

  // Load users
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const result = await makeApiRequest<User[]>('users');
      if (result.success) {
        setUsers(extractApiData(result.data || []));
      } else {
        console.error('Ошибка загрузки пользователей:', handleApiError(result as any));
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.company_name?.toLowerCase().includes(q) ||
        u.position?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }

    // User group filter
    if (userGroupFilter !== 'all') {
      filtered = filtered.filter(u => u.user_type === userGroupFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [users, searchTerm, statusFilter, userGroupFilter, sortBy, sortOrder]);

  // Handle user selection
  const handleUserSelect = (id: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  // Handle user preview
  const handleUserPreview = (user: User) => {
    setSelectedUser(user);
    setIsSidebarOpen(true);
  };

  // Handle user edit
  const handleUserEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      user_group: (user.user_type as 'client' | 'staff') || 'client',
      staff_role: (user.staff_role as 'coordinator' | 'observer') || 'observer',
      client_category: user.client_category || 'corporate',
      company_name: user.company_name || '',
      position: user.position || '',
      phone: user.phone || '',
      address: user.address || '',
      status: user.status || 'active'
    });
    setShowCreateForm(true);
  };

  // Handle form submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Update user
        const result = await makeApiRequest(`users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });

        if (result.success) {
          await loadUsers();
          setShowCreateForm(false);
          setEditingUser(null);
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
            status: 'active'
          });
        } else {
          console.error('Ошибка обновления пользователя:', handleApiError(result as any));
        }
      } else {
        // Create user
        const result = await makeApiRequest('users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });

        if (result.success) {
          await loadUsers();
          setShowCreateForm(false);
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
            status: 'active'
          });
        } else {
          console.error('Ошибка создания пользователя:', handleApiError(result as any));
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
    }
  };

  // Handle user delete
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) return;

    try {
      const result = await makeApiRequest(`users/${id}`, {
        method: 'DELETE'
      });

      if (result.success) {
        await loadUsers();
      } else {
        console.error('Ошибка удаления пользователя:', handleApiError(result as any));
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
    }
  };

  // Handle status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const result = await makeApiRequest(`users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (result.success) {
        await loadUsers();
      } else {
        console.error('Ошибка изменения статуса:', handleApiError(result as any));
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <div className="loading-title">Загрузка...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Stats Cards */}
      <section className="dashboard-kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <UsersIcon size={16} className="dashboard-kpi-icon" />
            <span className="dashboard-kpi-label">Всего пользователей</span>
          </div>
          <div className="dashboard-kpi-value">{users.length}</div>
          <div className="dashboard-kpi-subtitle">
            В системе
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('active')}
        >
          <div className="dashboard-kpi-header">
            <CheckIcon size={16} className="dashboard-kpi-icon" style={{ color: '#10B981' }} />
            <span className="dashboard-kpi-label">Активные</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>{users.filter(u => u.status === 'active').length}</div>
          <div className="dashboard-kpi-subtitle">
            Активных пользователей
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setUserGroupFilter('client')}
        >
          <div className="dashboard-kpi-header">
            <UsersIcon size={16} className="dashboard-kpi-icon" style={{ color: '#3B82F6' }} />
            <span className="dashboard-kpi-label">Клиенты</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#3B82F6' }}>{users.filter(u => u.user_type === 'client').length}</div>
          <div className="dashboard-kpi-subtitle">
            Зарегистрированных
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setUserGroupFilter('staff')}
        >
          <div className="dashboard-kpi-header">
            <UsersIcon size={16} className="dashboard-kpi-icon" style={{ color: '#F59E0B' }} />
            <span className="dashboard-kpi-label">Сотрудники</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>{users.filter(u => u.user_type === 'staff').length}</div>
          <div className="dashboard-kpi-subtitle">
            Координаторы и наблюдатели
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="dashboard-filters" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-search-container">
          <SearchIcon size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder="Поиск по имени, email, компании..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
            aria-label="Поиск пользователей"
          />
        </div>
        
        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label="Фильтр по статусу"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
            <option value="suspended">Заблокированные</option>
          </select>
        </div>

        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={userGroupFilter}
            onChange={(e) => setUserGroupFilter(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label="Фильтр по группе"
          >
            <option value="all">Все группы</option>
            <option value="client">Клиенты</option>
            <option value="staff">Сотрудники</option>
          </select>
        </div>

        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label="Сортировка"
          >
            <option value="name">По имени</option>
            <option value="email">По email</option>
            <option value="created_at">По дате создания</option>
            <option value="status">По статусу</option>
          </select>
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="dashboard-action-btn"
          aria-label={`Сортировка ${sortOrder === 'asc' ? 'по возрастанию' : 'по убыванию'}`}
          style={{ minWidth: '48px' }}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)',
          marginLeft: 'auto',
          flexWrap: 'wrap'
        }}>
          {selectedUsers.size > 0 && (
            <span style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--paul-gray)',
              padding: '4px 8px',
              background: '#F0F9FF',
              borderRadius: '12px',
              fontWeight: 600
            }}>
              Выбрано: {selectedUsers.size}
            </span>
          )}
          <div style={{ 
            display: 'flex', 
            gap: 'var(--space-2)',
            borderLeft: '1px solid var(--paul-border)',
            paddingLeft: 'var(--space-3)'
          }}>
            <button
              className={`dashboard-action-btn`}
              onClick={() => setViewMode('table')}
              style={{ 
                background: viewMode === 'table' ? 'var(--paul-black)' : 'var(--paul-white)',
                color: viewMode === 'table' ? 'var(--paul-white)' : 'var(--paul-black)',
                minWidth: 'auto',
                padding: '6px 10px'
              }}
            >
              Таблица
            </button>
            <button
              className={`dashboard-action-btn`}
              onClick={() => setViewMode('grid')}
              style={{ 
                background: viewMode === 'grid' ? 'var(--paul-black)' : 'var(--paul-white)',
                color: viewMode === 'grid' ? 'var(--paul-white)' : 'var(--paul-black)',
                minWidth: 'auto',
                padding: '6px 10px'
              }}
            >
              Сетка
            </button>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="dashboard-action-btn"
            style={{
              background: 'var(--paul-black)',
              color: 'var(--paul-white)'
            }}
          >
            + Добавить
          </button>
          <button
            onClick={loadUsers}
            className="dashboard-refresh-btn"
            aria-label="Обновить список пользователей"
          >
            <RefreshIcon size={16} />
            <span>Обновить</span>
          </button>
        </div>
      </section>

      {/* Users List */}
      <section className="applications-container">
        <div className="applications-main">
          <div className="applications-header">
            <div>
              <h2 className="applications-title">Пользователи</h2>
              <p className="applications-subtitle">
                {filteredUsers.length} из {users.length} пользователей
              </p>
            </div>
            <div className="select-all-label">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
              <span className="select-all-text">Выбрать все</span>
            </div>
          </div>

          {usersLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div className="loading-title">Загрузка пользователей...</div>
              <div className="loading-subtitle">Пожалуйста, подождите</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">Пользователи не найдены</div>
              <div className="empty-subtitle">
                {searchTerm || statusFilter !== 'all' || userGroupFilter !== 'all'
                  ? 'Попробуйте изменить фильтры поиска' 
                  : 'Пользователи появятся здесь после создания'
                }
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="table-responsive">
              <table className="applications-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                        className="table-checkbox"
                      />
                    </th>
                    <th className="table-header-cell">Пользователь</th>
                    <th className="table-header-cell">Контакт</th>
                    <th className="table-header-cell">Группа</th>
                    <th className="table-header-cell">Статус</th>
                    <th className="table-header-cell">Дата создания</th>
                    <th className="table-header-cell">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="table-row">
                      <td className="table-cell checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(u.id)}
                          onChange={() => handleUserSelect(u.id)}
                          className="table-checkbox"
                        />
                      </td>
                      <td className="table-cell">
                        <div className="applicant-name">
                          {u.name}
                        </div>
                        {u.company_name && (
                          <div className="contact-email">{u.company_name}</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="contact-email">{u.email}</div>
                        {u.phone && (
                          <div className="contact-phone">{u.phone}</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="status-badge">
                          {u.user_type === 'staff' ? 'Сотрудник' : 'Клиент'}
                        </span>
                        {u.user_type === 'staff' && u.staff_role && (
                          <div className="contact-phone">
                            {staffRoleLabels[u.staff_role] || u.staff_role}
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        <span 
                          className={`status-badge status-${u.status}`}
                          style={{ 
                            backgroundColor: u.status === 'active' ? '#10B98120' : u.status === 'inactive' ? '#F59E0B20' : '#EF444420',
                            color: u.status === 'active' ? '#10B981' : u.status === 'inactive' ? '#F59E0B' : '#EF4444'
                          }}
                        >
                          {statusLabels[u.status] || u.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="event-date">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleUserPreview(u)}
                            className="action-button preview-button"
                          >
                            Просмотр
                          </button>
                          <button
                            onClick={() => handleUserEdit(u)}
                            className="action-button edit-button"
                          >
                            Редактировать
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="action-button delete-button"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid-view">
              {filteredUsers.map((u) => (
                <div key={u.id} className="application-card">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(u.id)}
                    onChange={() => handleUserSelect(u.id)}
                    className="card-checkbox"
                  />
                  <div className="card-header">
                    <div className="card-name">
                      {u.name}
                    </div>
                    <div className="card-email">{u.email}</div>
                    <span 
                      className={`card-status status-${u.status}`}
                      style={{ 
                        backgroundColor: u.status === 'active' ? '#10B98120' : u.status === 'inactive' ? '#F59E0B20' : '#EF444420',
                        color: u.status === 'active' ? '#10B981' : u.status === 'inactive' ? '#F59E0B' : '#EF4444'
                      }}
                    >
                      {statusLabels[u.status] || u.status}
                    </span>
                  </div>
                  <div className="card-field">
                    <div className="field-label">Группа</div>
                    <div className="field-value">
                      {u.user_type === 'staff' ? 'Сотрудник' : 'Клиент'}
                    </div>
                  </div>
                  {u.company_name && (
                    <div className="card-field">
                      <div className="field-label">Компания</div>
                      <div className="field-value">
                        {u.company_name}
                      </div>
                    </div>
                  )}
                  <div className="card-footer">
                    <div className="card-date">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => handleUserEdit(u)}
                        className="quick-action-button"
                      >
                        Редактировать
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cards-view">
              {filteredUsers.map((u) => (
                <div key={u.id} className="user-card">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(u.id)}
                    onChange={() => handleUserSelect(u.id)}
                    className="card-checkbox"
                  />
                  <div className="card-header">
                    <div className="card-header-info">
                      <div className="card-name">
                        {u.name}
                      </div>
                      <div className="card-email">{u.email}</div>
                    </div>
                    <span 
                      className={`card-status status-${u.status}`}
                      style={{ 
                        backgroundColor: u.status === 'active' ? '#10B98120' : u.status === 'inactive' ? '#F59E0B20' : '#EF444420',
                        color: u.status === 'active' ? '#10B981' : u.status === 'inactive' ? '#F59E0B' : '#EF4444'
                      }}
                    >
                      {statusLabels[u.status] || u.status}
                    </span>
                  </div>
                  <div className="card-field">
                    <div className="field-label">Группа</div>
                    <div className="field-value">
                      {u.user_type === 'staff' ? 'Сотрудник' : 'Клиент'}
                    </div>
                  </div>
                  {u.company_name && (
                    <div className="card-field">
                      <div className="field-label">Компания</div>
                      <div className="field-value">
                        {u.company_name}
                      </div>
                    </div>
                  )}
                  {u.phone && (
                    <div className="card-field">
                      <div className="field-label">Телефон</div>
                      <div className="field-value">
                        {u.phone}
                      </div>
                    </div>
                  )}
                  <div className="card-footer">
                    <div className="card-date">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('ru-RU') : '—'}
                    </div>
                    <div className="card-actions">
                      <button
                        onClick={() => handleUserEdit(u)}
                        className="quick-action-button"
                      >
                        Редактировать
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Create/Edit User Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingUser(null);
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
                    status: 'active'
                  });
                }}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Имя *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Пароль {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    required={!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Группа *</label>
                  <select
                    value={formData.user_group}
                    onChange={(e) => setFormData({ ...formData, user_group: e.target.value as 'client' | 'staff' })}
                    className="form-select"
                    required
                  >
                    <option value="client">Клиент</option>
                    <option value="staff">Сотрудник</option>
                  </select>
                </div>
              </div>
              {formData.user_group === 'staff' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Роль сотрудника *</label>
                    <select
                      value={formData.staff_role}
                      onChange={(e) => setFormData({ ...formData, staff_role: e.target.value as 'coordinator' | 'observer' })}
                      className="form-select"
                      required
                    >
                      <option value="coordinator">Координатор</option>
                      <option value="observer">Наблюдатель</option>
                    </select>
                  </div>
                </div>
              )}
              {formData.user_group === 'client' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Категория клиента *</label>
                    <select
                      value={formData.client_category}
                      onChange={(e) => setFormData({ ...formData, client_category: e.target.value as 'corporate' | 'one_time' })}
                      className="form-select"
                      required
                    >
                      <option value="corporate">Корпоративный</option>
                      <option value="one_time">Разовый</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Компания</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Должность</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Статус *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="form-select"
                    required
                  >
                    <option value="active">Активный</option>
                    <option value="inactive">Неактивный</option>
                    <option value="suspended">Заблокирован</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Адрес</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="form-textarea"
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingUser(null);
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
                      status: 'active'
                    });
                  }}
                  className="action-button"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingUser ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

