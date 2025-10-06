import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = '0.25rem',
  className = '',
  style = {}
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e5e7eb',
        background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s ease-in-out infinite',
        ...style
      }}
    />
  );
};

// Skeleton для карточек
export const SkeletonCard: React.FC = () => (
  <div style={{ 
    padding: '12px', 
    border: '1px solid #EDEAE3', 
    borderRadius: '8px', 
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <Skeleton height="11px" width="60%" style={{ marginBottom: '4px' }} />
    <Skeleton height="24px" width="40%" />
  </div>
);

// Skeleton для строк таблицы
export const SkeletonTableRow: React.FC = () => (
  <tr>
    <td style={{ padding: '12px' }}>
      <Skeleton height="14px" width="80%" />
    </td>
    <td style={{ padding: '12px' }}>
      <div style={{ marginBottom: '4px' }}>
        <Skeleton height="14px" width="90%" />
      </div>
      <Skeleton height="12px" width="60%" />
    </td>
    <td style={{ padding: '12px' }}>
      <Skeleton height="14px" width="70%" />
    </td>
    <td style={{ padding: '12px' }}>
      <Skeleton height="20px" width="60px" borderRadius="999px" />
    </td>
    <td style={{ padding: '12px' }}>
      <Skeleton height="14px" width="50%" />
    </td>
    <td style={{ padding: '12px' }}>
      <Skeleton height="32px" width="80px" borderRadius="8px" />
    </td>
  </tr>
);

// CSS для анимации shimmer
export const SkeletonStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .skeleton {
      position: relative;
      overflow: hidden;
    }
    
    .skeleton::after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translateX(-100%);
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.6),
        transparent
      );
      animation: shimmer 2s infinite;
      content: '';
    }
  `}</style>
);
