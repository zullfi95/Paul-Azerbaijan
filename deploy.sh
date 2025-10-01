#!/bin/bash

# PAUL Azerbaijan Deployment Script
# This script updates the application on the server

echo "🚀 Starting PAUL Azerbaijan deployment..."

# Navigate to project directory
cd /var/www/paul-azerbaijan || {
    echo "❌ Project directory not found. Creating it..."
    mkdir -p /var/www/paul-azerbaijan
    cd /var/www/paul-azerbaijan
    git clone https://github.com/zullfi95/Paul-Azerbaijan.git .
}

echo "📥 Pulling latest changes from GitHub..."
git pull origin master

echo "🔧 Updating backend dependencies..."
cd backend
composer install --no-dev --optimize-autoloader

echo "🗄️ Running database migrations..."
php artisan migrate --force

echo "🔑 Clearing and caching configuration..."
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "📦 Updating frontend dependencies..."
cd ../frontend
npm ci --production

echo "🏗️ Building frontend for production..."
npm run build

echo "🔄 Restarting services..."
# Restart PHP-FPM
systemctl restart php8.2-fpm

# Restart Nginx
systemctl restart nginx

# Restart PM2 processes (if using PM2)
pm2 restart all 2>/dev/null || echo "PM2 not running, skipping..."

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be available at: http://46.62.208.132"

# Show status
echo "📊 Service Status:"
systemctl status nginx --no-pager -l
systemctl status php8.2-fpm --no-pager -l
