"use client";

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ShoppingBag, FileText, Menu, X, Globe } from 'lucide-react';
import CartModal from './CartModal';
import EventPlanningModal from './EventPlanningModal';
import EventSuccessNotification from './EventSuccessNotification';
import { useCart } from '@/contexts/CartContext';
import { useCartModal } from '@/contexts/CartModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import './Header.css';

const Header: React.FC = React.memo(function Header() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const { isOpen: isCartModalOpen, openModal: openCartModal, closeModal: closeCartModal } = useCartModal();
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [showEventSuccessNotification, setShowEventSuccessNotification] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const closeMobileMenu = useCallback(() => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMenuClosing(false);
    }, 400);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      setIsMobileMenuOpen(true);
    }
  }, [isMobileMenuOpen, closeMobileMenu]);

  const handleLogin = useCallback(() => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/auth/login');
    }
    closeMobileMenu();
  }, [isAuthenticated, router, closeMobileMenu]);

  const handleCartClick = useCallback(() => {
    openCartModal();
  }, [openCartModal]);

  const handleSubscribe = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      // TODO: Implement newsletter subscription endpoint
      // Temporary notification
      alert('Newsletter subscription is coming soon! Thank you for your interest.');
      console.log('Subscribed with email:', email);
      setEmail('');
      closeMobileMenu();
    }
  }, [email, closeMobileMenu]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const handleSearchClick = useCallback(() => {
    if (isMobile) {
      setIsSearchExpanded(true);
    } else {
      setIsSearchExpanded(true);
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
        console.log('Действие:', action);
    }
  }, [router]);

  const handleLanguageToggle = useCallback(() => {
    setCurrentLanguage(prev => prev === 'en' ? 'az' : 'en');
  }, []);

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
              width={329}
              height={120}
              className="logo-image"
            />
          </div>

          {/* Main Navigation */}
          <nav className="main-nav">
            <Link href="/cakes" className="nav-link">Cakes & Pies</Link>
            <Link href="/viennoiserie" className="nav-link">Viennoiserie</Link>
            <Link href="/patisserie" className="nav-link">Patisserie</Link>
            <Link href="/platters" className="nav-link">Platters</Link>
            <Link href="/bread" className="nav-link">Bread</Link>
            <Link href="/Savoury" className="nav-link">Savoury</Link>
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
              <div className="search-container">
                <form onSubmit={handleSearch} suppressHydrationWarning>
                  <input
                    type="text"
                    placeholder="search for product"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suppressHydrationWarning
                  />
                  <Search className="search-icon" size={18} />
                </form>
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

            {/* Language Toggle - Desktop only */}
            {!isMobile && (
              <button
                className="icon-button"
                aria-label={`Switch to ${currentLanguage === 'en' ? 'Azerbaijani' : 'English'}`}
                onClick={handleLanguageToggle}
                title={`Current: ${currentLanguage === 'en' ? 'English' : 'Azərbaycan'}`}
              >
                <Globe className="icon" size={20} />
              </button>
            )}

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
            <span>Find a PAUL</span>
          </button>

          {/* Click & Collect */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Click & Collect')}
          >
            <ShoppingBag className="action-button-icon" size={12} />
            <span>Click & Collect</span>
          </button>

          {/* Catering Menu */}
          <button 
            className="action-button"
            onClick={() => handleActionClick('Catering Menu')}
          >
            <FileText className="action-button-icon" size={12} />
            <span>Catering Menu</span>
          </button>

          {/* Plan an Event */}
          <div className="plan-event-container">
            <button 
              className="action-button plan-event" 
              onClick={() => handleActionClick('Plan an Event')}
            >
              <span>Plan an Event</span>
              <span className="plan-event-badge">i</span>
            </button>
            <div className="plan-event-tooltip">
              Planning an event is a great option for those who want to host but aren't sure what to order that fits their budget. Click here, and we'll assist you.
            </div>
          </div>
      </div>
    </div>

    {/* Mobile Menu */}
    <div className="mobile-menu-container">
        {isMobile && isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className={`mobile-menu-content ${isMenuClosing ? 'closing' : ''}`}>
              {/* Mobile Menu Header */}
              <div className="mobile-menu-header">
                <div className="mobile-menu-logo" onClick={() => router.push('/')}>
                  <Image
                    src="/images/logo.png"
                    alt="PAUL"
                    width={329}
                    height={120}
                    className="logo-image"
                    style={{ cursor: 'pointer' }}
                  />
                </div>
                <div className="mobile-menu-header-actions">
                  <button 
                    className="icon-button" 
                    aria-label="Search"
                    onClick={() => {
                      closeMobileMenu();
                      setIsSearchExpanded(true);
                    }}
                    onTouchStart={() => {}} // iOS Safari touch fix
                    type="button"
                  >
                    <Search className="icon" size={20} />
                  </button>
                  
                  
                  <button 
                    className="icon-button cart-button" 
                    aria-label="Shopping Cart"
                    onClick={() => {
                      closeMobileMenu();
                      handleCartClick();
                    }}
                    onTouchStart={() => {}} // iOS Safari touch fix
                    type="button"
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
                  <button 
                    className="icon-button" 
                    aria-label="Close menu"
                    onClick={closeMobileMenu}
                    onTouchStart={() => {}} // iOS Safari touch fix
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
                  Cakes & Pies
                </Link>
                <Link href="/viennoiserie" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Viennoiserie
                </Link>
                <Link href="/patisserie" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Patisserie
                </Link>
                <Link href="/platters" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Platters
                </Link>
                <Link href="/bread" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Bread
                </Link>
                <Link href="/Savoury" className="mobile-nav-link" onClick={closeMobileMenu}>
                  Savoury
                </Link>
              </nav>

              {/* Divider */}
              <div className="mobile-menu-divider"></div>

              {/* My Account */}
              <button 
                className="mobile-menu-item"
                onClick={() => {
                  if (isAuthenticated) {
                    router.push('/profile');
                  } else {
                    router.push('/auth/login');
                  }
                  closeMobileMenu();
                }}
                onTouchStart={() => {}} // iOS Safari touch fix
                type="button"
              >
                My Account
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
                Contact Us
              </button>

              {/* Log in */}
              <button 
                className="mobile-menu-item"
                onClick={handleLogin}
                onTouchStart={() => {}} // iOS Safari touch fix
                type="button"
              >
                {isAuthenticated ? 'Profile' : 'Login'}
              </button>
              </div>

              <div>
              {/* Newsletter */}
              <div className="mobile-menu-newsletter">
                <h3 className="mobile-menu-newsletter-title">Join our Newsletter</h3>
                <p className="mobile-menu-newsletter-description">
                  Be the first to know our latest news
                </p>
                <form className="mobile-menu-newsletter-form" onSubmit={handleSubscribe}>
                  <input
                    type="email"
                    placeholder="Enter your email here"
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
                    Subscribe
                  </button>
                </form>
              </div>

              {/* Social Media */}
              <div className="mobile-menu-social">
                <a href="#" className="mobile-menu-social-link" aria-label="Instagram">
                  <Image
                    src="/images/3463469_instagram_social media_social_network_icon 1.svg"
                    alt="Instagram"
                    width={26}
                    height={26}
                  />
                </a>
                <a href="#" className="mobile-menu-social-link" aria-label="YouTube">
                  <Image
                    src="/images/3463481_media_network_social_youtube_icon 1.svg"
                    alt="YouTube"
                    width={26}
                    height={26}
                  />
                </a>
                <a href="#" className="mobile-menu-social-link" aria-label="Facebook">
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
        )}

        {/* Mobile Search Modal */}
        {isMobile && isSearchExpanded && (
          <div className="mobile-search-modal" onClick={handleSearchClose}>
            <div className="mobile-search-content" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-search-header">
                <h3>Search</h3>
                <button 
                  className="mobile-search-close"
                  onClick={handleSearchClose}
                  aria-label="Close search"
                  onTouchStart={() => {}} // iOS Safari touch fix
                  type="button"
                >
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSearch} className="mobile-search-form">
                <input
                  type="text"
                  placeholder="search for product"
                  className="mobile-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="mobile-search-button"
                  onTouchStart={() => {}} // iOS Safari touch fix
                >
                  <Search size={20} />
                </button>
              </form>
            </div>
          </div>
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