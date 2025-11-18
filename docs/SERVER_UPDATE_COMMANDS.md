# 🚀 Команды для обновления на сервере

## Подключение к серверу

```bash
ssh root@46.62.152.225
```

---

## Все команды одной последовательностью

Скопируйте и выполните на сервере:

```bash
# 1. Создание бэкапа БД
mkdir -p /root/backups
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql

# 2. Обновление кода
cd /var/www/paul
git pull origin Zulfi

# 3. Создание docker.env файла
cd docker
cat > docker.env << 'EOF'
# Docker Environment Configuration
APP_NAME="PAUL Azerbaijan"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://paul.az

# База данных MySQL
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=paul_azerbaijan
DB_USERNAME=paul_user
DB_PASSWORD=paul_password

# Redis
REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

# Кеширование и сессии
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Почта (Brevo SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=9b682e001@smtp-brevo.com
MAIL_PASSWORD=xsmtpsib-8771a99c7073efd3240de4e350cafca996b45f7327e9007cf12155b0f4acd1c2-zXrPiIasEgkzoHw0
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=info@paul-azerbaijan.com
MAIL_FROM_NAME=PAUL Azerbaijan

# IIKO Integration
IIKO_API_URL=https://api-ru.iiko.services
IIKO_API_LOGIN=
IIKO_API_PASSWORD=
IIKO_API_KEY=e443a1d8f6f941eba3d92fbed30bdefd
IIKO_BASE_URL=https://api-ru.iiko.services

# Algoritma Integration
ALGORITMA_API_URL=https://api.testalgoritma.az
ALGORITMA_BASE_URL=https://api.testalgoritma.az
ALGORITMA_API_KEY=Paul
ALGORITMA_API_SECRET=+WlGb0xWlywRJn/tYT
ALGORITMA_ENVIRONMENT=test

# Frontend URL
NEXT_PUBLIC_API_URL=https://paul.az/api
NEXT_PUBLIC_APP_NAME=PAUL Azerbaijan

# SSL настройки
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
EOF

chmod 600 docker.env

# 4. Обновление зависимостей
docker exec paul_backend composer install --no-dev --optimize-autoloader

# 5. Применение миграций
docker exec paul_backend php artisan migrate --force

# 6. Очистка кеша
docker exec paul_backend php artisan config:clear
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan route:clear
docker exec paul_backend php artisan view:clear
docker exec paul_backend php artisan config:cache
docker exec paul_backend php artisan route:cache
docker exec paul_backend php artisan view:cache

# 7. Перезапуск контейнеров
docker-compose restart backend queue

# 8. Проверка статуса
sleep 5
docker ps | grep paul
docker logs paul_backend --tail 20

echo "✅ Обновление завершено!"
```

---

## Пошагово (если нужен контроль на каждом шаге)

### Шаг 1: Бэкап БД
```bash
mkdir -p /root/backups
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql
ls -lh /root/backups/
```

### Шаг 2: Обновление кода
```bash
cd /var/www/paul
git pull origin Zulfi
```

### Шаг 3: Создание docker.env
```bash
cd docker
nano docker.env
```

**Вставьте содержимое из файла выше, сохраните (Ctrl+O, Enter, Ctrl+X)**

```bash
chmod 600 docker.env
```

### Шаг 4: Обновление зависимостей
```bash
docker exec paul_backend composer install --no-dev --optimize-autoloader
```

### Шаг 5: Миграции
```bash
docker exec paul_backend php artisan migrate --force
```

### Шаг 6: Очистка кеша
```bash
docker exec paul_backend php artisan config:clear
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan route:clear
docker exec paul_backend php artisan view:clear
docker exec paul_backend php artisan config:cache
docker exec paul_backend php artisan route:cache
docker exec paul_backend php artisan view:cache
```

### Шаг 7: Перезапуск
```bash
cd /var/www/paul/docker
docker-compose restart backend queue
```

### Шаг 8: Проверка
```bash
docker ps | grep paul
docker logs paul_backend --tail 50
curl -I https://paul-azerbaijan.com/health
```

---

## ✅ Готово!

После выполнения всех команд проект будет обновлен на сервере.

