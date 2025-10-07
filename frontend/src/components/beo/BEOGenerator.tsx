import React, { useState } from 'react';
import { Order } from '../../config/api';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../ui';

interface BEOGeneratorProps {
  order: Order;
  onSave: (beo: Record<string, unknown>) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BEOGenerator: React.FC<BEOGeneratorProps> = ({
  order,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    event_name: order.company_name || '',
    event_date: order.delivery_date || '',
    event_time: order.delivery_time || '',
    venue: order.delivery_address || '',
    guest_count: (order as Order & { guest_count?: number }).guest_count || 0,
    contact_person: (order as Order & { contact_person?: string }).contact_person || '',
    contact_phone: (order as Order & { contact_phone?: string }).contact_phone || '',
    contact_email: (order as Order & { contact_email?: string }).contact_email || '',
    special_instructions: (order as Order & { special_instructions?: string }).special_instructions || '',
    setup_requirements: (order as Order & { setup_requirements?: string }).setup_requirements || '',
    dietary_restrictions: (order as Order & { dietary_restrictions?: string }).dietary_restrictions || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const beoData = {
      ...formData,
      order_id: order.id,
      menu_items: order.menu_items,
      total_amount: order.total_amount
    };
    onSave(beoData);
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle size="lg">Создание BEO для заказа #{order.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название мероприятия *
                  </label>
                  <input
                    type="text"
                    value={formData.event_name}
                    onChange={(e) => handleChange('event_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата мероприятия *
                  </label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => handleChange('event_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время мероприятия *
                  </label>
                  <input
                    type="time"
                    value={formData.event_time}
                    onChange={(e) => handleChange('event_time', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Место проведения *
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => handleChange('venue', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Количество гостей *
                  </label>
                  <input
                    type="number"
                    value={formData.guest_count}
                    onChange={(e) => handleChange('guest_count', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Контактное лицо *
                  </label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => handleChange('contact_person', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Особые инструкции
                </label>
                <textarea
                  value={formData.special_instructions}
                  onChange={(e) => handleChange('special_instructions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Дополнительные требования к мероприятию..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Требования к сервировке
                </label>
                <textarea
                  value={formData.setup_requirements}
                  onChange={(e) => handleChange('setup_requirements', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Требования к настройке и сервировке..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Диетические ограничения
                </label>
                <textarea
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleChange('dietary_restrictions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Особые диетические требования..."
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                >
                  Создать BEO
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BEOGenerator;