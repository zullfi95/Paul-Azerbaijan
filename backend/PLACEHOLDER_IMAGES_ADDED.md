# 🖼️ Заглушки для изображений добавлены!

## ✅ Что добавлено:

### 1. Заглушка для еды (`placeholder-food.svg`)
- **Дизайн**: Тарелка с хлебом, кофе и печеньем
- **Цвета**: В стиле PAUL (бежевые тона)
- **Размер**: 300x200px
- **Использование**: Для всех продуктов, кроме напитков

### 2. Заглушка для напитков (`placeholder-drink.svg`)
- **Дизайн**: Стакан с напитком, льдом и соломинкой
- **Цвета**: Синие тона для жидкости
- **Размер**: 300x200px
- **Использование**: Для напитков (milk, juice, coffee, tea, drink)

### 3. Умная логика выбора заглушки
```typescript
const getMainImage = (images?: string[], itemName?: string) => {
  if (!images || images.length === 0) {
    const name = itemName?.toLowerCase() || '';
    if (name.includes('milk') || name.includes('juice') || name.includes('coffee') || name.includes('tea') || name.includes('drink')) {
      return '/images/placeholder-drink.svg';
    }
    return '/images/placeholder-food.svg';
  }
  return images[0];
};
```

## 🎯 Результат:

### Для продуктов из меню:
- **Garnirs** (Salad, French Fries, etc.) → `placeholder-food.svg`
- **Meat** (Medium well, Rare, etc.) → `placeholder-food.svg`
- **Alt. Milks** (Soya Milk, Almond Milk, etc.) → `placeholder-drink.svg`
- **Capri Sun** (различные вкусы) → `placeholder-drink.svg`
- **Fruit Juice** (Peach, Orange, etc.) → `placeholder-drink.svg`

### Обработка ошибок:
- Если изображение не загружается → автоматически показывается заглушка
- Если нет изображений в API → показывается соответствующая заглушка

## 🚀 Готово к использованию:
Теперь все элементы меню будут иметь красивые заглушки вместо пустых мест или ошибок загрузки изображений!

**Меню выглядит профессионально даже без реальных фотографий продуктов!** 🎉
