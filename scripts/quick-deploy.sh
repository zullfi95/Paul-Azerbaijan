#!/bin/bash

# Быстрый деплой на сервер 46.62.152.225
# Использование: ./quick-deploy.sh

echo "🚀 Быстрый деплой PAUL Azerbaijan на сервер 46.62.152.225..."

# Проверяем SSH ключи
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
    echo "❌ SSH ключи не найдены. Создайте их командой:"
    echo "ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo "ssh-copy-id root@46.62.152.225"
    exit 1
fi

# Запускаем деплой
./deploy-remote.sh

echo "✅ Деплой завершен!"
echo "🌐 Откройте в браузере: http://46.62.152.225"
