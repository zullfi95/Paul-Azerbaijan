"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useAuth } from "../../../contexts/AuthContext";
import { Application } from "../../../types/common";
import { makeApiRequest, extractApiData, handleApiError } from "../../../utils/apiHelpers";
import { useAuthGuard, isCoordinator } from "../../../utils/authConstants";
import { useDebounce } from "../../../utils/useDebounce";
import { useToast } from "../../../components/ui/Toast";
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

// Status labels will be retrieved from translations

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
// Мемоизированная версия будет создана внутри компонента
const calculateTotalAmountRaw = (cartItems: any[] | null | undefined): number => {
  if (!cartItems || !Array.isArray(cartItems)) return 0;
  return cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
};

export default function ApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const { showToast } = useToast();
  
  const statusLabels = {
    new: t('applications.new'),
    processing: t('applications.processing'),
    approved: t('applications.approvedStatus'),
    rejected: t('applications.rejectedStatus')
  };

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
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;
  
  // Debounced search для производительности
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Мемоизированная функция для расчета суммы
  const calculateTotalAmount = useCallback((cartItems: any[] | null | undefined): number => {
    return calculateTotalAmountRaw(cartItems);
  }, []);
  
  // Мемоизированный кэш сумм для каждой заявки
  const applicationAmounts = useMemo(() => {
    const amounts = new Map<number, number>();
    applications.forEach(app => {
      amounts.set(app.id, calculateTotalAmount(app.cart_items));
    });
    return amounts;
  }, [applications, calculateTotalAmount]);

  // Quick filters
  const quickFilters: QuickFilter[] = [
    {
      id: 'new',
      label: t('applications.new'),
      filter: (app) => app.status === 'new',
      color: '#3B82F6'
    },
    {
      id: 'processing',
      label: t('applications.processing'),
      filter: (app) => app.status === 'processing',
      color: '#F59E0B'
    },
    {
      id: 'approved',
      label: t('applications.approved'),
      filter: (app) => app.status === 'approved',
      color: '#10B981'
    },
    {
      id: 'rejected',
      label: t('applications.rejected'),
      filter: (app) => app.status === 'rejected',
      color: '#EF4444'
    }
  ];

  // Auth guard
  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, isCoordinator, router);

  // Load applications with pagination
  const loadApplications = useCallback(async (page: number) => {
    setApplicationsLoading(true);
    try {
      const result = await makeApiRequest<{ data: Application[]; current_page?: number; last_page?: number; total?: number }>(
        `/applications?page=${page}&per_page=${itemsPerPage}`
      );
      if (result.success && result.data) {
        const data = result.data;
        setApplications(extractApiData(data.data || []));
        // Обновляем пагинацию только если данные пришли с сервера
        if (data.current_page !== undefined) {
          setCurrentPage(data.current_page);
        }
        if (data.last_page !== undefined) {
          setTotalPages(data.last_page);
        }
        if (data.total !== undefined) {
          setTotalItems(data.total);
        }
      } else {
        const errorMessage = handleApiError(result as any);
        console.error('Ошибка загрузки заявок:', errorMessage);
        showToast({
          type: 'error',
          title: t('common.error'),
          message: t('applications.loadError') || errorMessage
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error);
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('applications.loadError') || 'Ошибка загрузки заявок'
      });
    } finally {
      setApplicationsLoading(false);
    }
  }, [itemsPerPage, t, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadApplications(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);
  
  // Перезагрузка при изменении страницы (только если страница действительно изменилась пользователем)
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage !== currentPage && newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      loadApplications(newPage);
    }
  }, [currentPage, totalPages, loadApplications]);

  // Filtered applications (client-side filtering для текущей страницы)
  const filteredApplications = useMemo(() => {
    let filtered = [...applications];

    // Search filter (используем debounced значение)
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase();
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
          aValue = applicationAmounts.get(a.id) || 0;
          bValue = applicationAmounts.get(b.id) || 0;
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
  }, [applications, debouncedSearchTerm, statusFilter, sortBy, sortOrder, applicationAmounts]);

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
      let successCount = 0;
      let errorCount = 0;
      
      if (massAction.type === 'status_change' && massAction.status) {
        // Update status for selected applications
        for (const id of applicationIds) {
          try {
            const result = await makeApiRequest(`/applications/${id}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status: massAction.status })
            });
            if (result.success) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }
      }

      // Reload applications (используем текущую страницу)
      const pageToLoad = currentPage;
      await loadApplications(pageToLoad);
      setSelectedApplications(new Set());
      setShowMassActions(false);
      setMassAction(null);
      
      if (errorCount === 0) {
        showToast({
          type: 'success',
          title: t('common.success'),
          message: t('applications.massActionSuccess', { count: successCount }) || `Успешно обработано ${successCount} заявок`
        });
      } else {
        showToast({
          type: 'warning',
          title: t('common.warning'),
          message: t('applications.massActionPartial', { success: successCount, error: errorCount }) || `Обработано ${successCount}, ошибок: ${errorCount}`
        });
      }
    } catch (error) {
      console.error('Ошибка массового действия:', error);
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('applications.massActionError') || 'Ошибка выполнения массового действия'
      });
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
        const pageToLoad = currentPage;
        await loadApplications(pageToLoad);
        showToast({
          type: 'success',
          title: t('common.success'),
          message: t('applications.statusUpdated') || 'Статус заявки обновлен'
        });
      } else {
        const errorMessage = handleApiError(result as any);
        console.error('Ошибка изменения статуса:', errorMessage);
        showToast({
          type: 'error',
          title: t('common.error'),
          message: t('applications.statusUpdateError') || errorMessage
        });
      }
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('applications.statusUpdateError') || 'Ошибка изменения статуса'
      });
    }
  };

  // Handle application delete
  const handleDelete = async (id: number) => {
    if (!confirm(t('applications.confirmDelete') || 'Вы уверены, что хотите удалить эту заявку?')) return;

    try {
      const result = await makeApiRequest(`/applications/${id}`, {
        method: 'DELETE'
      });

      if (result.success) {
        const pageToLoad = currentPage;
        await loadApplications(pageToLoad);
        showToast({
          type: 'success',
          title: t('common.success'),
          message: t('applications.deleted') || 'Заявка удалена'
        });
      } else {
        const errorMessage = handleApiError(result as any);
        console.error('Ошибка удаления заявки:', errorMessage);
        showToast({
          type: 'error',
          title: t('common.error'),
          message: t('applications.deleteError') || errorMessage
        });
      }
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('applications.deleteError') || 'Ошибка удаления заявки'
      });
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
        showToast({
          type: 'success',
          title: t('common.success'),
          message: t('applications.exportSuccess') || 'Экспорт выполнен успешно'
        });
      } else {
        showToast({
          type: 'error',
          title: t('common.error'),
          message: t('applications.exportError') || 'Ошибка экспорта'
        });
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      showToast({
        type: 'error',
        title: t('common.error'),
        message: t('applications.exportError') || 'Ошибка экспорта'
      });
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
            <FileTextIcon size={16} className="dashboard-kpi-icon" />
            <span className="dashboard-kpi-label">{t('applications.totalApplications')}</span>
          </div>
          <div className="dashboard-kpi-value">{applications.length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('dashboard.inSystem')}
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
            <span className="dashboard-kpi-label">{t('applications.newApplications')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#3B82F6' }}>{applications.filter(a => a.status === 'new').length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('applications.requireProcessing')}
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
            <span className="dashboard-kpi-label">{t('applications.processing')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>{applications.filter(a => a.status === 'processing').length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('applications.inProcessing')}
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
            <span className="dashboard-kpi-label">{t('applications.approved')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>{applications.filter(a => a.status === 'approved').length}</div>
          <div className="dashboard-kpi-subtitle">
            {t('applications.successfullyProcessed')}
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
            {t('common.all')}
          </button>
        </div>
      </section>

      {/* Enhanced Filters */}
      <section className="dashboard-filters" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-search-container">
          <SearchIcon size={16} className="dashboard-search-icon" />
          <input
            type="text"
            placeholder={t('applications.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
            aria-label={t('applications.title')}
          />
        </div>
        <div className="dashboard-filter-container">
          <FilterIcon size={16} className="dashboard-filter-icon" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="dashboard-filter-select"
            aria-label={t('common.sort')}
          >
            <option value="date">{t('applications.sortByDate')}</option>
            <option value="name">{t('applications.sortByName')}</option>
            <option value="status">{t('applications.sortByStatus')}</option>
            <option value="amount">{t('applications.sortByAmount')}</option>
          </select>
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="dashboard-action-btn"
          aria-label={sortOrder === 'asc' ? t('common.sortAscending') : t('common.sortDescending')}
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
                {t('applications.selected', { count: selectedApplications.size })}
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
                <span>{t('applications.approve')}</span>
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
                <span>{t('applications.reject')}</span>
              </button>
            </>
          )}
          <button
            onClick={() => loadApplications(currentPage)}
            className="dashboard-refresh-btn"
            aria-label={t('common.refresh')}
          >
            <RefreshIcon size={16} />
            <span>{t('common.refresh')}</span>
          </button>
        </div>
      </section>

      {/* Applications List */}
      <section className="dashboard-table-container">
        <div className="dashboard-table-header">
          <div>
            <h2 className="dashboard-table-title">{t('applications.title')}</h2>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--paul-gray)', 
              marginTop: 'var(--space-1)' 
            }}>
              {t('applications.showing', { count: filteredApplications.length, total: totalItems })}
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
              <span>{t('applications.selectAll')}</span>
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
                {t('applications.viewTable')}
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
                {t('applications.viewGrid')}
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
                {t('applications.viewKanban')}
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
              {t('applications.loadingApplications')}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--paul-gray)' }}>
              {t('common.pleaseWait')}
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
              {t('applications.applicationsNotFound')}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--paul-gray)' }}>
              {searchTerm || statusFilter !== 'all' 
                ? t('applications.tryChangingFilters')
                : t('applications.createFirst')
              }
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <>
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
                    <th>{t('applications.applicant')}</th>
                    <th>{t('applications.contacts')}</th>
                    <th>{t('applications.event')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('common.amount')}</th>
                    <th>{t('common.date')}</th>
                    <th>{t('common.actions')}</th>
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
                            {t('applications.notSpecified')}
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
                          {applicationAmounts.get(app.id) ? `₼${applicationAmounts.get(app.id)!.toLocaleString()}` : '—'}
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
                            <span>{t('common.view')}</span>
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
                            <span>{t('applications.createOrder')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3)'
            }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="dashboard-action-btn"
                style={{
                  opacity: currentPage === 1 ? 0.5 : 1,
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                ← {t('common.previous') || 'Назад'}
              </button>
              <span style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--paul-gray)',
                padding: '0 var(--space-3)'
              }}>
                {t('common.page', { current: currentPage, total: totalPages }) || `Страница ${currentPage} из ${totalPages}`}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="dashboard-action-btn"
                style={{
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                {t('common.next') || 'Вперед'} →
              </button>
            </div>
          )}
          </>
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
                    <div className="field-label">{t('applications.event')}</div>
                    <div className="field-value">
                      {app.event_address || t('applications.notSpecified')}
                    </div>
                  </div>
                  <div className="card-field">
                    <div className="field-label">{t('applications.amount')}</div>
                    <div className="field-value">
                      {applicationAmounts.get(app.id) ? `₼${applicationAmounts.get(app.id)!.toLocaleString()}` : '—'}
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-date">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                    </div>
                    <div className="card-amount">
                      {applicationAmounts.get(app.id) ? `₼${applicationAmounts.get(app.id)!.toLocaleString()}` : '—'}
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
                              {applicationAmounts.get(app.id) ? `₼${applicationAmounts.get(app.id)!.toLocaleString()}` : '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredApplications.filter(filter.filter).length === 0 && (
                      <div className="kanban-empty">{t('applications.noApplications')}</div>
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
            {t('applications.massActions')}
            <span style={{
              color: '#3B82F6',
              marginLeft: 'var(--space-2)'
            }}>
              ({selectedApplications.size} {t('applications.selected')})
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
              {t('applications.execute')}
            </button>
            <button
              onClick={() => setShowMassActions(false)}
              className="dashboard-action-btn"
            >
              {t('common.cancel')}
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
            aria-label={t('applications.viewApplication')}
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
                  {t('applications.application')} №{selectedApplication.id}
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="dashboard-action-btn"
                aria-label={t('common.close')}
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
                  {t('applications.createOrder')}
                </button>
              </div>

              <div style={{ display: 'grid', rowGap: 16 }}>
                <section style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {t('applications.contactDetails')}
                  </h4>
                  <div style={{ display: 'grid', rowGap: 8 }}>
                    <div>
                      <div className="field-label">Email</div>
                      <div className="field-value">{selectedApplication.email || '—'}</div>
                    </div>
                    <div>
                      <div className="field-label">{t('common.phone')}</div>
                      <div className="field-value">{selectedApplication.phone || '—'}</div>
                    </div>
                    {selectedApplication.company_name && (
                      <div>
                        <div className="field-label">{t('common.company')}</div>
                        <div className="field-value">{selectedApplication.company_name}</div>
                      </div>
                    )}
                    {selectedApplication.contact_person && (
                      <div>
                        <div className="field-label">{t('applications.contactPerson')}</div>
                        <div className="field-value">{selectedApplication.contact_person}</div>
                      </div>
                    )}
                  </div>
                </section>

                <section style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    {t('applications.eventDetails')}
                  </h4>
                  <div style={{ display: 'grid', rowGap: 8 }}>
                    <div>
                      <div className="field-label">{t('common.address')}</div>
                      <div className="field-value">{selectedApplication.event_address || '—'}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 12 }}>
                      <div>
                        <div className="field-label">{t('common.date')}</div>
                        <div className="field-value">{formatApplicationDate(selectedApplication.event_date)}</div>
                      </div>
                      <div>
                        <div className="field-label">{t('common.time')}</div>
                        <div className="field-value">{formatApplicationTime(selectedApplication.event_time)}</div>
                      </div>
                    </div>
                    {selectedApplication.message && (
                      <div>
                        <div className="field-label">{t('form.clientComment')}</div>
                        <div className="field-value">{selectedApplication.message}</div>
                      </div>
                    )}
                  </div>
                </section>

                {Array.isArray(selectedApplication.cart_items) && selectedApplication.cart_items.length > 0 && (
                  <section style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {t('applications.selectedItems')}
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
                    {t('applications.systemInformation')}
                  </h4>
                  <div style={{ display: 'grid', rowGap: 8 }}>
                    <div>
                      <div className="field-label">{t('applications.created')}</div>
                      <div className="field-value">
                        {selectedApplication.created_at ? new Date(selectedApplication.created_at).toLocaleString('ru-RU') : '—'}
                      </div>
                    </div>
                    {selectedApplication.processed_at && (
                      <div>
                        <div className="field-label">{t('applications.processed')}</div>
                        <div className="field-value">
                          {new Date(selectedApplication.processed_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    )}
                    {selectedApplication.coordinator && (
                      <div>
                        <div className="field-label">{t('applications.coordinator')}</div>
                        <div className="field-value">{selectedApplication.coordinator.name}</div>
                      </div>
                    )}
                    {selectedApplication.coordinator_comment && (
                      <div>
                        <div className="field-label">{t('applications.coordinatorComment')}</div>
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
                {t('common.close')}
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
                {t('applications.createOrder')}
              </button>
            </div>
          </aside>
        </>
      )}
    </DashboardLayout>
  );
}

