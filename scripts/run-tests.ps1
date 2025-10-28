# 🧪 Скрипт для запуска всех тестов системы PAUL Catering (PowerShell)

Write-Host "🚀 Запуск комплексного тестирования системы PAUL Catering" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

# Функция для вывода статуса
function Write-Status {
    param(
        [bool]$Success,
        [string]$Message
    )
    
    if ($Success) {
        Write-Host "✅ $Message" -ForegroundColor Green
    } else {
        Write-Host "❌ $Message" -ForegroundColor Red
    }
}

# Функция для вывода заголовка
function Write-Header {
    param([string]$Title)
    
    Write-Host "`n📋 $Title" -ForegroundColor Cyan
    Write-Host "----------------------------------------" -ForegroundColor Cyan
}

# Переходим в директорию backend
Set-Location backend

# Проверяем, что мы в правильной директории
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Ошибка: Не найден файл artisan. Убедитесь, что вы находитесь в корневой директории проекта." -ForegroundColor Red
    exit 1
}

Write-Header "1. Подготовка к тестированию"

# Устанавливаем зависимости
Write-Host "📦 Установка зависимостей..."
try {
    composer install --no-interaction --prefer-dist --optimize-autoloader
    Write-Status $true "Установка зависимостей"
} catch {
    Write-Status $false "Установка зависимостей"
}

# Очищаем кэш
Write-Host "🧹 Очистка кэша..."
try {
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    Write-Status $true "Очистка кэша"
} catch {
    Write-Status $false "Очистка кэша"
}

# Создаем тестовую базу данных
Write-Host "🗄️ Настройка тестовой базы данных..."
try {
    php artisan migrate:fresh --env=testing
    Write-Status $true "Настройка тестовой базы данных"
} catch {
    Write-Status $false "Настройка тестовой базы данных"
}

Write-Header "2. Запуск базовых тестов"

# Запускаем существующие тесты
Write-Host "🧪 Запуск существующих тестов..."
try {
    php artisan test --testsuite=Feature
    Write-Status $true "Существующие тесты"
} catch {
    Write-Status $false "Существующие тесты"
}

Write-Header "3. Запуск новых комплексных тестов"

# Запускаем комплексные тесты
Write-Host "🔬 Запуск ComprehensiveSystemTest..."
try {
    php artisan test tests/Feature/ComprehensiveSystemTest.php --verbose
    Write-Status $true "ComprehensiveSystemTest"
} catch {
    Write-Status $false "ComprehensiveSystemTest"
}

Write-Host "🔬 Запуск AdvancedSystemTest..."
try {
    php artisan test tests/Feature/AdvancedSystemTest.php --verbose
    Write-Status $true "AdvancedSystemTest"
} catch {
    Write-Status $false "AdvancedSystemTest"
}

Write-Header "4. Запуск тестов производительности"

Write-Host "⚡ Запуск PerformanceTest..."
try {
    php artisan test tests/Feature/PerformanceTest.php --verbose
    Write-Status $true "PerformanceTest"
} catch {
    Write-Status $false "PerformanceTest"
}

Write-Header "5. Запуск тестов безопасности"

Write-Host "🔒 Запуск SecurityTest..."
try {
    php artisan test tests/Feature/SecurityTest.php --verbose
    Write-Status $true "SecurityTest"
} catch {
    Write-Status $false "SecurityTest"
}

Write-Header "6. Запуск всех тестов с покрытием"

Write-Host "📊 Запуск всех тестов с анализом покрытия..."
try {
    php artisan test --coverage --min=80
    Write-Status $true "Тесты с покрытием"
} catch {
    Write-Status $false "Тесты с покрытием"
}

Write-Header "7. Проверка качества кода"

# Проверяем синтаксис PHP
Write-Host "🔍 Проверка синтаксиса PHP..."
try {
    Get-ChildItem -Path app -Recurse -Filter "*.php" | ForEach-Object {
        php -l $_.FullName
    }
    Write-Status $true "Проверка синтаксиса PHP"
} catch {
    Write-Status $false "Проверка синтаксиса PHP"
}

Write-Header "8. Генерация отчета о тестировании"

# Создаем директорию для отчетов
if (-not (Test-Path "storage/app/testing-reports")) {
    New-Item -ItemType Directory -Path "storage/app/testing-reports" -Force
}

# Генерируем отчет о тестах
Write-Host "📄 Генерация отчета о тестах..."
try {
    php artisan test --log-junit=storage/app/testing-reports/junit.xml
    Write-Status $true "Генерация отчета JUnit"
} catch {
    Write-Status $false "Генерация отчета JUnit"
}

# Генерируем отчет о покрытии
Write-Host "📊 Генерация отчета о покрытии..."
try {
    php artisan test --coverage-html=storage/app/testing-reports/coverage
    Write-Status $true "Генерация отчета о покрытии"
} catch {
    Write-Status $false "Генерация отчета о покрытии"
}

Write-Header "9. Финальная проверка"

# Проверяем, что все основные файлы существуют
Write-Host "🔍 Проверка основных файлов..."

$filesToCheck = @(
    "app/Http/Controllers/Api/BaseApiController.php",
    "app/Http/Requests/CreateOrderRequest.php",
    "app/Http/Requests/CreateApplicationRequest.php",
    "app/Http/Requests/CreateClientRequest.php",
    "app/Policies/OrderPolicy.php",
    "app/Policies/ApplicationPolicy.php",
    "app/Policies/UserPolicy.php",
    "app/Http/Controllers/Concerns/HandlesJsonData.php",
    "app/Http/Controllers/Concerns/HandlesOrderCalculations.php",
    "app/Http/Controllers/Concerns/HandlesValidation.php"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
    }
}

Write-Header "10. Результаты тестирования"

# Подсчитываем количество тестов
try {
    $testOutput = php artisan test --testsuite=Feature
    $totalTests = ($testOutput | Select-String "PASS|FAIL").Count
    $passedTests = ($testOutput | Select-String "PASS").Count
    $failedTests = ($testOutput | Select-String "FAIL").Count
    
    Write-Host "📊 Статистика тестов:" -ForegroundColor Yellow
    Write-Host "   Всего тестов: $totalTests" -ForegroundColor White
    Write-Host "   Пройдено: $passedTests" -ForegroundColor Green
    Write-Host "   Провалено: $failedTests" -ForegroundColor Red
    
    if ($failedTests -eq 0) {
        Write-Host "`n🎉 Все тесты пройдены успешно!" -ForegroundColor Green
        Write-Host "✅ Система готова к продакшену!" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Обнаружены проблемы в тестах!" -ForegroundColor Red
        Write-Host "🔧 Необходимо исправить ошибки перед деплоем." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Ошибка при подсчете результатов тестов" -ForegroundColor Red
}

Write-Host "`n📁 Отчеты сохранены в: storage/app/testing-reports/" -ForegroundColor Cyan
Write-Host "🌐 Отчет о покрытии: storage/app/testing-reports/coverage/index.html" -ForegroundColor Cyan

Write-Host "`n🏁 Тестирование завершено!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Blue
