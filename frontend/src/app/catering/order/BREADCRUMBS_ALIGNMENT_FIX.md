# Исправление выравнивания хлебных крошек на странице заказа

## 🐛 Проблема
Хлебные крошки на странице `/catering/order` "ушли влево" и не соответствовали стандартам выравнивания Header.

## 🔍 Причина
В CSS файле `CheckoutPage.module.css` использовались неправильные размеры контейнеров:
- `max-width: 1440px` вместо `1140px` (как в Header)
- `padding: 0 100px` вместо `padding: 0 20px` (как в Header)
- На мобильных: `padding: 0 20px` вместо `padding: 0 14px` (как в Header)

## ✅ Решение

### 1. **Исправлены размеры контейнеров**

**До:**
```css
.breadcrumbsContainer {
  max-width: 1440px;
  padding-left: 100px;
  padding-right: 100px;
}

.titleContainer {
  max-width: 1440px;
  padding: 0 100px;
}

.form {
  max-width: 1440px;
  padding: 0 100px;
}
```

**После:**
```css
.breadcrumbsContainer {
  max-width: 1140px; /* Как в Header */
  padding-left: 20px; /* Как в Header */
  padding-right: 20px; /* Как в Header */
}

.titleContainer {
  max-width: 1140px; /* Как в Header */
  padding: 0 20px; /* Как в Header */
}

.form {
  max-width: 1140px; /* Как в Header */
  padding: 0 20px; /* Как в Header */
}
```

### 2. **Обновлены responsive стили**

**До:**
```css
@media (max-width: 768px) {
  .breadcrumbsContainer {
    padding-left: 20px;
    padding-right: 20px;
  }
}
```

**После:**
```css
@media (max-width: 768px) {
  .breadcrumbsContainer {
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
- 📏 **Контейнеры**: `1140px` (как Header)
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
| Max-width | 1440px | 1140px | 1140px ✅ |
| Desktop padding | 100px | 20px | 20px ✅ |
| Mobile padding | 20px | 14px | 14px ✅ |

## 🎨 Визуальный результат

Теперь все элементы на странице заказа выровнены по стандартам Header:
- 🍞 **Хлебные крошки** - по центру, как в Header
- 📝 **Заголовок** - по центру, как в Header  
- 📋 **Форма** - по центру, как в Header
- 📱 **Мобильная версия** - корректные отступы

Страница заказа теперь полностью соответствует дизайн-системе Header! 🎉

