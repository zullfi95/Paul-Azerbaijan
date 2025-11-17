"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
// import Image from "next/image"; // Не используем Next.js Image для backend storage изображений
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { MenuItem, MenuCategory, PaginatedResponse } from "@/types/common";
import { fetchMenuItems, fetchMenuCategories, deleteMenuItem, handleApiError } from "@/utils/apiHelpers";
import { useDebounce } from "@/utils/useDebounce";
import { useAuthGuard, canManageMenu } from "@/utils/authConstants";
import {
  SearchIcon,
  FilterIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  PlusIcon,
  XIcon,
  BookOpenIcon,
  CheckIcon,
  ShoppingBagIcon,
  ChartBarIcon
} from "@/components/Icons";
import "@/styles/dashboard.css";
import { SkeletonCard, SkeletonTableRow, SkeletonStyles } from "@/components/Skeleton";

export default function PositionsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [menuItems, setMenuItems] = useState<PaginatedResponse<MenuItem> | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsItem, setDetailsItem] = useState<MenuItem | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Быстрый доступ к названию категории по id
  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    (categories || []).forEach(c => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Auth Guard
  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, (user) => {
    return canManageMenu(user || { user_type: '', staff_role: '' });
  }, router);

  const loadMenuItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { [key: string]: any } = { page: currentPage };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedCategory !== "all") params.category_id = selectedCategory;

      const result = await fetchMenuItems(params);
      if (result.success && result.data) {
        setMenuItems(result.data);
      } else {
        setError(handleApiError(result as any, t('positions.loadError')));
      }
    } catch (e) {
      setError(t('positions.loadError'));
      console.error("Failed to load menu items", e);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, selectedCategory, currentPage]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await fetchMenuCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        console.error("Failed to load menu categories:", handleApiError(result as any));
      }
    } catch (e) {
      console.error("Failed to load menu categories", e);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadCategories();
    }
  }, [isAuthenticated, isLoading, loadCategories]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && categories.length > 0) {
      loadMenuItems();
    }
  }, [isAuthenticated, isLoading, categories, loadMenuItems]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('positions.confirmDelete'))) return;
    try {
      setLoading(true); // Показываем загрузку при удалении
      const result = await deleteMenuItem(id);
      if (result.success) {
        alert(t('positions.deleteSuccess'));
        loadMenuItems(); // Перезагружаем список
      } else {
        setError(handleApiError(result as any, t('positions.deleteError')));
      }
    } catch (e) {
      setError(t('positions.deleteError'));
      console.error("Failed to delete menu item", e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const items = menuItems?.data || [];
    return {
      total: menuItems?.total ?? items.length,
      active: items.filter(i => i.is_active).length,
      available: items.filter(i => i.is_available).length,
      categories: categories.length
    };
  }, [menuItems, categories]);

  if (isLoading || !isAuthenticated || !user || !canManageMenu(user)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Statistics Cards */}
      <section className="dashboard-kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <BookOpenIcon size={16} className="dashboard-kpi-icon" />
            <span className="dashboard-kpi-label">{t('positions.totalPositions')}</span>
          </div>
          <div className="dashboard-kpi-value">
            {stats.total}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('positions.inMenu')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <CheckIcon size={16} className="dashboard-kpi-icon" style={{ color: '#10B981' }} />
            <span className="dashboard-kpi-label">{t('positions.active')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#10B981' }}>
            {stats.active}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('positions.published')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <ShoppingBagIcon size={16} className="dashboard-kpi-icon" style={{ color: '#3B82F6' }} />
            <span className="dashboard-kpi-label">{t('positions.available')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#3B82F6' }}>
            {stats.available}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('positions.inStock')}
          </div>
        </div>

        <div 
          className="dashboard-kpi-card"
          role="button"
          tabIndex={0}
        >
          <div className="dashboard-kpi-header">
            <ChartBarIcon size={16} className="dashboard-kpi-icon" style={{ color: '#F59E0B' }} />
            <span className="dashboard-kpi-label">{t('positions.categories')}</span>
          </div>
          <div className="dashboard-kpi-value" style={{ color: '#F59E0B' }}>
            {stats.categories}
          </div>
          <div className="dashboard-kpi-subtitle">
            {t('positions.menuGroups')}
          </div>
        </div>
      </section>

      <section className="dashboard-table-container" style={{ maxWidth: '100%', overflowX: 'hidden' }}>
        <div className="dashboard-table-header">
          <div>
            <h2 className="dashboard-table-title">{t('positions.title')}</h2>
            <p style={{ 
              fontSize: 'var(--text-sm)', 
              color: 'var(--paul-gray)', 
              marginTop: 'var(--space-1)' 
            }}>
              {t('positions.description')}
            </p>
          </div>
        </div>

          <div className="dashboard-filters" style={{ padding: 'var(--space-4)'}}>
            <div className="dashboard-search-container">
              <SearchIcon size={16} className="dashboard-search-icon" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('positions.searchPlaceholder')}
                className="dashboard-search-input"
                aria-label={t('positions.title')}
              />
            </div>
            <div className="dashboard-filter-container">
              <FilterIcon size={16} className="dashboard-filter-icon" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1); // Сбрасываем страницу при смене фильтра
                }}
                className="dashboard-filter-select"
                aria-label={t('common.filter')}
              >
                <option value="all">{t('common.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setCurrentPage(1);
                loadMenuItems();
              }}
              className="dashboard-refresh-btn"
              aria-label={t('positions.resetFilters')}
            >
              <RefreshIcon size={16} />
              <span>{t('positions.resetFilters')}</span>
            </button>
          </div>

          <div className="responsive-table" style={{ overflowX: 'hidden' }}>
            <table className="dashboard-table" style={{ tableLayout: 'fixed', width: '100%', textAlign: 'center' }}>
              <colgroup>
                <col style={{ width: '56px' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '9%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>{t('positions.image')}</th>
                  <th>{t('positions.name')}</th>
                  <th>{t('positions.category')}</th>
                  <th>{t('positions.price')}</th>
                  <th>{t('positions.available')}</th>
                  <th>{t('positions.active')}</th>
                  <th>{t('positions.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={7}>
                        <SkeletonTableRow />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "red", padding: "20px" }}>
                      {error}
                    </td>
                  </tr>
                ) : menuItems?.data.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#6b7280", padding: "20px" }}>
                      {debouncedSearchTerm || selectedCategory !== "all" ? t('positions.noResults') : t('positions.noItems')}
                    </td>
                  </tr>
                ) : (
                  menuItems?.data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            width={40}
                            height={40}
                            style={{ objectFit: "cover", borderRadius: "6px" }}
                          />
                        ) : (
                          <div style={{ width: 40, height: 40, background: '#eee', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>
                            No Image
                          </div>
                        )}
                      </td>
                      <td style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{item.name}</td>
                      <td style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{item.menuCategory?.name || (item.menu_category_id ? categoryNameById.get(item.menu_category_id) : t('positions.noCategory'))}</td>
                      <td>{item.price} {item.currency}</td>
                      <td>{item.is_available ? t('positions.yes') : t('positions.no')}</td>
                      <td>{item.is_active ? t('positions.yes') : t('positions.no')}</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: 'wrap', justifyContent: 'center' }}>
                          <button
                            onClick={() => setDetailsItem(item)}
                            className="dashboard-action-btn"
                            aria-label={t('positions.details')}
                          >
                            {t('positions.details')}
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/positions/${item.id}/edit`)}
                            className="dashboard-action-btn"
                            aria-label={t('positions.edit')}
                          >
                            <EditIcon size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="dashboard-action-btn"
                            style={{ borderColor: "#dc2626", color: "#dc2626" }}
                            aria-label={t('positions.delete')}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {menuItems && menuItems.last_page > 1 && (
            <div className="dashboard-pagination" style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-4)', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Prev */}
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="dashboard-action-btn"
                disabled={currentPage === 1}
                aria-label={t('positions.previousPage')}
              >
                «
              </button>
              {(() => {
                const pages: (number | 'ellipsis')[] = [];
                const total = menuItems.last_page || 1;
                const windowSize = 2; // по 2 страницы слева/справа
                const add = (p: number | 'ellipsis') => pages.push(p);

                add(1);
                const start = Math.max(2, currentPage - windowSize);
                const end = Math.min(total - 1, currentPage + windowSize);

                if (start > 2) add('ellipsis');
                for (let p = start; p <= end; p++) add(p);
                if (end < total - 1) add('ellipsis');
                if (total > 1) add(total);

                return pages.map((p, idx) => p === 'ellipsis' ? (
                  <span key={`e-${idx}`} style={{ padding: '0 6px', color: 'var(--paul-gray)' }}>…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`dashboard-action-btn ${currentPage === p ? 'active' : ''}`}
                    style={currentPage === p ? { background: 'var(--paul-black)', color: 'var(--paul-white)' } : {}}
                  >
                    {p}
                  </button>
                ));
              })()}
              {/* Next */}
              <button
                onClick={() => setCurrentPage(Math.min(menuItems.last_page, currentPage + 1))}
                className="dashboard-action-btn"
                disabled={currentPage === menuItems.last_page}
                aria-label={t('positions.nextPage')}
              >
                »
              </button>
            </div>
          )}
        </section>

      {/* Slide-over Details Panel */}
      {detailsItem && (
        <>
          <div
            onClick={() => setDetailsItem(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 60 }}
          />
          <aside
            role="dialog"
            aria-label={t('positions.productDetails')}
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
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--paul-black)' }}>{detailsItem.name}</h3>
              <button onClick={() => setDetailsItem(null)} className="dashboard-action-btn" aria-label={t('common.close')}>
                <XIcon size={14} />
              </button>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto' }}>
              {detailsItem.images && detailsItem.images.length > 0 ? (
                <img
                  src={detailsItem.images[0]}
                  alt={detailsItem.name}
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                />
              ) : (
                <div style={{ width: '100%', height: 180, background: '#eee', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>No Image</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', rowGap: 8 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{t('positions.category')}</div>
                  <div style={{ fontSize: 14 }}>{detailsItem.menuCategory?.name || (detailsItem.menu_category_id ? categoryNameById.get(detailsItem.menu_category_id) : t('positions.noCategory'))}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{t('common.price')}</div>
                  <div style={{ fontSize: 14 }}>{detailsItem.price} {detailsItem.currency}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{t('positions.availableForOrder')}</div>
                  <div style={{ fontSize: 14 }}>{detailsItem.is_available ? t('positions.yes') : t('positions.no')}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{t('positions.activeInMenu')}</div>
                  <div style={{ fontSize: 14 }}>{detailsItem.is_active ? t('positions.yes') : t('positions.no')}</div>
                </div>
                {detailsItem.description && (
                  <div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{t('positions.description')}</div>
                    <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{detailsItem.description}</div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid var(--paul-border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => router.push(`/dashboard/positions/${detailsItem.id}/edit`)}
                className="dashboard-action-btn"
              >
                {t('positions.edit')}
              </button>
              <button
                onClick={() => setDetailsItem(null)}
                className="dashboard-action-btn"
              >
                {t('common.close')}
              </button>
            </div>
          </aside>
        </>
      )}

      <SkeletonStyles />
    </DashboardLayout>
  );
}
