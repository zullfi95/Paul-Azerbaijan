#!/bin/bash

# Quick Update Script for PAUL Azerbaijan
echo "🔄 Quick update starting..."

# Update code
cd /var/www/paul
git pull origin master

# Update backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan config:clear
php artisan cache:clear
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Update frontend
cd ../frontend
npm ci --production
npm run build

# Restart services
systemctl restart nginx
systemctl restart php8.3-fpm

echo "✅ Quick update completed!"
