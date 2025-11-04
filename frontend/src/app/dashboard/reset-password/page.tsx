"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthGuard, isCoordinator } from '../../../utils/authConstants';
import DashboardLayout from '../../../components/DashboardLayout';
import ResetPasswordForm from '../../../components/ResetPasswordForm';

export default function ResetPasswordPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  // Проверяем, что пользователь является координатором
  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user || { user_type: '', position: '', staff_role: '' }, isCoordinator, router);

  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontFamily: 'Playfair Display, serif',
              color: '#1A1A1A',
              marginBottom: '1rem'
            }}>
              Доступ запрещен
            </h2>
            <p style={{ color: '#4A4A4A' }}>
              Только координаторы могут сбрасывать пароли пользователей
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontFamily: 'Playfair Display, serif',
              fontWeight: 'bold',
              color: '#1A1A1A',
              marginBottom: '1rem'
            }}>
              Управление пользователями
            </h1>
            <p style={{
              color: '#4A4A4A',
              fontSize: '1.125rem'
            }}>
              Сброс паролей пользователей системы
            </p>
          </div>

          {!showForm ? (
            <div style={{
              backgroundColor: '#FFFCF8',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
              <h2 style={{
                fontSize: '1.5rem',
                fontFamily: 'Playfair Display, serif',
                fontWeight: 'bold',
                color: '#1A1A1A',
                marginBottom: '1rem'
              }}>
                Сброс пароля пользователя
              </h2>
              <p style={{
                color: '#4A4A4A',
                marginBottom: '2rem'
              }}>
                Введите email пользователя и новый пароль для сброса
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: '#D4AF37',
                  color: '#1A1A1A',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F4D03F';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4AF37';
                }}
              >
                Начать сброс пароля
              </button>
            </div>
          ) : (
            <ResetPasswordForm
              onSuccess={() => {
                setShowForm(false);
              }}
              onCancel={() => setShowForm(false)}
            />
          )}

          <div style={{
            marginTop: '2rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '0.5rem',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#7B5E3B',
              marginBottom: '0.5rem'
            }}>
              ⚠️ Важная информация
            </h3>
            <ul style={{
              color: '#7B5E3B',
              fontSize: '0.875rem',
              lineHeight: '1.6',
              margin: 0,
              paddingLeft: '1.5rem'
            }}>
              <li>Пользователь получит новый пароль и сможет войти в систему</li>
              <li>Рекомендуется сообщить пользователю новый пароль по безопасному каналу</li>
              <li>Пользователь сможет изменить пароль в своем профиле после входа</li>
            </ul>
          </div>
        </div>
    </DashboardLayout>
  );
}


