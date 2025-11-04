"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { Application } from "../../../types/common";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, isCoordinator } from "../../../utils/authConstants";
import DashboardLayout from "../../../components/DashboardLayout";
import "../../../styles/dashboard.css";

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
const paul = { black: '#1A1A1A', beige: '#EBDCC8', border: '#EDEAE3', gray: '#4A4A4A', white: '#FFFCF8' };
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

// Helper function to calculate total amount from cart items
const calculateTotalAmount = (cartItems: any[] | null | undefined): number => {
  if (!cartItems || !Array.isArray(cartItems)) return 0;
  return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
};

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedApplications, setSelectedApplications] = useState<Set<number>>(new Set());
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "processing" | "approved" | "rejected">("all");
  const [viewMode, setViewMode] = useState<"table" | "grid" | "kanban">("table");
  const [sortBy, setSortBy] = useState<"date" | "name" | "status" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showMassActions, setShowMassActions] = useState(false);
  const [massAction, setMassAction] = useState<MassAction | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<Application | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_group: 'client' as 'client' | 'staff',
    staff_role: 'observer' as 'coordinator' | 'observer',
    client_category: 'corporate' as 'corporate' | 'one_time',
    company_name: '',
    position: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  // Quick filters
  const quickFilters: QuickFilter[] = [
    {
      id: 'new',
      label: 'Новые',
      filter: (app) => app.status === 'new',
      color: '#3B82F6'
    },
    {
      id: 'processing',
      label: 'В обработке',
      filter: (app) => app.status === 'processing',
      color: '#F59E0B'
    },
    {
      id: 'approved',
      label: 'Одобренные',
      filter: (app) => app.status === 'approved',
      color: '#10B981'
    },
    {
      id: 'rejected',
      label: 'Отклоненные',
      filter: (app) => app.status === 'rejected',
      color: '#EF4444'
    }
  ];

  // Auth guard
  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', position: '', staff_role: '' }, isCoordinator, router);

  // Load applications
  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const result = await makeApiRequest<Application[]>('applications');
      if (result.success) {
        setApplications(extractApiData(result.data || []));
      } else {
        console.error('Ошибка загрузки заявок:', handleApiError(result as any));
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
    } finally {
      setApplicationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated, loadApplications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        app.first_name?.toLowerCase().includes(q) ||
        (app.last_name && app.last_name.toLowerCase().includes(q)) ||
        app.email?.toLowerCase().includes(q) ||
        app.company_name?.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'amount':
          aValue = calculateTotalAmount(a.cart_items || []);
          bValue = calculateTotalAmount(b.cart_items || []);
          break;
        case 'date':
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
  }, [applications, searchTerm, statusFilter, sortBy, sortOrder]);

  // Quick filter counts
  const quickFilterCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    quickFilters.forEach(filter => {
      counts[filter.id] = applications.filter(filter.filter).length;
    });
    return counts;
  }, [applications, quickFilters]);

  // Handle application selection
  const handleApplicationSelect = (id: number) => {
    const newSelected = new Set(selectedApplications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedApplications(newSelected);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedApplications.size === filteredApplications.length) {
      setSelectedApplications(new Set());
    } else {
      setSelectedApplications(new Set(filteredApplications.map(app => app.id)));
    }
  };

  // Handle application preview
  const handleApplicationPreview = (application: Application) => {
    setSelectedApplication(application);
    setIsSidebarOpen(true);
  };

  // Handle mass actions
  const handleMassAction = (action: MassAction) => {
    setMassAction(action);
    setShowMassActions(true);
  };

  // Handle mass action execution
  const executeMassAction = async () => {
    if (!massAction || selectedApplications.size === 0) return;

    try {
      const applicationIds = Array.from(selectedApplications);
      
      if (massAction.type === 'status_change' && massAction.status) {
        // Update status for selected applications
        for (const id of applicationIds) {
          await makeApiRequest(`applications/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: massAction.status })
          });
        }
      }

      // Reload applications
      await loadApplications();
      setSelectedApplications(new Set());
      setShowMassActions(false);
      setMassAction(null);
    } catch (error) {
      console.error('Ошибка выполнения массового действия:', error);
    }
  };

  // Handle application status change
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const result = await makeApiRequest(`applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (result.success) {
        await loadApplications();
      } else {
        console.error('Ошибка изменения статуса:', handleApiError(result as any));
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  // Handle application delete
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

    try {
      const result = await makeApiRequest(`applications/${id}`, {
        method: 'DELETE'
      });

      if (result.success) {
        await loadApplications();
      } else {
        console.error('Ошибка удаления заявки:', handleApiError(result as any));
      }
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const result = await makeApiRequest('applications/export', {
        method: 'POST',
        body: JSON.stringify({ 
          ids: Array.from(selectedApplications),
          format: 'excel'
        })
      });

      if (result.success) {
        // Download file
        const blob = new Blob([result.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
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
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Заявки</h1>
        <p className="page-description">Управление заявками клиентов</p>
      </div>

      {/* Stats Cards */}
      <section className="dashboard-kpi-grid">
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <span className="dashboard-kpi-icon">📋</span>
            <span className="dashboard-kpi-label">Всего заявок</span>
          </div>
          <div className="dashboard-kpi-value">{applications.length}</div>
          <div className="dashboard-kpi-subtitle">
            Всего в системе
          </div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <span className="dashboard-kpi-icon status-new">🆕</span>
            <span className="dashboard-kpi-label">Новые</span>
          </div>
          <div className="dashboard-kpi-value status-new">{applications.filter(a => a.status === 'new').length}</div>
          <div className="dashboard-kpi-subtitle">
            Требуют обработки
          </div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <span className="dashboard-kpi-icon status-processing">⏳</span>
            <span className="dashboard-kpi-label">В обработке</span>
          </div>
          <div className="dashboard-kpi-value status-processing">{applications.filter(a => a.status === 'processing').length}</div>
          <div className="dashboard-kpi-subtitle">
            В работе
          </div>
        </div>
        <div className="dashboard-kpi-card">
          <div className="dashboard-kpi-header">
            <span className="dashboard-kpi-icon status-approved">✅</span>
            <span className="dashboard-kpi-label">Одобренные</span>
          </div>
          <div className="dashboard-kpi-value status-approved">{applications.filter(a => a.status === 'approved').length}</div>
          <div className="dashboard-kpi-subtitle">
            Успешно обработаны
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="quick-filters">
        <div className="quick-filters-content">
          <h3 className="quick-filters-title">Быстрые фильтры</h3>
          <div className="quick-filters-buttons">
            {quickFilters.map(filter => (
              <button
                key={filter.id}
                className={`quick-filter-button ${statusFilter === filter.id ? 'active' : ''} ${quickFilterCounts[filter.id] > 0 ? 'has-count' : ''}`}
                onClick={() => setStatusFilter(filter.id as any)}
                style={{ '--filter-color': filter.color } as React.CSSProperties}
              >
                {filter.label}
                {quickFilterCounts[filter.id] > 0 && (
                  <span className="filter-count">{quickFilterCounts[filter.id]}</span>
                )}
              </button>
            ))}
            <button
              className="clear-filters-button"
              onClick={() => setStatusFilter('all')}
            >
              Сбросить
            </button>
          </div>
        </div>
      </section>

      {/* Enhanced Filters */}
      <section className="enhanced-filters">
        <div className="search-row">
          <input
            type="text"
            placeholder="Поиск по имени, email, компании..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="view-toggle">
            <button
              className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Таблица
            </button>
            <button
              className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Сетка
            </button>
            <button
              className={`view-button ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              Канбан
            </button>
          </div>
        </div>
        <div className="filter-row">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">Все статусы</option>
            <option value="new">Новые</option>
            <option value="processing">В обработке</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="filter-select"
          >
            <option value="date">По дате</option>
            <option value="name">По имени</option>
            <option value="status">По статусу</option>
            <option value="amount">По сумме</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="action-button"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
          <div className="mass-actions">
            <span className="selected-count">
              Выбрано: {selectedApplications.size}
            </span>
            {selectedApplications.size > 0 && (
              <>
                <button
                  onClick={() => handleMassAction({ type: 'status_change', status: 'approved' })}
                  className="export-button"
                >
                  Одобрить
                </button>
                <button
                  onClick={() => handleMassAction({ type: 'status_change', status: 'rejected' })}
                  className="actions-button"
                >
                  Отклонить
                </button>
                <button
                  onClick={handleExport}
                  className="export-button"
                >
                  Экспорт
                </button>
              </>
            )}
            <button
              onClick={loadApplications}
              className="refresh-button"
            >
              Обновить
            </button>
          </div>
        </div>
      </section>

      {/* Applications List */}
      <section className="applications-container">
        <div className="applications-main">
          <div className="applications-header">
            <div>
              <h2 className="applications-title">Заявки</h2>
              <p className="applications-subtitle">
                {filteredApplications.length} из {applications.length} заявок
              </p>
            </div>
            <div className="select-all-label">
              <input
                type="checkbox"
                checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                onChange={handleSelectAll}
                className="select-all-checkbox"
              />
              <span className="select-all-text">Выбрать все</span>
            </div>
          </div>

          {applicationsLoading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <div className="loading-title">Загрузка заявок...</div>
              <div className="loading-subtitle">Пожалуйста, подождите</div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">Заявки не найдены</div>
              <div className="empty-subtitle">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Попробуйте изменить фильтры поиска' 
                  : 'Заявки появятся здесь после создания'
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
                        checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                        onChange={handleSelectAll}
                        className="table-checkbox"
                      />
                    </th>
                    <th className="table-header-cell">Заявитель</th>
                    <th className="table-header-cell">Контакт</th>
                    <th className="table-header-cell">Мероприятие</th>
                    <th className="table-header-cell">Статус</th>
                    <th className="table-header-cell">Сумма</th>
                    <th className="table-header-cell">Дата</th>
                    <th className="table-header-cell">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id} className="table-row">
                      <td className="table-cell checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(app.id)}
                          onChange={() => handleApplicationSelect(app.id)}
                          className="table-checkbox"
                        />
                      </td>
                      <td className="table-cell">
                        <div className="applicant-name">
                          {app.first_name} {app.last_name || ''}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="contact-email">{app.email}</div>
                        {app.phone && (
                          <div className="contact-phone">{app.phone}</div>
                        )}
                      </td>
                      <td className="table-cell">
                        {app.event_address ? (
                          <div className="event-address">{app.event_address}</div>
                        ) : (
                          <div className="no-event">Не указано</div>
                        )}
                      </td>
                      <td className="table-cell">
                        <span 
                          className={`status-badge status-${app.status}`}
                          style={{ 
                            backgroundColor: `${statusColors[app.status as keyof typeof statusColors]}20`,
                            color: statusColors[app.status as keyof typeof statusColors]
                          }}
                        >
                          {statusLabels[app.status as keyof typeof statusLabels]}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="amount-value">
                          {calculateTotalAmount(app.cart_items) ? `₽${calculateTotalAmount(app.cart_items).toLocaleString()}` : '—'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="event-date">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApplicationPreview(app)}
                            className="action-button preview-button"
                          >
                            Просмотр
                          </button>
                          <button
                            onClick={() => handleStatusChange(app.id, 'processing')}
                            className="action-button edit-button"
                          >
                            Обработать
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
              {filteredApplications.map((app) => (
                <div key={app.id} className="application-card">
                  <input
                    type="checkbox"
                    checked={selectedApplications.has(app.id)}
                    onChange={() => handleApplicationSelect(app.id)}
                    className="card-checkbox"
                  />
                  <div className="card-header">
                    <div className="card-name">
                      {app.first_name} {app.last_name || ''}
                    </div>
                    <div className="card-email">{app.email}</div>
                    <span 
                      className={`card-status status-${app.status}`}
                      style={{ 
                        backgroundColor: `${statusColors[app.status as keyof typeof statusColors]}20`,
                        color: statusColors[app.status as keyof typeof statusColors]
                      }}
                    >
                      {statusLabels[app.status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <div className="card-field">
                    <div className="field-label">Мероприятие</div>
                    <div className="field-value">
                      {app.event_address || 'Не указано'}
                    </div>
                  </div>
                  <div className="card-field">
                    <div className="field-label">Сумма</div>
                    <div className="field-value">
                      {calculateTotalAmount(app.cart_items) ? `₽${calculateTotalAmount(app.cart_items).toLocaleString()}` : '—'}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-date">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                    </div>
                    <div className="card-amount">
                      {calculateTotalAmount(app.cart_items) ? `₽${calculateTotalAmount(app.cart_items).toLocaleString()}` : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="kanban-view">
              {quickFilters.map(filter => (
                <div key={filter.id} className="kanban-column">
                  <div className="kanban-header">
                    <div className="kanban-title">{filter.label}</div>
                    <div className="kanban-count">
                      {filteredApplications.filter(filter.filter).length}
                    </div>
                  </div>
                  <div className="kanban-applications">
                    {filteredApplications.filter(filter.filter).map(app => (
                      <div key={app.id} className="kanban-card">
                        <input
                          type="checkbox"
                          checked={selectedApplications.has(app.id)}
                          onChange={() => handleApplicationSelect(app.id)}
                          className="kanban-checkbox"
                        />
                        <div className="kanban-card-content">
                          <div className="kanban-name">
                            {app.first_name} {app.last_name || ''}
                          </div>
                          <div className="kanban-email">{app.email}</div>
                          {app.event_address && (
                            <div className="kanban-event">{app.event_address}</div>
                          )}
                          <div className="kanban-footer">
                            <div className="kanban-date">
                              {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                            </div>
                            <div className="kanban-amount">
                              {calculateTotalAmount(app.cart_items) ? `₽${calculateTotalAmount(app.cart_items).toLocaleString()}` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredApplications.filter(filter.filter).length === 0 && (
                      <div className="kanban-empty">Нет заявок</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mass Actions Panel */}
      {showMassActions && massAction && (
        <div className="mass-actions-panel">
          <h3 className="mass-actions-title">
            Массовые действия
            <span className="selected-count-highlight">
              ({selectedApplications.size} выбрано)
            </span>
          </h3>
          <div className="mass-actions-buttons">
            <button
              onClick={executeMassAction}
              className="reject-button"
            >
              Выполнить
            </button>
            <button
              onClick={() => setShowMassActions(false)}
              className="close-button"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

