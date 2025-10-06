'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { BEO, Order } from '../../../types/enhanced';
import BEOGenerator from '../../../components/beo/BEOGenerator';
import BEOViewer from '../../../components/beo/BEOViewer';
import { Button } from '../../../components/ui/Button';
import { makeApiRequest, extractApiData } from '../../../utils/apiHelpers';

export default function BEOPage() {
  const { user } = useAuth();
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
        setError('Ошибка загрузки заказов');
      }

      // Загружаем BEO
      const beosResult = await makeApiRequest<BEO[]>('/beos');
      if (beosResult.success && beosResult.data) {
        setBeos(extractApiData(beosResult.data) || []);
      } else {
        setError('Ошибка загрузки BEO');
      }
    } catch (err) {
      setError('Ошибка загрузки данных');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Создание нового BEO
  const handleCreateBEO = async (beo: BEO) => {
    try {
      const result = await makeApiRequest<BEO>('/beos', {
        method: 'POST',
        body: JSON.stringify(beo),
      });

      if (result.success && result.data) {
        setBeos(prev => [...prev, result.data!]);
        setSelectedOrder(null);
        setSelectedBEO(result.data);
      } else {
        setError(result.message || 'Ошибка создания BEO');
      }
    } catch (err) {
      setError('Ошибка создания BEO');
      console.error('Error creating BEO:', err);
    }
  };

  // Обновление BEO
  const handleUpdateBEO = async (beo: BEO) => {
    try {
      const result = await makeApiRequest<BEO>(`/beos/${beo.id}`, {
        method: 'PUT',
        body: beo,
      });

      if (result.success && result.data) {
        setBeos(prev => prev.map(b => b.id === beo.id ? result.data : b));
        setSelectedBEO(result.data);
      } else {
        setError(result.message || 'Ошибка обновления BEO');
      }
    } catch (err) {
      setError('Ошибка обновления BEO');
      console.error('Error updating BEO:', err);
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
              <p>Заказ #${beo.order_id} • ${new Date(beo.event_date).toLocaleDateString('ru-RU')} в ${beo.event_time}</p>
            </div>
            
            <div class="section">
              <h3>Информация о событии</h3>
              <div class="info"><span class="label">Название:</span> ${beo.event_name}</div>
              <div class="info"><span class="label">Дата:</span> ${new Date(beo.event_date).toLocaleDateString('ru-RU')}</div>
              <div class="info"><span class="label">Время:</span> ${beo.event_time}</div>
              <div class="info"><span class="label">Место:</span> ${beo.venue}</div>
              <div class="info"><span class="label">Количество гостей:</span> ${beo.guest_count}</div>
            </div>
            
            <div class="section">
              <h3>Контактная информация</h3>
              <div class="info"><span class="label">Контактное лицо:</span> ${beo.contact_person}</div>
              <div class="info"><span class="label">Телефон:</span> ${beo.contact_phone}</div>
              <div class="info"><span class="label">Email:</span> ${beo.contact_email}</div>
            </div>
            
            ${beo.special_instructions ? `
              <div class="section">
                <h3>Особые инструкции</h3>
                <p>${beo.special_instructions}</p>
              </div>
            ` : ''}
            
            ${beo.setup_requirements ? `
              <div class="section">
                <h3>Требования к сервировке</h3>
                <p>${beo.setup_requirements}</p>
              </div>
            ` : ''}
            
            ${beo.dietary_restrictions ? `
              <div class="section">
                <h3>Диетические ограничения</h3>
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
    !beos.some(beo => beo.order_id === order.id)
  );

  if (!user || user.user_type !== 'staff') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Доступ запрещен</h1>
          <p className="text-gray-600">Только сотрудники могут создавать BEO</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData}>Попробовать снова</Button>
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Управление BEO</h1>
          <p className="text-gray-600 mt-2">Создание и управление планами мероприятий</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <h3 className="text-lg font-semibold text-gray-900">Всего заказов</h3>
            <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <h3 className="text-lg font-semibold text-gray-900">Создано BEO</h3>
            <p className="text-3xl font-bold text-green-600">{beos.length}</p>
          </div>
          <div className="p-6 rounded-lg shadow" style={{ backgroundColor: '#FFFCF8' }}>
            <h3 className="text-lg font-semibold text-gray-900">Без BEO</h3>
            <p className="text-3xl font-bold text-orange-600">{ordersWithoutBEO.length}</p>
          </div>
        </div>

        {/* Заказы без BEO */}
        {ordersWithoutBEO.length > 0 && (
          <div className="rounded-lg shadow mb-8" style={{ backgroundColor: '#FFFCF8' }}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Заказы без BEO</h2>
              <p className="text-gray-600 mt-1">Выберите заказ для создания BEO</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {ordersWithoutBEO.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Заказ #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.event_date).toLocaleDateString('ru-RU')} в {order.event_time}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.guest_count} гостей • ₼{order.total_amount}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedOrder(order)}
                      variant="primary"
                    >
                      Создать BEO
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
              <h2 className="text-xl font-semibold text-gray-900">Созданные BEO</h2>
              <p className="text-gray-600 mt-1">Просмотр и управление планами мероприятий</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {beos.map(beo => (
                  <div key={beo.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">BEO #{beo.id}</h3>
                      <p className="text-sm text-gray-600">{beo.event_name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(beo.event_date).toLocaleDateString('ru-RU')} в {beo.event_time}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedBEO(beo)}
                        variant="secondary"
                      >
                        Просмотр
                      </Button>
                      <Button
                        onClick={() => handlePrintBEO(beo)}
                        variant="secondary"
                      >
                        Печать
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заказов</h3>
            <p className="text-gray-600">Создайте заказ для генерации BEO</p>
          </div>
        )}
      </div>
    </div>
  );
}
