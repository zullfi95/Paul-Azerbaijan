# 🎨 CSS Variables Cheatsheet - Quick Reference

## 🎨 Цвета

```css
/* Основные */
var(--color-primary)         /* #1A1A1A - Paul Black */
var(--color-secondary)       /* #FFFCF8 - Paul Ivory */
var(--color-accent)          /* #D4AF37 - Gold */
var(--color-beige)           /* #EBDCC8 - Beige */
var(--color-gray)            /* #4A4A4A - Gray */

/* Статусы */
var(--color-success)         /* Зеленый */
var(--color-error)           /* Красный */
var(--color-warning)         /* Оранжевый */
var(--color-info)            /* Синий */

/* Границы */
var(--color-border)          /* #EDEAE3 */
var(--color-overlay)         /* rgba(0,0,0,0.4) */
```

## 📝 Типография

```css
/* Шрифты */
var(--font-primary)          /* Sabon Next LT Pro */
var(--font-secondary)        /* Source Serif Pro */

/* Размеры */
var(--text-xs)               /* 12px */
var(--text-sm)               /* 14px */
var(--text-base)             /* 16px */
var(--text-lg)               /* 18px */
var(--text-xl)               /* 20px */
var(--text-2xl)              /* 24px */

/* Веса */
var(--font-normal)           /* 400 */
var(--font-medium)           /* 500 */
var(--font-semibold)         /* 600 */
var(--font-bold)             /* 700 */
```

## 📏 Отступы

```css
var(--space-1)               /* 4px */
var(--space-2)               /* 8px */
var(--space-3)               /* 12px */
var(--space-4)               /* 16px */
var(--space-6)               /* 24px */
var(--space-8)               /* 32px */
```

## 🔘 Скругления

```css
var(--radius-sm)             /* 6px */
var(--radius-md)             /* 8px */
var(--radius-lg)             /* 12px */
var(--radius-xl)             /* 16px */
var(--radius-full)           /* 9999px */
```

## 🌑 Тени

```css
var(--shadow-sm)             /* Маленькая */
var(--shadow-md)             /* Средняя */
var(--shadow-lg)             /* Большая */
var(--shadow-card)           /* Для карточек */
```

## ⚡ Переходы

```css
var(--transition-fast)       /* 150ms */
var(--transition-normal)     /* 300ms */
var(--transition-slow)       /* 500ms */
```

## 📱 Breakpoints

```
--breakpoint-sm: 480px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

---

## 🚀 Быстрый старт

**До:**
```css
.my-button {
  background-color: #1A1A1A;
  padding: 16px;
  border-radius: 8px;
  transition: 0.3s ease;
}
```

**После:**
```css
.my-button {
  background-color: var(--color-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
}
```

---

📚 Полная документация: [README.md](./README.md)

