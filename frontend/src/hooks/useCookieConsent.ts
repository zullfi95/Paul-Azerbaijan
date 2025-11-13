import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'paul-cookie-consent';

export type CookieConsentStatus = 'accepted' | 'rejected' | null;

export const useCookieConsent = () => {
  const [consentStatus, setConsentStatus] = useState<CookieConsentStatus>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if consent has been given before
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    
    if (storedConsent) {
      setConsentStatus(storedConsent as CookieConsentStatus);
    }
    
    setIsLoaded(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setConsentStatus('accepted');
  };

  const rejectCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setConsentStatus('rejected');
  };

  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    setConsentStatus(null);
  };

  return {
    consentStatus,
    isLoaded,
    acceptCookies,
    rejectCookies,
    resetConsent,
    shouldShowBanner: isLoaded && consentStatus === null,
  };
};

