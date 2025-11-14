"use client";

import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, type View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Order } from '../types/common';
import { STATUS_LABELS, STATUS_COLORS } from '../utils/statusTranslations';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar.css';

const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Order;
  status: string;
}

interface OrderCalendarProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
  onCreateOrder?: (date: Date) => void;
  isLoading?: boolean;
}



export default function OrderCalendar({ orders, onSelectOrder, onCreateOrder, isLoading }: OrderCalendarProps) {
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  // Преобразуем заказы в события календаря
  const events = useMemo((): CalendarEvent[] => {
         return orders.map(order => {
       const deliveryDate = new Date(order.delivery_date || new Date());
       // const deliveryTime = order.delivery_time ? new Date(order.delivery_time) : deliveryDate;
      
      // Устанавливаем время доставки
      const startTime = new Date(deliveryDate);
      if (order.delivery_time) {
        const timeStr = order.delivery_time.toString();
        const [hours, minutes] = timeStr.includes(':') 
          ? timeStr.split(':').map(Number)
          : [parseInt(timeStr.slice(-2)), 0];
        
        startTime.setHours(hours || 9, minutes || 0);
      } else {
        startTime.setHours(9, 0); // По умолчанию 9:00
      }

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2); // +2 часа на мероприятие

      return {
        id: order.id.toString(),
                 title: `${order.company_name} - ${STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] || order.status}`,
        start: startTime,
        end: endTime,
        resource: order,
        status: order.status
      };
    });
  }, [orders]);

  // Кастомный компонент события
  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div 
             style={{
         backgroundColor: STATUS_COLORS[event.status as keyof typeof STATUS_COLORS] || '#6B7280',
        color: 'white',
        padding: '2px 4px',
        borderRadius: '4px',
        fontSize: '12px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {event.title}
    </div>
  );

  // Обработчик выбора события - НЕ показываем модалку здесь, только передаем в родитель
  const handleSelectEvent = (event: CalendarEvent) => {
    // Закрываем внутреннюю модалку, если она открыта
    setShowEventModal(false);
    setSelectedEvent(null);
    // Передаем событие в родительский компонент, который покажет свою модалку
    if (onSelectOrder) {
      onSelectOrder(event.resource);
    }
  };

  // Обработчик выбора слота (создание нового заказа)
  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (onCreateOrder) {
      onCreateOrder(start);
    }
  };


  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{ color: '#6B7280' }}>Загрузка календаря...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Легенда статусов */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#F9F9F6',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: '#1A1A1A'
        }}>
          Статусы заказов:
        </h3>
                 <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
           {Object.entries(STATUS_COLORS).map(([status, color]) => (
             <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <div style={{
                 width: '12px',
                 height: '12px',
                 backgroundColor: color,
                 borderRadius: '50%'
               }} />
               <span style={{ fontSize: '0.875rem', color: '#4A4A4A' }}>
                 {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
               </span>
             </div>
           ))}
         </div>
      </div>

      {/* Календарь */}
      <div style={{ height: '600px', padding: '0' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onView={setCurrentView}
          view={currentView}
          selectable
          components={{
            event: EventComponent
          }}
          messages={{
            today: 'Сегодня',
            previous: 'Назад',
            next: 'Вперед',
            month: 'Месяц',
            week: 'Неделя',
            day: 'День',
            agenda: 'Повестка',
            date: 'Дата',
            time: 'Время',
            event: 'Событие',
            noEventsInRange: 'Нет заказов в этом периоде',
            showMore: (total: number) => `+${total} еще`
          }}
          style={{ height: '100%' }}
        />
      </div>

    </div>
  );
}
