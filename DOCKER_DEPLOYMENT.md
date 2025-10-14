# Docker Deployment Guide для PAUL Azerbaijan

Этот документ описывает процесс развертывания приложения PAUL Azerbaijan с использованием Docker контейнеров.

## Архитектура

Приложение состоит из следующих сервисов:
- **MySQL** - база данных
- **Redis** - кеширование и очереди
- **Backend** - Laravel API
- **Frontend** - Next.js приложение
- **Nginx** - reverse proxy
- **Queue Worker** - обработка очередей Laravel

## Предварительные требования

1. Docker и Docker Compose установлены на сервере
2. SSL сертификаты (для продакшена)
3. Настроенные переменные окружения

## Быстрый старт

### 1. Клонирование и настройка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd paul-azerbaijan

# Скопируйте файл окружения
cp docker.env.example .env

# Отредактируйте .env файл под ваши нужды
nano .env
```

### 2. Настройка переменных окружения

Обязательно настройте следующие переменные в `.env`:

```env
# Генерируйте новый APP_KEY
APP_KEY=base64:your-generated-key

# Настройте базу данных
DB_PASSWORD=secure-password

# Настройте почту
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Настройте интеграции
IIKO_API_LOGIN=your-iiko-login
IIKO_API_PASSWORD=your-iiko-password
ALGORITMA_API_KEY=your-algoritma-api-key
```

### 3. SSL сертификаты (для продакшена)

```bash
# Создайте SSL сертификаты
mkdir -p nginx/ssl
# Поместите ваши сертификаты в nginx/ssl/
# cert.pem - сертификат
# key.pem - приватный ключ
```

### 4. Запуск приложения

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

## Управление сервисами

### Основные команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Перезапуск конкретного сервиса
docker-compose restart backend

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend

# Выполнение команд в контейнере
docker-compose exec backend php artisan migrate
docker-compose exec backend php artisan queue:work
```

### Обновление приложения

```bash
# Остановка сервисов
docker-compose down

# Обновление кода
git pull origin main

# Пересборка и запуск
docker-compose up -d --build
```

## Мониторинг и логи

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Мониторинг ресурсов

```bash
# Использование ресурсов
docker stats

# Информация о контейнерах
docker-compose ps
```

## База данных

### Резервное копирование

```bash
# Создание бэкапа
docker-compose exec mysql mysqldump -u paul_user -p paul_azerbaijan > backup.sql

# Восстановление из бэкапа
docker-compose exec -T mysql mysql -u paul_user -p paul_azerbaijan < backup.sql
```

### Миграции

```bash
# Выполнение миграций
docker-compose exec backend php artisan migrate

# Откат миграций
docker-compose exec backend php artisan migrate:rollback
```

## Troubleshooting

### Частые проблемы

1. **Контейнер не запускается**
   ```bash
   # Проверьте логи
   docker-compose logs backend
   
   # Проверьте конфигурацию
   docker-compose config
   ```

2. **Проблемы с базой данных**
   ```bash
   # Проверьте подключение
   docker-compose exec backend php artisan tinker
   # В tinker: DB::connection()->getPdo();
   ```

3. **Проблемы с очередями**
   ```bash
   # Перезапустите worker
   docker-compose restart queue
   
   # Проверьте Redis
   docker-compose exec redis redis-cli ping
   ```

4. **Проблемы с Nginx**
   ```bash
   # Проверьте конфигурацию
   docker-compose exec nginx nginx -t
   
   # Перезагрузите конфигурацию
   docker-compose exec nginx nginx -s reload
   ```

### Очистка

```bash
# Удаление неиспользуемых образов
docker system prune -a

# Удаление всех контейнеров и томов
docker-compose down -v --remove-orphans
```

## Производительность

### Оптимизация

1. **Laravel оптимизации**
   ```bash
   docker-compose exec backend php artisan config:cache
   docker-compose exec backend php artisan route:cache
   docker-compose exec backend php artisan view:cache
   ```

2. **Next.js оптимизации**
   - Используется standalone режим
   - Включено сжатие gzip в Nginx
   - Настроено кеширование статических файлов

### Масштабирование

Для увеличения нагрузки можно:

1. **Увеличить количество worker'ов**
   ```yaml
   # В docker-compose.yml
   queue:
     deploy:
       replicas: 3
   ```

2. **Добавить load balancer**
   ```yaml
   # Добавить несколько backend инстансов
   backend:
     deploy:
       replicas: 2
   ```

## Безопасность

### Рекомендации

1. **Измените пароли по умолчанию**
2. **Используйте HTTPS в продакшене**
3. **Регулярно обновляйте образы**
4. **Настройте firewall**
5. **Используйте secrets для чувствительных данных**

### Обновление образов

```bash
# Обновление всех образов
docker-compose pull

# Пересборка с новыми образами
docker-compose up -d --build
```

## Контакты

При возникновении проблем обращайтесь к команде разработки.
