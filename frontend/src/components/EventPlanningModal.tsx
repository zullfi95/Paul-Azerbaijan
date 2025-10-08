"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import styles from './EventPlanningModal.module.css';

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
        className={styles.overlay}
      />
      
      {/* Модальное окно */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
      >
        {/* Заголовок */}
        <div className={styles.header}>
          {/* Кнопка закрытия */}
          {/* <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <X size={20} />
          </button> */}
          
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              Share the details of your event with us, and we&apos;ll do our best to assist you!
            </h2>
          </div>
        </div>

        {/* Форма */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Первая строка - Дата и Место (2 поля рядом) */}
            <div className={styles.gridRow}>
              {/* Дата мероприятия */}
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                placeholder="Date of the event*"
                required
                className={styles.input}
              />

              {/* Место проведения */}
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Location of the event*"
                required
                className={styles.input}
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
              className={styles.inputLarge}
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
              className={styles.inputLarge}
            />

            {/* Четвертая строка - Детали запроса (1 поле на всю ширину) */}
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder="Details of request*"
              required
              rows={3}
              className={styles.textarea}
            />

            {/* Пятая строка - Email и Телефон (2 поля рядом) */}
            <div className={styles.gridRow}>
              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email*"
                required
                className={styles.input}
              />

              {/* Телефон + кнопка отправки */}
              <div className={styles.phoneButtonColumn}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number*"
                  required
                  className={styles.inputLargePhone}
                />

                <button
                  type="submit"
                  disabled={!isFormValid() || isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? 'Sending...' : 'Send a request'}
                </button>
              </div>
            </div>

            {/* Примечание о конфиденциальности */}
            <p className={styles.privacyNotice}>
              PAUL respects your privacy and is committed to protecting your personal data in line with applicable data protection laws.
            </p>
          </form>
        </div>
      </div>

    </>
  );
};

export default EventPlanningModal;
