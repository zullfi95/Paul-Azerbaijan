# 📋 Инструкция: Копирование docker.env на сервер

## Готовый файл создан!

Файл `docker/docker.env` уже содержит все реальные API ключи из старого `docker-compose.yml`.

---

## Шаги на сервере:

### 1. Подключиться к серверу
```bash
ssh root@46.62.152.225
```

### 2. Перейти в директорию проекта
```bash
cd /var/www/paul
```

### 3. Обновить код из GitHub
```bash
git pull origin Zulfi
```

### 4. Скопировать файл docker.env
```bash
cd docker
cp docker.env.example docker.env
```

### 5. Открыть файл для редактирования
```bash
nano docker.env
```

### 6. Скопировать и вставить содержимое

**Скопируйте весь текст ниже и вставьте в nano (Ctrl+Shift+V):**

```bash
# Docker Environment Configuration
# Этот файл содержит реальные API ключи для production
# НЕ КОММИТЬТЕ ЭТОТ ФАЙЛ В GIT!

# Общие настройки
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

# SSL настройки (для продакшена)
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 7. Установить права доступа
```bash
chmod 600 docker.env
```

### 8. Применить миграции
```bash
docker exec paul_backend php artisan migrate --force
```

### 9. Перезапустить контейнеры
```bash
docker-compose restart backend queue
```

### 10. Проверить работу
```bash
docker ps | grep paul
docker logs paul_backend --tail 20
```

---

## ✅ Готово!

Все ключи скопированы и сохранены. Проект готов к работе!

