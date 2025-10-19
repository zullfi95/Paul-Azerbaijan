import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

// PAUL brand colors
const paulColors = {
  black: '#1A1A1A',
  beige: '#EBDCC8',
  border: '#EDEAE3',
  gray: '#4A4A4A',
  white: '#FFFCF8'
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  padding = 'md',
  variant = 'default'
}) => {
  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return { padding: '1rem' };
      case 'md':
        return { padding: '1.5rem' };
      case 'lg':
        return { padding: '2rem' };
      default:
        return getPaddingStyles();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: paulColors.white,
          border: `1px solid ${paulColors.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        };
      case 'elevated':
        return {
          backgroundColor: paulColors.white,
          border: `1px solid ${paulColors.border}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          border: `2px solid ${paulColors.border}`,
          boxShadow: 'none',
        };
      default:
        return getVariantStyles();
    }
  };

  const paddingStyles = getPaddingStyles();
  const variantStyles = getVariantStyles();

  const baseStyle: React.CSSProperties = {
    ...paddingStyles,
    ...variantStyles,
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <div className={className} style={baseStyle}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  style = {}
}) => {
  const baseStyle: React.CSSProperties = {
    marginBottom: '1rem',
    ...style,
  };

  return (
    <div className={className} style={baseStyle}>
      {children}
    </div>
  );
};

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  size?: 'sm' | 'md' | 'lg';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  style = {},
  size = 'md'
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { fontSize: '1rem', fontWeight: '600' };
      case 'md':
        return { fontSize: '1.125rem', fontWeight: '700' };
      case 'lg':
        return { fontSize: '1.25rem', fontWeight: '700' };
      default:
        return getSizeStyles();
    }
  };

  const sizeStyles = getSizeStyles();

  const baseStyle: React.CSSProperties = {
    ...sizeStyles,
    color: paulColors.black,
    fontFamily: 'Playfair Display, serif',
    letterSpacing: '-0.025em',
    margin: 0,
    ...style,
  };

  return (
    <h3 className={className} style={baseStyle}>
      {children}
    </h3>
  );
};

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  style = {}
}) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};

