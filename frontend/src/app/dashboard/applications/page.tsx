"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { Application } from "../../../types/common";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, isCoordinator } from "../../../utils/authConstants";
import DashboardLayout from "../../../components/DashboardLayout";
import { 
  SearchIcon, 
  FilterIcon, 
  RefreshIcon, 
  EyeIcon,
  FileTextIcon,
  XIcon,
  CheckIcon 
} from "../../../components/Icons";
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

const formatApplicationDate = (value?: string | null): string => {
  if (!value) return '—';
  const normalized = value.includes('T')
    ? value.split('T')[0]
    : value.includes(' ')
      ? value.split(' ')[0]
      : value;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? normalized : date.toLocaleDateString('ru-RU');
};

const formatApplicationTime = (value?: string | null): string => {
  if (!value) return '—';
  if (value.includes('T')) {
    return value.split('T')[1]?.slice(0, 5) || '—';
  }
  if (value.includes(' ')) {
    return value.split(' ')[1]?.slice(0, 5) || '—';
  }
  return value.slice(0, 5);
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
  // Form data removed - not needed in applications page

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
  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, isCoordinator, router);

  // Load applications
  const loadApplications = useCallback(async () => {
    setApplicationsLoading(true);
    try {
      const result = await makeApiRequest<Application[]>('/applications');
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
          await makeApiRequest(`/applications/${id}/status`, {
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
      const result = await makeApiRequest(`/applications/${id}/status`, {
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
      const result = await makeApiRequest(`/applications/${id}`, {
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
      const result = await makeApiRequest('/applications/export', {
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
      {/* Stats Cards */}
      <section className="dashboard-kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <FileTextIcon size={16} className="dashboard-kpi-icon" />
            <span className="dashboard-kpi-label">Всего заявок</span>
          </div>
          <div className="dashboard-kpi-value">{applications.length}</div>
          <div className="dashboard-kpi-subtitle">
            Всего в системе
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('new')}
        >
          <div className="dashboard-kpi-header">
            <FileTextIcon size={16} className="dashboard-kpi-icon" style={{ color: '#3B82F6' }} />
            <span className="dashboard-kpi-label">Новые</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#3B82F6' }}>{applications.filter(a => a.status === 'new').length}</div>
          <div className="dashboard-kpi-subtitle">
            Требуют обработки
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
            <span className="dashboard-kpi-label">В обработке</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>{applications.filter(a => a.status === 'processing').length}</div>
          <div className="dashboard-kpi-subtitle">
            В работе
          </div>
        </div>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => setStatusFilter('approved')}
        >
          <div className="dashboard-kpi-header">
            <CheckIcon size={16} className="dashboard-kpi-icon" style={{ color: '#10B981' }} />
            <span className="dashboard-kpi-label">Одобренные</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>{applications.filter(a => a.status === 'approved').length}</div>
          <div className="dashboard-kpi-subtitle">
            Успешно обработаны
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section 
        className="dashboard-quick-actions"
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <div className="dashboard-quick-actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          {quickFilters.map(filter => (
            <button
              key={filter.id}
              className="dashboard-quick-action-link"
              onClick={() => setStatusFilter(filter.id as any)}
              style={{ 
                background: statusFilter === filter.id ? filter.color : 'var(--paul-white)',
                color: statusFilter === filter.id ? 'var(--paul-white)' : 'var(--paul-black)',
                borderColor: filter.color,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)'
              }}
            >
              {filter.label}
              {quickFilterCounts[filter.id] > 0 && (
                <span style={{
                  padding: '2px 8px',
                  background: statusFilter === filter.id ? 'rgba(255,255,255,0.3)' : `${filter.color}20`,
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {quickFilterCounts[filter.id]}
                </span>
              )}
            </button>
          ))}
          <button
            className="dashboard-quick-action-link"
            onClick={() => setStatusFilter('all')}
            style={{
              background: statusFilter === 'all' ? 'var(--paul-black)' : 'var(--paul-white)',
              color: statusFilter === 'all' ? 'var(--paul-white)' : 'var(--paul-gray)',
              borderColor: 'var(--paul-gray)'
            }}
          >
            Все заявки
          </button>
        </div>
      </section>

      {/* Enhanced Filters */}
      <section className="dashboard-filters" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-search-container">
          <SearchIcon size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder="Поиск по имени, email, компании..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
            aria-label="Поиск заявок"
          />
        </div>
        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label="Сортировка"
          >
            <option value="date">По дате</option>
            <option value="name">По имени</option>
            <option value="status">По статусу</option>
            <option value="amount">По сумме</option>
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
          {selectedApplications.size > 0 && (
            <>
              <span style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--paul-gray)',
                padding: '4px 8px',
                background: '#F0F9FF',
                borderRadius: '12px',
                fontWeight: 600
              }}>
                Выбрано: {selectedApplications.size}
              </span>
              <button
                onClick={() => handleMassAction({ type: 'status_change', status: 'approved' })}
                className="dashboard-action-btn"
                style={{ 
                  borderColor: '#10B981',
                  color: '#10B981'
                }}
              >
                <CheckIcon size={14} />
                <span>Одобрить</span>
              </button>
              <button
                onClick={() => handleMassAction({ type: 'status_change', status: 'rejected' })}
                className="dashboard-action-btn"
                style={{ 
                  borderColor: '#EF4444',
                  color: '#EF4444'
                }}
              >
                <XIcon size={14} />
                <span>Отклонить</span>
              </button>
            </>
          )}
          <button
            onClick={loadApplications}
            className="dashboard-refresh-btn"
            aria-label="Обновить список заявок"
          >
            <RefreshIcon size={16} />
            <span>Обновить</span>
          </button>
        </div>
      </section>

      {/* Applications List */}
      <section className="dashboard-table-container">
        <div className="dashboard-table-header">
          <div>
            <h2 className="dashboard-table-title">Заявки клиентов</h2>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--paul-gray)', 
              marginTop: 'var(--space-1)' 
            }}>
              Показано {filteredApplications.length} из {applications.length} заявок
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              color: 'var(--paul-gray)'
            }}>
              <input
                type="checkbox"
                checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                onChange={handleSelectAll}
                style={{ cursor: 'pointer' }}
              />
              <span>Выбрать все</span>
            </label>
            <div style={{ 
              display: 'flex', 
              gap: 'var(--space-2)',
              borderLeft: '1px solid var(--paul-border)',
              paddingLeft: 'var(--space-3)'
            }}>
              <button
                className={`dashboard-action-btn ${viewMode === 'table' ? '' : ''}`}
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
                className={`dashboard-action-btn ${viewMode === 'grid' ? '' : ''}`}
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
              <button
                className={`dashboard-action-btn ${viewMode === 'kanban' ? '' : ''}`}
                onClick={() => setViewMode('kanban')}
                style={{ 
                  background: viewMode === 'kanban' ? 'var(--paul-black)' : 'var(--paul-white)',
                  color: viewMode === 'kanban' ? 'var(--paul-white)' : 'var(--paul-black)',
                  minWidth: 'auto',
                  padding: '6px 10px'
                }}
              >
                Канбан
              </button>
            </div>
          </div>
        </div>

        {applicationsLoading ? (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center',
            color: 'var(--paul-gray)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f1f5f9',
              borderTop: '4px solid var(--paul-black)',
              borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'spin 1.2s linear infinite'
            }}></div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: 'var(--paul-black)',
              marginBottom: '8px'
            }}>
              Загрузка заявок...
            </div>
            <div style={{ fontSize: '14px', color: 'var(--paul-gray)' }}>
              Пожалуйста, подождите
            </div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center',
            color: 'var(--paul-gray)'
          }}>
            <div style={{ 
              fontSize: '64px', 
              marginBottom: '20px', 
              opacity: 0.6 
            }}>
              📋
            </div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 600, 
              color: 'var(--paul-black)',
              marginBottom: '8px'
            }}>
              Заявки не найдены
            </div>
            <div style={{ fontSize: '14px', color: 'var(--paul-gray)' }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Попробуйте изменить фильтры поиска' 
                : 'Заявки появятся здесь после создания'
              }
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="responsive-table">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedApplications.size === filteredApplications.length && filteredApplications.length > 0}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th>Заявитель</th>
                  <th>Контакты</th>
                  <th>Мероприятие</th>
                  <th>Статус</th>
                  <th>Сумма</th>
                  <th>Дата</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedApplications.has(app.id)}
                        onChange={() => handleApplicationSelect(app.id)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--paul-black)' }}>
                        {app.first_name} {app.last_name || ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--paul-black)' }}>{app.email}</div>
                      {app.phone && (
                        <div style={{ color: 'var(--paul-gray)', fontSize: '12px' }}>{app.phone}</div>
                      )}
                    </td>
                    <td>
                      {app.event_address ? (
                        <div style={{ color: 'var(--paul-black)', fontSize: '13px' }}>
                          {app.event_address}
                        </div>
                      ) : (
                        <div style={{ color: 'var(--paul-gray)', fontSize: '12px', fontStyle: 'italic' }}>
                          Не указано
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="dashboard-status-badge">
                        {statusLabels[app.status as keyof typeof statusLabels]}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--paul-black)' }}>
                        {calculateTotalAmount(app.cart_items) ? `₼${calculateTotalAmount(app.cart_items).toLocaleString()}` : '—'}
                      </div>
                    </td>
                    <td>
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <button
                          onClick={() => handleApplicationPreview(app)}
                          className="dashboard-action-btn"
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          <EyeIcon size={12} />
                          <span>Просмотр</span>
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/orders/create?fromApplication=${app.id}`)}
                          className="dashboard-action-btn"
                          style={{ 
                            fontSize: '11px', 
                            padding: '4px 8px',
                            background: '#10B981',
                            color: 'white',
                            borderColor: '#10B981'
                          }}
                        >
                          <FileTextIcon size={12} />
                          <span>Создать заказ</span>
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
      </section>

      {/* Mass Actions Panel */}
      {showMassActions && massAction && (
        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-4)',
          background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid var(--paul-border)',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <h3 style={{
            marginBottom: 'var(--space-3)',
            fontSize: 'var(--text-base)',
            fontWeight: 700,
            color: 'var(--paul-black)'
          }}>
            Массовые действия
            <span style={{
              color: '#3B82F6',
              marginLeft: 'var(--space-2)'
            }}>
              ({selectedApplications.size} выбрано)
            </span>
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <button
              onClick={executeMassAction}
              className="dashboard-action-btn"
              style={{ 
                background: '#10B981',
                color: 'var(--paul-white)',
                borderColor: '#10B981'
              }}
            >
              Выполнить
            </button>
            <button
              onClick={() => setShowMassActions(false)}
              className="dashboard-action-btn"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Slide-over application preview */}
      {isSidebarOpen && selectedApplication && (
        <>
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 90
            }}
          />
          <aside
            role="dialog"
            aria-label="Просмотр заявки"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '430px',
              maxWidth: '95vw',
              background: '#FFFCF8',
              boxShadow: '-18px 0 32px rgba(0,0,0,0.18)',
              zIndex: 91,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--paul-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--paul-black)' }}>
                  {selectedApplication.first_name} {selectedApplication.last_name || ''}
                </div>
                <div style={{ marginTop: 4, fontSize: '13px', color: 'var(--paul-gray)' }}>
                  Заявка №{selectedApplication.id}
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="dashboard-action-btn"
                aria-label="Закрыть просмотр заявки"
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <span style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: `${statusColors[selectedApplication.status] ?? '#1F2937'}15`,
                  color: statusColors[selectedApplication.status] ?? '#1F2937'
                }}>
                  {statusLabels[selectedApplication.status as keyof typeof statusLabels]}
                </span>
                <button
                  onClick={() => {
                    setIsSidebarOpen(false);
                    router.push(`/dashboard/orders/create?fromApplication=${selectedApplication.id}`);
                  }}
                  className="dashboard-action-btn"
                  style={{
                    borderColor: '#10B981',
                    color: '#fff',
                    background: '#10B981'
                  }}
                >
                  Создать заказ
                </button>
              </div>

              <div style={{ display: 'grid', rowGap: 16 }}>
                <section style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Контактные данные
                  </h4>
                  <div style={{ display: 'grid', rowGap: 8 }}>
                    <div>
                      <div className="field-label">Email</div>
                      <div className="field-value">{selectedApplication.email || '—'}</div>
                    </div>
                    <div>
                      <div className="field-label">Телефон</div>
                      <div className="field-value">{selectedApplication.phone || '—'}</div>
                    </div>
                    {selectedApplication.company_name && (
                      <div>
                        <div className="field-label">Компания</div>
                        <div className="field-value">{selectedApplication.company_name}</div>
                      </div>
                    )}
                    {selectedApplication.contact_person && (
                      <div>
                        <div className="field-label">Контактное лицо</div>
                        <div className="field-value">{selectedApplication.contact_person}</div>
                      </div>
                    )}
                  </div>
                </section>

                <section style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Детали мероприятия
                  </h4>
                  <div style={{ display: 'grid', rowGap: 8 }}>
                    <div>
                      <div className="field-label">Адрес</div>
                      <div className="field-value">{selectedApplication.event_address || '—'}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                      <div>
                        <div className="field-label">Дата</div>
                        <div className="field-value">{formatApplicationDate(selectedApplication.event_date)}</div>
                      </div>
                      <div>
                        <div className="field-label">Время</div>
                        <div className="field-value">{formatApplicationTime(selectedApplication.event_time)}</div>
                      </div>
                    </div>
                    {selectedApplication.message && (
                      <div>
                        <div className="field-label">Комментарий клиента</div>
                        <div className="field-value">{selectedApplication.message}</div>
                      </div>
                    )}
                  </div>
                </section>

                {Array.isArray(selectedApplication.cart_items) && selectedApplication.cart_items.length > 0 && (
                  <section style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Выбранные позиции
                    </h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {selectedApplication.cart_items.map((item, index) => (
                        <li key={`${item.id ?? index}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#0f172a', fontWeight: 600 }}>
                          <span style={{ maxWidth: '70%' }}>
                            {item.name} ×{item.quantity ?? 1}
                          </span>
                          <span style={{ color: '#475569' }}>
                            {item.price ? `₼${Number(item.price).toLocaleString('ru-RU')}` : '—'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Системная информация
                  </h4>
                  <div style={{ display: 'grid', rowGap: 8 }}>
                    <div>
                      <div className="field-label">Создана</div>
                      <div className="field-value">
                        {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleString('ru-RU') : '—'}
                      </div>
                    </div>
                    {selectedApplication.processed_at && (
                      <div>
                        <div className="field-label">Обработана</div>
                        <div className="field-value">
                          {new Date(selectedApplication.processed_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    )}
                    {selectedApplication.coordinator && (
                      <div>
                        <div className="field-label">Координатор</div>
                        <div className="field-value">{selectedApplication.coordinator.name}</div>
                      </div>
                    )}
                    {selectedApplication.coordinator_comment && (
                      <div>
                        <div className="field-label">Комментарий координатора</div>
                        <div className="field-value">{selectedApplication.coordinator_comment}</div>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--paul-border)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12
            }}>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="dashboard-action-btn"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  router.push(`/dashboard/orders/create?fromApplication=${selectedApplication.id}`);
                }}
                className="dashboard-action-btn"
                style={{
                  background: 'var(--paul-black)',
                  color: '#fff',
                  borderColor: 'var(--paul-black)'
                }}
              >
                Создать заказ
              </button>
            </div>
          </aside>
        </>
      )}
    </DashboardLayout>
  );
}

