"use client";

import React, { useState } from 'react';
import { makeApiRequest } from '../utils/apiHelpers';

interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ResetPasswordForm({ onSuccess, onCancel }: ResetPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const result = await makeApiRequest('reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email,
          new_password: newPassword
        })
      });

      if (result.success) {
        setMessage('Пароль успешно сброшен!');
        setEmail('');
        setNewPassword('');
        onSuccess?.();
      } else {
        setError(result.message || 'Ошибка при сбросе пароля');
      }
    } catch (error) {
      setError('Произошла ошибка при сбросе пароля');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        Сброс пароля пользователя
      </h2>

      {message && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '0.5rem',
          color: '#166534',
          marginBottom: '1rem'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          color: '#dc2626',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div>
          <label style={{
            display: 'block',
            color: '#4A4A4A',
            fontWeight: 500,
            marginBottom: '0.5rem',
            fontSize: '0.875rem'
          }}>
            Email пользователя *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '0.5rem',
              outline: 'none',
              fontSize: '0.875rem',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="user@example.com"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            color: '#4A4A4A',
            fontWeight: 500,
            marginBottom: '0.5rem',
            fontSize: '0.875rem'
          }}>
            Новый пароль *
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '0.5rem',
              outline: 'none',
              fontSize: '0.875rem',
              transition: 'border-color 0.2s ease'
            }}
            placeholder="Минимум 6 символов"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#D4AF37';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Отмена
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isSubmitting ? '#6b7280' : '#D4AF37',
              color: isSubmitting ? '#9ca3af' : '#1A1A1A',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? 'Сброс...' : 'Сбросить пароль'}
          </button>
        </div>
      </form>
    </div>
  );
}



