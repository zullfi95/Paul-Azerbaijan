"use client";

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, User, MapPin, ShoppingBag, FileText, Calculator } from 'lucide-react';
import BasketIcon from './BasketIcon';
import LanguageSelector from './LanguageSelector';
import CartModal from './CartModal';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useCartModal } from '../contexts/CartModalContext';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = React.memo(() => {
  const router = useRouter();
  const { t } = useLanguage();
  const { getTotalItems } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

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
    }
  }, [searchQuery, router]);

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
      case 'Calculate budget':
        router.push('/calculator');
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
          <div className="logo">
            <Image
              src="/images/logo.png"
              alt="PAUL"
              width={150}
              height={50}
              className="logo-image"
            />
            <p className="logo-caption">depuis 1889</p>
          </div>

          {/* Main Navigation */}
          <nav className="main-nav">
            <a href="#" className="nav-link">{t('nav.cakes')}</a>
            <a href="#" className="nav-link">{t('nav.platters')}</a>
            <a href="#" className="nav-link">{t('nav.patisserie')}</a>
            <a href="#" className="nav-link">{t('nav.tarts')}</a>
            <a href="#" className="nav-link">{t('nav.bread')}</a>
            <a href="#" className="nav-link">{t('nav.macarons')}</a>
          </nav>

          {/* Right Side Actions */}
          <div className="right-actions">
            {/* Search */}
            <form className="search-container" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder={t('search.placeholder')}
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="search-icon" size={18} />
            </form>

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

          {/* Calculate Budget */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Calculate budget')}
          >
            <Calculator className="action-button-icon" size={12} />
            <span>{t('action.calculate_budget')}</span>
          </button>
        </div>
      </div>
      
      {/* Модальное окно корзины */}
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={closeCartModal} 
      />
    </header>
  );
});

export default Header;