#!/bin/bash

# PAUL Azerbaijan Remote Server Deployment Script
# Этот скрипт автоматизирует деплой на удаленный сервер через SSH

set -e

# Конфигурация сервера
SERVER_IP="46.62.152.225"
SERVER_USER="root"
SERVER_PATH="/var/www/paul"
REPO_URL="https://github.com/zullfi95/Paul-Azerbaijan.git"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

log "🚀 Начинаем деплой PAUL Azerbaijan на сервер $SERVER_IP..."

# Проверка SSH подключения
log "🔐 Проверяем SSH подключение к серверу..."
if ! ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER_USER@$SERVER_IP exit 2>/dev/null; then
    error "Не удается подключиться к серверу $SERVER_IP. Проверьте SSH ключи и доступ."
fi

log "✅ SSH подключение успешно"

# Выполнение команд на сервере
log "📡 Подключаемся к серверу и выполняем деплой..."

ssh $SERVER_USER@$SERVER_IP << EOF
set -e

echo "🔧 Обновляем систему..."
apt update && apt upgrade -y

echo "🐳 Устанавливаем Docker и Docker Compose..."
# Удаляем старые версии
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Устанавливаем зависимости
apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавляем официальный GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \$(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновляем пакеты и устанавливаем Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Запускаем Docker
systemctl start docker
systemctl enable docker

# Добавляем пользователя в группу docker
usermod -aG docker \$USER

echo "📁 Создаем директорию проекта..."
mkdir -p $SERVER_PATH
cd $SERVER_PATH

echo "📥 Клонируем репозиторий..."
if [ -d ".git" ]; then
    echo "🔄 Обновляем существующий репозиторий..."
    git fetch origin
    git reset --hard origin/master
else
    echo "📋 Клонируем новый репозиторий..."
    git clone $REPO_URL .
fi

echo "⚙️ Настраиваем переменные окружения..."
if [ ! -f ".env" ]; then
    if [ -f "docker.env.example" ]; then
        cp docker.env.example .env
        echo "📝 Создан .env файл из примера. Не забудьте его настроить!"
    else
        echo "❌ Файл docker.env.example не найден!"
        exit 1
    fi
fi

echo "🔧 Настраиваем права доступа..."
chmod +x deploy-docker.sh

echo "🐳 Запускаем Docker контейнеры..."
docker-compose down 2>/dev/null || true
docker-compose up -d --build

echo "⏳ Ждем запуска сервисов..."
sleep 30

echo "🗄️ Выполняем миграции базы данных..."
docker-compose exec -T backend php artisan migrate --force

echo "🔧 Кешируем конфигурацию Laravel..."
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
docker-compose exec -T backend php artisan view:cache

echo "🔍 Проверяем статус контейнеров..."
docker-compose ps

echo "📊 Показываем использование ресурсов..."
docker stats --no-stream

echo "🌐 Проверяем доступность приложения..."
curl -I http://localhost || echo "⚠️ Приложение может быть еще не готово"

echo "✅ Деплой завершен!"
echo "🌐 Приложение доступно по адресу: http://$SERVER_IP"
echo "📋 Полезные команды:"
echo "  Просмотр логов: docker-compose logs -f"
echo "  Остановка: docker-compose down"
echo "  Перезапуск: docker-compose restart"
echo "  Статус: docker-compose ps"

EOF

if [ $? -eq 0 ]; then
    log "🎉 Деплой успешно завершен!"
    log "🌐 Приложение доступно по адресу: http://$SERVER_IP"
    log "📋 Для управления сервисами используйте:"
    log "  ssh $SERVER_USER@$SERVER_IP"
    log "  cd $SERVER_PATH"
    log "  docker-compose logs -f"
else
    error "❌ Деплой завершился с ошибкой"
fi
