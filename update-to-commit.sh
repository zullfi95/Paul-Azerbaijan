#!/bin/bash

# Script to update to specific commit d961a9b
echo "🔄 Updating to commit d961a9b..."

# Navigate to project directory
cd /var/www/paul

# Check if archive exists
if [ -f "d961a9b048205f2468551831e901a6fc78fb49a5.zip" ]; then
    echo "📦 Archive found, extracting..."
    
    # Create backup of current state
    echo "💾 Creating backup..."
    cp -r . ../paul-backup-$(date +%Y%m%d-%H%M%S)
    
    # Extract archive
    unzip -o d961a9b048205f2468551831e901a6fc78fb49a5.zip
    
    # Move files from extracted directory
    if [ -d "Paul-Azerbaijan-d961a9b048205f2468551831e901a6fc78fb49a5" ]; then
        echo "📁 Moving files from extracted directory..."
        cp -r Paul-Azerbaijan-d961a9b048205f2468551831e901a6fc78fb49a5/* .
        cp -r Paul-Azerbaijan-d961a9b048205f2468551831e901a6fc78fb49a5/.* . 2>/dev/null || true
        rm -rf Paul-Azerbaijan-d961a9b048205f2468551831e901a6fc78fb49a5
    fi
    
    # Clean up
    rm -f d961a9b048205f2468551831e901a6fc78fb49a5.zip
    
    echo "✅ Successfully updated to commit d961a9b!"
    
    # Update backend
    echo "🔧 Updating backend..."
    cd backend
    composer install --no-dev --optimize-autoloader
    php artisan config:clear
    php artisan cache:clear
    php artisan migrate --force
    php artisan config:cache
    php artisan route:cache
    
    # Update frontend
    echo "📦 Updating frontend..."
    cd ../frontend
    npm ci --production
    npm run build
    
    # Restart services
    echo "🔄 Restarting services..."
    systemctl restart nginx
    systemctl restart php8.3-fpm
    
    echo "✅ Update completed successfully!"
    
else
    echo "❌ Archive not found. Please download it first."
    exit 1
fi
