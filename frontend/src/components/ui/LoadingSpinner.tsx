import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// PAUL brand colors
const paulColors = {
  black: '#1A1A1A',
  beige: '#EBDCC8',
  border: '#EDEAE3',
  gray: '#4A4A4A',
  white: '#FFFCF8'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = paulColors.black,
  className = '',
  style = {}
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { width: '1rem', height: '1rem' };
      case 'md':
        return { width: '2rem', height: '2rem' };
      case 'lg':
        return { width: '3rem', height: '3rem' };
      default:
        return getSizeStyles();
    }
  };

  const sizeStyles = getSizeStyles();

  const spinnerStyle: React.CSSProperties = {
    ...sizeStyles,
    border: '3px solid #f3f3f3',
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    ...style,
  };

  return (
    <>
      <div className={className} style={spinnerStyle} />
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  loadingText = 'Загрузка...',
  className = '',
  style = {}
}) => {
  if (isLoading) {
    return (
      <div 
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          textAlign: 'center',
          color: paulColors.gray,
          ...style,
        }}
      >
        <LoadingSpinner size="lg" style={{ marginBottom: '1rem' }} />
        <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
          {loadingText}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

