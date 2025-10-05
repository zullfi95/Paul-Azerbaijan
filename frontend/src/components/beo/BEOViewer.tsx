import React from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../ui';
import { generateBEOFile } from '../../utils/beoGenerator';
import { BEO } from '../../types/enhanced';

interface BEOViewerProps {
  beo: BEO;
  onClose: () => void;
  onEdit?: (beo: BEO) => void;
  onDelete?: (beoId: string) => void;
  isLoading?: boolean;
}

const BEOViewer: React.FC<BEOViewerProps> = ({
  beo,
  onClose,
  onEdit,
  onDelete,
  isLoading = false
}) => {
  const handlePrint = () => {
    // Создаем объект заказа для печати
    const orderForPrint = {
      id: parseInt(beo.order_id),
      order_number: beo.order_id,
      company_name: beo.event_name,
      delivery_date: beo.event_date,
      delivery_time: beo.event_time,
      delivery_address: beo.venue,
      guest_count: beo.guest_count,
      contact_person: beo.contact_person,
      contact_phone: beo.contact_phone,
      contact_email: beo.contact_email,
      special_instructions: beo.special_instructions,
      setup_requirements: beo.setup_requirements,
      dietary_restrictions: beo.dietary_restrictions,
      menu_items: [],
      total_amount: 0,
      status: 'completed' as const,
      created_at: beo.created_at,
      updated_at: beo.updated_at
    };
    
    generateBEOFile(orderForPrint);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle size="lg">BEO #{beo.id}</CardTitle>
                <p className="text-gray-600 mt-2">{beo.event_name}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handlePrint}
                  disabled={isLoading}
                >
                  Печать
                </Button>
                {onEdit && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onEdit(beo)}
                    disabled={isLoading}
                  >
                    Редактировать
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(beo.id)}
                    disabled={isLoading}
                  >
                    Удалить
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Закрыть
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Информация о мероприятии */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о мероприятии</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Название</label>
                    <p className="text-gray-900">{beo.event_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Дата</label>
                    <p className="text-gray-900">{new Date(beo.event_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Время</label>
                    <p className="text-gray-900">{beo.event_time}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Место</label>
                    <p className="text-gray-900">{beo.venue}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Количество гостей</label>
                    <p className="text-gray-900">{beo.guest_count}</p>
                  </div>
                </div>
              </div>

              {/* Контактная информация */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Контактное лицо</label>
                    <p className="text-gray-900">{beo.contact_person}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Телефон</label>
                    <p className="text-gray-900">{beo.contact_phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{beo.contact_email}</p>
                  </div>
                </div>
              </div>

              {/* Особые инструкции */}
              {beo.special_instructions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Особые инструкции</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{beo.special_instructions}</p>
                </div>
              )}

              {/* Требования к сервировке */}
              {beo.setup_requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Требования к сервировке</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{beo.setup_requirements}</p>
                </div>
              )}

              {/* Диетические ограничения */}
              {beo.dietary_restrictions && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Диетические ограничения</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-md">{beo.dietary_restrictions}</p>
                </div>
              )}

              {/* Метаданные */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    <label className="block font-medium">ID заказа</label>
                    <p>#{beo.order_id}</p>
                  </div>
                  <div>
                    <label className="block font-medium">Создан</label>
                    <p>{new Date(beo.created_at).toLocaleString('ru-RU')}</p>
                  </div>
                  <div>
                    <label className="block font-medium">Обновлен</label>
                    <p>{new Date(beo.updated_at).toLocaleString('ru-RU')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BEOViewer;