"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    // Always start with Dashboard
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard', current: false });
    
    // Add current page
    if (pathSegments.length > 1) {
      const currentPage = pathSegments[1];
      const pageLabels: { [key: string]: string } = {
        'applications': 'Заявки',
        'orders': 'Заказы',
        'users': 'Пользователи',
        'calendar': 'Календарь',
        'reports': 'Отчеты',
        'beo': 'BEO',
        'reset-password': 'Сброс пароля'
      };
      
      const label = pageLabels[currentPage] || currentPage;
      breadcrumbs.push({ 
        label, 
        href: pathname, 
        current: true 
      });
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="dashboard-container">
      <DashboardSidebar 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="dashboard-main">
        {/* Breadcrumbs */}
        <div className="dashboard-breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center">
              {index > 0 && (
                <span className="dashboard-breadcrumb-separator mx-2">/</span>
              )}
              {crumb.current ? (
                <span className="dashboard-breadcrumb-current">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="dashboard-breadcrumb-link">
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
}
