"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getMinOrderDate } from '../../utils/timeValidations';
import styles from './DeliveryOptions.module.css';

interface DeliveryOptionsProps {
  formData: {
    deliveryType: 'pickup' | 'delivery';
    deliveryDate: string;
    deliveryTime: string;
  };
  errors: Partial<{
    deliveryDate: string;
    deliveryTime: string;
  }>;
  onInputChange: (field: keyof DeliveryOptionsProps['formData'], value: string | boolean) => void;
}

export default function DeliveryOptions({ formData, errors, onInputChange }: DeliveryOptionsProps) {
  // const [showCalendar] = useState(true); // Не используется
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    formData.deliveryDate ? new Date(formData.deliveryDate) : null
  );

  const minDate = new Date(getMinOrderDate());

  // Обновляем выбранную дату при изменении formData.deliveryDate
  useEffect(() => {
    if (formData.deliveryDate) {
      setSelectedDate(new Date(formData.deliveryDate));
    }
  }, [formData.deliveryDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Добавляем пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(selectedDate);
    const dateString = selectedDate.toISOString().split('T')[0];
    onInputChange('deliveryDate', dateString);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date < minDate;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === currentMonth.getMonth() && 
           selectedDate.getFullYear() === currentMonth.getFullYear();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={styles.deliveryOptions}>
      <div className={styles.sectionHeader}>
        Delivery
      </div>

      <h3 className={styles.subtitle}>
        Do you want to pick up your order or have it delivered?
      </h3>

      <div className={styles.deliveryButtons}>
        <div className={styles.deliveryOption}>
          <button
            type="button"
            onClick={() => onInputChange('deliveryType', 'pickup')}
            className={`${styles.deliveryButton} ${formData.deliveryType === 'pickup' ? styles.active : ''}`}
          >
            <Image src="/images/clickandcollecticon.svg" alt="Click & Collect" width={24} height={24} className={styles.buttonIcon} />
            <span>Click & Collect</span>
          </button>
          <p className={styles.deliveryDescription}>
            Pick up your order from our nearest location
          </p>
        </div>

        <div className={styles.deliveryOption}>
          <button
            type="button"
            onClick={() => onInputChange('deliveryType', 'delivery')}
            className={`${styles.deliveryButton} ${formData.deliveryType === 'delivery' ? styles.active : ''}`}
          >
            <Image src="/images/deliveryicon.svg" alt="Delivery" width={24} height={24} className={styles.buttonIcon} />
            <span>Delivery by Courier</span>
          </button>
          <p className={styles.deliveryDescription}>
            We deliver your order directly to your address
          </p>
        </div>
      </div>


      <h3 className={styles.subtitle}>
        Choose delivery time & date
      </h3>

      <div className={styles.timeSelection}>
        <div className={styles.fieldGroup}>
          <div className={styles.datePickerContainer}>
            <h4 className={styles.fieldTitle}>Delivery date *</h4>
            
            <div className={styles.calendar}>
                <div className={styles.calendarHeader}>
                  <button
                    type="button"
                    onClick={goToPreviousMonth}
                    className={styles.calendarNavButton}
                  >
                    ‹
                  </button>
                  <h3 className={styles.calendarTitle}>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    type="button"
                    onClick={goToNextMonth}
                    className={styles.calendarNavButton}
                  >
                    ›
                  </button>
                </div>
                
                <div className={styles.calendarDays}>
                  {dayNames.map(day => (
                    <div key={day} className={styles.dayName}>
                      {day}
                    </div>
                  ))}
                  
                  {getDaysInMonth(currentMonth).map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => day && handleDateSelect(day)}
                      disabled={!day || isDateDisabled(day)}
                      className={`${styles.calendarDay} ${
                        day && isDateSelected(day) ? styles.selectedDay : ''
                      } ${
                        day && isDateDisabled(day) ? styles.disabledDay : ''
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
          </div>
          {errors.deliveryDate && <span className={styles.errorMessage}>{errors.deliveryDate}</span>}
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.timePickerContainer}>
            <h4 className={styles.fieldTitle}>Delivery time *</h4>
            
            <div className={styles.timeSlots}>
              {['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00', '20:00 - 22:00', '22:00 - 00:00'].map((timeSlot) => (
                <button
                  key={timeSlot}
                  type="button"
                  onClick={() => onInputChange('deliveryTime', timeSlot.split(' - ')[0])}
                  className={`${styles.timeSlot} ${
                    formData.deliveryTime === timeSlot.split(' - ')[0] ? styles.selectedTimeSlot : ''
                  }`}
                >
                  {timeSlot}
                </button>
              ))}
            </div>
          </div>
          {errors.deliveryTime && <span className={styles.errorMessage}>{errors.deliveryTime}</span>}
        </div>
      </div>
    </div>
  );
}
