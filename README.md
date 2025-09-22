# Paul Azerbaijan Project

Полнофункциональное веб-приложение для управления заявками и заказами с системой ролей пользователей.

## Структура проекта

- **backend/** - Laravel 12 API сервер
- **frontend/** - Next.js 15 клиентское приложение

## Технологии

### Backend
- Laravel 12
- PHP 8.2+
- SQLite (для разработки)
- Laravel Sanctum (аутентификация)
- CORS поддержка

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (управление состоянием)

## Установка и запуск

### Backend (Laravel)

1. Перейдите в папку backend:
```bash
cd backend
```

2. Установите зависимости:
```bash
composer install
```

3. Скопируйте файл конфигурации:
```bash
cp .env.example .env
```

4. Сгенерируйте ключ приложения:
```bash
php artisan key:generate
```

5. Создайте базу данных:
```bash
touch database/database.sqlite
```

6. Запустите миграции:
```bash
php artisan migrate
```

7. Запустите сервер:
```bash
php artisan serve
```

Backend будет доступен по адресу: http://localhost:8000

### Frontend (Next.js)

1. Перейдите в папку frontend:
```bash
cd frontend
```

2. Установите зависимости:
```bash
npm install
```

3. Скопируйте файл конфигурации:
```bash
cp .env.example .env
```

4. Запустите сервер разработки:
```bash
npm run dev
```

Frontend будет доступен по адресу: http://localhost:3000

## Функциональность

### Роли пользователей
- **Клиенты** (client)
  - Корпоративные (corporate)
  - Разовые (one_time)
- **Персонал** (staff)
  - Координаторы (coordinator)
  - Наблюдатели (observer)

### Основные возможности
- Регистрация и аутентификация пользователей
- Создание заявок с сайта
- Управление заявками (для координаторов)
- Создание заказов из заявок
- Система комментариев и статусов
- Статистика и аналитика

## 🆕 Новые функции
- **📅 Календарь заказов** - интерактивный календарь для планирования мероприятий
- **⏰ Временные ограничения** - автоматическая валидация сроков заказов (48ч) и изменений (24ч)
- **📧 Email-уведомления** - автоматические уведомления клиентам и персоналу
- **📄 BEO файлы** - генерация профессиональных документов Banquet Event Order
- **🎯 Система ролей** - расширенные права для координаторов, шефов и операционных менеджеров

## API Endpoints

### Аутентификация
- `POST /api/register` - Регистрация
- `POST /api/login` - Вход
- `POST /api/logout` - Выход
- `GET /api/user` - Информация о пользователе

### Заявки
- `POST /api/applications` - Создание заявки
- `GET /api/applications` - Список заявок (координаторы)
- `GET /api/applications/{id}` - Просмотр заявки
- `PATCH /api/applications/{id}/status` - Обновление статуса

### Пользователи
- `GET /api/users` - Список пользователей (координаторы)
- `POST /api/users` - Создание пользователя
- `GET /api/users/{id}` - Просмотр пользователя
- `PUT /api/users/{id}` - Обновление пользователя
- `DELETE /api/users/{id}` - Удаление пользователя

### Заказы
- `GET /api/orders` - Список заказов (координаторы)
- `POST /api/orders` - Создание заказа
- `POST /api/applications/{id}/create-order` - Создание заказа из заявки

## Разработка

### Запуск всех сервисов
```bash
# В папке backend
composer run dev
```

### Тестирование
```bash
# Backend
php artisan test

# Frontend
npm run lint
```

## Конфигурация

### CORS
Настройки CORS находятся в `backend/config/cors.php` и поддерживают:
- Локальную разработку (localhost:3000, localhost:3001)
- Vercel и Netlify деплойменты
- Настраиваемые origins через переменные окружения

### API URL
Frontend использует конфигурационный файл `src/config/api.ts` для настройки API endpoints.

## Лицензия

MIT License
