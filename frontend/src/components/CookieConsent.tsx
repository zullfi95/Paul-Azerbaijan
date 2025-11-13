'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import styles from './CookieConsent.module.css';

/**
 * CookieConsent Component
 * 
 * Displays a banner to inform users about cookie usage and obtain consent.
 * The banner appears only on the first visit and stores the user's preference
 * in localStorage to prevent showing it again.
 * 
 * Features:
 * - Multi-language support via next-intl
 * - Persistent storage of user consent
 * - Accessible and responsive design
 * - Smooth animations
 */
export const CookieConsent: React.FC = () => {
  const t = useTranslations('cookieConsent');
  const { shouldShowBanner, acceptCookies, rejectCookies } = useCookieConsent();

  // Don't render if banner shouldn't be shown
  if (!shouldShowBanner) {
    return null;
  }

  const handleLearnMore = () => {
    // Navigate to cookie policy page
    window.location.href = '/cookies';
  };

  return (
    <div className={styles.cookieBanner} role="dialog" aria-label={t('title')}>
      <div className={styles.container}>
        <div className={styles.content}>
          <svg 
            className={styles.icon} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          
          <div className={styles.textContent}>
            <h2 className={styles.title}>{t('title')}</h2>
            <p className={styles.message}>
              {t('message')}{' '}
              <button
                onClick={handleLearnMore}
                className={styles.learnMore}
                aria-label={t('learnMore')}
              >
                {t('learnMore')}
              </button>
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            onClick={acceptCookies}
            className={`${styles.button} ${styles.acceptButton}`}
            aria-label={t('acceptAll')}
          >
            {t('acceptAll')}
          </button>
          <button
            onClick={rejectCookies}
            className={`${styles.button} ${styles.rejectButton}`}
            aria-label={t('rejectAll')}
          >
            {t('rejectAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

