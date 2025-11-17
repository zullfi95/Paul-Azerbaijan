'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '../../../contexts/AuthContext';
import { BEO } from '../../../types/enhanced';
import { Order } from '../../../config/api';
import BEOGenerator from '../../../components/beo/BEOGenerator';
import DashboardLayout from '../../../components/DashboardLayout';
import BEOViewer from '../../../components/beo/BEOViewer';
import { Button } from '../../../components/ui/Button';
import { makeApiRequest, extractApiData } from '../../../utils/apiHelpers';

export default function BEOPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const [beos, setBeos] = useState<BEO[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedBEO, setSelectedBEO] = useState<BEO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Загружаем заказы
      const ordersResult = await makeApiRequest<Order[]>('/orders');
      if (ordersResult.success && ordersResult.data) {
        setOrders(extractApiData(ordersResult.data) || []);
      } else {
        setError(t('beo.loadOrdersError'));
      }

      // Загружаем BEO
      const beosResult = await makeApiRequest<BEO[]>('/beos');
      if (beosResult.success && beosResult.data) {
        setBeos(extractApiData(beosResult.data) || []);
      } else {
        setError(t('beo.loadBEOError'));
      }
    } catch (err) {
      setError(t('beo.loadDataError'));
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание нового BEO
  const handleCreateBEO = async (beoData: Record<string, unknown>) => {
    const beo = beoData as unknown as BEO; // Приведение типа
    try {
      const result = await makeApiRequest<BEO>('/beos', {
        method: 'POST',
        body: JSON.stringify(beo),
      });

      if (result.success && result.data) {
        const newBeo = result.data;
        setBeos(prev => [...prev, newBeo]);
        setSelectedOrder(null);
        setSelectedBEO(newBeo);
      } else {
        setError(result.message || t('beo.createBEOError'));
      }
    } catch (err) {
      setError(t('beo.createBEOError'));
      console.error('Error creating BEO:', err);
    }
  };


  // Печать BEO
  const handlePrintBEO = (beo: BEO) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>BEO #${beo.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .section h3 { background: #f5f5f5; padding: 5px 10px; margin: 0 0 10px 0; }
              .info { margin: 5px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>BEO #${beo.id}</h1>
              <h2>${beo.event_name}</h2>
              <p>${t('beo.order')} #${beo.order_id} • ${new Date(beo.event_date).toLocaleDateString('ru-RU')} ${t('beo.at')} ${beo.event_time}</p>
            </div>
            
            <div class="section">
              <h3>${t('beo.eventInformation')}</h3>
              <div class="info"><span class="label">${t('beo.name')}:</span> ${beo.event_name}</div>
              <div class="info"><span class="label">${t('beo.date')}:</span> ${new Date(beo.event_date).toLocaleDateString('ru-RU')}</div>
              <div class="info"><span class="label">${t('beo.time')}:</span> ${beo.event_time}</div>
              <div class="info"><span class="label">${t('beo.venue')}:</span> ${beo.venue}</div>
              <div class="info"><span class="label">${t('beo.guestCount')}:</span> ${beo.guest_count}</div>
            </div>
            
            <div class="section">
              <h3>${t('beo.contactInformation')}</h3>
              <div class="info"><span class="label">${t('beo.contactPerson')}:</span> ${beo.contact_person}</div>
              <div class="info"><span class="label">${t('beo.phone')}:</span> ${beo.contact_phone}</div>
              <div class="info"><span class="label">${t('beo.email')}:</span> ${beo.contact_email}</div>
            </div>
            
            ${beo.special_instructions ? `
              <div class="section">
                <h3>${t('beo.specialInstructions')}</h3>
                <p>${beo.special_instructions}</p>
              </div>
            ` : ''}
            
            ${beo.setup_requirements ? `
              <div class="section">
                <h3>${t('beo.setupRequirements')}</h3>
                <p>${beo.setup_requirements}</p>
              </div>
            ` : ''}
            
            ${beo.dietary_restrictions ? `
              <div class="section">
                <h3>${t('beo.dietaryRestrictions')}</h3>
                <p>${beo.dietary_restrictions}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Фильтрация заказов без BEO
  const ordersWithoutBEO = orders.filter(order => 
    !beos.some(beo => parseInt(beo.order_id, 10) === order.id)
  );

  if (!user || user.user_type !== 'staff') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('beo.accessDenied')}</h1>
          <p className="text-gray-600">{t('beo.staffOnly')}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{t('beo.error')}</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData}>{t('beo.tryAgain')}</Button>
        </div>
      </div>
    );
  }

  // Если выбран заказ для создания BEO
  if (selectedOrder) {
    return (
      <BEOGenerator
        order={selectedOrder}
        onSave={handleCreateBEO}
        onCancel={() => setSelectedOrder(null)}
        isLoading={isLoading}
      />
    );
  }

  // Если выбран BEO для просмотра
  if (selectedBEO) {
    return (
      <BEOViewer
        beo={selectedBEO}
        onEdit={() => {
          // Здесь можно добавить логику редактирования
          setSelectedBEO(null);
        }}
        onPrint={() => handlePrintBEO(selectedBEO)}
        onClose={() => setSelectedBEO(null)}
      />
    );
  }

  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('beo.management')}</h1>
          <p className="text-gray-600 mt-2">{t('beo.description')}</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <h3 className="text-lg font-semibold text-gray-900">{t('beo.totalOrders')}</h3>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <h3 className="text-lg font-semibold text-gray-900">{t('beo.createdBEO')}</h3>
            <p className="text-3xl font-bold text-green-600">{beos.length}</p>
          </div>
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <h3 className="text-lg font-semibold text-gray-900">{t('beo.withoutBEO')}</h3>
            <p className="text-3xl font-bold text-orange-600">{ordersWithoutBEO.length}</p>
          </div>
        </div>

        {/* Заказы без BEO */}
        {ordersWithoutBEO.length > 0 && (
          <div className="rounded-lg shadow mb-8" style={{ backgroundColor: '#FFFCF8' }}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{t('beo.ordersWithoutBEO')}</h2>
              <p className="text-gray-600 mt-1">{t('beo.selectOrderToCreate')}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {ordersWithoutBEO.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{t('beo.order')} #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('ru-RU') : t('beo.dateNotSpecified')} {t('beo.at')} {order.delivery_time || t('beo.timeNotSpecified')}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₼{order.total_amount}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="primary"
                    >
                      {t('beo.createBEO')}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Созданные BEO */}
        {beos.length > 0 && (
          <div className="rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">{t('beo.createdBEOs')}</h2>
              <p className="text-gray-600 mt-1">{t('beo.viewAndManage')}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {beos.map(beo => (
                  <div key={beo.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">BEO #{beo.id}</h3>
                      <p className="text-sm text-gray-600">{beo.event_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(beo.event_date).toLocaleDateString('ru-RU')} {t('beo.at')} {beo.event_time}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedBEO(beo)}
                        variant="secondary"
                      >
                        {t('beo.view')}
                      </Button>
                      <Button
                        onClick={() => handlePrintBEO(beo)}
                        variant="secondary"
                      >
                        {t('beo.print')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Пустое состояние */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('beo.noOrders')}</h3>
            <p className="text-gray-600">{t('beo.createOrderToGenerate')}</p>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}
