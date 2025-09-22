import React from 'react';
import Link from 'next/link';

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  items: Crumb[];
  separator?: React.ReactNode;
};

export default function Breadcrumbs({ items, separator = '›' }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" style={{ marginBottom: '1rem' }}>
      <ol style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {item.href && !isLast ? (
                <Link href={item.href} style={{ color: '#6c757d', textDecoration: 'none', fontWeight: 500 }}>
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} style={{ color: isLast ? '#1A1A1A' : '#6c757d', fontWeight: isLast ? 700 : 500 }}>
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span aria-hidden style={{ color: '#adb5bd', marginLeft: '0.25rem', marginRight: '0.25rem' }}>{separator}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
