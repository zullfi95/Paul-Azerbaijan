"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from 'next-intl';
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { LOCALE_NAMES, LOCALE_FLAGS, type Locale } from "../i18n/config";
import {
  DashboardIcon,
  FileTextIcon,
  UsersIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
  MenuIcon,
  XIcon,
  BookOpenIcon,
  UtensilsIcon
} from "./Icons";
import { canManageMenu, canViewKitchen } from "../utils/authConstants";
import { getShortRoleLabel } from "../utils/userHelpers";

interface DashboardSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const t = useTranslations();
  const { locale, setLocale, availableLocales } = useLanguage();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="dashboard-mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label={t('sidebar.openMenu')}
      >
        <MenuIcon size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="dashboard-mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="dashboard-sidebar-header">
          <h1 className="dashboard-sidebar-title">PAUL Dashboard</h1>
          <p className="dashboard-sidebar-subtitle">{t('sidebar.coordinatorPanel')}</p>
        </div>

        <nav className="dashboard-sidebar-nav">
          <div className="dashboard-nav-section">{t('sidebar.main')}</div>
          <Link
            href="/dashboard"
            className={`dashboard-nav-link ${pathname === "/dashboard" ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('sidebar.dashboardOverview')}
          >
            <DashboardIcon size={18} />
            <span>{t('sidebar.overview')}</span>
          </Link>
          <Link
            href="/dashboard/applications"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/applications") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('sidebar.manageApplications')}
          >
            <FileTextIcon size={18} />
            <span>{t('sidebar.applications')}</span>
          </Link>
          <Link
            href="/dashboard/orders"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/orders") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('sidebar.manageOrders')}
          >
            <ShoppingBagIcon size={18} />
            <span>{t('sidebar.orders')}</span>
          </Link>
          <Link
            href="/dashboard/users"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/users") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('sidebar.manageUsers')}
          >
            <UsersIcon size={18} />
            <span>{t('sidebar.users')}</span>
          </Link>
          <Link
            href="/dashboard/calendar"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/calendar") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('sidebar.orderCalendar')}
          >
            <CalendarIcon size={18} />
            <span>{t('sidebar.calendar')}</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/reports") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={t('sidebar.reportsAnalytics')}
          >
            <ChartBarIcon size={18} />
            <span>{t('sidebar.reports')}</span>
          </Link>

          {user && canManageMenu(user) && (
            <Link
              href="/dashboard/positions"
              className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/positions") ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={t('sidebar.manageMenuPositions')}
            >
              <BookOpenIcon size={18} />
              <span>{t('sidebar.positions')}</span>
            </Link>
          )}

          {user && canViewKitchen(user) && (
            <Link
              href="/dashboard/kitchen"
              className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/kitchen") ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label={t('sidebar.kitchen')}
            >
              <UtensilsIcon size={18} />
              <span>{t('sidebar.kitchen')}</span>
            </Link>
          )}
        </nav>

        <div className="dashboard-sidebar-footer">
          {/* Language Selector */}
          <div className="dashboard-language-selector" style={{ 
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-3)',
            borderTop: '1px solid var(--paul-border)',
            borderBottom: '1px solid var(--paul-border)'
          }}>
            <label style={{ 
              display: 'block',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              color: 'var(--paul-gray)',
              marginBottom: 'var(--space-2)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {t('sidebar.language')}
            </label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                border: '1px solid var(--paul-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                backgroundColor: 'var(--paul-white)',
                color: 'var(--paul-black)',
                cursor: 'pointer'
              }}
              aria-label={t('sidebar.selectLanguage')}
            >
              {availableLocales.map((loc) => (
                <option key={loc} value={loc}>
                  {LOCALE_FLAGS[loc]} {LOCALE_NAMES[loc]}
                </option>
              ))}
            </select>
          </div>

          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="dashboard-user-details">
              <h4>{user?.name}</h4>
              <p>{getShortRoleLabel(user)}</p>
            </div>
          </div>
          <button onClick={logout} className="dashboard-logout-btn">
            {t('sidebar.logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
