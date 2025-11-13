"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotification } from '../contexts/NotificationContext';
import styles from './EventPlanningModal.module.css';

interface EventPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface EventFormData {
  eventDate: string;
  eventTime?: string;
  location: string;
  budget: string;
  guestCount: string;
  details: string;
  email: string;
  phone: string;
  name: string;
}

const EventPlanningModal: React.FC<EventPlanningModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const t = useTranslations('event');
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<EventFormData>({
    eventDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    eventTime: '',
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
        if (onSuccess) {
          onSuccess();
        }
        
        // Close modal immediately
        onClose();
        
        // Reset form
        setFormData({
          eventDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          eventTime: '',
          location: '',
          budget: '',
          guestCount: '',
          details: '',
          email: '',
          phone: '',
          name: ''
        });
      } else {
        showNotification(result.message || t('error'));
      }
    } catch (error) {
      console.error('Event application error:', error);
      showNotification(t('error'));
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
              {t('subtitle')}
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* First row - Date and Time (2 fields side by side) */}
            <div className={styles.gridRow}>
              {/* Event date */}
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className={styles.input}
              />

              {/* Event time */}
              <input
                type="time"
                name="eventTime"
                value={formData.eventTime || ''}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>

            {/* Second row - Location (1 field full width) */}
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder={t('location')}
              required
              className={styles.inputLarge}
            />

            {/* Third row - Budget (1 field full width) */}
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder={t('budget')}
              required
              min="0"
              step="0.01"
              className={styles.inputLarge}
            />

            {/* Fourth row - Number of guests (1 field full width) */}
            <input
              type="number"
              name="guestCount"
              value={formData.guestCount}
              onChange={handleInputChange}
              placeholder={t('guestCount')}
              required
              min="1"
              className={styles.inputLarge}
            />

            {/* Fifth row - Request details (1 field full width) */}
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              placeholder={t('details')}
              required
              rows={3}
              className={styles.textarea}
            />

            {/* Sixth row - Contact Name (1 field full width) */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('name')}
              className={styles.inputLarge}
            />

            {/* Seventh row - Email and Phone (2 fields side by side) */}
            <div className={styles.gridRow}>
              {/* Email */}
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('email')}
                required
                className={styles.input}
              />

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('phone')}
                required
                className={styles.input}
              />
            </div>

            {/* Submit button */}
            <div className={styles.buttonContainer}>
              <button
                type="submit"
                disabled={!isFormValid() || isSubmitting}
                className={styles.submitButton}
                onTouchStart={() => {}} // iOS Safari touch fix
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
            </div>

            {/* Privacy notice */}
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