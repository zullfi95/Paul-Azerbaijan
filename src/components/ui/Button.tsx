import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

// PAUL brand colors
const paulColors = {
  black: '#1A1A1A',
  beige: '#EBDCC8',
  border: '#EDEAE3',
  gray: '#4A4A4A',
  white: '#FFFFFF'
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  className = '',
  style = {},
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: paulColors.black,
          color: paulColors.white,
          border: `2px solid ${paulColors.black}`,
          hoverBg: '#D4AF37',
          hoverColor: paulColors.black,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: paulColors.black,
          border: `2px solid ${paulColors.black}`,
          hoverBg: paulColors.black,
          hoverColor: paulColors.white,
        };
      case 'danger':
        return {
          backgroundColor: '#EF4444',
          color: paulColors.white,
          border: '2px solid #EF4444',
          hoverBg: '#DC2626',
          hoverColor: paulColors.white,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: paulColors.gray,
          border: `1px solid ${paulColors.border}`,
          hoverBg: '#F8F9FA',
          hoverColor: paulColors.black,
        };
      default:
        return getVariantStyles();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: '0.75rem',
        };
      case 'md':
        return {
          padding: '0.625rem 1.25rem',
          fontSize: '0.875rem',
        };
      case 'lg':
        return {
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
        };
      default:
        return getSizeStyles();
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const baseStyle: React.CSSProperties = {
    ...sizeStyles,
    backgroundColor: disabled || isLoading ? '#ADB5BD' : variantStyles.backgroundColor,
    color: disabled || isLoading ? '#fff' : variantStyles.color,
    border: disabled || isLoading ? '2px solid #ADB5BD' : variantStyles.border,
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    outline: 'none',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = variantStyles.hoverBg;
      e.currentTarget.style.color = variantStyles.hoverColor;
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading) {
      e.currentTarget.style.backgroundColor = variantStyles.backgroundColor;
      e.currentTarget.style.color = variantStyles.color;
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      {...props}
      style={baseStyle}
      disabled={disabled || isLoading}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {isLoading && (
        <div style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  );
};

