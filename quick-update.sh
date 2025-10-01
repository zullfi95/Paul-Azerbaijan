#!/bin/bash

# Quick Update Script for PAUL Azerbaijan
echo "🔄 Quick update starting..."

# Update code
cd /var/www/paul-azerbaijan
git pull origin master

# Update backend
cd backend
composer install --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Update frontend
cd ../frontend
npm ci
npm run build

# Restart services
systemctl restart nginx
systemctl restart php8.2-fpm

echo "✅ Quick update completed!"
