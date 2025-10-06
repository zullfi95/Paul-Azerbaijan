# Выравнивание стилей корзины с Header

## 📋 Обзор изменений

Все размеры, шрифты и стили страницы корзины были приведены в соответствие с дизайн-системой Header для единообразия интерфейса.

## 🎨 Применённые стили из Header

### 1. **Контейнер и отступы**
```css
max-width: 1140px;        /* Как header-container */
padding: 0 20px;          /* Как header-container */
padding: 0 14px;          /* Мобильная версия, как в Header */
```

### 2. **Шрифты и размеры**

#### Заголовки и навигация:
- **Заголовок страницы**: `2rem` (desktop), `1.5rem` (mobile)
- **Названия товаров**: `17.6px` (как nav-link)
- **Описания**: `13px` (как action-button)
- **Цены**: `17.6px` с `font-weight: 600`

#### Шрифтовые семейства:
- **Sabon Next LT Pro** - заголовки, названия, цены
- **Sabon Next LT** - описания, кнопки, текст

### 3. **Заголовок таблицы**
```css
height: 50px;             /* Уменьшено с 56px */
padding: 1rem 1.5rem;
background: #000000;
border-radius: 7px;       /* Как в Header */
font-size: 17.6px;        /* Как nav-link */
font-weight: 500;
```

### 4. **Кнопка удаления**
```css
width: 36px;
height: 36px;
border-radius: 7px;       /* Как icon-button в Header */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Hover эффект:**
```css
background-color: #1a1a1a;
transform: translateY(-1px);
```

### 5. **Изображения товаров**
```css
width: 170px;
height: 165px;
border-radius: 7px;       /* Как в Header */
```

### 6. **Селектор количества**
```css
background: white;
border: 1px solid #d1d5db;  /* Как action-button */
border-radius: 14px;        /* Как action-button */
padding: 6px 12px;
min-width: 120px;
```

**Кнопки +/-:**
```css
width: 28px;
height: 28px;
font-size: 17.6px;
border-radius: 7px;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Hover эффект:**
```css
background-color: rgba(26, 26, 26, 0.05);
transform: scale(1.1);
```

### 7. **Кнопки действий**

#### Структура (как action-button):
```css
padding: 12px 24px;
border: 1px solid #d1d5db;
border-radius: 14px;
font-family: 'Sabon Next LT';
font-size: 15px;
font-weight: 400;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

#### Hover эффект (как в Header):
```css
background-color: #1a1a1a;
border-color: #1a1a1a;
color: white;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
```

#### Анимация блеска:
```css
.button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.button:hover::before {
  left: 100%;
}
```

### 8. **Информационные блоки**
```css
font-family: 'Sabon Next LT';
font-size: 13px;          /* Как action-button */
line-height: 1.5;
```

**Иконка "i":**
```css
width: 18px;
height: 18px;
font-size: 11px;
font-weight: 500;
```

### 9. **Итоговая секция**
```css
.totalLabel {
  font-size: 20px;
  font-weight: 600;
}

.totalAmount {
  font-size: 24px;
  font-weight: 700;
}
```

## 📱 Адаптивность

### Desktop (1024px+)
- Полная ширина: `1140px`
- Padding: `20px`
- Все элементы в полном размере

### Tablet (768-1023px)
- Padding: `14px`
- Шрифты: `15.6px` (как nav-link mobile)
- Кнопки: `padding: 10px 20px`

### Mobile (до 767px)
- Padding: `14px` (как в Header)
- Шрифты: `14px` (названия), `12px` (описания)
- Кнопки: `font-size: 13px` (как action-button mobile)
- Изображения: `110×105px`

## 🎯 Ключевые изменения

### До:
- ❌ Разные размеры контейнеров (1438px vs 1140px)
- ❌ Разные шрифты (Parisine vs Sabon Next LT)
- ❌ Разные размеры кнопок (323×80px)
- ❌ Разные border-radius (4px vs 7px/14px)
- ❌ Разные transitions

### После:
- ✅ Единый контейнер `1140px`
- ✅ Единая шрифтовая система (Sabon Next LT)
- ✅ Единые размеры элементов
- ✅ Единые border-radius (7px/14px)
- ✅ Единые transitions `cubic-bezier(0.4, 0, 0.2, 1)`
- ✅ Единые hover эффекты
- ✅ Единая анимация блеска на кнопках

## 🔄 Transitions из Header

Все интерактивные элементы используют:
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

Это создаёт плавную и единообразную анимацию по всему сайту.

## ✨ Результат

Теперь страница корзины полностью соответствует дизайн-системе Header:
- 🎨 Единый визуальный язык
- 📏 Согласованные размеры
- 🔤 Единая типографика
- ⚡ Единые анимации
- 📱 Согласованная адаптивность

Пользователи получают единообразный опыт взаимодействия на всех страницах сайта.

