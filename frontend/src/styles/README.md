# 🎨 PAUL - CSS Architecture & Design System

## 📋 Содержание
- [Обзор](#обзор)
- [Структура файлов](#структура-файлов)
- [Использование переменных](#использование-переменных)
- [Примеры](#примеры)
- [Миграция](#миграция)
- [Следующие шаги](#следующие-шаги)

---

## 🌟 Обзор

Этот проект использует централизованную систему CSS переменных для обеспечения консистентности дизайна и упрощения поддержки.

### Преимущества новой системы:
- ✅ **Единый источник истины** для всех дизайн-токенов
- ✅ **Легкость изменений** - изменить цвет/шрифт можно в одном месте
- ✅ **Консистентность** - все компоненты используют одинаковые значения
- ✅ **Темная тема** - готовность к добавлению темной темы
- ✅ **Типобезопасность** - семантические имена переменных

---

## 📁 Структура файлов

```
frontend/src/styles/
├── variables.css       ← ⭐ НОВОЕ: Все CSS переменные
├── globals.css         ← Базовые стили, использует variables.css
├── dashboard.css       ← Стили дашборда (TODO: оптимизировать)
├── paul-fonts.css      ← Импорты и классы шрифтов
└── calendar.css        ← Стили библиотеки календаря
```

---

## 🎨 Использование переменных

### Цвета

```css
/* ❌ СТАРЫЙ СПОСОБ (не использовать) */
.my-component {
  background-color: #1A1A1A;
  color: #FFFCF8;
}

/* ✅ НОВЫЙ СПОСОБ (использовать) */
.my-component {
  background-color: var(--color-primary);
  color: var(--color-secondary);
}
```

#### Основные цвета PAUL:
- `--color-primary` - #1A1A1A (Paul Black)
- `--color-secondary` - #FFFCF8 (Paul Ivory)
- `--color-accent` - #D4AF37 (Gold)
- `--color-beige` - #EBDCC8 (Paul Beige)
- `--color-gray` - #4A4A4A (Paul Gray)

#### Статусные цвета:
- `--color-success` - Зеленый для успеха
- `--color-error` - Красный для ошибок
- `--color-warning` - Оранжевый для предупреждений
- `--color-info` - Синий для информации

### Типография

```css
/* Шрифты */
.my-text {
  font-family: var(--font-primary);  /* Sabon Next LT Pro */
  font-size: var(--text-lg);          /* 18px */
  font-weight: var(--font-semibold);  /* 600 */
  line-height: var(--leading-normal); /* 1.4 */
}
```

#### Размеры шрифтов:
- `--text-xs` - 12px
- `--text-sm` - 14px
- `--text-base` - 16px
- `--text-lg` - 18px
- `--text-xl` - 20px
- `--text-2xl` - 24px
- `--text-3xl` - 30px
- `--text-4xl` - 36px

### Отступы

```css
.my-container {
  padding: var(--space-4);      /* 16px */
  margin-bottom: var(--space-6); /* 24px */
  gap: var(--space-2);           /* 8px */
}
```

### Скругления

```css
.my-card {
  border-radius: var(--radius-lg);  /* 12px */
}

.my-button {
  border-radius: var(--radius-md);  /* 8px */
}

.my-avatar {
  border-radius: var(--radius-full); /* 9999px - полный круг */
}
```

### Тени

```css
.my-card {
  box-shadow: var(--shadow-md);  /* Средняя тень */
}

.my-modal {
  box-shadow: var(--shadow-xl);  /* Большая тень */
}
```

### Переходы

```css
.my-button {
  transition: all var(--transition-normal); /* 300ms ease */
}

.my-tooltip {
  transition: opacity var(--transition-fast); /* 150ms ease */
}
```

---

## 💡 Примеры

### Пример 1: Кнопка

```css
/* Старый способ */
.my-button {
  background-color: #1A1A1A;
  color: #F5E9D6;
  padding: 10px 27px;
  font-family: "Sabon Next LT Pro", sans-serif;
  border: 2px solid #1A1A1A;
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* Новый способ */
.my-button {
  background-color: var(--color-primary);
  color: var(--color-beige);
  padding: var(--space-2) var(--space-6);
  font-family: var(--font-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}
```

### Пример 2: Карточка

```css
.product-card {
  background-color: var(--color-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
}

.product-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.product-card h3 {
  font-family: var(--font-primary);
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.product-card p {
  font-family: var(--font-secondary);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}
```

### Пример 3: CSS модуль компонента

```css
/* MyComponent.module.css */

.container {
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

.title {
  font-family: var(--font-primary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-6);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

/* Адаптивность */
@media (max-width: 768px) {
  .container {
    padding: var(--space-4) var(--space-2);
  }
  
  .title {
    font-size: var(--text-2xl);
  }
}
```

---

## 🔄 Миграция существующих файлов

### Шаг 1: Определите хардкоженные значения

Найдите все места с прямыми значениями:
- Цвета: `#1A1A1A`, `rgb(26, 26, 26)`, etc.
- Размеры: `16px`, `1rem`, `0.5em`, etc.
- Шрифты: `"Sabon Next LT Pro"`, etc.

### Шаг 2: Замените на переменные

Используйте таблицу соответствия:

| Старое значение | Новая переменная |
|----------------|------------------|
| `#1A1A1A` | `var(--color-primary)` |
| `#FFFCF8` | `var(--color-secondary)` |
| `#D4AF37` | `var(--color-accent)` |
| `16px` (padding/margin) | `var(--space-4)` |
| `12px` (font-size) | `var(--text-xs)` |
| `8px` (border-radius) | `var(--radius-md)` |
| `0.3s ease` | `var(--transition-normal)` |

### Шаг 3: Тестируйте

После замены проверьте:
1. Визуальное отображение не изменилось
2. Интерактивность работает (hover, active, focus)
3. Адаптивность сохранена

---

## 🎯 Следующие шаги (TODO)

### Приоритет 1: Создать animations.css
- [ ] Вынести все @keyframes в отдельный файл
- [ ] Удалить дубликаты анимаций
- [ ] Импортировать в globals.css

### Приоритет 2: Мигрировать основные компоненты
- [ ] Header.css
- [ ] Footer.css
- [ ] CartModal.module.css
- [ ] CheckoutPage.module.css

### Приоритет 3: Оптимизировать dashboard.css
- [ ] Разбить на модули
- [ ] Использовать переменные
- [ ] Удалить дубликаты

### Приоритет 4: Очистить paul-fonts.css
- [ ] Удалить неиспользуемые классы
- [ ] Оставить только импорты шрифтов

### Приоритет 5: Удалить старые переменные
После полной миграции удалить из globals.css:
```css
/* УСТАРЕВШИЕ - удалить после миграции */
:root {
  --black-colour-paul: var(--color-primary-dark);
  --ivory-colour-paul: var(--color-ivory-alt);
  --primary-1: var(--color-bg-primary);
  --primary-2: var(--color-bg-secondary);
}
```

---

## 📚 Полезные ресурсы

### Документация CSS переменных
- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [CSS Tricks: A Complete Guide to Custom Properties](https://css-tricks.com/a-complete-guide-to-custom-properties/)

### Дизайн-системы
- [Material Design](https://material.io/design)
- [Tailwind CSS Design Tokens](https://tailwindcss.com/docs/customizing-colors)

---

## ❓ FAQ

**Q: Можно ли использовать старые переменные?**  
A: Да, они оставлены для обратной совместимости. Но рекомендуется постепенно мигрировать на новые.

**Q: Что делать, если нужен цвет, которого нет в переменных?**  
A: Добавьте его в `variables.css` с семантическим именем. Не используйте хардкод.

**Q: Как добавить темную тему?**  
A: Раскомментируйте секцию в `variables.css` и переопределите нужные переменные.

**Q: Можно ли использовать переменные в inline стилах?**  
A: Да! `style={{ color: 'var(--color-primary)' }}`

---

## 📊 Текущий статус миграции

**Завершено:**
- ✅ Создан variables.css (241 строка)
- ✅ Обновлен globals.css для использования переменных
- ✅ Кнопки .btn-primary и .btn-secondary используют переменные

**В процессе:**
- ⏳ Миграция компонентов (0 из ~50)
- ⏳ Создание animations.css
- ⏳ Оптимизация dashboard.css

**Экономия:**
- Потенциально: ~20-35 KB (10-20% от CSS)
- Фактически: ~0 KB (миграция не начата)

---

## 👥 Для команды

При создании новых компонентов:
1. **ВСЕГДА** используйте CSS переменные из `variables.css`
2. **НЕ** добавляйте новые хардкоженные значения
3. Если нужна новая переменная - добавьте её в `variables.css`
4. Следуйте naming convention: `--{категория}-{назначение}-{вариант}`

**Примеры хороших имён:**
- `--color-primary-hover`
- `--space-button-padding`
- `--shadow-card-elevated`

**Примеры плохих имён:**
- `--my-blue` (не семантическое)
- `--padding1` (непонятное назначение)
- `--btnClr` (плохой naming)

---

Обновлено: 04.11.2025  
Автор: CSS Optimization Team

