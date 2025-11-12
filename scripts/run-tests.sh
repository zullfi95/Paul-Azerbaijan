#!/bin/bash

# 🧪 Скрипт для запуска всех тестов системы PAUL Catering

echo "🚀 Запуск комплексного тестирования системы PAUL Catering"
echo "=================================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода статуса
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Функция для вывода заголовка
print_header() {
    echo -e "\n${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Переходим в директорию backend
cd backend

# Проверяем, что мы в правильной директории
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Ошибка: Не найден файл artisan. Убедитесь, что вы находитесь в корневой директории проекта.${NC}"
    exit 1
fi

print_header "1. Подготовка к тестированию"

# Устанавливаем зависимости
echo "📦 Установка зависимостей..."
composer install --no-interaction --prefer-dist --optimize-autoloader
print_status $? "Установка зависимостей"

# Очищаем кэш
echo "🧹 Очистка кэша..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
print_status $? "Очистка кэша"

# Создаем тестовую базу данных
echo "🗄️ Настройка тестовой базы данных..."
php artisan migrate:fresh --env=testing
print_status $? "Настройка тестовой базы данных"

print_header "2. Запуск базовых тестов"

# Запускаем существующие тесты
echo "🧪 Запуск существующих тестов..."
php artisan test --testsuite=Feature
print_status $? "Существующие тесты"

print_header "3. Запуск новых комплексных тестов"

# Запускаем комплексные тесты
echo "🔬 Запуск ComprehensiveSystemTest..."
php artisan test tests/Feature/ComprehensiveSystemTest.php --verbose
print_status $? "ComprehensiveSystemTest"

echo "🔬 Запуск AdvancedSystemTest..."
php artisan test tests/Feature/AdvancedSystemTest.php --verbose
print_status $? "AdvancedSystemTest"

print_header "4. Запуск тестов производительности"

echo "⚡ Запуск PerformanceTest..."
php artisan test tests/Feature/PerformanceTest.php --verbose
print_status $? "PerformanceTest"

print_header "5. Запуск тестов безопасности"

echo "🔒 Запуск SecurityTest..."
php artisan test tests/Feature/SecurityTest.php --verbose
print_status $? "SecurityTest"

print_header "6. Запуск всех тестов с покрытием"

echo "📊 Запуск всех тестов с анализом покрытия..."
php artisan test --coverage --min=80
print_status $? "Тесты с покрытием"

print_header "7. Проверка качества кода"

# Проверяем синтаксис PHP
echo "🔍 Проверка синтаксиса PHP..."
find app -name "*.php" -exec php -l {} \;
print_status $? "Проверка синтаксиса PHP"

# Проверяем стандарты кодирования (если установлен PHP CS Fixer)
if command -v php-cs-fixer &> /dev/null; then
    echo "🎨 Проверка стандартов кодирования..."
    php-cs-fixer fix --dry-run --diff
    print_status $? "Проверка стандартов кодирования"
fi

print_header "8. Генерация отчета о тестировании"

# Создаем директорию для отчетов
mkdir -p storage/app/testing-reports

# Генерируем отчет о тестах
echo "📄 Генерация отчета о тестах..."
php artisan test --log-junit=storage/app/testing-reports/junit.xml
print_status $? "Генерация отчета JUnit"

# Генерируем отчет о покрытии
echo "📊 Генерация отчета о покрытии..."
php artisan test --coverage-html=storage/app/testing-reports/coverage
print_status $? "Генерация отчета о покрытии"

print_header "9. Финальная проверка"

# Проверяем, что все основные файлы существуют
echo "🔍 Проверка основных файлов..."

files_to_check=(
    "app/Http/Controllers/Api/BaseApiController.php"
    "app/Http/Requests/CreateOrderRequest.php"
    "app/Http/Requests/CreateApplicationRequest.php"
    "app/Http/Requests/CreateClientRequest.php"
    "app/Policies/OrderPolicy.php"
    "app/Policies/ApplicationPolicy.php"
    "app/Policies/UserPolicy.php"
    "app/Http/Controllers/Concerns/HandlesJsonData.php"
    "app/Http/Controllers/Concerns/HandlesOrderCalculations.php"
    "app/Http/Controllers/Concerns/HandlesValidation.php"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file${NC}"
    fi
done

print_header "10. Результаты тестирования"

# Подсчитываем количество тестов
total_tests=$(php artisan test --testsuite=Feature | grep -c "PASS\|FAIL")
passed_tests=$(php artisan test --testsuite=Feature | grep -c "PASS")
failed_tests=$(php artisan test --testsuite=Feature | grep -c "FAIL")

echo "📊 Статистика тестов:"
echo "   Всего тестов: $total_tests"
echo "   Пройдено: $passed_tests"
echo "   Провалено: $failed_tests"

if [ $failed_tests -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Все тесты пройдены успешно!${NC}"
    echo -e "${GREEN}✅ Система готова к продакшену!${NC}"
else
    echo -e "\n${RED}⚠️ Обнаружены проблемы в тестах!${NC}"
    echo -e "${YELLOW}🔧 Необходимо исправить ошибки перед деплоем.${NC}"
fi

echo -e "\n${BLUE}📁 Отчеты сохранены в: storage/app/testing-reports/${NC}"
echo -e "${BLUE}🌐 Отчет о покрытии: storage/app/testing-reports/coverage/index.html${NC}"

echo -e "\n${GREEN}🏁 Тестирование завершено!${NC}"
echo "=================================================="
