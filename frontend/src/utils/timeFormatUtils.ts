/**
 * Утилиты для работы с форматами времени
 */

/**
 * Конвертирует время в формат H:i для backend
 * @param timeString - время в любом формате
 * @returns время в формате H:i (например, "14:30")
 */
export const formatTimeForBackend = (timeString: string): string => {
  if (!timeString) return '';
  
  // Если уже в формате H:i, возвращаем как есть
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Если в формате HH:mm, возвращаем как есть
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Если в формате с секундами HH:mm:ss, убираем секунды
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString.substring(0, 5);
  }
  
  // Если это Date объект или ISO строка
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().substring(0, 5);
    }
  } catch {
    // Игнорируем ошибки парсинга
  }
  
  // Если ничего не подошло, возвращаем исходную строку
  return timeString;
};

/**
 * Конвертирует время в формат для отображения
 * @param timeString - время в формате H:i
 * @returns время в формате для отображения
 */
export const formatTimeForDisplay = (timeString: string): string => {
  if (!timeString) return '';
  
  // Если в формате H:i, возвращаем как есть
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  return timeString;
};

/**
 * Валидирует формат времени
 * @param timeString - время для валидации
 * @returns true если формат корректный
 */
export const validateTimeFormat = (timeString: string): boolean => {
  if (!timeString) return true; // Пустое время допустимо
  
  // Проверяем формат H:i или HH:mm
  return /^\d{1,2}:\d{2}$/.test(timeString);
};

/**
 * Нормализует время для отправки на backend
 * @param timeString - время в любом формате
 * @returns нормализованное время или null если невалидное
 */
export const normalizeTimeForBackend = (timeString: string): string | null => {
  if (!timeString) return null;
  
  const formatted = formatTimeForBackend(timeString);
  
  if (validateTimeFormat(formatted)) {
    return formatted;
  }
  
  return null;
};
