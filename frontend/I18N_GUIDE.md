# Руководство по интернационализации (i18n)

## Обзор

Проект использует **next-intl** для поддержки нескольких языков:
- 🇬🇧 **Английский** (en) - язык по умолчанию
- 🇦🇿 **Азербайджанский** (az)

## Архитектура

```
frontend/
├── messages/
│   ├── en.json              # Английские переводы
│   └── az.json              # Азербайджанские переводы
├── src/
│   ├── i18n/
│   │   ├── config.ts        # Конфигурация локалей
│   │   └── request.ts       # Серверная конфигурация next-intl
│   ├── contexts/
│   │   └── LanguageContext.tsx  # Контекст для управления языком
│   ├── middleware.ts        # Middleware для определения локали
│   └── app/
│       ├── layout.tsx       # Root layout с провайдером i18n
│       └── Providers.tsx    # Клиентские провайдеры
```

## Использование в компонентах

### Client Components

```typescript
"use client";

import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Server Components

```typescript
import { getTranslations } from 'next-intl/server';

async function MyServerComponent() {
  const t = await getTranslations('namespace');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Переключатель языка

Используйте `LanguageContext` для смены языка:

```typescript
import { useLanguage } from '@/contexts/LanguageContext';

function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLanguage();
  
  const toggleLanguage = () => {
    const nextLocale = locale === 'en' ? 'az' : 'en';
    setLocale(nextLocale);
  };
  
  return (
    <button onClick={toggleLanguage}>
      Current: {locale}
    </button>
  );
}
```

## Структура файлов переводов

Файлы `messages/en.json` и `messages/az.json` организованы по разделам:

```json
{
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "header": {
    "searchPlaceholder": "search for product",
    "findAPaul": "Find a PAUL"
  },
  "footer": {
    "newsletter": {
      "title": "Join our Newsletter",
      "description": "Be the first to know our latest news"
    }
  }
}
```

## Добавление новых переводов

1. **Добавьте ключ в `messages/en.json`:**

```json
{
  "mySection": {
    "greeting": "Hello, {name}!",
    "itemsCount": "You have {count} items"
  }
}
```

2. **Добавьте перевод в `messages/az.json`:**

```json
{
  "mySection": {
    "greeting": "Salam, {name}!",
    "itemsCount": "Sizdə {count} məhsul var"
  }
}
```

3. **Используйте в компоненте:**

```typescript
const t = useTranslations('mySection');

// Простой перевод
<p>{t('greeting', { name: 'John' })}</p>

// С параметрами
<p>{t('itemsCount', { count: 5 })}</p>
```

## Best Practices

### 1. Организация ключей

✅ **Хорошо:**
```json
{
  "cart": {
    "title": "Shopping Cart",
    "empty": "Your cart is empty",
    "actions": {
      "checkout": "Checkout",
      "continue": "Continue Shopping"
    }
  }
}
```

❌ **Плохо:**
```json
{
  "cartTitle": "Shopping Cart",
  "cartEmpty": "Your cart is empty",
  "checkoutButton": "Checkout"
}
```

### 2. Использование namespace

Группируйте переводы по функциональным областям:

```typescript
// Header компонент
const t = useTranslations('header');

// Footer компонент
const t = useTranslations('footer');

// Cart компонент
const t = useTranslations('cart');
```

### 3. Не дублируйте тексты

Используйте общие переводы для повторяющихся элементов:

```typescript
const tCommon = useTranslations('common');

<button>{tCommon('save')}</button>
<button>{tCommon('cancel')}</button>
```

### 4. Форматирование

Для дат, чисел и валют используйте встроенные форматтеры:

```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();

// Дата
{format.dateTime(date, { dateStyle: 'long' })}

// Число
{format.number(1234.56, { style: 'currency', currency: 'AZN' })}
```

## Миграция существующего кода

### До:
```typescript
<h1>Shopping Cart</h1>
<p>Your cart is empty</p>
<button>Checkout</button>
```

### После:
```typescript
const t = useTranslations('cart');

<h1>{t('title')}</h1>
<p>{t('empty')}</p>
<button>{t('checkout')}</button>
```

## Тестирование

При тестировании компонентов с переводами:

```typescript
import { NextIntlClientProvider } from 'next-intl';

const messages = {
  common: {
    save: 'Save',
    cancel: 'Cancel'
  }
};

<NextIntlClientProvider locale="en" messages={messages}>
  <YourComponent />
</NextIntlClientProvider>
```

## Настройки

### Изменить язык по умолчанию

В `src/i18n/config.ts`:

```typescript
export const DEFAULT_LOCALE: Locale = 'az'; // Изменить на азербайджанский
```

### Добавить новый язык

1. Создайте файл `messages/ru.json`
2. Обновите `src/i18n/config.ts`:

```typescript
export const LOCALES = ['en', 'az', 'ru'] as const;

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  az: 'Azərbaycan',
  ru: 'Русский'
};
```

## Сохранение выбора пользователя

Выбранный язык автоматически сохраняется в `localStorage` с ключом `paul-locale`.

## URL структура

- Английский (по умолчанию): `/about`, `/products`
- Азербайджанский: `/az/about`, `/az/products`

Middleware автоматически определяет и применяет локаль из URL.

## Полезные ссылки

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Текущие переводы](./messages/)
- [Конфигурация i18n](./src/i18n/)

## Поддержка

При возникновении проблем проверьте:

1. ✅ Все ключи существуют в обоих файлах переводов
2. ✅ Namespace указан корректно
3. ✅ Компонент обернут в Provider
4. ✅ Используется правильный хук (client vs server)

