"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import styles from './EventPlanningModal.module.css';

interface EventPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EventFormData {
  eventDate: string;
  location: string;
  budget: string;
  guestCount: string;
  details: string;
  email: string;
  phone: string;
  name: string;
}

const EventPlanningModal: React.FC<EventPlanningModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // const { t } = useLanguage(); // Not used
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<EventFormData>({
    eventDate: '',
    location: '',
    budget: '',
    guestCount: '',
    details: '',
    email: '',
    phone: '',
    name: ''
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
      const response = await fetch('/api/event-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Show custom success notification via parent component
        console.log('Calling onSuccess callback');
        if (onSuccess) {
          onSuccess();
        }
        
        // Close modal immediately
        onClose();
        
        // Reset form
        setFormData({
          eventDate: '',
          location: '',
          budget: '',
          guestCount: '',
          details: '',
          email: '',
          phone: '',
          name: ''
        });
      } else {
        showNotification(result.message || 'Error sending request. Please try again.');
      }
    } catch (error) {
      console.error('Event application error:', error);
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
      {/* Semi-transparent background */}
      <div 
        onClick={onClose}
        className={styles.overlay}
      />
      
      {/* Modal window */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
      >
        {/* Header */}
        <div className={styles.header}>
          {/* Close button */}
          <button
            onClick={onClose}
            className={styles.closeButton}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <div className={styles.headerContent}>
            <h2 className={styles.title}>
              Share the details of your event with us, and we&apos;ll do our best to assist you!
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* First row - Date and Location (2 fields side by side) */}
            <div className={styles.gridRow}>
              {/* Event date with label */}
              <div className={styles.inputWrapper} data-placeholder="Date of the event*">
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>

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

              {/* Телефон */}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Phone number*"
                required
                className={styles.input}
              />
            </div>

            {/* Кнопка отправки */}
            <div className={styles.buttonContainer}>
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={styles.submitButton}
                onTouchStart={() => {}} // iOS Safari touch fix
              >
                {isSubmitting ? 'Sending...' : 'Send a request'}
              </button>
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
