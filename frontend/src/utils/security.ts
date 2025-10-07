/**
 * Утилиты для обеспечения безопасности
 */

// Типы для безопасности
export interface SecurityConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  maxRequestSize: number;
  rateLimitWindow: number;
  rateLimitMax: number;
}

// Конфигурация безопасности
export const securityConfig: SecurityConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxRequestSize: 10 * 1024 * 1024, // 10MB
  rateLimitWindow: 15 * 60 * 1000, // 15 минут
  rateLimitMax: 100 // 100 запросов за 15 минут
};

// Хранилище для rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting
export const checkRateLimit = (identifier: string): boolean => {
  const now = Date.now();
  const stored = rateLimitStore.get(identifier);
  
  if (!stored || now > stored.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + securityConfig.rateLimitWindow
    });
    return true;
  }
  
  if (stored.count >= securityConfig.rateLimitMax) {
    return false;
  }
  
  stored.count++;
  return true;
};

// Очистка устаревших записей rate limiting
export const cleanupRateLimit = (): void => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
};

// Валидация размера файла
export const validateFileSize = (file: File): boolean => {
  return file.size <= securityConfig.maxFileSize;
};

// Валидация типа файла
export const validateFileType = (file: File): boolean => {
  return securityConfig.allowedFileTypes.includes(file.type);
};

// Валидация размера запроса
export const validateRequestSize = (data: unknown): boolean => {
  const jsonString = JSON.stringify(data);
  return new Blob([jsonString]).size <= securityConfig.maxRequestSize;
};

// Генерация CSRF токена
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Валидация CSRF токена
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && token.length === 64;
};

// Хеширование пароля (клиентская сторона - только для демонстрации)
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Генерация безопасного токена
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Валидация JWT токена (базовая проверка структуры)
export const validateJWTStructure = (token: string): boolean => {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Очистка чувствительных данных из объекта
export const sanitizeSensitiveData = (obj: unknown): unknown => {
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeSensitiveData(item));
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

// Проверка на SQL инъекции (базовая)
export const detectSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\w+['"]\s*=\s*['"]\w+['"])/i,
    /(\bUNION\s+SELECT\b)/i,
    /(\bDROP\s+TABLE\b)/i,
    /(\bDELETE\s+FROM\b)/i,
    /(\bINSERT\s+INTO\b)/i,
    /(\bUPDATE\s+SET\b)/i
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
};

// Проверка на XSS атаки
export const detectXSS = (input: string): boolean => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
    /<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

// Безопасная обработка пользовательского ввода
export const sanitizeInput = (input: string): string => {
  if (detectSQLInjection(input)) {
    throw new Error('Обнаружена попытка SQL инъекции');
  }
  
  if (detectXSS(input)) {
    throw new Error('Обнаружена попытка XSS атаки');
  }
  
  // Базовая санитизация
  return input
    .replace(/[<>]/g, '') // Удаление угловых скобок
    .replace(/javascript:/gi, '') // Удаление javascript: протокола
    .replace(/vbscript:/gi, '') // Удаление vbscript: протокола
    .trim();
};

// Проверка безопасности файла
export const validateFileSecurity = (file: File): { isValid: boolean; error?: string } => {
  if (!validateFileSize(file)) {
    return { isValid: false, error: 'Файл слишком большой' };
  }
  
  if (!validateFileType(file)) {
    return { isValid: false, error: 'Недопустимый тип файла' };
  }
  
  return { isValid: true };
};

// Логирование безопасности
export const logSecurityEvent = (event: string, details: unknown): void => {
  const timestamp = new Date().toISOString();
  const sanitizedDetails = sanitizeSensitiveData(details);
  
  console.warn(`[SECURITY] ${timestamp} - ${event}:`, sanitizedDetails);
  
  // В продакшене здесь должен быть отправка в систему мониторинга
  if (process.env.NODE_ENV === 'production') {
    // Отправка в систему мониторинга безопасности
    // sendToSecurityMonitoring(event, sanitizedDetails);
  }
};

// Проверка безопасности запроса
export const validateRequestSecurity = (data: unknown, identifier: string): { isValid: boolean; error?: string } => {
  // Проверка rate limiting
  if (!checkRateLimit(identifier)) {
    logSecurityEvent('Rate limit exceeded', { identifier });
    return { isValid: false, error: 'Слишком много запросов' };
  }
  
  // Проверка размера запроса
  if (!validateRequestSize(data)) {
    logSecurityEvent('Request too large', { identifier, size: JSON.stringify(data).length });
    return { isValid: false, error: 'Запрос слишком большой' };
  }
  
  // Проверка на подозрительные паттерны
  const dataString = JSON.stringify(data);
  if (detectSQLInjection(dataString)) {
    logSecurityEvent('SQL injection attempt', { identifier, data: dataString });
    return { isValid: false, error: 'Обнаружена попытка SQL инъекции' };
  }
  
  if (detectXSS(dataString)) {
    logSecurityEvent('XSS attempt', { identifier, data: dataString });
    return { isValid: false, error: 'Обнаружена попытка XSS атаки' };
  }
  
  return { isValid: true };
};
