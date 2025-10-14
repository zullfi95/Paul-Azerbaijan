# Используем официальный PHP образ с Apache
FROM php:8.2-apache

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    && docker-php-ext-install pdo_mysql pdo_sqlite mbstring exif pcntl bcmath gd

# Включаем mod_rewrite для Apache
RUN a2enmod rewrite

# Устанавливаем Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Устанавливаем рабочую директорию
WORKDIR /var/www/html

# Копируем composer файлы
COPY composer.json composer.lock ./

# Устанавливаем PHP зависимости
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Копируем остальные файлы приложения
COPY . .

# Устанавливаем права доступа
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Копируем конфигурацию Apache
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf

# Генерируем ключ приложения и настраиваем Laravel
RUN php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Создаем базу данных SQLite если её нет
RUN touch database/database.sqlite

# Выполняем миграции
RUN php artisan migrate --force

# Открываем порт 80
EXPOSE 80

# Запускаем Apache
CMD ["apache2-foreground"]
