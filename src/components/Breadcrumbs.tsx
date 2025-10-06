import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumbs.module.css';

type Crumb = {
  label: string;
  href?: string;
  isActive?: boolean;
};

type Props = {
  items: Crumb[];
  separator?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export default function Breadcrumbs({ items, separator = '/', className = "", style = {} }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="breadcrumb" 
      className={`${styles.breadcrumb} ${className}`}
      style={style}
    >
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        const isActive = item.isActive || isLast;
        
        return (
          <div key={idx} className={styles.breadcrumbItem}>
            {idx > 0 && (
              <span className={styles.separator}>{separator}</span>
            )}
            
            {item.href && !isActive ? (
              <Link 
                href={item.href} 
                className={styles.link}
              >
                {item.label}
              </Link>
            ) : (
              <span 
                aria-current={isActive ? 'page' : undefined} 
                className={isActive ? styles.textActive : styles.text}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
