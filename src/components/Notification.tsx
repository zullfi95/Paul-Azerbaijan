"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Показываем уведомление с небольшой задержкой для анимации
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Автоматически скрываем уведомление
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Ждем завершения анимации
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          iconColor: '#28a745'
        };
      case 'error':
        return {
          backgroundColor: '#f8d7da',
          borderColor: '#f5c6cb',
          color: '#721c24',
          iconColor: '#dc3545'
        };
      case 'info':
        return {
          backgroundColor: '#d1ecf1',
          borderColor: '#bee5eb',
          color: '#0c5460',
          iconColor: '#17a2b8'
        };
      default:
        return {
          backgroundColor: '#d4edda',
          borderColor: '#c3e6cb',
          color: '#155724',
          iconColor: '#28a745'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          backgroundColor: typeStyles.backgroundColor,
          border: `1px solid ${typeStyles.borderColor}`,
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Иконка */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            color: typeStyles.iconColor,
            flexShrink: 0
          }}
        >
          <CheckCircle size={24} />
        </div>

        {/* Сообщение */}
        <div
          style={{
            flex: 1,
            fontSize: '14px',
            fontWeight: 500,
            color: typeStyles.color,
            lineHeight: '1.4'
          }}
        >
          {message}
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '24px',
            height: '24px',
            backgroundColor: 'transparent',
            border: 'none',
            color: typeStyles.color,
            cursor: 'pointer',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={16} />
        </button>

        {/* Прогресс-бар */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            backgroundColor: typeStyles.iconColor,
            borderRadius: '0 0 12px 12px',
            animation: `progressBar ${duration}ms linear forwards`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default Notification;
