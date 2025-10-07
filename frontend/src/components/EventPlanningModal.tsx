"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface EventPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EventFormData {
  eventDate: string;
  location: string;
  budget: string;
  guestCount: string;
  details: string;
  email: string;
  phone: string;
}

const EventPlanningModal: React.FC<EventPlanningModalProps> = ({ isOpen, onClose }) => {
  // const { t } = useLanguage(); // Не используется
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<EventFormData>({
    eventDate: '',
    location: '',
    budget: '',
    guestCount: '',
    details: '',
    email: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Здесь будет логика отправки данных на сервер
      // Пока что просто симулируем отправку
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Your event request has been sent successfully! We will contact you soon.');
      onClose();
      
      // Сброс формы
      setFormData({
        eventDate: '',
        location: '',
        budget: '',
        guestCount: '',
        details: '',
        email: '',
        phone: ''
      });
    } catch {
      showNotification('Error sending request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    return formData.eventDate && 
           formData.location && 
           formData.budget && 
           formData.guestCount && 
           formData.details && 
           formData.email && 
           formData.phone;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Полупрозрачный фон */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 40,
          animation: 'fadeIn 0.3s ease',
          cursor: 'pointer'
        }} 
      />
      
      {/* Модальное окно */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '514px',
          height: '735px',
          flexShrink: 0,
          background: '#000000',
          border: 'none',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 50,
          animation: 'fadeInScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Заголовок */}
        <div style={{
          padding: '2rem 2rem 1rem 2rem',
          background: '#000000',
          color: '#FFFCF8',
          position: 'relative'
        }}>
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFCF8',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
              e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
              e.currentTarget.style.borderColor = '#dc3545';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <X size={20} />
          </button>
          
          <div style={{
            marginRight: '60px'
          }}>
            <h2 style={{
              color: '#FFFCF8',
              fontWeight: 400,
              fontSize: '16px',
              margin: '0 0 1rem 0',
              fontFamily: '"Parisine Pro Gris", sans-serif',
              lineHeight: 'normal',
              textAlign: 'center'
            }}>
              Share the details of your event with us, and we&apos;ll do our best to assist you!
            </h2>
          </div>
        </div>

        {/* Форма */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '2rem',
          background: '#000000'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {/* Первая строка - Дата и Место (2 поля рядом) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem'
            }}>
              {/* Дата мероприятия */}
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                placeholder="Date of the event*"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000000',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
              />

              {/* Место проведения */}
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location of the event*"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000000',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* Вторая строка - Бюджет (1 поле на всю ширину) */}
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="Estimated budget*"
              required
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                color: '#000000',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            />

            {/* Третья строка - Количество гостей (1 поле на всю ширину) */}
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleInputChange}
              placeholder="Number of guests* (approximate)"
              required
              min="1"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                color: '#000000',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease'
              }}
            />

            {/* Четвертая строка - Детали запроса (1 поле на всю ширину) */}
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Details of request*"
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                color: '#000000',
                fontSize: '0.875rem',
                transition: 'all 0.3s ease',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />

            {/* Пятая строка - Email и Телефон (2 поля рядом) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem'
            }}>
              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email*"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000000',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease'
                }}
              />

              {/* Телефон + кнопка отправки */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number*"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000000',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease'
                  }}
                />

                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  style={{
                    width: '100%',
                    padding: '1rem 2rem',
                    backgroundColor: isFormValid() ? '#FFFCF8' : 'rgba(255, 255, 255, 0.1)',
                    color: isFormValid() ? '#000000' : 'rgba(255, 255, 255, 0.5)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: isFormValid() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    fontFamily: '"Parisine Pro Gris", sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                  onMouseEnter={(e) => {
                    if (isFormValid()) {
                      e.currentTarget.style.backgroundColor = '#f5f5dc';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 250, 230, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isFormValid()) {
                      e.currentTarget.style.backgroundColor = '#FFFCF8';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {isSubmitting ? 'Sending...' : 'Send a request'}
                </button>
              </div>
            </div>

            {/* Примечание о конфиденциальности */}
            <p style={{
              color: '#FFFCF8',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              textAlign: 'center',
              margin: '1rem 0 0 0',
              fontFamily: '"Parisine Pro Gris", sans-serif'
            }}>
              PAUL respects your privacy and is committed to protecting your personal data in line with applicable data protection laws.
            </p>
          </form>
        </div>
      </div>

      {/* Стили для анимаций */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default EventPlanningModal;
