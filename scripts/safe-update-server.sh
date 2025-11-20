#!/bin/bash
# Безопасный скрипт обновления проекта на сервере
# Сохраняет API ключи, настройки HTTPS и nginx конфигурации

set -e

# Конфигурация
SERVER_IP="46.62.152.225"
SERVER_USER="root"
PROJECT_PATH="/var/www/paul"
BACKUP_DIR="/root/backups"
BRANCH="Zulfi"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

log "🚀 Начинаем безопасное обновление проекта на сервере $SERVER_IP..."

# Проверка SSH подключения
log "🔐 Проверяем SSH подключение к серверу..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    error "Не удается подключиться к серверу $SERVER_IP. Проверьте SSH ключи и доступ."
fi

log "✅ SSH подключение успешно"

# Выполнение команд на сервере
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

PROJECT_PATH="/var/www/paul"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BRANCH="Zulfi"

echo "=========================================="
echo "🔄 Безопасное обновление проекта"
echo "=========================================="

# 1. Создание директории для бэкапов
echo ""
echo "📁 Создаем директорию для бэкапов..."
mkdir -p $BACKUP_DIR

# 2. Бэкап базы данных
echo ""
echo "💾 Создаем бэкап базы данных..."
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan \
    > $BACKUP_DIR/paul_db_${TIMESTAMP}.sql
if [ $? -eq 0 ]; then
    echo "✅ Бэкап БД создан: $BACKUP_DIR/paul_db_${TIMESTAMP}.sql"
    ls -lh $BACKUP_DIR/paul_db_${TIMESTAMP}.sql
else
    echo "⚠️  Не удалось создать бэкап БД, но продолжаем..."
fi

# 3. Сохранение критических файлов
echo ""
echo "🔐 Сохраняем критически важные файлы..."

# Сохраняем docker.env (API ключи)
if [ -f "$PROJECT_PATH/docker/docker.env" ]; then
    cp $PROJECT_PATH/docker/docker.env $BACKUP_DIR/docker.env.backup_${TIMESTAMP}
    echo "✅ docker.env сохранен"
else
    echo "⚠️  docker.env не найден - будет создан из примера"
fi

# Сохраняем nginx конфигурацию
if [ -f "$PROJECT_PATH/nginx/conf.d/default.conf" ]; then
    mkdir -p $BACKUP_DIR/nginx_${TIMESTAMP}
    cp -r $PROJECT_PATH/nginx/conf.d/* $BACKUP_DIR/nginx_${TIMESTAMP}/ 2>/dev/null || true
    echo "✅ nginx конфигурация сохранена"
fi

# Сохраняем SSL сертификаты
if [ -d "$PROJECT_PATH/nginx/ssl" ]; then
    mkdir -p $BACKUP_DIR/ssl_${TIMESTAMP}
    cp -r $PROJECT_PATH/nginx/ssl/* $BACKUP_DIR/ssl_${TIMESTAMP}/ 2>/dev/null || true
    echo "✅ SSL сертификаты сохранены"
fi

# Сохраняем backend/.env если есть
if [ -f "$PROJECT_PATH/backend/.env" ]; then
    cp $PROJECT_PATH/backend/.env $BACKUP_DIR/backend.env.backup_${TIMESTAMP}
    echo "✅ backend/.env сохранен"
fi

# 4. Обновление кода из GitHub
echo ""
echo "📥 Обновляем код из GitHub (ветка $BRANCH)..."
cd $PROJECT_PATH

# Сохраняем текущий commit для возможного отката
CURRENT_COMMIT=$(git rev-parse HEAD)
echo $CURRENT_COMMIT > $BACKUP_DIR/previous_commit_${TIMESTAMP}.txt
echo "📍 Текущий commit сохранен: $CURRENT_COMMIT"

# Получаем обновления
git fetch origin $BRANCH

# Смотрим, что изменится
echo ""
echo "📋 Изменения для применения:"
git log HEAD..origin/$BRANCH --oneline | head -10 || echo "Нет новых изменений"

# Применяем обновления
git pull origin $BRANCH || {
    echo "❌ Ошибка при обновлении кода. Откатываем изменения..."
    git reset --hard $CURRENT_COMMIT
    exit 1
}

echo "✅ Код обновлен"

# 5. Восстановление критических файлов (если они были перезаписаны)
echo ""
echo "🔐 Восстанавливаем критически важные файлы..."

# Восстанавливаем docker.env если он был перезаписан
if [ -f "$BACKUP_DIR/docker.env.backup_${TIMESTAMP}" ]; then
    if [ ! -f "$PROJECT_PATH/docker/docker.env" ] || [ "$PROJECT_PATH/docker/docker.env" -ot "$BACKUP_DIR/docker.env.backup_${TIMESTAMP}" ]; then
        cp $BACKUP_DIR/docker.env.backup_${TIMESTAMP} $PROJECT_PATH/docker/docker.env
        chmod 600 $PROJECT_PATH/docker/docker.env
        echo "✅ docker.env восстановлен из бэкапа"
    else
        echo "ℹ️  docker.env уже существует и актуален"
    fi
else
    # Если docker.env не существует, создаем из примера
    if [ ! -f "$PROJECT_PATH/docker/docker.env" ]; then
        if [ -f "$PROJECT_PATH/docker/docker.env.example" ]; then
            cp $PROJECT_PATH/docker/docker.env.example $PROJECT_PATH/docker/docker.env
            chmod 600 $PROJECT_PATH/docker/docker.env
            echo "⚠️  docker.env создан из примера - ЗАПОЛНИТЕ ЕГО РЕАЛЬНЫМИ КЛЮЧАМИ!"
            echo "⚠️  Используйте значения из: $BACKUP_DIR/docker.env.backup_*"
        else
            echo "❌ Не найден docker.env.example!"
        fi
    fi
fi

# Восстанавливаем nginx конфигурацию
if [ -d "$BACKUP_DIR/nginx_${TIMESTAMP}" ]; then
    if [ -d "$PROJECT_PATH/nginx/conf.d" ]; then
        # Создаем бэкап текущей версии
        cp -r $PROJECT_PATH/nginx/conf.d $BACKUP_DIR/nginx_new_${TIMESTAMP} 2>/dev/null || true
        # Восстанавливаем сохраненную версию
        cp -r $BACKUP_DIR/nginx_${TIMESTAMP}/* $PROJECT_PATH/nginx/conf.d/ 2>/dev/null || true
        echo "✅ nginx конфигурация восстановлена"
    fi
fi

# Восстанавливаем SSL сертификаты
if [ -d "$BACKUP_DIR/ssl_${TIMESTAMP}" ]; then
    if [ -d "$PROJECT_PATH/nginx/ssl" ]; then
        # Создаем бэкап текущей версии
        cp -r $PROJECT_PATH/nginx/ssl $BACKUP_DIR/ssl_new_${TIMESTAMP} 2>/dev/null || true
        # Восстанавливаем сохраненную версию
        cp -r $BACKUP_DIR/ssl_${TIMESTAMP}/* $PROJECT_PATH/nginx/ssl/ 2>/dev/null || true
        echo "✅ SSL сертификаты восстановлены"
    fi
fi

# 6. Обновление зависимостей Backend
echo ""
echo "📦 Обновляем зависимости Backend..."
docker exec paul_backend composer install --no-dev --optimize-autoloader || {
    echo "⚠️  Ошибка при обновлении зависимостей, но продолжаем..."
}

# 7. Применение миграций
echo ""
echo "🗄️  Применяем миграции базы данных..."
docker exec paul_backend php artisan migrate --force || {
    echo "❌ Ошибка при применении миграций!"
    echo "🔄 Откатываем изменения..."
    git reset --hard $CURRENT_COMMIT
    exit 1
}
echo "✅ Миграции применены"

# 8. Очистка и пересборка кеша
echo ""
echo "🧹 Очищаем кеш Laravel..."
docker exec paul_backend php artisan config:clear || true
docker exec paul_backend php artisan cache:clear || true
docker exec paul_backend php artisan route:clear || true
docker exec paul_backend php artisan view:clear || true

echo ""
echo "💾 Кешируем конфигурацию Laravel..."
docker exec paul_backend php artisan config:cache || true
docker exec paul_backend php artisan route:cache || true
docker exec paul_backend php artisan view:cache || true

# 9. Перезапуск контейнеров (без остановки nginx)
echo ""
echo "🔄 Перезапускаем контейнеры backend и queue..."
cd $PROJECT_PATH/docker
docker-compose restart backend queue || {
    echo "⚠️  Ошибка при перезапуске контейнеров, пробуем полный перезапуск..."
    docker-compose restart
}

echo ""
echo "⏳ Ждем 10 секунд для запуска сервисов..."
sleep 10

# 10. Проверка статуса
echo ""
echo "🔍 Проверяем статус контейнеров..."
docker ps | grep paul || echo "⚠️  Некоторые контейнеры могут быть остановлены"

# Проверка логов на ошибки
echo ""
echo "📋 Проверяем логи backend на критические ошибки..."
if docker logs paul_backend --tail 20 2>&1 | grep -i "error\|fatal\|exception" | head -5; then
    echo "⚠️  Обнаружены ошибки в логах. Проверьте: docker logs paul_backend --tail 50"
else
    echo "✅ Критических ошибок в логах не обнаружено"
fi

# 11. Проверка доступности
echo ""
echo "🌐 Проверяем доступность сайта..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost/health | grep -q "200\|301\|302"; then
    echo "✅ Сайт доступен"
else
    echo "⚠️  Сайт может быть недоступен. Проверьте: curl -I http://localhost/health"
fi

echo ""
echo "=========================================="
echo "✅ Обновление завершено!"
echo "=========================================="
echo ""
echo "📋 Созданные бэкапы:"
echo "  - БД: $BACKUP_DIR/paul_db_${TIMESTAMP}.sql"
echo "  - docker.env: $BACKUP_DIR/docker.env.backup_${TIMESTAMP}"
echo "  - nginx: $BACKUP_DIR/nginx_${TIMESTAMP}/"
echo "  - SSL: $BACKUP_DIR/ssl_${TIMESTAMP}/"
echo "  - Previous commit: $CURRENT_COMMIT"
echo ""
echo "📊 Статус контейнеров:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep paul || docker ps
echo ""
echo "🔍 Полезные команды:"
echo "  Просмотр логов: docker logs paul_backend --tail 50 -f"
echo "  Статус миграций: docker exec paul_backend php artisan migrate:status"
echo "  Проверка сайта: curl -I https://paul-azerbaijan.com/health"
echo ""
echo "⚠️  Если что-то пошло не так, используйте откат:"
echo "  cd $PROJECT_PATH"
echo "  git reset --hard $CURRENT_COMMIT"
echo "  docker-compose restart"

ENDSSH

if [ $? -eq 0 ]; then
    log "🎉 Обновление успешно завершено!"
    log "🌐 Сайт должен быть доступен"
else
    error "❌ Обновление завершилось с ошибкой. Проверьте логи выше."
fi

