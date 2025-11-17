"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';
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
  user_type: 'client' | 'staff';
  staff_role: 'coordinator' | 'observer';
  client_category: 'corporate' | 'one_time';
  company_name: string;
  position: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
}

// Labels will be retrieved from translations

export default function UsersPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  
  const staffRoleLabels: Record<string, string> = {
    coordinator: t('users.roles.coordinator'),
    observer: t('users.roles.observer')
  };

  const clientCategoryLabels: Record<string, string> = {
    corporate: t('users.corporate'),
    one_time: t('users.oneTime')
  };

  const statusLabels: Record<string, string> = {
    active: t('users.active'),
    inactive: t('users.inactive'),
    suspended: t('users.suspended')
  };

  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [userTypeFilter, setUserTypeFilter] = useState<"all" | "client" | "staff">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "cards">("table");
  const [sortBy, setSortBy] = useState<"name" | "email" | "created_at" | "status">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    user_type: 'client',
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
      const result = await makeApiRequest<User[]>('/users');
      if (result.success) {
        setUsers(extractApiData(result.data || []));
      } else {
        console.error(t('users.loadError'), handleApiError(result as any));
      }
    } catch (error) {
      console.error(t('users.loadError'), error);
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
    if (userTypeFilter !== "all") {
      filtered = filtered.filter(u => u.user_type === userTypeFilter);
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
  }, [users, searchTerm, statusFilter, userTypeFilter, sortBy, sortOrder]);

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
      user_type: user.user_type || 'client',
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
        const result = await makeApiRequest(`/users/${editingUser.id}`, {
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
            user_type: 'client',
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
        const result = await makeApiRequest('/users', {
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
            user_type: 'client',
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
    if (!confirm(t('users.confirmDelete'))) return;

    try {
      const result = await makeApiRequest(`/users/${id}`, {
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
      const result = await makeApiRequest(`/users/${id}/status`, {
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
        <div className="loading-title">{t('common.loading')}</div>
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
            <span className="dashboard-kpi-label">{t('users.totalUsers')}</span>
          </div>
          <div className="dashboard-kpi-value">{users.length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('dashboard.inSystem')}
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
            <span className="dashboard-kpi-label">{t('users.active')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>{users.filter(u => u.status === 'active').length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('users.activeUsers')}
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setUserTypeFilter('client')}
        >
          <div className="dashboard-kpi-header">
            <UsersIcon size={16} className="dashboard-kpi-icon" style={{ color: '#3B82F6' }} />
            <span className="dashboard-kpi-label">{t('users.clients')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#3B82F6' }}>{users.filter(u => u.user_type === 'client').length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('users.registered')}
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setUserTypeFilter('staff')}
        >
          <div className="dashboard-kpi-header">
            <UsersIcon size={16} className="dashboard-kpi-icon" style={{ color: '#F59E0B' }} />
            <span className="dashboard-kpi-label">{t('users.staff')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>{users.filter(u => u.user_type === 'staff').length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('users.coordinatorsAndObservers')}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="dashboard-filters" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-search-container">
          <SearchIcon size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder={t('users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
            aria-label={t('users.title')}
          />
        </div>
        
        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label={t('common.filter')}
          >
            <option value="all">{t('users.allStatuses')}</option>
            <option value="active">{t('users.activeUsers')}</option>
            <option value="inactive">{t('users.inactiveUsers')}</option>
            <option value="suspended">{t('users.blocked')}</option>
          </select>
        </div>

        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={userTypeFilter}
            onChange={(e) => setUserTypeFilter(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label={t('common.filter')}
          >
            <option value="all">{t('users.allGroups')}</option>
            <option value="client">{t('users.clients')}</option>
            <option value="staff">{t('users.staff')}</option>
          </select>
        </div>

        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label={t('common.sort')}
          >
            <option value="name">{t('users.sortByName')}</option>
            <option value="email">{t('users.sortByEmail')}</option>
            <option value="created_at">{t('users.sortByDate')}</option>
            <option value="status">{t('users.sortByStatus')}</option>
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
              {t('users.selected')}: {selectedUsers.size}
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
              {t('users.viewTable')}
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
              {t('users.viewGrid')}
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
            + {t('users.add')}
          </button>
          <button
            onClick={loadUsers}
            className="dashboard-refresh-btn"
            aria-label={t('users.refreshList')}
          >
            <RefreshIcon size={16} />
            <span>{t('users.refresh')}</span>
          </button>
        </div>
      </section>

      {/* Users List */}
      <section className="applications-container">
        <div className="applications-main">
          <div className="applications-header">
            <div>
              <h2 className="applications-title">{t('users.title')}</h2>
              <p className="applications-subtitle">
                {t('users.showing', { current: filteredUsers.length, total: users.length })}
              </p>
            </div>
            <div className="select-all-label">
              <input
                type="checkbox"
                checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
              <span className="select-all-text">{t('users.selectAll')}</span>
            </div>
          </div>

          {usersLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div className="loading-title">{t('users.loadingUsers')}</div>
              <div className="loading-subtitle">{t('common.pleaseWait')}</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">{t('users.usersNotFound')}</div>
              <div className="empty-subtitle">
                {searchTerm || statusFilter !== 'all' || userTypeFilter !== 'all'
                  ? t('users.tryChangingFilters')
                  : t('users.createFirst')
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
                    <th className="table-header-cell">{t('users.user')}</th>
                    <th className="table-header-cell">{t('users.contact')}</th>
                    <th className="table-header-cell">{t('users.group')}</th>
                    <th className="table-header-cell">{t('users.status')}</th>
                    <th className="table-header-cell">{t('users.createdAt')}</th>
                    <th className="table-header-cell">{t('users.actions')}</th>
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
                          {u.user_type === 'staff' ? t('users.staff') : t('users.client')}
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
                            {t('common.view')}
                          </button>
                          <button
                            onClick={() => handleUserEdit(u)}
                            className="action-button edit-button"
                          >
                            {t('users.edit')}
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="action-button delete-button"
                          >
                            {t('users.delete')}
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
                    <div className="field-label">{t('users.group')}</div>
                    <div className="field-value">
                      {u.user_type === 'staff' ? t('users.staff') : t('users.client')}
                    </div>
                  </div>
                  {u.company_name && (
                    <div className="card-field">
                      <div className="field-label">{t('common.company')}</div>
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
                        {t('users.edit')}
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
                    <div className="field-label">{t('users.group')}</div>
                    <div className="field-value">
                      {u.user_type === 'staff' ? t('users.staff') : t('users.client')}
                    </div>
                  </div>
                  {u.company_name && (
                    <div className="card-field">
                      <div className="field-label">{t('common.company')}</div>
                      <div className="field-value">
                        {u.company_name}
                      </div>
                    </div>
                  )}
                  {u.phone && (
                    <div className="card-field">
                      <div className="field-label">{t('common.phone')}</div>
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
                        {t('users.edit')}
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
                {editingUser ? t('users.editUser') : t('users.addUser')}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingUser(null);
                  setFormData({
                    name: '',
                    email: '',
                    password: '',
                    user_type: 'client',
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
                  <label className="form-label">{t('users.name')} *</label>
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
                  <label className="form-label">{t('users.password')} {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    required={!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('users.group')} *</label>
                  <select
                    value={formData.user_type}
                    onChange={(e) => setFormData({ ...formData, user_type: e.target.value as 'client' | 'staff' })}
                    className="form-select"
                    required
                  >
                    <option value="client">{t('users.client')}</option>
                    <option value="staff">{t('users.staff')}</option>
                  </select>
                </div>
              </div>
              {formData.user_type === 'staff' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('users.role')} *</label>
                    <select
                      value={formData.staff_role}
                      onChange={(e) => setFormData({ ...formData, staff_role: e.target.value as 'coordinator' | 'observer' })}
                      className="form-select"
                      required
                    >
                      <option value="coordinator">{t('users.roles.coordinator')}</option>
                      <option value="observer">{t('users.roles.observer')}</option>
                    </select>
                  </div>
                </div>
              )}
              {formData.user_type === 'client' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('users.clientCategory')} *</label>
                    <select
                      value={formData.client_category}
                      onChange={(e) => setFormData({ ...formData, client_category: e.target.value as 'corporate' | 'one_time' })}
                      className="form-select"
                      required
                    >
                      <option value="corporate">{t('users.corporate')}</option>
                      <option value="one_time">{t('users.oneTime')}</option>
                    </select>
                  </div>
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('common.company')}</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('users.position')}</label>
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
                  <label className="form-label">{t('common.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('users.status')} *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                    className="form-select"
                    required
                  >
                    <option value="active">{t('users.active')}</option>
                    <option value="inactive">{t('users.inactive')}</option>
                    <option value="suspended">{t('users.suspended')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('common.address')}</label>
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
                      user_type: 'client',
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
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="primary-button"
                >
                  {editingUser ? t('users.save') : t('users.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide-over User Preview */}
      {isSidebarOpen && selectedUser && (
        <>
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60 }}
          />
          <aside
            role="dialog"
            aria-label={t('users.viewUser')}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '420px',
              maxWidth: '90vw',
              background: '#FFFCF8',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.12)',
              zIndex: 61,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--paul-border)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--paul-black)' }}>{selectedUser.name}</h3>
              <button onClick={() => setIsSidebarOpen(false)} className="dashboard-action-btn" aria-label={t('common.close')}>
                ×
              </button>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: 8 }}>
                <div>
                  <div className="field-label">Email</div>
                  <div className="field-value">{selectedUser.email}</div>
                </div>
                {selectedUser.phone && (
                  <div>
                    <div className="field-label">{t('common.phone')}</div>
                    <div className="field-value">{selectedUser.phone}</div>
                  </div>
                )}
                {selectedUser.company_name && (
                  <div>
                    <div className="field-label">{t('common.company')}</div>
                    <div className="field-value">{selectedUser.company_name}</div>
                  </div>
                )}
                {selectedUser.position && (
                  <div>
                    <div className="field-label">{t('users.position')}</div>
                    <div className="field-value">{selectedUser.position}</div>
                  </div>
                )}
                <div>
                  <div className="field-label">{t('users.group')}</div>
                  <div className="field-value">{selectedUser.user_type === 'staff' ? t('users.staff') : t('users.client')}</div>
                </div>
                {selectedUser.user_type === 'staff' && selectedUser.staff_role && (
                  <div>
                    <div className="field-label">{t('users.role')}</div>
                    <div className="field-value">{staffRoleLabels[selectedUser.staff_role] || selectedUser.staff_role}</div>
                  </div>
                )}
                <div>
                    <div className="field-label">{t('users.status')}</div>
                  <div className="field-value">{statusLabels[selectedUser.status] || selectedUser.status}</div>
                </div>
                {selectedUser.address && (
                  <div>
                    <div className="field-label">{t('common.address')}</div>
                    <div className="field-value">{selectedUser.address}</div>
                  </div>
                )}
                <div>
                    <div className="field-label">{t('users.created')}</div>
                  <div className="field-value">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('ru-RU') : '—'}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--paul-border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setIsSidebarOpen(false); handleUserEdit(selectedUser); }}
                className="dashboard-action-btn"
              >
                {t('users.edit')}
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="dashboard-action-btn"
              >
                {t('common.close')}
              </button>
            </div>
          </aside>
        </>
      )}
    </DashboardLayout>
  );
}

