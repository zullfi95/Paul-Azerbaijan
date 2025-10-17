# PAUL Azerbaijan Remote Server Deployment Script (PowerShell)
# Этот скрипт автоматизирует деплой на удаленный сервер через SSH

param(
    [string]$ServerIP = "46.62.152.225",
    [string]$ServerUser = "root",
    [string]$ServerPath = "/var/www/paul",
    [string]$RepoURL = "https://github.com/zullfi95/Paul-Azerbaijan.git"
)

# Функция для вывода сообщений
function Write-Log {
    param([string]$Message, [string]$Type = "Info")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    switch ($Type) {
        "Error" { Write-Host "[$timestamp] ERROR: $Message" -ForegroundColor Red }
        "Warning" { Write-Host "[$timestamp] WARNING: $Message" -ForegroundColor Yellow }
        "Success" { Write-Host "[$timestamp] $Message" -ForegroundColor Green }
        "Info" { Write-Host "[$timestamp] INFO: $Message" -ForegroundColor Cyan }
        default { Write-Host "[$timestamp] $Message" -ForegroundColor White }
    }
}

Write-Log "🚀 Начинаем деплой PAUL Azerbaijan на сервер $ServerIP..." "Success"

# Проверка SSH подключения
Write-Log "🔐 Проверяем SSH подключение к серверу..." "Info"
try {
    $sshTest = ssh -o ConnectTimeout=10 -o BatchMode=yes "$ServerUser@$ServerIP" "exit" 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "SSH connection failed"
    }
    Write-Log "✅ SSH подключение успешно" "Success"
} catch {
    Write-Log "Не удается подключиться к серверу $ServerIP. Проверьте SSH ключи и доступ." "Error"
    exit 1
}

# Создаем скрипт для выполнения на сервере
$remoteScript = @"
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
mkdir -p $ServerPath
cd $ServerPath

echo "📥 Клонируем репозиторий..."
if [ -d ".git" ]; then
    echo "🔄 Обновляем существующий репозиторий..."
    git fetch origin
    git reset --hard origin/master
else
    echo "📋 Клонируем новый репозиторий..."
    git clone $RepoURL .
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
echo "🌐 Приложение доступно по адресу: http://$ServerIP"
echo "📋 Полезные команды:"
echo "  Просмотр логов: docker-compose logs -f"
echo "  Остановка: docker-compose down"
echo "  Перезапуск: docker-compose restart"
echo "  Статус: docker-compose ps"
"@

# Выполняем скрипт на сервере
Write-Log "📡 Подключаемся к серверу и выполняем деплой..." "Info"

try {
    $remoteScript | ssh "$ServerUser@$ServerIP" "bash -s"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Log "🎉 Деплой успешно завершен!" "Success"
        Write-Log "🌐 Приложение доступно по адресу: http://$ServerIP" "Success"
        Write-Log "📋 Для управления сервисами используйте:" "Info"
        Write-Log "  ssh $ServerUser@$ServerIP" "Info"
        Write-Log "  cd $ServerPath" "Info"
        Write-Log "  docker-compose logs -f" "Info"
    } else {
        throw "Deployment failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Log "❌ Деплой завершился с ошибкой: $_" "Error"
    exit 1
}
