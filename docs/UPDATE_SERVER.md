# 🚀 Инструкция по обновлению проекта на сервере

## Дата: 18 ноября 2025

---

## ⚠️ ВАЖНО: Перед обновлением

После обновления `docker-compose.yml` теперь используется файл `docker.env` для хранения API ключей.

**Если на сервере еще нет файла `docker.env`, его нужно создать!**

---

## 📋 Шаги обновления

### Шаг 1: Подключение к серверу

```bash
ssh root@46.62.152.225
```

---

### Шаг 2: Создание бэкапа БД

```bash
mkdir -p /root/backups
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan \
    > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql
ls -lh /root/backups/
```

---

### Шаг 3: Обновление кода из GitHub

```bash
cd /var/www/paul
git fetch origin Zulfi
git pull origin Zulfi
```

---

### Шаг 4: Проверка и создание docker.env файла

**ВАЖНО:** Если файл `docker.env` не существует, создайте его:

```bash
cd /var/www/paul/docker

# Проверить наличие файла
ls -la docker.env

# Если файла нет - создать из примера
cp docker.env.example docker.env
chmod 600 docker.env  # Защита от чтения другими пользователями
```

**Заполните `docker.env` реальными значениями:**

Откройте файл для редактирования:
```bash
nano docker.env
```

**Обязательно заполните эти переменные:**
```bash
MAIL_USERNAME=9b682e001@smtp-brevo.com
MAIL_PASSWORD=xsmtpsib-8771a99c7073efd3240de4e350cafca996b45f7327e9007cf12155b0f4acd1c2-zXrPiIasEgkzoHw0
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=info@paul-azerbaijan.com

IIKO_API_URL=https://api-ru.iiko.services
IIKO_API_LOGIN=ваш_логин_iiko
IIKO_API_PASSWORD=ваш_пароль_iiko

ALGORITMA_API_URL=https://api.algoritma.az
ALGORITMA_API_KEY=ваш_ключ_algoritma
ALGORITMA_API_SECRET=ваш_секрет_algoritma
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Шаг 5: Обновление зависимостей Backend

```bash
docker exec paul_backend composer install --no-dev --optimize-autoloader
```

---

### Шаг 6: Применение миграций

```bash
docker exec paul_backend php artisan migrate --force
```

**Ожидаемая новая миграция:**
- `2025_11_18_131635_create_newsletter_subscribers_table.php`

---

### Шаг 7: Очистка кеша

```bash
docker exec paul_backend php artisan config:clear
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan route:clear
docker exec paul_backend php artisan view:clear
docker exec paul_backend php artisan config:cache
docker exec paul_backend php artisan route:cache
docker exec paul_backend php artisan view:cache
```

---

### Шаг 8: Перезапуск контейнеров

```bash
cd /var/www/paul/docker
docker-compose restart backend queue
```

---

### Шаг 9: Проверка статуса

```bash
# Проверить статус контейнеров
docker ps | grep paul

# Проверить логи на ошибки
docker logs paul_backend --tail 50
docker logs paul_queue --tail 30

# Проверить работу сайта
curl -I https://paul-azerbaijan.com/health
curl -I https://paul-azerbaijan.com/api/menu/categories
```

---

## ✅ Быстрый скрипт (все команды одной строкой)

Если хотите выполнить все автоматически:

```bash
cd /var/www/paul && \
mkdir -p /root/backups && \
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql && \
git pull origin Zulfi && \
cd docker && \
[ ! -f docker.env ] && cp docker.env.example docker.env && chmod 600 docker.env && echo "⚠️  Заполните docker.env реальными ключами!" && exit 1 || true && \
docker exec paul_backend composer install --no-dev --optimize-autoloader && \
docker exec paul_backend php artisan migrate --force && \
docker exec paul_backend php artisan config:clear && \
docker exec paul_backend php artisan cache:clear && \
docker exec paul_backend php artisan route:clear && \
docker exec paul_backend php artisan view:clear && \
docker exec paul_backend php artisan config:cache && \
docker exec paul_backend php artisan route:cache && \
docker exec paul_backend php artisan view:cache && \
docker-compose restart backend queue && \
sleep 5 && \
docker ps | grep paul && \
echo "✅ Обновление завершено!"
```

---

## 🔍 Что было обновлено

1. ✅ **Newsletter подписка** - теперь сохраняется в БД и отправляется приветственное письмо
2. ✅ **Функция addAllToOrder** - реализована в CoffeeBreaksMenu
3. ✅ **Защита API ключей** - перенесены в `docker.env` файл
4. ✅ **Новая миграция** - таблица `newsletter_subscribers`

---

## 🆘 Troubleshooting

### Проблема: Контейнеры не запускаются после обновления

**Решение:**
```bash
# Проверить логи
docker logs paul_backend --tail 100

# Если ошибка с переменными окружения - проверьте docker.env
cat /var/www/paul/docker/docker.env

# Перезапустить с нуля
cd /var/www/paul/docker
docker-compose down
docker-compose up -d
```

### Проблема: Миграция не применяется

**Решение:**
```bash
# Проверить статус миграций
docker exec paul_backend php artisan migrate:status

# Применить вручную
docker exec paul_backend php artisan migrate --force
```

### Проблема: Email не отправляется

**Решение:**
```bash
# Проверить настройки в docker.env
grep MAIL /var/www/paul/docker/docker.env

# Перезапустить контейнеры
docker-compose restart backend queue
```

---

**Готово!** Проект обновлен на сервере. 🎉

