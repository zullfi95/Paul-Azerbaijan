"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  DashboardIcon,
  FileTextIcon,
  UsersIcon,
  ShoppingBagIcon,
  CalendarIcon,
  ChartBarIcon,
  MenuIcon,
  XIcon,
  BookOpenIcon
} from "./Icons";
import { canManageMenu } from "../utils/authConstants";

interface DashboardSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="dashboard-mobile-menu-btn"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Открыть меню"
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
          <p className="dashboard-sidebar-subtitle">Панель координатора</p>
        </div>

        <nav className="dashboard-sidebar-nav">
          <div className="dashboard-nav-section">Основное</div>
          <Link
            href="/dashboard"
            className={`dashboard-nav-link ${pathname === "/dashboard" ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Обзор дашборда"
          >
            <DashboardIcon size={18} />
            <span>Обзор</span>
          </Link>
          <Link
            href="/dashboard/applications"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/applications") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Управление заявками"
          >
            <FileTextIcon size={18} />
            <span>Заявки</span>
          </Link>
          <Link
            href="/dashboard/orders"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/orders") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Управление заказами"
          >
            <ShoppingBagIcon size={18} />
            <span>Заказы</span>
          </Link>
          <Link
            href="/dashboard/users"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/users") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Управление пользователями"
          >
            <UsersIcon size={18} />
            <span>Пользователи</span>
          </Link>
          <Link
            href="/dashboard/calendar"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/calendar") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Календарь заказов"
          >
            <CalendarIcon size={18} />
            <span>Календарь</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/reports") ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Отчеты и аналитика"
          >
            <ChartBarIcon size={18} />
            <span>Отчеты</span>
          </Link>

          {user && canManageMenu(user) && (
            <Link
              href="/dashboard/positions"
              className={`dashboard-nav-link ${pathname?.startsWith("/dashboard/positions") ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Управление позициями меню"
            >
              <BookOpenIcon size={18} />
              <span>Позиции</span>
            </Link>
          )}
        </nav>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-info">
            <div className="dashboard-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="dashboard-user-details">
              <h4>{user?.name}</h4>
              <p>{user?.position || user?.staff_role}</p>
            </div>
          </div>
          <button onClick={logout} className="dashboard-logout-btn">
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
