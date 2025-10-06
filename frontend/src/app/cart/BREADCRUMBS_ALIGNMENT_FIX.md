# Исправление выравнивания хлебных крошек на странице корзины

## 🐛 Проблема
Хлебные крошки на странице `/cart` "ушли влево" и не соответствовали стандартам выравнивания Header.

## 🔍 Причина
В CSS файле `CartPage.module.css` секция `.breadcrumbsSection` не имела правильного выравнивания:
- Отсутствовали `max-width` и `margin` для центрирования
- Отсутствовали `padding-left` и `padding-right` для соответствия Header
- На мобильных устройствах не было правильных отступов

## ✅ Решение

### 1. **Исправлены стили breadcrumbsSection**

**До:**
```css
.breadcrumbsSection {
  padding: 1rem 0;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
}
```

**После:**
```css
.breadcrumbsSection {
  padding: 1rem 0;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
  max-width: 1140px; /* Как в Header */
  margin-left: auto;
  margin-right: auto;
  padding-left: 20px; /* Как в Header */
  padding-right: 20px; /* Как в Header */
}
```

### 2. **Обновлены responsive стили**

**До:**
```css
@media (max-width: 767px) {
  .breadcrumbsSection {
    padding: var(--space-sm) 0;
  }
}
```

**После:**
```css
@media (max-width: 767px) {
  .breadcrumbsSection {
    padding: var(--space-sm) 0;
    padding-left: 14px; /* Как в Header mobile */
    padding-right: 14px; /* Как в Header mobile */
  }
}
```

## 🎯 Результат

### ✅ Что исправлено:
- ❌ **Проблема**: Хлебные крошки "ушли влево"
- ✅ **Исправлено**: Хлебные крошки выровнены по стандартам Header

### ✅ Что приведено в соответствие:
- 📏 **Контейнер**: `max-width: 1140px` (как Header)
- 📱 **Desktop padding**: `20px` (как Header)
- 📱 **Mobile padding**: `14px` (как Header)
- 🎨 **Визуальное единство** с остальными страницами

### ✅ Адаптивность:
- **Desktop (1024px+)**: `padding: 20px`
- **Tablet (768-1023px)**: `padding: 20px`
- **Mobile (до 767px)**: `padding: 14px`

## 📊 Сравнение размеров

| Элемент | До | После | Header |
|---------|----|----|---------|
| Max-width | ❌ Отсутствует | 1140px | 1140px ✅ |
| Desktop padding | ❌ Отсутствует | 20px | 20px ✅ |
| Mobile padding | ❌ Отсутствует | 14px | 14px ✅ |
| Центрирование | ❌ Отсутствует | `margin: 0 auto` | ✅ |

## 🎨 Визуальный результат

Теперь хлебные крошки на странице корзины:
- 🍞 **Выровнены по левому краю** внутри контейнера Header
- 📏 **Имеют правильные отступы** (20px desktop, 14px mobile)
- 🎯 **Центрированы** на странице (max-width: 1140px)
- 📱 **Адаптивны** для всех устройств

## 🔄 Структура исправления

```jsx
<div className={styles.breadcrumbsSection}>
  <Breadcrumbs 
    items={[
      { label: 'Home', href: '/' },
      { label: 'Catering Menu', href: '/catering' },
      { label: 'Shopping Cart', isActive: true }
    ]}
  />
</div>
```

**CSS стили:**
```css
.breadcrumbsSection {
  /* Выравнивание как в Header */
  max-width: 1140px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
  
  /* Оригинальные стили */
  padding: 1rem 0;
  background: transparent;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 1.5rem;
}
```

Страница корзины теперь полностью соответствует дизайн-системе Header! 🎉

