"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useAuth } from "../../contexts/AuthContext";
import { Application, Order, User } from "../../types/common";
import { makeApiRequest, extractApiData, handleApiError } from "../../utils/apiHelpers";
import { useAuthGuard, canViewDashboard } from "../../utils/authConstants";
import DashboardLayout from "../../components/DashboardLayout";
import MiniCalendar from "../../components/MiniCalendar";
import { 
    UsersIcon, 
    BookOpenIcon, 
    ShoppingBagIcon, 
    CheckCircleIcon,
    FileTextIcon
} from "../../components/Icons";
import "../../styles/dashboard.css";
import styles from "../../styles/dashboard.module.css";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [filterClientType, setFilterClientType] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [loading, setLoading] = useState(true);

  const hasAccess = useAuthGuard(isAuthenticated, isLoading, user, canViewDashboard, router);

  const loadClients = useCallback(async () => {
    try {
        const result = await makeApiRequest<User[]>("/clients");
        if (result.success) {
            setClients(extractApiData(result.data));
        } else {
            console.error("Failed to fetch clients");
        }
    } catch (error) {
        console.error("Error fetching clients:", error);
    }
  }, []);

  const loadApplications = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterClientId) params.append('client_id', filterClientId);
    if (filterClientType && !filterClientId) params.append('client_type', filterClientType);
    
    try {
      const result = await makeApiRequest<Application[]>(`/applications?${params.toString()}`);
      if (result.success) {
        setApplications(extractApiData(result.data));
      } else {
        console.error("Failed to load applications:", result.error);
      }
    } catch (e) {
      console.error(e);
    }
  }, [filterClientId, filterClientType]);

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterClientId) params.append('client_id', filterClientId);
    if (filterClientType && !filterClientId) params.append('client_type', filterClientType);

    try {
      const result = await makeApiRequest<Order[]>(`/orders?${params.toString()}`);
      if (result.success) {
        setOrders(extractApiData(result.data));
      } else {
        console.error("Failed to load orders:", result.error);
      }
    } catch (e) {
      console.error(e);
    }
  }, [filterClientId, filterClientType]);

  useEffect(() => {
    if (hasAccess) {
      setLoading(true);
      Promise.all([loadClients(), loadApplications(), loadOrders()]).finally(() => setLoading(false));
    }
  }, [hasAccess, loadClients, loadApplications, loadOrders]);

  const recentApplications = useMemo(
    () => applications.slice(0, 5),
    [applications]
  );

  const upcomingOrders = useMemo(() => orders.filter(o => new Date(o.delivery_date || '') > new Date()), [orders]);

  const stats = useMemo(
    () => ({
        totalClients: clients.length,
        newApplications: applications.filter(a => a.status === 'pending').length,
        ordersInProgress: orders.filter(o => o.status === 'in_progress').length,
        completedOrders: orders.filter(o => o.status === 'completed').length,
    }),
    [applications, orders, clients]
  );
  
    const exportSectionToPdf = async (elementId: string, fileName: string) => {
        const input = document.getElementById(elementId);
        if (input) {
            const canvas = await html2canvas(input);
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;
            const imgHeight = pdfWidth * ratio;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            pdf.save(`${fileName}.pdf`);
        }
    };

    const handleExcelExport = () => {
        const wb = XLSX.utils.book_new();

        const statsData = [
            [t('dashboard.totalClients'), stats.totalClients],
            [t('dashboard.newApplications'), stats.newApplications],
            [t('dashboard.ordersInProgress'), stats.ordersInProgress],
            [t('dashboard.completedOrders'), stats.completedOrders],
        ];
        const wsStats = XLSX.utils.aoa_to_sheet(statsData);
        XLSX.utils.book_append_sheet(wb, wsStats, t('dashboard.statistics'));

        const applicationsData = recentApplications.map(app => ({
            [t('common.id')]: app.id,
            [t('common.client')]: app.client?.name || `${app.first_name} ${app.last_name}`,
            [t('common.date')]: new Date(app.created_at).toLocaleDateString(),
            [t('common.status')]: t(`statuses.${app.status}`),
        }));
        const wsApps = XLSX.utils.json_to_sheet(applicationsData);
        XLSX.utils.book_append_sheet(wb, wsApps, t('dashboard.recentApplications'));

        const ordersData = upcomingOrders.map(order => ({
            [t('common.id')]: order.id,
            [t('common.client')]: order.client?.name || order.company_name,
            [t('common.deliveryDate')]: new Date(order.delivery_date || '').toLocaleDateString(),
            [t('common.total')]: `${order.total_amount} ${t('common.currency')}`,
            [t('common.status')]: t(`statuses.${order.status}`),
        }));
        const wsOrders = XLSX.utils.json_to_sheet(ordersData);
        XLSX.utils.book_append_sheet(wb, wsOrders, t('dashboard.upcomingOrders'));

        XLSX.writeFile(wb, 'Dashboard_Report.xlsx');
    };

  if (isLoading || !hasAccess) {
    return <div>{t('common.loading')}</div>;
  }

  return (
    <DashboardLayout>
      <div className={styles.dashboard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('dashboard.title')}</h1>
          <div className={styles.filters}>
            <select
                value={filterClientType}
                onChange={(e) => {
                    setFilterClientType(e.target.value);
                    setFilterClientId('');
                }}
                className={styles.filterSelect}
            >
                <option value="">{t('filters.allClientTypes')}</option>
                <option value="corporate">{t('filters.corporate')}</option>
                <option value="one_time">{t('filters.oneTime')}</option>
            </select>
            <select
                value={filterClientId}
                onChange={(e) => setFilterClientId(e.target.value)}
                className={styles.filterSelect}
                disabled={!clients.length}
            >
                <option value="">{t('filters.allClients')}</option>
                {clients
                    .filter(client => !filterClientType || client.client_category === filterClientType)
                    .map(client => (
                        <option key={client.id} value={client.id}>
                            {client.name} {client.company_name ? `(${client.company_name})` : ''}
                        </option>
                    ))
                }
            </select>
          </div>
          <div className={styles.actions}>
            <button className={styles.exportButton} onClick={handleExcelExport}>
              <FileTextIcon />
              {t('dashboard.exportExcel')}
            </button>
          </div>
        </div>

        {loading ? (
            <div>{t('common.loadingData')}</div>
        ) : (
            <>
                <div className={styles.statsGrid} id="stats-section">
                    <div className={styles.statCard}>
                        <UsersIcon />
                        <div className={styles.statCardInfo}>
                            <span className={styles.statCardLabel}>{t('dashboard.totalClients')}</span>
                            <span className={styles.statCardValue}>{stats.totalClients}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <BookOpenIcon />
                        <div className={styles.statCardInfo}>
                            <span className={styles.statCardLabel}>{t('dashboard.newApplications')}</span>
                            <span className={styles.statCardValue}>{stats.newApplications}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <ShoppingBagIcon />
                        <div className={styles.statCardInfo}>
                            <span className={styles.statCardLabel}>{t('dashboard.ordersInProgress')}</span>
                            <span className={styles.statCardValue}>{stats.ordersInProgress}</span>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <CheckCircleIcon />
                        <div className={styles.statCardInfo}>
                            <span className={styles.statCardLabel}>{t('dashboard.completedOrders')}</span>
                            <span className={styles.statCardValue}>{stats.completedOrders}</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => exportSectionToPdf('stats-section', 'Statistics_Report')} className={styles.pdfExportButton}>
                    <FileTextIcon /> {t('dashboard.exportToPdf')}
                </button>

                <div className={styles.columns}>
                    <div className={styles.column} id="applications-section">
                        <h2 className={styles.sectionTitle}>
                            {t('dashboard.recentApplications')}
                        </h2>
                        <div className={styles.card}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('common.id')}</th>
                                        <th>{t('common.client')}</th>
                                        <th>{t('common.date')}</th>
                                        <th>{t('common.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentApplications.map((app) => (
                                        <tr key={app.id} onClick={() => router.push(`/dashboard/applications`)}>
                                            <td>{app.id}</td>
                                            <td>{app.client?.name || `${app.first_name} ${app.last_name}`}</td>
                                            <td>{new Date(app.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[app.status]}`}>
                                                    {t(`statuses.${app.status}`)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => exportSectionToPdf('applications-section', 'Applications_Report')} className={styles.pdfExportButton}>
                            <FileTextIcon /> {t('dashboard.exportToPdf')}
                        </button>
                    </div>

                    <div className={styles.column} id="orders-section">
                        <h2 className={styles.sectionTitle}>{t('dashboard.upcomingOrders')}</h2>
                        <div className={styles.card}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('common.id')}</th>
                                        <th>{t('common.client')}</th>
                                        <th>{t('common.deliveryDate')}</th>
                                        <th>{t('common.total')}</th>
                                        <th>{t('common.status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingOrders.map((order) => (
                                        <tr key={order.id} onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                                            <td>{order.id}</td>
                                            <td>{order.client?.name || order.company_name}</td>
                                            <td>{new Date(order.delivery_date || '').toLocaleDateString()}</td>
                                            <td>{order.total_amount} {t('common.currency')}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[order.status]}`}>
                                                    {t(`statuses.${order.status}`)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => exportSectionToPdf('orders-section', 'Orders_Report')} className={styles.pdfExportButton}>
                            <FileTextIcon /> {t('dashboard.exportToPdf')}
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>
    </DashboardLayout>
  );
} 
