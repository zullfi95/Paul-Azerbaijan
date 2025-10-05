import { isAfter, isBefore, subHours, addHours, differenceInHours, parseISO } from 'date-fns';

/**
 * Проверяет, можно ли создать заказ (за 72 часов до мероприятия)
 */
export function canCreateOrder(eventDate: Date): boolean {
  const now = new Date();
  const minOrderTime = subHours(eventDate, 72);
  return isAfter(now, minOrderTime) === false;
}

/**
 * Проверяет, можно ли изменить заказ (за 24 часа до мероприятия)
 */
export function canModifyOrder(eventDate: Date): boolean {
  const now = new Date();
  const minModifyTime = subHours(eventDate, 24);
  return isAfter(now, minModifyTime) === false;
}

/**
 * Получает количество часов до крайнего срока заказа
 */
export function getHoursUntilOrderDeadline(eventDate: Date): number {
  const now = new Date();
  const deadline = subHours(eventDate, 72);
  return Math.max(0, differenceInHours(deadline, now));
}

/**
 * Получает количество часов до крайнего срока изменения
 */
export function getHoursUntilModifyDeadline(eventDate: Date): number {
  const now = new Date();
  const deadline = subHours(eventDate, 24);
  return Math.max(0, differenceInHours(deadline, now));
}

/**
 * Проверяет, является ли дата в прошлом
 */
export function isPastDate(date: Date): boolean {
  const now = new Date();
  return isBefore(date, now);
}

/**
 * Получает минимальную дату для создания заказа (сегодня + 72 часов)
 */
export function getMinOrderDate(): string {
  const minDate = addHours(new Date(), 72);
  return minDate.toISOString().split('T')[0];
}

/**
 * Получает сообщение об ошибке для временных ограничений
 */
export function getTimeValidationMessage(eventDate: Date, isModification: boolean = false): string | null {
  if (isPastDate(eventDate)) {
    return 'Нельзя создать заказ на прошедшую дату';
  }

  if (isModification) {
    if (!canModifyOrder(eventDate)) {
      const hours = getHoursUntilModifyDeadline(eventDate);
      if (hours <= 0) {
        return 'Изменение заказа возможно только за 24 часа до мероприятия';
      }
      return `Изменение заказа возможно еще ${hours} часов`;
    }
  } else {
    if (!canCreateOrder(eventDate)) {
      const hours = getHoursUntilOrderDeadline(eventDate);
      if (hours <= 0) {
        return 'Заказы принимаются не менее чем за 72 часов до мероприятия. Вы можете отправить запрос, но подтверждение не гарантируется.';
      }
      return `До крайнего срока заказа осталось ${hours} часов`;
    }
  }

  return null;
}

/**
 * Валидация данных заказа с учетом временных ограничений
 */
export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  canProceed: boolean;
}

export function validateOrderData(data: {
  eventDate: string;
  eventTime?: string;
  isModification?: boolean;
}): OrderValidationResult {
  const result: OrderValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    canProceed: true
  };

  try {
    // Парсим дату мероприятия
    let eventDateTime: Date;
    if (data.eventTime) {
      eventDateTime = parseISO(`${data.eventDate}T${data.eventTime}`);
    } else {
      eventDateTime = parseISO(data.eventDate);
    }

    // Проверяем, что дата не в прошлом
    if (isPastDate(eventDateTime)) {
      result.errors.push('Дата мероприятия не может быть в прошлом');
      result.isValid = false;
      result.canProceed = false;
      return result;
    }

    // Проверяем временные ограничения
    const timeMessage = getTimeValidationMessage(eventDateTime, data.isModification);
    
    if (timeMessage) {
      if (data.isModification && !canModifyOrder(eventDateTime)) {
        result.errors.push(timeMessage);
        result.isValid = false;
        result.canProceed = false;
      } else if (!data.isModification && !canCreateOrder(eventDateTime)) {
        result.warnings.push(timeMessage);
        // Для заказов все равно позволяем продолжить, но с предупреждением
        result.canProceed = true;
      }
    }

    // Проверяем рабочие часы (с 8:00 до 22:00)
    if (data.eventTime) {
      const eventHour = eventDateTime.getHours();
      if (eventHour < 8 || eventHour > 22) {
        result.warnings.push('Мероприятие запланировано вне стандартных рабочих часов (8:00-22:00)');
      }
    }

    // Проверяем выходные дни (для предупреждения)
    const dayOfWeek = eventDateTime.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      result.warnings.push('Мероприятие запланировано на выходные дни');
    }

    } catch {
    result.errors.push('Неверный формат даты или времени');
    result.isValid = false;
    result.canProceed = false;
  }

  return result;
}

/**
 * Хук для проверки временных ограничений в режиме реального времени
 */
export function useTimeValidation(eventDate: string, eventTime?: string, isModification: boolean = false) {
  const validation = validateOrderData({ eventDate, eventTime, isModification });
  
  return {
    ...validation,
    minDate: getMinOrderDate(),
    hoursUntilDeadline: eventDate ? getHoursUntilOrderDeadline(parseISO(eventDate)) : 0,
    hoursUntilModifyDeadline: eventDate ? getHoursUntilModifyDeadline(parseISO(eventDate)) : 0
  };
}
