"use client";

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, MapPin, ShoppingBag, FileText, Calendar } from 'lucide-react';
import BasketIcon from './BasketIcon';
import LanguageSelector from './LanguageSelector';
import CartModal from './CartModal';
import EventPlanningModal from './EventPlanningModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useCartModal } from '../contexts/CartModalContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = React.memo(function Header() {
  const router = useRouter();
  const { t } = useLanguage();
  const { getTotalItems } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleLogin = useCallback(() => {
    if (isAuthenticated) {
      // Если пользователь уже вошел, переходим в профиль
      router.push('/profile');
    } else {
      // Если не вошел, переходим на страницу логина
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleCartClick = useCallback(() => {
    openCartModal();
  }, [openCartModal]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
    }
  }, [searchQuery, router]);

  const handleSearchClick = useCallback(() => {
    setIsSearchExpanded(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    if (!searchQuery.trim()) {
      setIsSearchExpanded(false);
    }
  }, [searchQuery]);

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
        console.log('Действие:', action);
    }
  }, [router]);

  return (
    <header className="header">
      <div className="header-container">
        {/* Top Navigation Bar */}
        <div className="nav-bar">
          {/* Logo */}
          <div className="logo" onClick={() => router.push('/')} style={{ cursor: 'pointer' }}>
            <Image
              src="/images/logo.png"
              alt="PAUL"
              width={220}
              height={75}
              className="logo-image"
            />
          </div>

          {/* Main Navigation */}
          <nav className="main-nav">
            <a href="/cakes" className="nav-link">{t('nav.cakes_pies')}</a>
            <a href="/viennoiserie" className="nav-link">{t('nav.viennoiserie')}</a>
            <a href="/patisserie" className="nav-link">{t('nav.patisserie')}</a>
            <a href="/platters" className="nav-link">{t('nav.platters')}</a>
            <a href="/bread" className="nav-link">{t('nav.bread')}</a>
            <a href="/macarons" className="nav-link">{t('nav.macarons')}</a>
          </nav>

          {/* Right Side Actions */}
          <div className="right-actions">
            {/* Search */}
            <div className={`search-container ${isSearchExpanded ? 'expanded' : ''}`}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder={isSearchExpanded ? t('search.placeholder') : ''}
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={handleSearchClick}
                  onBlur={handleSearchBlur}
                />
                <Search className="search-icon" size={18} />
              </form>
            </div>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Profile Icon */}
            <button 
              className="icon-button" 
              aria-label={isAuthenticated ? t('aria.profile') : t('aria.login')}
              onClick={handleLogin}
            >
              <User className="icon" size={23} />
            </button>

            {/* Cart Icon */}
            <button 
              className="icon-button cart-button" 
              aria-label={t('aria.cart')}
              onClick={handleCartClick}
            >
              <BasketIcon className="icon" size={23} />
              {getTotalItems() > 0 && (
                <span className="cart-badge">{getTotalItems()}</span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-button" aria-label={t('aria.menu')}>
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="action-buttons">
          {/* Find a PAUL */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Find a PAUL')}
          >
            <MapPin className="action-button-icon" size={12} />
            <span>{t('action.find_paul')}</span>
          </button>

          {/* Click & Collect */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Click & Collect')}
          >
            <ShoppingBag className="action-button-icon" size={12} />
            <span>{t('action.click_collect')}</span>
          </button>

          {/* Catering Menu */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Catering Menu')}
          >
            <FileText className="action-button-icon" size={12} />
            <span>{t('action.catering_menu')}</span>
          </button>

          {/* Plan an Event */}
          <button 
            className="action-button plan-event"
            onClick={() => handleActionClick('Plan an Event')}
          >
            <span>{t('action.plan_event')}</span>
            <span className="plan-event-badge">!</span>
          </button>
        </div>
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
      />
    </header>
  );
});

export default Header;