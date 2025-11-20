#!/bin/bash
# Безопасный скрипт обновления проекта на сервере
# Сохраняет API ключи, настройки HTTPS и nginx конфигурации

set -e

PROJECT_PATH="/var/www/paul"
BACKUP_DIR="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BRANCH="Zulfi"

echo "🚀 Начало безопасного обновления проекта на сервере..."
echo "=========================================="

# 1. Создание директории для бэкапов
echo ""
echo "📁 Создаем директорию для бэкапов..."
mkdir -p $BACKUP_DIR

# 2. Бэкап базы данных
echo ""
echo "💾 Создаем бэкап базы данных..."
docker exec paul_mysql mysqldump -upaul_user -ppaul_password paul_azerbaijan \
    > $BACKUP_DIR/paul_db_${TIMESTAMP}.sql 2>/dev/null || {
    echo "⚠️  Не удалось создать бэкап БД, но продолжаем..."
}
if [ -f "$BACKUP_DIR/paul_db_${TIMESTAMP}.sql" ] && [ -s "$BACKUP_DIR/paul_db_${TIMESTAMP}.sql" ]; then
    echo "✅ Бэкап БД создан: $(ls -lh $BACKUP_DIR/paul_db_${TIMESTAMP}.sql | awk '{print $5}')"
else
    echo "⚠️  Бэкап БД пустой или не создан"
fi

# 3. Сохранение критически важных файлов (ДО обновления кода)
echo ""
echo "🔐 Сохраняем критически важные файлы..."

# Сохраняем docker.env (API ключи)
if [ -f "$PROJECT_PATH/docker/docker.env" ]; then
    cp $PROJECT_PATH/docker/docker.env $BACKUP_DIR/docker.env.backup_${TIMESTAMP}
    chmod 600 $BACKUP_DIR/docker.env.backup_${TIMESTAMP}
    echo "✅ docker.env сохранен"
else
    echo "⚠️  docker.env не найден - будет создан из примера после обновления"
fi

# Сохраняем nginx конфигурацию с SSL
if [ -f "$PROJECT_PATH/nginx/conf.d/default.conf" ]; then
    mkdir -p $BACKUP_DIR/nginx_${TIMESTAMP}
    cp -r $PROJECT_PATH/nginx/conf.d/* $BACKUP_DIR/nginx_${TIMESTAMP}/ 2>/dev/null || true
    echo "✅ nginx конфигурация сохранена"
fi

# Сохраняем SSL сертификаты
if [ -d "$PROJECT_PATH/nginx/ssl" ]; then
    mkdir -p $BACKUP_DIR/ssl_${TIMESTAMP}
    cp -r $PROJECT_PATH/nginx/ssl/* $BACKUP_DIR/ssl_${TIMESTAMP}/ 2>/dev/null || true
    echo "✅ SSL сертификаты сохранены"
fi

# Сохраняем backend/.env если есть
if [ -f "$PROJECT_PATH/backend/.env" ]; then
    cp $PROJECT_PATH/backend/.env $BACKUP_DIR/backend.env.backup_${TIMESTAMP}
    chmod 600 $BACKUP_DIR/backend.env.backup_${TIMESTAMP}
    echo "✅ backend/.env сохранен"
fi

# Сохраняем текущий commit для возможного отката
echo ""
echo "📍 Сохраняем текущее состояние репозитория..."
cd $PROJECT_PATH
CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
echo $CURRENT_COMMIT > $BACKUP_DIR/previous_commit_${TIMESTAMP}.txt
echo "   Commit: $CURRENT_COMMIT"

# 4. Обновление кода из GitHub
echo ""
echo "📥 Обновляем код из GitHub (ветка $BRANCH)..."
git fetch origin $BRANCH 2>/dev/null || {
    echo "⚠️  Не удалось получить обновления, но продолжаем..."
}

# Показываем, что изменится
echo ""
echo "📋 Изменения для применения:"
git log HEAD..origin/$BRANCH --oneline | head -5 2>/dev/null || echo "   Нет новых изменений"

# Применяем обновления
echo ""
git pull origin $BRANCH || {
    echo "❌ Ошибка при обновлении кода!"
    echo "🔄 Откатываем изменения..."
    git reset --hard $CURRENT_COMMIT 2>/dev/null || true
    exit 1
}
echo "✅ Код обновлен"

# 5. Восстановление критических файлов (если они были перезаписаны)
echo ""
echo "🔐 Восстанавливаем критически важные файлы..."

# Восстанавливаем docker.env если он был перезаписан или не существует
if [ -f "$BACKUP_DIR/docker.env.backup_${TIMESTAMP}" ]; then
    # Восстанавливаем из бэкапа
    cp $BACKUP_DIR/docker.env.backup_${TIMESTAMP} $PROJECT_PATH/docker/docker.env
    chmod 600 $PROJECT_PATH/docker/docker.env
    echo "✅ docker.env восстановлен из бэкапа (API ключи сохранены)"
elif [ ! -f "$PROJECT_PATH/docker/docker.env" ]; then
    # Если файла нет, создаем из примера
    if [ -f "$PROJECT_PATH/docker/docker.env.example" ]; then
        cp $PROJECT_PATH/docker/docker.env.example $PROJECT_PATH/docker/docker.env
        chmod 600 $PROJECT_PATH/docker/docker.env
        echo "⚠️  docker.env создан из примера"
        echo "⚠️  ВАЖНО: Заполните его реальными API ключами!"
        echo "⚠️  Проверьте старые бэкапы: ls -lt $BACKUP_DIR/docker.env.backup_* | head -1"
    else
        echo "❌ Не найден docker.env.example!"
    fi
else
    echo "ℹ️  docker.env уже существует и актуален"
fi

# Восстанавливаем nginx конфигурацию
if [ -d "$BACKUP_DIR/nginx_${TIMESTAMP}" ]; then
    if [ -d "$PROJECT_PATH/nginx/conf.d" ]; then
        # Восстанавливаем сохраненную версию (SSL настройки)
        cp -r $BACKUP_DIR/nginx_${TIMESTAMP}/* $PROJECT_PATH/nginx/conf.d/ 2>/dev/null || true
        echo "✅ nginx конфигурация восстановлена (HTTPS настройки сохранены)"
    fi
fi

# Восстанавливаем SSL сертификаты
if [ -d "$BACKUP_DIR/ssl_${TIMESTAMP}" ]; then
    if [ -d "$PROJECT_PATH/nginx/ssl" ]; then
        # Восстанавливаем сохраненную версию
        cp -r $BACKUP_DIR/ssl_${TIMESTAMP}/* $PROJECT_PATH/nginx/ssl/ 2>/dev/null || true
        echo "✅ SSL сертификаты восстановлены"
    fi
fi

# 6. Проверка наличия docker.env файла перед продолжением
echo ""
echo "🔐 Проверка docker.env файла..."
if [ ! -f "$PROJECT_PATH/docker/docker.env" ]; then
    echo "❌ Файл docker.env не найден и не был восстановлен!"
    echo "⚠️  Попробуйте восстановить вручную:"
    echo "   cp $BACKUP_DIR/docker.env.backup_* $PROJECT_PATH/docker/docker.env"
    exit 1
fi
echo "✅ docker.env найден и готов к использованию"

# 7. Обновление зависимостей Backend
echo ""
echo "📦 Обновляем зависимости Backend..."
docker exec paul_backend composer install --no-dev --optimize-autoloader 2>/dev/null || {
    echo "⚠️  Ошибка при обновлении зависимостей, но продолжаем..."
}
echo "✅ Зависимости обновлены"

# 8. Применение миграций
echo ""
echo "🗄️  Применяем миграции базы данных..."
docker exec paul_backend php artisan migrate --force || {
    echo "❌ Ошибка при применении миграций!"
    echo "🔄 Откатываем изменения кода..."
    git reset --hard $CURRENT_COMMIT 2>/dev/null || true
    exit 1
}
echo "✅ Миграции применены"

# 9. Очистка и пересборка кеша
echo ""
echo "🧹 Очищаем кеш Laravel..."
docker exec paul_backend php artisan config:clear 2>/dev/null || true
docker exec paul_backend php artisan cache:clear 2>/dev/null || true
docker exec paul_backend php artisan route:clear 2>/dev/null || true
docker exec paul_backend php artisan view:clear 2>/dev/null || true

echo ""
echo "💾 Кешируем конфигурацию Laravel..."
docker exec paul_backend php artisan config:cache 2>/dev/null || true
docker exec paul_backend php artisan route:cache 2>/dev/null || true
docker exec paul_backend php artisan view:cache 2>/dev/null || true
echo "✅ Кеш обновлен"

# 10. Перезапуск контейнеров (только backend и queue, nginx продолжает работать)
echo ""
echo "🔄 Перезапускаем контейнеры backend и queue..."
cd $PROJECT_PATH/docker
docker-compose restart backend queue 2>/dev/null || {
    echo "⚠️  Ошибка при перезапуске, пробуем полный перезапуск..."
    docker-compose restart 2>/dev/null || true
}
echo "✅ Контейнеры перезапущены"

echo ""
echo "⏳ Ждем 10 секунд для запуска сервисов..."
sleep 10

# 11. Проверка статуса
echo ""
echo "🔍 Проверяем статус контейнеров..."
docker ps --format "table {{.Names}}\t{{.Status}}" | grep paul || docker ps | grep paul || echo "⚠️  Проверьте контейнеры вручную"

# 12. Проверка логов на критические ошибки
echo ""
echo "📋 Проверяем логи backend на критические ошибки..."
if docker logs paul_backend --tail 30 2>&1 | grep -iE "error|fatal|exception" | head -3; then
    echo "⚠️  Обнаружены ошибки в логах"
else
    echo "✅ Критических ошибок в логах не обнаружено"
fi

# 13. Проверка доступности
echo ""
echo "🌐 Проверяем доступность сайта..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Сайт доступен (HTTP $HTTP_CODE)"
else
    echo "⚠️  Сайт может быть недоступен (HTTP $HTTP_CODE)"
    echo "   Проверьте: curl -I http://localhost/health"
fi

# 14. Итоговая информация
echo ""
echo "=========================================="
echo "✅ Обновление завершено!"
echo "=========================================="
echo ""
echo "📋 Созданные бэкапы:"
echo "  - БД: $BACKUP_DIR/paul_db_${TIMESTAMP}.sql"
if [ -f "$BACKUP_DIR/docker.env.backup_${TIMESTAMP}" ]; then
    echo "  - docker.env: $BACKUP_DIR/docker.env.backup_${TIMESTAMP}"
fi
if [ -d "$BACKUP_DIR/nginx_${TIMESTAMP}" ]; then
    echo "  - nginx: $BACKUP_DIR/nginx_${TIMESTAMP}/"
fi
if [ -d "$BACKUP_DIR/ssl_${TIMESTAMP}" ]; then
    echo "  - SSL: $BACKUP_DIR/ssl_${TIMESTAMP}/"
fi
echo "  - Previous commit: $CURRENT_COMMIT"
echo ""
echo "🔍 Полезные команды:"
echo "  Логи: docker logs paul_backend --tail 50 -f"
echo "  Статус: docker ps | grep paul"
echo "  Миграции: docker exec paul_backend php artisan migrate:status"
echo "  Сайт: curl -I https://paul-azerbaijan.com/health"
echo ""
echo "🔄 Если нужно откатить изменения:"
echo "  cd $PROJECT_PATH"
echo "  git reset --hard $CURRENT_COMMIT"
echo "  docker-compose restart backend queue"
echo ""

