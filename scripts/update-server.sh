#!/bin/bash
# Скрипт для обновления проекта на сервере

set -e

echo "🚀 Начало обновления проекта на сервере..."

# 1. Создание бэкапа БД
echo "💾 Создание бэкапа БД..."
mkdir -p /root/backups
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan \
    > /root/backups/paul_$(date +%Y%m%d_%H%M%S).sql
echo "✅ Бэкап создан"

# 2. Обновление кода
echo "📥 Обновление кода из GitHub..."
cd /var/www/paul
git fetch origin Zulfi
git pull origin Zulfi
echo "✅ Код обновлен"

# 3. Проверка наличия docker.env файла
echo "🔐 Проверка docker.env файла..."
if [ ! -f "/var/www/paul/docker/docker.env" ]; then
    echo "⚠️  Файл docker.env не найден!"
    echo "📝 Создаю из примера..."
    cd /var/www/paul/docker
    cp docker.env.example docker.env
    echo "⚠️  ВАЖНО: Отредактируйте docker.env и заполните реальными API ключами!"
    echo "⚠️  Используйте значения из старого docker-compose.yml"
    exit 1
fi
echo "✅ docker.env найден"

# 4. Обновление зависимостей Backend
echo "📦 Обновление зависимостей Backend..."
docker exec paul_backend composer install --no-dev --optimize-autoloader
echo "✅ Зависимости обновлены"

# 5. Применение миграций
echo "🗄️  Применение миграций..."
docker exec paul_backend php artisan migrate --force
echo "✅ Миграции применены"

# 6. Очистка кеша
echo "🧹 Очистка кеша..."
docker exec paul_backend php artisan config:clear
docker exec paul_backend php artisan cache:clear
docker exec paul_backend php artisan route:clear
docker exec paul_backend php artisan view:clear
docker exec paul_backend php artisan config:cache
docker exec paul_backend php artisan route:cache
docker exec paul_backend php artisan view:cache
echo "✅ Кеш очищен"

# 7. Перезапуск контейнеров
echo "🔄 Перезапуск контейнеров..."
cd /var/www/paul/docker
docker-compose restart backend queue
echo "✅ Контейнеры перезапущены"

# 8. Проверка статуса
echo "✅ Проверка статуса..."
sleep 5
docker ps | grep paul
echo ""

echo "🎉 Обновление завершено!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Проверьте логи: docker logs paul_backend --tail 50"
echo "2. Проверьте работу сайта: curl -I https://paul-azerbaijan.com/health"
echo "3. Если docker.env был создан - заполните его реальными ключами и перезапустите:"
echo "   docker-compose restart backend queue"

