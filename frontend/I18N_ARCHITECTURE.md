# 🏗️ Архитектура системы i18n

## 📐 Диаграмма потока данных

```
┌─────────────────────────────────────────────────────────────┐
│                         USER                                 │
│                    Clicks Globe 🌐                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  LanguageContext                             │
│  - Current Locale: 'en' | 'az'                              │
│  - setLocale(newLocale)                                     │
│  - Saves to localStorage                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Router                              │
│  Updates URL: / → /az/                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware                                │
│  1. Detects locale from URL                                 │
│  2. Adds locale to request                                  │
│  3. Routes to correct page                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                 │
         ▼                                 ▼
┌──────────────────┐            ┌──────────────────┐
│  Server Layout   │            │  Client Component │
│                  │            │                   │
│  getLocale()     │            │  useTranslations()│
│  getMessages()   │            │                   │
│      ↓           │            │       ↓           │
│  Pass to Client  │            │   Get from        │
│   Providers      │            │   NextIntlProvider│
└────────┬─────────┘            └────────┬──────────┘
         │                                │
         └──────────────┬─────────────────┘
                        │
                        ▼
            ┌────────────────────────┐
            │  messages/en.json      │
            │  messages/az.json      │
            │                        │
            │  Translation Files     │
            └────────────────────────┘
```

## 🔄 Жизненный цикл перевода

### Инициализация (Server-side)

```typescript
1. Request → http://localhost:3000/products

2. Middleware.ts
   ↓
   - Check URL for locale (/az/products)
   - Check localStorage (paul-locale)
   - Default to 'en'
   ↓
   Locale = 'en'

3. layout.tsx (Server Component)
   ↓
   const locale = await getLocale();         // 'en'
   const messages = await getMessages();      // Load en.json
   ↓
   Pass to Providers

4. Providers.tsx (Client Component)
   ↓
   <NextIntlClientProvider locale={locale} messages={messages}>
     <LanguageProvider initialLocale={locale}>
       {children}
     </LanguageProvider>
   </NextIntlClientProvider>
```

### Рендеринг компонента

```typescript
5. Component (Client)
   ↓
   const t = useTranslations('header');
   ↓
   {t('findAPaul')}  // Reads from messages object
   ↓
   Output: "Find a PAUL" (en) или "PAUL Tap" (az)
```

### Смена языка

```typescript
1. User clicks Globe icon
   ↓
2. handleLanguageToggle()
   ↓
3. LanguageContext.setLocale('az')
   ↓
4. localStorage.setItem('paul-locale', 'az')
   ↓
5. router.push('/az/current-path')
   ↓
6. Page reloads with new locale
   ↓
7. Middleware detects /az/ prefix
   ↓
8. Layout loads az.json
   ↓
9. All components re-render with Azerbaijani text
```

## 📦 Структура компонентов

```
App Root
│
├── RootLayout (Server Component)
│   ├── getLocale()
│   ├── getMessages()
│   └── <html lang={locale}>
│       └── Providers (Client Component)
│           ├── NextIntlClientProvider
│           │   └── LanguageProvider
│           │       └── QueryClientProvider
│           │           └── AuthProvider
│           │               └── CartProvider
│           │                   └── {children}
│
└── Page Components
    ├── Header
    │   ├── useTranslations('header')
    │   ├── useLanguage() → { locale, setLocale }
    │   └── Globe Button → toggleLanguage()
    │
    ├── Hero
    │   └── useTranslations('hero')
    │
    ├── Footer
    │   └── useTranslations('footer')
    │
    └── CartModal
        └── useTranslations('cart')
```

## 🗂️ Структура файлов переводов

```json
messages/en.json
{
  "common": {          // Общие элементы
    "loading": "...",
    "error": "...",
    "save": "..."
  },
  "header": {          // Специфичные для Header
    "findAPaul": "...",
    "clickCollect": "..."
  },
  "cart": {            // Специфичные для Cart
    "title": "...",
    "empty": "...",
    "checkout": "..."
  }
}
```

### Иерархия ключей

```
ROOT
├── common/              [Переиспользуемые]
│   ├── actions
│   ├── statuses
│   └── messages
│
├── header/              [Navigation]
│   ├── menu items
│   ├── actions
│   └── search
│
├── footer/              [Footer sections]
│   ├── newsletter
│   ├── navigation
│   └── legal
│
├── cart/                [Shopping]
│   ├── states
│   ├── actions
│   └── totals
│
└── [feature]/           [Feature-specific]
    ├── titles
    ├── descriptions
    └── actions
```

## 🔐 Type Safety Flow

```typescript
1. Config Definition
   ↓
   export type Locale = 'en' | 'az';
   export const LOCALES = ['en', 'az'] as const;

2. Context Types
   ↓
   interface LanguageContextType {
     locale: Locale;              // ← Type-safe
     setLocale: (locale: Locale) => void;
     availableLocales: readonly Locale[];
   }

3. Component Usage
   ↓
   const { locale, setLocale } = useLanguage();
   setLocale('az');  // ✅ Valid
   setLocale('fr');  // ❌ TypeScript Error

4. Translation Keys
   ↓
   const t = useTranslations('header');
   t('findAPaul');   // ✅ Autocomplete available
   t('invalid');     // ⚠️ No runtime error, but IDE warning
```

## 🌐 URL Routing Strategy

### Strategy: "as-needed"
```
Default Locale (en): No prefix
/products
/about
/cart

Other Locales (az): With prefix
/az/products
/az/about
/az/cart
```

### Middleware Logic
```typescript
Request URL → Middleware
              ↓
         Has /az/ prefix?
         ↙        ↘
       YES        NO
        ↓          ↓
    locale=az   locale=en (default)
        ↓          ↓
    Add to       Add to
   Request      Request
        ↓          ↓
    Route to     Route to
     Page         Page
```

## 💾 State Management

### Client State
```
┌──────────────────────────┐
│    localStorage          │
│  key: 'paul-locale'      │
│  value: 'en' | 'az'      │
└───────────┬──────────────┘
            │
            ↓
┌──────────────────────────┐
│  LanguageContext         │
│  - locale: Locale        │
│  - setLocale: Function   │
└───────────┬──────────────┘
            │
            ↓
┌──────────────────────────┐
│  Components              │
│  - Read locale           │
│  - Change locale         │
└──────────────────────────┘
```

### Server State
```
Request
  ↓
Middleware → Extract locale from URL/headers
  ↓
Layout → getLocale() → Read from request
  ↓
Pass to Providers → Available in Client
```

## 🔄 Hot Reload Flow (Development)

```
Developer edits messages/en.json
         ↓
Next.js detects file change
         ↓
Triggers Hot Module Replacement
         ↓
Re-imports translation files
         ↓
Components re-render with new translations
         ↓
Page updates WITHOUT full refresh
```

## 📱 Responsive Design

### Desktop
```
Header
├── Logo
├── Navigation Menu (translated)
├── Search (placeholder translated)
├── User Icon
├── Cart Icon
└── Globe Icon (Language Switcher) ← HERE
```

### Mobile
```
Header
├── Logo
├── Search Icon
├── Cart Icon
└── Hamburger Menu
    ↓ (opens)
    Mobile Menu
    ├── Navigation (translated)
    ├── My Account (translated)
    ├── Newsletter (translated)
    └── [Language switcher in context menu]
```

## 🎯 Performance Optimizations

1. **Code Splitting**
   - Only load active locale's translations
   - Lazy load other locales on demand

2. **Caching**
   - Translation files cached in memory
   - localStorage prevents re-fetch

3. **SSR**
   - Translations rendered on server
   - No flash of untranslated content

4. **Bundle Size**
   ```
   en.json: ~15KB
   az.json: ~15KB
   next-intl: ~50KB (minified)
   Total overhead: ~80KB
   ```

## 🧪 Testing Strategy

```typescript
// Component Test
import { NextIntlClientProvider } from 'next-intl';

const messages = { header: { findAPaul: 'Find a PAUL' } };

render(
  <NextIntlClientProvider locale="en" messages={messages}>
    <Header />
  </NextIntlClientProvider>
);

expect(screen.getByText('Find a PAUL')).toBeInTheDocument();
```

## 🚀 Production Deployment

```
Build Process:
1. npm run build
   ↓
2. Next.js compiles with next-intl plugin
   ↓
3. Generates static pages for both locales
   ↓
4. Outputs:
   - /products/page.html (en)
   - /az/products/page.html (az)
   ↓
5. Deploy to hosting
```

## 🔧 Maintenance

### Adding new translation:
```
1. Edit messages/en.json → Add key
2. Edit messages/az.json → Add translation
3. Use in component → t('newKey')
4. Test both locales
5. Commit changes
```

### Adding new language:
```
1. Create messages/ru.json
2. Update LOCALES in config.ts
3. Add to LOCALE_NAMES mapping
4. Test routing /ru/
5. Deploy
```

---

**Архитектура следует принципам:**
- ✅ SOLID (Single Responsibility, Dependency Inversion)
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ Separation of Concerns
- ✅ Type Safety
- ✅ Scalability

