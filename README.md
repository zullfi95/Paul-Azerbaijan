# 🥖 PAUL Azerbaijan - Французская пекарня и кондитерская

Полнофункциональное веб-приложение для управления заявками, заказами и кейтерингом с системой ролей пользователей.

## 🏗️ Структура проекта

- **`backend/`** - Laravel API сервер
- **`frontend/`** - Next.js клиентское приложение с мобильной адаптацией

## 🚀 Технологии

### Backend
- **Laravel 12** - PHP фреймворк
- **PHP 8.2+** - Язык программирования
- **SQLite** - База данных (для разработки)
- **Laravel Sanctum 4.2** - Аутентификация API
- **CORS** - Поддержка кросс-доменных запросов

### Frontend
- **Next.js 15.5.0** - React фреймворк
- **React 18.3.1** - Библиотека UI
- **TypeScript 5.5.3** - Типизированный JavaScript
- **Tailwind CSS 3.4.4** - CSS фреймворк
- **Context API** - Управление состоянием
- **Radix UI** - UI компоненты
- **Мобильная адаптация** - Полная поддержка мобильных устройств

## 📱 Мобильная адаптация

Проект включает полную мобильную адаптацию:
- Адаптивный хедер с бургер-меню
- Мобильные touch события для iOS Safari
- Правильные touch targets (44px) для совместимости с iOS
- Синхронизированные брейкпоинты между хуками и CSS
- Оптимизированные изображения с Next.js Image

## 📦 Установка и запуск

### 🐳 Docker (Рекомендуется)

```bash
# Скопируйте файл конфигурации
cp docker.env.example .env

# Отредактируйте .env файл под ваши нужды
nano .env

# Запустите все сервисы
docker-compose up -d --build

# Или используйте автоматический скрипт
./deploy-docker.sh  # Linux/Mac
# или
.\deploy-docker.ps1  # Windows
```

**Приложение будет доступно по адресу:** http://localhost

### 🔧 Локальная разработка

#### Backend (Laravel)

```bash
# Перейдите в папку backend
cd backend

# Установите зависимости
composer install

# Скопируйте файл конфигурации
cp .env.example .env

# Сгенерируйте ключ приложения
php artisan key:generate

# Создайте базу данных
touch database/database.sqlite

# Запустите миграции
php artisan migrate

# Запустите сервер
php artisan serve
```

**Backend будет доступен по адресу:** http://localhost:8000

#### Frontend (Next.js)

```bash
# Перейдите в папку frontend
cd frontend

# Установите зависимости
npm install

# Запустите сервер разработки
npm run dev
```

**Frontend будет доступен по адресу:** http://localhost:3000

## 👥 Роли пользователей

### Клиенты (client)
- **Корпоративные** (corporate)
  - Разовые (one_time)
- **Персонал** (staff)
  - Координаторы (coordinator)
  - Наблюдатели (observer)

### Основные возможности
- Регистрация и аутентификация пользователей
- Создание заявок с сайта (требует аутентификации)
- Управление заявками (для координаторов)
- Создание заказов из заявок
- Система комментариев и статусов
- Статистика и аналитика
- Интеграция с iiko для управления меню
- Система платежей через Algoritma

## 🆕 Новые функции
- **📅 Календарь заказов** - интерактивный календарь для планирования мероприятий
- **⏰ Временные ограничения** - автоматическая валидация сроков заказов (48ч) и изменений (24ч)
- **📧 Email-уведомления** - автоматические уведомления клиентам и персоналу
- **🔐 Безопасность** - CSRF защита, безопасное хранение токенов
- **⚡ Производительность** - мемоизация, оптимизированные импорты, tree-shaking
- **♿ Доступность** - улучшенная поддержка screen readers и keyboard navigation
- **📄 BEO файлы** - генерация профессиональных документов Banquet Event Order
- **🎯 Система ролей** - расширенные права для координаторов, шефов и операционных менеджеров
- **📱 Мобильная адаптация** - полная поддержка мобильных устройств

## API Endpoints

### Аутентификация
- `POST /api/register` - Регистрация
- `POST /api/login` - Вход
- `POST /api/logout` - Выход
- `GET /api/user` - Информация о пользователе

### Заявки
- `POST /api/applications` - Создание заявки (требует аутентификации)
- `GET /api/applications` - Список заявок (только координаторы)
- `GET /api/applications/{id}` - Просмотр заявки (только координаторы)
- `PATCH /api/applications/{id}/status` - Обновление статуса (только координаторы)

### Пользователи
- `GET /api/users` - Список пользователей (только координаторы)
- `POST /api/users` - Создание пользователя (только координаторы)
- `GET /api/users/{id}` - Просмотр пользователя (только координаторы)
- `PUT /api/users/{id}` - Обновление пользователя (только координаторы)
- `DELETE /api/users/{id}` - Удаление пользователя (только координаторы)

### Заказы
- `GET /api/orders` - Список заказов (только координаторы)
- `POST /api/orders` - Создание заказа (только координаторы)
- `POST /api/applications/{id}/create-order` - Создание заказа из заявки (только координаторы)
- `GET /api/client/orders` - Заказы клиента (только клиенты)
- `GET /api/client/orders/active` - Активные заказы клиента (только клиенты)

### Меню
- `GET /api/menu/categories` - Категории меню (публичный)
- `GET /api/menu/items` - Элементы меню (публичный)
- `GET /api/menu/full` - Полное меню (публичный)
- `GET /api/menu/search` - Поиск по меню (публичный)

### Платежи
- `POST /api/payment/orders/{order}/create` - Создание платежа
- `GET /api/payment/orders/{order}/info` - Информация о платеже
- `POST /api/payment/orders/{order}/success` - Обработка успешного платежа
- `POST /api/payment/orders/{order}/failure` - Обработка неудачного платежа

### iiko интеграция
- `GET /api/iiko/organizations` - Список организаций (только координаторы)
- `GET /api/iiko/menu` - Меню из iiko (только координаторы)
- `POST /api/iiko/sync-menu` - Синхронизация меню (только координаторы)

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

## 🐳 Docker Deployment

Проект полностью поддерживает Docker контейнеризацию для упрощения деплоя и управления.

### Архитектура Docker

- **MySQL** - База данных
- **Redis** - Кеширование и очереди
- **Backend** - Laravel API
- **Frontend** - Next.js приложение
- **Nginx** - Reverse proxy
- **Queue Worker** - Обработка очередей Laravel

### Быстрый старт с Docker

```bash
# 1. Клонируйте репозиторий
git clone <repository-url>
cd paul-azerbaijan

# 2. Настройте переменные окружения
cp docker.env.example .env
nano .env

# 3. Запустите приложение
docker-compose up -d --build
```

### Управление Docker сервисами

```bash
# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart
```

Подробная документация по Docker деплою доступна в [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

## 📁 Структура проекта

```
paul-azerbaijan/
├── backend/                 # Laravel API
├── frontend/               # Next.js приложение
├── nginx/                  # Nginx конфигурация
├── docs/                   # Документация
├── docker-compose.yml      # Docker оркестрация
├── docker.env.example      # Переменные окружения
├── deploy-docker.sh        # Скрипт деплоя (Linux/Mac)
├── deploy-docker.ps1       # Скрипт деплоя (Windows)
└── DOCKER_DEPLOYMENT.md    # Документация по Docker
```

## Лицензия

MIT License
