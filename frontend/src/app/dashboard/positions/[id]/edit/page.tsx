"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import MenuItemForm from '@/components/MenuItemForm';
import { fetchMenuItem, updateMenuItem, handleApiError } from '@/utils/apiHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard, canManageMenu } from '@/utils/authConstants';
import { MenuItem } from '@/types/common';

export default function EditMenuItemPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const itemId = typeof params.id === 'string' ? parseInt(params.id, 10) : undefined; // Ensure itemId is number or undefined

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [loadingItem, setLoadingItem] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, (user: { user_type?: string; position?: string; staff_role?: string; name?: string; email?: string; id?: number } | null) => {
    return canManageMenu(user || { user_type: '', staff_role: '' });
  }, router);

  const loadMenuItem = useCallback(async (id: number) => {
    setLoadingItem(true);
    setError(null);
    try {
      const result = await fetchMenuItem(id);
      if (result.success && result.data) {
        setMenuItem(result.data);
      } else {
        setError(handleApiError(result as any, 'Не удалось загрузить позицию меню для редактирования'));
      }
    } catch (e) {
      setError('Произошла ошибка при загрузке позиции меню.');
      console.error('Failed to load menu item for edit', e);
    } finally {
      setLoadingItem(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading && itemId) {
      loadMenuItem(itemId);
    }
  }, [isAuthenticated, isLoading, itemId, loadMenuItem]);

  const handleSubmit = async (formData: FormData) => {
    if (itemId === undefined) {
      setError('ID позиции меню не найден.');
      return;
    }

    setLoadingForm(true);
    setError(null);
    try {
      const result = await updateMenuItem(itemId, formData);
      if (result.success) {
        alert('Позиция меню успешно обновлена!');
        router.push('/dashboard/positions');
      } else {
        setError(handleApiError(result as any, 'Не удалось обновить позицию меню'));
      }
    } catch (e) {
      setError('Произошла ошибка при обновлении позиции меню.');
      console.error('Failed to update menu item', e);
    } finally {
      setLoadingForm(false);
    }
  };

  if (isLoading || !isAuthenticated || !user || !canManageMenu(user)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>Загрузка или нет доступа...</div>
      </div>
    );
  }

  if (loadingItem) {
    return (
      <DashboardLayout>
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--paul-gray)' }}>Загрузка данных позиции...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'red' }}>{error}</div>
      </DashboardLayout>
    );
  }

  if (!menuItem) {
    return (
      <DashboardLayout>
        <div style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--paul-gray)' }}>Позиция меню не найдена.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content-grid">
        <section className="dashboard-table-container">
          <div className="dashboard-table-header">
            <h1 className="dashboard-table-title">Редактировать позицию меню: {menuItem.name}</h1>
          </div>
          <div style={{ padding: 'var(--space-4)' }}>
            <MenuItemForm initialData={menuItem} onSubmit={handleSubmit} loading={loadingForm} error={error} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
