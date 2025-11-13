# 🚀 Инструкция по деплою обновлений на production

## Дата: 12 ноября 2025

---

## ⚠️ Важно прочитать перед деплоем!

**Что было изменено в коде:**
1. ✅ Исправлена платежная система (критично)
2. ✅ Добавлена подробная статистика
3. ✅ Реализован Forgot Password + Newsletter
4. ✅ Создана новая миграция для password reset

**Время деплоя:** ~5-10 минут  
**Downtime:** ~30 секунд (при перезапуске контейнеров)

---

## 📋 Checklist перед деплоем

- [ ] Убедитесь, что вы в нерабочее время или низкая нагрузка
- [ ] Сделайте бэкап БД (обязательно!)
- [ ] Проверьте, что все контейнеры работают

---

## 🔧 Шаг 1: Подключение к серверу

```bash
ssh root@46.62.152.225
```

---

## 💾 Шаг 2: Создание бэкапа БД (ОБЯЗАТЕЛЬНО!)

```bash
# Создать директорию для бэкапов
mkdir -p /root/backups

# Создать бэкап
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan \
    > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql

# Проверить, что бэкап создан
ls -lh /root/backups/
```

**Ожидаемый результат:** Файл размером >1KB

---

## 📥 Шаг 3: Обновление кода

```bash
# Перейти в директорию проекта
cd /var/www/paul

# Проверить текущую ветку и статус
git status
git branch

# Получить изменения (БЕЗ применения)
git fetch origin main

# Посмотреть, что изменится
git log HEAD..origin/main --oneline

# Применить изменения
git pull origin main
```

**Ожидаемый вывод:**
```
Updating xxxxx..yyyyy
Fast-forward
 backend/app/Models/Order.php           | +50 -10
 backend/app/Http/Controllers/...       | +200 -50
 ...
```

---

## 🗄️ Шаг 4: Проверка миграций

```bash
# Посмотреть список миграций
docker exec paul_backend php artisan migrate:status

# Проверить, есть ли новая миграция
ls -la backend/database/migrations/ | grep 2025_11_12
```

**Ожидаемая новая миграция:**
- `2025_11_12_000000_add_password_reset_to_users_table.php`

---

## 📦 Шаг 5: Обновление зависимостей Backend

```bash
# Обновить Composer зависимости (если изменились)
docker exec paul_backend composer install --no-dev --optimize-autoloader

# Если ошибка autoload, то:
docker exec paul_backend composer dump-autoload
```

**Время:** ~1-2 минуты

---

## 🔄 Шаг 6: Применение миграций

```bash
# ВАЖНО: Сначала применить старые pending миграции
docker exec paul_backend php artisan migrate --force

# Проверить статус
docker exec paul_backend php artisan migrate:status
```

**Ожидаемый результат:**
- Все миграции должны быть `Ran`
- Новые поля `reset_token` и `reset_token_expires` добавлены в таблицу `users`

**Если ошибка:** Смотрите раздел "Troubleshooting" ниже

---

## 🧹 Шаг 7: Очистка кеша Laravel

```bash
# Очистить весь кеш
docker exec paul_backend php artisan config:clear
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan route:clear
docker exec paul_backend php artisan view:clear

# Создать новый оптимизированный кеш
docker exec paul_backend php artisan config:cache
docker exec paul_backend php artisan route:cache
docker exec paul_backend php artisan view:cache
```

**Время:** ~10 секунд

---

## 🔄 Шаг 8: Перезапуск контейнеров

### Вариант A: Мягкий перезапуск (без downtime)

```bash
# Перезапуск только backend и queue
docker restart paul_backend paul_queue

# Проверить статус
docker ps | grep paul
```

**Downtime:** 0 секунд (Nginx продолжает работать)

### Вариант B: Полный перезапуск (рекомендуется)

```bash
# Остановить все контейнеры
cd /var/www/paul/docker
docker-compose down

# Запустить заново
docker-compose up -d

# Проверить статус
docker-compose ps
```

**Downtime:** ~30 секунд

---

## ✅ Шаг 9: Проверка работоспособности

### 9.1 Проверка контейнеров

```bash
# Все контейнеры должны быть Up
docker ps

# Проверить логи на ошибки
docker logs paul_backend --tail 50
docker logs paul_frontend --tail 50
docker logs paul_nginx --tail 20
```

**Ожидаемый результат:** Нет ошибок ERROR или CRITICAL

### 9.2 Проверка сайта

```bash
# Проверка health endpoint
curl -I https://paul-azerbaijan.com/health

# Проверка API
curl -I https://paul-azerbaijan.com/api/menu/categories
```

**Ожидаемый результат:** HTTP 200 OK

### 9.3 Проверка новых endpoints

```bash
# Forgot Password
curl -X POST https://paul-azerbaijan.com/api/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

# Newsletter
curl -X POST https://paul-azerbaijan.com/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com"}'

# Статистика (требуется токен координатора)
# curl -X GET https://paul-azerbaijan.com/api/orders/statistics \
#   -H "Authorization: Bearer YOUR_TOKEN"
```

**Ожидаемый результат:** HTTP 200, JSON с `"success": true`

### 9.4 Проверка базы данных

```bash
# Проверить новые поля
docker exec paul_mysql mysql -upaul_user -ppaul_password -e \
  "DESCRIBE paul_azerbaijan.users;" | grep reset_token
```

**Ожидаемый результат:**
```
reset_token          | varchar(255)  | YES
reset_token_expires  | timestamp     | YES
```

---

## 🎯 Шаг 10: Мониторинг после деплоя

### Следить за логами 5-10 минут:

```bash
# Terminal 1: Backend logs
docker logs paul_backend --follow

# Terminal 2: Nginx logs
docker logs paul_nginx --follow

# Terminal 3: System monitor
htop
```

**Что искать:**
- ❌ Ошибки SQL
- ❌ PHP Fatal errors
- ❌ 500 Internal Server Error
- ✅ Успешные запросы к новым endpoints

---

## 🔥 Troubleshooting

### Проблема 1: Миграция не применяется

**Ошибка:** `SQLSTATE[42S01]: Base table or view already exists`

**Решение:**
```bash
# Посмотреть текст ошибки
docker exec paul_backend php artisan migrate --force

# Если таблица уже существует, пропустить
docker exec paul_backend php artisan migrate --force --pretend

# Или вручную отметить как выполненную
docker exec paul_mysql mysql -upaul_user -ppaul_password paul_azerbaijan \
  -e "INSERT INTO migrations (migration, batch) VALUES ('2025_11_12_000000_add_password_reset_to_users_table', 14);"
```

### Проблема 2: Composer ошибки

**Ошибка:** `Class not found`

**Решение:**
```bash
docker exec paul_backend composer dump-autoload -o
docker restart paul_backend
```

### Проблема 3: 502 Bad Gateway

**Причина:** Backend контейнер не запустился

**Решение:**
```bash
# Проверить логи
docker logs paul_backend --tail 100

# Перезапустить
docker restart paul_backend

# Если не помогает - полный rebuild
cd /var/www/paul/docker
docker-compose build backend
docker-compose up -d backend
```

### Проблема 4: Forgot Password не работает

**Причина:** Поля не добавлены в БД

**Решение:**
```bash
# Проверить наличие полей
docker exec paul_mysql mysql -upaul_user -ppaul_password -e \
  "SHOW COLUMNS FROM paul_azerbaijan.users WHERE Field LIKE 'reset_%';"

# Если нет - добавить вручную
docker exec paul_mysql mysql -upaul_user -ppaul_password paul_azerbaijan <<EOF
ALTER TABLE users 
  ADD COLUMN reset_token VARCHAR(255) NULL AFTER password,
  ADD COLUMN reset_token_expires TIMESTAMP NULL AFTER reset_token;
EOF
```

### Проблема 5: Сайт не отвечает

**Rollback к предыдущей версии:**
```bash
# 1. Остановить контейнеры
docker-compose down

# 2. Откатить код
cd /var/www/paul
git reset --hard HEAD~1

# 3. Восстановить БД из бэкапа
docker-compose up -d mysql
sleep 10
cat /root/backups/paul_YYYYMMDD_HHMMSS.sql | \
  docker exec -i paul_mysql mysql -upaul_user -ppaul_password paul_azerbaijan

# 4. Запустить все сервисы
docker-compose up -d

# 5. Очистить кеш
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan config:clear
```

---

## 📊 Ожидаемые результаты

После успешного деплоя:

✅ **Работает:**
- Сайт доступен по HTTPS
- Все старые функции работают
- Forgot Password работает
- Newsletter subscription работает
- Подробная статистика доступна
- Платежная система стабильна
- Почта работает (если была настроена)

✅ **Логи:**
- Нет ошибок ERROR в логах
- Backend отвечает на запросы
- Миграции применены

✅ **База данных:**
- Все миграции в статусе `Ran`
- Новые поля `reset_token` и `reset_token_expires` добавлены

---

## 🎓 Команды для быстрого копирования

### Вся последовательность одной командой:

```bash
#!/bin/bash
set -e

echo "🚀 Начало деплоя..."

# 1. Бэкап
echo "💾 Создание бэкапа..."
mkdir -p /root/backups
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan \
    > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql

# 2. Обновление кода
echo "📥 Обновление кода..."
cd /var/www/paul
git pull origin main

# 3. Composer
echo "📦 Обновление зависимостей..."
docker exec paul_backend composer install --no-dev --optimize-autoloader

# 4. Миграции
echo "🗄️ Применение миграций..."
docker exec paul_backend php artisan migrate --force

# 5. Кеш
echo "🧹 Очистка кеша..."
docker exec paul_backend php artisan config:clear
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan route:clear
docker exec paul_backend php artisan config:cache
docker exec paul_backend php artisan route:cache

# 6. Перезапуск
echo "🔄 Перезапуск контейнеров..."
docker restart paul_backend paul_queue

# 7. Проверка
echo "✅ Проверка..."
sleep 5
docker ps | grep paul
curl -I https://paul-azerbaijan.com/health

echo "🎉 Деплой завершен!"
```

**Сохраните как:** `/root/deploy.sh`

**Использование:**
```bash
chmod +x /root/deploy.sh
/root/deploy.sh
```

---

## 📝 Checklist после деплоя

- [ ] Все контейнеры работают (docker ps)
- [ ] Сайт доступен по HTTPS
- [ ] API отвечает на запросы
- [ ] Forgot Password работает
- [ ] Newsletter работает
- [ ] Статистика работает
- [ ] Нет ошибок в логах
- [ ] Миграции применены
- [ ] Бэкап создан
- [ ] Мониторинг показывает норму

---

## 🆘 Поддержка

Если что-то пошло не так:

1. **Не паникуйте** - у вас есть бэкап
2. **Проверьте логи** - они покажут проблему
3. **Сделайте rollback** - используйте инструкцию выше
4. **Сообщите разработчикам** - если проблема критична

---

**Автор:** AI Assistant  
**Дата:** 12 ноября 2025  
**Версия:** 1.0

**Статус:** ✅ Готово к использованию

