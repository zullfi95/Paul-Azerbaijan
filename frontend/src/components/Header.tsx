"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Search, MapPin, ShoppingBag, FileText, Menu, X, Globe } from 'lucide-react';
import CartModal from './CartModal';
import EventPlanningModal from './EventPlanningModal';
import EventSuccessNotification from './EventSuccessNotification';
import SearchDropdown from './SearchDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import { useCart } from '@/contexts/CartContext';
import { useCartModal } from '@/contexts/CartModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { isCoordinator, isObserver, isClient } from '@/utils/authConstants';
import './Header.css';

const Header: React.FC = React.memo(function Header() {
  const router = useRouter();
  const t = useTranslations();
  const { locale, setLocale, availableLocales } = useLanguage();
  const { getTotalItems } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { isAuthenticated, user } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showEventSuccessNotification, setShowEventSuccessNotification] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Минимальное расстояние для свайпа (50px)
  const minSwipeDistance = 50;

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Обработка начала касания для swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  // Обработка движения касания
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  // Обработка окончания касания и определение свайпа
  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && isMobileMenuOpen) {
      closeMobileMenu();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, isMobileMenuOpen, closeMobileMenu]);

  const handleLogin = useCallback(() => {
    if (isAuthenticated && user) {
      // Клиенты -> профиль
      if (isClient(user)) {
        router.push('/profile');
      }
      // Координатор -> дашборд
      else if (isCoordinator(user)) {
        router.push('/dashboard');
      }
      // Observer (кухня) -> кухня
      else if (isObserver(user)) {
        router.push('/dashboard/kitchen');
      }
      // По умолчанию -> профиль
      else {
        router.push('/profile');
      }
    } else {
      router.push('/auth/login');
    }
    closeMobileMenu();
  }, [isAuthenticated, user, router, closeMobileMenu]);

  const handleCartClick = useCallback(() => {
    openCartModal();
  }, [openCartModal]);

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        const response = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ email: email.trim() })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert(data.data?.message || t('footer.newsletter.success'));
          setEmail('');
        } else {
          alert(t('footer.newsletter.error'));
        }
      } catch (error) {
        alert(t('footer.newsletter.generalError'));
      }
      closeMobileMenu();
    }
  }, [email, closeMobileMenu]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
      setIsSearchDropdownOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const handleSearchClick = useCallback(() => {
    if (isMobile) {
      setIsSearchExpanded(true);
    } else {
      setIsSearchDropdownOpen(true);
    }
  }, [isMobile]);

  const handleSearchBlur = useCallback(() => {
    if (!searchQuery.trim()) {
      // For mobile, we still want to collapse it
      if (isMobile) {
        setIsSearchExpanded(false);
      }
    }
  }, [searchQuery, isMobile]);

  const handleSearchClose = useCallback(() => {
    setIsSearchExpanded(false);
    setIsSearchDropdownOpen(false);
    setSearchQuery('');
  }, []);

  const handleActionClick = useCallback((action: string) => {
    switch (action) {
      case 'Find a PAUL':
        router.push('/locations');
        break;
      case 'Click & Collect':
        router.push('/click-collect');
        break;
      case 'Catering Menu':
        router.push('/catering');
        break;
      case 'Plan an Event':
        setIsEventModalOpen(true);
        break;
      default:
    }
  }, [router]);

  // Add/remove menu-open class to body when mobile menu is opened
  React.useEffect(() => {
    if (isMobile && isMobileMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [isMobile, isMobileMenuOpen]);

  return (
    <>
    <header className="header">
      <div className="header-container">
        {/* Top Navigation Bar */}
        <div className="nav-bar">
          {/* Logo */}
          <div className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <Image
              src="/images/logo.png"
              alt="PAUL"
              width={100}
              height={35}
              className="logo-image"
            />
          </div>

          {/* Main Navigation */}
          <nav className="main-nav">
            <Link href="/cakes" className="nav-link">{t('navigation.cakesPies')}</Link>
            <Link href="/viennoiserie" className="nav-link">{t('navigation.viennoiserie')}</Link>
            <Link href="/patisserie" className="nav-link">{t('navigation.patisserie')}</Link>
            <Link href="/platters" className="nav-link">{t('navigation.platters')}</Link>
            <Link href="/bread" className="nav-link">{t('navigation.bread')}</Link>
            <Link href="/Savoury" className="nav-link">{t('navigation.savoury')}</Link>
          </nav>

          {/* Right Side Actions */}
          <div className="right-actions">
            {/* Search Icon - Mobile only */}
            {isMobile && (
              <button 
                className="icon-button" 
                aria-label="Search"
                onClick={handleSearchClick}
              >
                <Search className="icon" size={20} />
              </button>
            )}

            {/* Search - Desktop */}
            {!isMobile && (
              <div className="search-container" style={{ position: 'relative' }}>
                <form onSubmit={handleSearch} suppressHydrationWarning>
                  <input
                    type="text"
                    placeholder={t('header.searchPlaceholder')}
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    suppressHydrationWarning
                  />
                  <Search className="search-icon" size={18} />
                </form>
                <SearchDropdown
                  isOpen={isSearchDropdownOpen}
                  onClose={() => setIsSearchDropdownOpen(false)}
                  isMobile={false}
                />
              </div>
            )}


            {/* Profile Icon - Desktop only */}
            {!isMobile && (
              <button 
                className="icon-button" 
                aria-label={isAuthenticated ? 'Profile' : 'Login'}
                onClick={handleLogin}
              >
                <Image
                  src="/images/userHeader.svg"
                  alt="User"
                  width={23}
                  height={23}
                  className="icon"
                />
              </button>
            )}

            {/* Cart Icon */}
            <button 
              className="icon-button cart-button" 
              aria-label="Shopping Cart"
              onClick={handleCartClick}
            >
              <Image
                src="/images/basketHeader.svg"
                alt="Cart"
                width={23}
                height={23}
                className="icon"
              />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </button>

            {/* Language Switcher */}
            {!isMobile && <LanguageSwitcher />}
              
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                  className="mobile-menu-button"
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-menu"
                  onClick={toggleMobileMenu}
                  onTouchStart={() => {}}
                  type="button"
                >
                  {isMobileMenuOpen ? (
                    <X className="icon" size={24} />
                  ) : (
                    <Menu className="icon" size={24} />
                  )}
                </button>
              )}
          </div>
        </div>
      </div>
    </header>

    {/* Action Buttons Row - Outside sticky header */}
    <div className="action-buttons-wrapper">
      <div className="action-buttons">
          {/* Find a PAUL */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Find a PAUL')}
          >
            <MapPin className="action-button-icon" size={12} />
            <span>{t('header.findAPaul')}</span>
          </button>

          {/* Click & Collect */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Click & Collect')}
          >
            <ShoppingBag className="action-button-icon" size={12} />
            <span>{t('header.clickCollect')}</span>
          </button>

          {/* Catering Menu */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Catering Menu')}
          >
            <FileText className="action-button-icon" size={12} />
            <span>{t('header.cateringMenu')}</span>
          </button>

          {/* Plan an Event */}
          <div className="plan-event-container">
            <button 
              className="action-button plan-event" 
              onClick={() => handleActionClick('Plan an Event')}
            >
              <span>{t('header.planEvent')}</span>
              <span className="plan-event-badge">i</span>
            </button>
            <div className="plan-event-tooltip">
              {t('header.planEventTooltip')}
            </div>
          </div>
      </div>
    </div>

    {/* Mobile Menu */}
    <div className="mobile-menu-container">
        {isMobile && isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div 
              className="mobile-menu-overlay"
              onClick={closeMobileMenu}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            />
            
            <div 
              className="mobile-menu"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="mobile-menu-content">
                {/* Mobile Menu Header */}
                <div className="mobile-menu-header">
                  <div className="mobile-menu-logo" onClick={() => router.push('/')}>
                    <Image
                      src="/images/logo.png"
                      alt="PAUL"
                      width={100}
                      height={35}
                      className="logo-image"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="mobile-menu-header-actions">
                    {/* Profile Icon - Mobile */}
                    <button 
                      className="icon-button" 
                      aria-label={isAuthenticated ? 'Profile' : 'Login'}
                      onClick={() => {
                        closeMobileMenu();
                        handleLogin();
                      }}
                      onTouchStart={() => {}}
                      type="button"
                    >
                      <Image
                        src="/images/userHeader.svg"
                        alt="User"
                        width={23}
                        height={23}
                        className="icon"
                      />
                    </button>
                    
                    <LanguageSwitcher />
                    
                    {/* Close Button */}
                    <button 
                      className="icon-button mobile-menu-close-btn" 
                      aria-label="Close menu"
                      onClick={closeMobileMenu}
                      onTouchStart={() => {}}
                      type="button"
                    >
                      <X className="icon" size={24} />
                    </button>
                  </div>
                </div>

                {/* Mobile Menu Body */}
                <div className="mobile-menu-body">
                  <div>
                    {/* Navigation Links */}
                    <nav className="mobile-nav">
                      <Link href="/cakes" className="mobile-nav-link" onClick={closeMobileMenu}>
                        {t('navigation.cakesPies')}
                      </Link>
                      <Link href="/viennoiserie" className="mobile-nav-link" onClick={closeMobileMenu}>
                        {t('navigation.viennoiserie')}
                      </Link>
                      <Link href="/patisserie" className="mobile-nav-link" onClick={closeMobileMenu}>
                        {t('navigation.patisserie')}
                      </Link>
                      <Link href="/platters" className="mobile-nav-link" onClick={closeMobileMenu}>
                        {t('navigation.platters')}
                      </Link>
                      <Link href="/bread" className="mobile-nav-link" onClick={closeMobileMenu}>
                        {t('navigation.bread')}
                      </Link>
                      <Link href="/Savoury" className="mobile-nav-link" onClick={closeMobileMenu}>
                        {t('navigation.savoury')}
                      </Link>
                    </nav>

                    {/* Divider */}
                    <div className="mobile-menu-divider"></div>

                    {/* My Account */}
                    <button 
                      className="mobile-menu-item"
                      onClick={() => {
                        if (isAuthenticated && user) {
                          // Клиенты -> профиль
                          if (isClient(user)) {
                            router.push('/profile');
                          }
                          // Координатор -> дашборд
                          else if (isCoordinator(user)) {
                            router.push('/dashboard');
                          }
                          // Observer (кухня) -> кухня
                          else if (isObserver(user)) {
                            router.push('/dashboard/kitchen');
                          }
                          // По умолчанию -> профиль
                          else {
                            router.push('/profile');
                          }
                        } else {
                          router.push('/auth/login');
                        }
                        closeMobileMenu();
                      }}
                      onTouchStart={() => {}} // iOS Safari touch fix
                      type="button"
                    >
                      {t('header.myAccount')}
                    </button>

                    {/* Contact Us */}
                    <button 
                      className="mobile-menu-item"
                      onClick={() => {
                        router.push('/contact');
                        closeMobileMenu();
                      }}
                      onTouchStart={() => {}} // iOS Safari touch fix
                      type="button"
                    >
                      {t('header.contactUs')}
                    </button>

                    {/* Log in */}
                    <button 
                      className="mobile-menu-item"
                      onClick={handleLogin}
                      onTouchStart={() => {}} // iOS Safari touch fix
                      type="button"
                    >
                      {isAuthenticated ? t('header.profile') : t('header.login')}
                    </button>
                  </div>

                  <div>
                    {/* Newsletter */}
                    <div className="mobile-menu-newsletter">
                      <h3 className="mobile-menu-newsletter-title">{t('footer.newsletter.title')}</h3>
                      <p className="mobile-menu-newsletter-description">
                        {t('footer.newsletter.description')}
                      </p>
                      <form className="mobile-menu-newsletter-form" onSubmit={handleSubscribe}>
                        <input
                          type="email"
                          placeholder={t('footer.newsletter.placeholder')}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mobile-menu-newsletter-input"
                          required
                        />
                        <button 
                          type="submit" 
                          className="mobile-menu-newsletter-button"
                          onTouchStart={() => {}} // iOS Safari touch fix
                        >
                          {t('footer.newsletter.button')}
                        </button>
                      </form>
                    </div>

                    {/* Social Media */}
                    <div className="mobile-menu-social">
                      <a href="https://instagram.com/paulbakery" className="mobile-menu-social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                        <Image
                          src="/images/3463469_instagram_social media_social_network_icon 1.svg"
                          alt="Instagram"
                          width={26}
                          height={26}
                        />
                      </a>
                      <a href="https://youtube.com/paulbakery" className="mobile-menu-social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                        <Image
                          src="/images/3463481_media_network_social_youtube_icon 1.svg"
                          alt="YouTube"
                          width={26}
                          height={26}
                        />
                      </a>
                      <a href="https://facebook.com/paulbakery" className="mobile-menu-social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                        <Image
                          src="/images/3463465_facebook_media_network_social_icon 1.svg"
                          alt="Facebook"
                          width={26}
                          height={26}
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile Search Modal */}
        {isMobile && isSearchExpanded && (
          <SearchDropdown
            isOpen={isSearchExpanded}
            onClose={handleSearchClose}
            isMobile={true}
          />
        )}
    </div>
      
    {/* Модальное окно корзины */}
    <CartModal 
      isOpen={isCartModalOpen} 
      onClose={closeCartModal} 
    />
    
    {/* Модальное окно планирования мероприятия */}
    <EventPlanningModal 
      isOpen={isEventModalOpen} 
      onClose={() => setIsEventModalOpen(false)}
      onSuccess={() => setShowEventSuccessNotification(true)}
    />

    {/* Event Success Notification */}
    {showEventSuccessNotification && (
      <EventSuccessNotification
        onClose={() => setShowEventSuccessNotification(false)}
        duration={5000}
      />
    )}
    </>
  );
});

export default Header;