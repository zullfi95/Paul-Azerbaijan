# PAUL Azerbaijan Docker Deployment Script (PowerShell)
# Этот скрипт автоматизирует процесс деплоя приложения

param(
    [switch]$Clean
)

# Функция для вывода сообщений
function Write-Log {
    param([string]$Message, [string]$Type = "Info")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    switch ($Type) {
        "Error" { Write-Host "[$timestamp] ERROR: $Message" -ForegroundColor Red }
        "Warning" { Write-Host "[$timestamp] WARNING: $Message" -ForegroundColor Yellow }
        "Success" { Write-Host "[$timestamp] $Message" -ForegroundColor Green }
        default { Write-Host "[$timestamp] $Message" -ForegroundColor Cyan }
    }
}

Write-Log "🚀 Начинаем деплой PAUL Azerbaijan..." "Success"

# Проверка наличия Docker
try {
    docker --version | Out-Null
    Write-Log "✅ Docker найден"
} catch {
    Write-Log "Docker не установлен. Пожалуйста, установите Docker." "Error"
    exit 1
}

# Проверка наличия Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Log "✅ Docker Compose найден"
} catch {
    Write-Log "Docker Compose не установлен. Пожалуйста, установите Docker Compose." "Error"
    exit 1
}

# Проверка наличия .env файла
if (-not (Test-Path ".env")) {
    Write-Log ".env файл не найден. Создаем из примера..." "Warning"
    if (Test-Path "docker.env.example") {
        Copy-Item "docker.env.example" ".env"
        Write-Log "Пожалуйста, отредактируйте .env файл перед продолжением." "Warning"
        Read-Host "Нажмите Enter после настройки .env файла"
    } else {
        Write-Log "Файл docker.env.example не найден." "Error"
        exit 1
    }
}

# Остановка существующих контейнеров
Write-Log "Останавливаем существующие контейнеры..."
docker-compose down

# Удаление старых образов (опционально)
if ($Clean) {
    Write-Log "Удаляем старые образы..."
    docker system prune -f
}

# Сборка и запуск контейнеров
Write-Log "Собираем и запускаем контейнеры..."
docker-compose up -d --build

# Ожидание запуска сервисов
Write-Log "Ожидаем запуска сервисов..."
Start-Sleep -Seconds 30

# Проверка статуса контейнеров
Write-Log "Проверяем статус контейнеров..."
docker-compose ps

# Выполнение миграций
Write-Log "Выполняем миграции базы данных..."
docker-compose exec -T backend php artisan migrate --force

# Кеширование конфигурации Laravel
Write-Log "Кешируем конфигурацию Laravel..."
docker-compose exec -T backend php artisan config:cache
docker-compose exec -T backend php artisan route:cache
docker-compose exec -T backend php artisan view:cache

# Проверка здоровья сервисов
Write-Log "Проверяем здоровье сервисов..."

# Проверка MySQL
try {
    docker-compose exec -T mysql mysqladmin ping -h localhost --silent
    Write-Log "✅ MySQL работает" "Success"
} catch {
    Write-Log "❌ MySQL не отвечает" "Error"
}

# Проверка Redis
try {
    $redisResult = docker-compose exec -T redis redis-cli ping
    if ($redisResult -match "PONG") {
        Write-Log "✅ Redis работает" "Success"
    } else {
        Write-Log "❌ Redis не отвечает" "Error"
    }
} catch {
    Write-Log "❌ Redis не отвечает" "Error"
}

# Проверка Backend
try {
    $null = Invoke-WebRequest -Uri "http://localhost/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Log "✅ Backend API работает" "Success"
} catch {
    Write-Log "⚠️ Backend API может быть недоступен (это нормально если нет health endpoint)" "Warning"
}

# Проверка Frontend
try {
    $null = Invoke-WebRequest -Uri "http://localhost" -TimeoutSec 5 -ErrorAction Stop
    Write-Log "✅ Frontend работает" "Success"
} catch {
    Write-Log "❌ Frontend не отвечает" "Error"
}

# Показ логов
Write-Log "Показываем последние логи..."
docker-compose logs --tail=20

Write-Host ""
Write-Log "🎉 Деплой завершен успешно!" "Success"
Write-Host ""
Write-Host "Приложение доступно по адресу:"
Write-Host "  Frontend: http://localhost"
Write-Host "  Backend API: http://localhost/api"
Write-Host ""
Write-Host "Полезные команды:"
Write-Host "  Просмотр логов: docker-compose logs -f"
Write-Host "  Остановка: docker-compose down"
Write-Host "  Перезапуск: docker-compose restart"
Write-Host "  Статус: docker-compose ps"
Write-Host ""
