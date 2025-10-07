/**
 * Утилиты для валидации данных
 */

// Типы для валидации
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  custom?: (value: unknown) => string | null;
}

// Валидация email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация телефона
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// Валидация пароля
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну заглавную букву');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну строчную букву');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Пароль должен содержать хотя бы одну цифру');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Универсальная валидация поля
export const validateField = (value: unknown, rules: ValidationRule): string | null => {
  // Проверка обязательности
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'Поле обязательно для заполнения';
  }
  
  if (!value || value.toString().trim() === '') {
    return null; // Если поле не обязательное и пустое, валидация проходит
  }
  
  const stringValue = value.toString();
  
  // Проверка минимальной длины
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `Минимальная длина: ${rules.minLength} символов`;
  }
  
  // Проверка максимальной длины
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `Максимальная длина: ${rules.maxLength} символов`;
  }
  
  // Проверка паттерна
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return 'Неверный формат';
  }
  
  // Проверка email
  if (rules.email && !validateEmail(stringValue)) {
    return 'Неверный формат email';
  }
  
  // Проверка телефона
  if (rules.phone && !validatePhone(stringValue)) {
    return 'Неверный формат телефона';
  }
  
  // Проверка числовых значений
  if (typeof value === 'number' || !isNaN(Number(value))) {
    const numValue = Number(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      return `Минимальное значение: ${rules.min}`;
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      return `Максимальное значение: ${rules.max}`;
    }
  }
  
  // Кастомная валидация
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      return customError;
    }
  }
  
  return null;
};

// Валидация формы
export const validateForm = (data: Record<string, unknown>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: string[] = [];
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(data[field], fieldRules);
    if (error) {
      errors.push(`${field}: ${error}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Санитизация HTML для предотвращения XSS
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Экранирование HTML
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Валидация URL
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Валидация даты
export const validateDate = (date: string): boolean => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

// Валидация времени (соответствует backend формату H:i)
export const validateTime = (time: string): boolean => {
  if (!time) return true; // Пустое время допустимо
  
  // Проверяем формат H:i (например, "14:30" или "9:30")
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Валидация заказа
export const validateOrder = (order: Record<string, unknown>): ValidationResult => {
  const rules: Record<string, ValidationRule> = {
    company_name: { required: true, minLength: 2, maxLength: 100 },
    contact_person: { required: true, minLength: 2, maxLength: 50 },
    contact_phone: { required: true, phone: true },
    contact_email: { required: true, email: true },
    delivery_date: { required: true, custom: (value) => validateDate(value) ? null : 'Неверная дата' },
    delivery_time: { required: true, custom: (value) => validateTime(value) ? null : 'Неверное время' },
    delivery_address: { required: true, minLength: 5, maxLength: 200 },
    guest_count: { required: true, min: 1, max: 1000 }
  };
  
  return validateForm(order, rules);
};

// Валидация пользователя
export const validateUser = (user: Record<string, unknown>): ValidationResult => {
  const rules: Record<string, ValidationRule> = {
    name: { required: true, minLength: 2, maxLength: 50 },
    email: { required: true, email: true },
    phone: { phone: true },
    user_group: { required: true },
    status: { required: true }
  };
  
  return validateForm(user, rules);
};

// Валидация заявки (соответствует backend валидации)
export const validateApplication = (application: Record<string, unknown>): ValidationResult => {
  const rules: Record<string, ValidationRule> = {
    first_name: { required: true, minLength: 2, maxLength: 255 },
    last_name: { required: false, maxLength: 255 },
    phone: { required: true, phone: true, maxLength: 20 },
    email: { required: true, email: true, maxLength: 255 },
    message: { required: false, maxLength: 1000 },
    event_address: { required: false, maxLength: 500 },
    event_date: { required: false, custom: (value) => validateDate(value) ? null : 'Неверная дата' },
    event_time: { required: false, custom: (value) => validateTime(value) ? null : 'Неверное время' },
    event_lat: { required: false, min: -90, max: 90 },
    event_lng: { required: false, min: -180, max: 180 },
    cart_items: { required: false }
  };
  
  return validateForm(application, rules);
};
