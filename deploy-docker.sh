#!/bin/bash

# PAUL Azerbaijan Docker Deployment Script
# Этот скрипт автоматизирует процесс деплоя приложения

set -e

echo "🚀 Начинаем деплой PAUL Azerbaijan..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
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

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    error "Docker не установлен. Пожалуйста, установите Docker."
fi

# Проверка наличия Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose не установлен. Пожалуйста, установите Docker Compose."
fi

# Проверка наличия .env файла
if [ ! -f .env ]; then
    warn ".env файл не найден. Создаем из примера..."
    if [ -f docker.env.example ]; then
        cp docker.env.example .env
        warn "Пожалуйста, отредактируйте .env файл перед продолжением."
        read -p "Нажмите Enter после настройки .env файла..."
    else
        error "Файл docker.env.example не найден."
    fi
fi

# Остановка существующих контейнеров
log "Останавливаем существующие контейнеры..."
docker-compose down

# Удаление старых образов (опционально)
if [ "$1" = "--clean" ]; then
    log "Удаляем старые образы..."
    docker system prune -f
fi

# Сборка и запуск контейнеров
log "Собираем и запускаем контейнеры..."
docker-compose up -d --build

# Ожидание запуска сервисов
log "Ожидаем запуска сервисов..."
sleep 30

# Проверка статуса контейнеров
log "Проверяем статус контейнеров..."
docker-compose ps

# Выполнение миграций
log "Выполняем миграции базы данных..."
docker-compose exec -T backend php artisan migrate --force

# Кеширование конфигурации Laravel
log "Кешируем конфигурацию Laravel..."
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
docker-compose exec -T backend php artisan view:cache

# Проверка здоровья сервисов
log "Проверяем здоровье сервисов..."

# Проверка MySQL
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
    log "✅ MySQL работает"
else
    error "❌ MySQL не отвечает"
fi

# Проверка Redis
if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
    log "✅ Redis работает"
else
    error "❌ Redis не отвечает"
fi

# Проверка Backend
if curl -f http://localhost/api/health &> /dev/null; then
    log "✅ Backend API работает"
else
    warn "⚠️ Backend API может быть недоступен (это нормально если нет health endpoint)"
fi

# Проверка Frontend
if curl -f http://localhost &> /dev/null; then
    log "✅ Frontend работает"
else
    error "❌ Frontend не отвечает"
fi

# Показ логов
log "Показываем последние логи..."
docker-compose logs --tail=20

echo ""
log "🎉 Деплой завершен успешно!"
echo ""
echo "Приложение доступно по адресу:"
echo "  Frontend: http://localhost"
echo "  Backend API: http://localhost/api"
echo ""
echo "Полезные команды:"
echo "  Просмотр логов: docker-compose logs -f"
echo "  Остановка: docker-compose down"
echo "  Перезапуск: docker-compose restart"
echo "  Статус: docker-compose ps"
echo ""
