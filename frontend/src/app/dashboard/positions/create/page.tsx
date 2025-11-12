"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import MenuItemForm from '@/components/MenuItemForm';
import { createMenuItem, handleApiError } from '@/utils/apiHelpers';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard, canManageMenu } from '@/utils/authConstants';

export default function CreateMenuItemPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', staff_role: '' }, (user) => {
    return canManageMenu(user || { user_type: '', staff_role: '' });
  }, router);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createMenuItem(formData);
      if (result.success) {
        alert('Позиция меню успешно создана!');
        router.push('/dashboard/positions');
      } else {
        setError(handleApiError(result as any, 'Не удалось создать позицию меню'));
      }
    } catch (e) {
      setError('Произошла ошибка при создании позиции меню.');
      console.error('Failed to create menu item', e);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || !isAuthenticated || !user || !canManageMenu(user)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#fafafa" }}>
        <div style={{ textAlign: "center", color: "#6b7280" }}>Загрузка или нет доступа...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-content-grid">
        <section className="dashboard-table-container">
          <div className="dashboard-table-header">
            <h1 className="dashboard-table-title">Создать новую позицию меню</h1>
          </div>
          <div style={{ padding: 'var(--space-4)' }}>
            <MenuItemForm onSubmit={handleSubmit} loading={loading} error={error} />
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
