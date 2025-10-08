#!/bin/bash

# Скрипт для обновления только файлов дизайна на сервере
# Безопасно обновляет только frontend файлы, не затрагивая backend

echo "🚀 Начинаем обновление файлов дизайна на сервере..."

# Подключаемся к серверу и обновляем только frontend файлы
ssh root@46.62.208.132 << 'EOF'

echo "📁 Переходим в директорию проекта..."
cd /var/www/paul

echo "🔄 Получаем последние изменения из git..."
git fetch origin

echo "📋 Проверяем статус git..."
git status

echo "🎨 Обновляем только файлы дизайна..."

# Обновляем CSS модули страниц продуктов
echo "📝 Обновляем CSS модули страниц продуктов..."
git checkout origin/master -- frontend/src/app/cakes/CakesPage.module.css
git checkout origin/master -- frontend/src/app/viennoiserie/ViennoiseriePage.module.css
git checkout origin/master -- frontend/src/app/patisserie/PatisseriePage.module.css
git checkout origin/master -- frontend/src/app/platters/PlattersPage.module.css
git checkout origin/master -- frontend/src/app/bread/BreadPage.module.css
git checkout origin/master -- frontend/src/app/macarons/MacaronsPage.module.css

# Обновляем React компоненты страниц продуктов
echo "⚛️ Обновляем React компоненты страниц продуктов..."
git checkout origin/master -- frontend/src/app/cakes/page.tsx
git checkout origin/master -- frontend/src/app/viennoiserie/page.tsx
git checkout origin/master -- frontend/src/app/patisserie/page.tsx
git checkout origin/master -- frontend/src/app/platters/page.tsx
git checkout origin/master -- frontend/src/app/bread/page.tsx
git checkout origin/master -- frontend/src/app/macarons/page.tsx

# Обновляем Footer компонент
echo "🦶 Обновляем Footer компонент..."
git checkout origin/master -- frontend/src/components/Footer.css
git checkout origin/master -- frontend/src/components/Footer.tsx

# Обновляем ArtOfBread компонент
echo "🍞 Обновляем ArtOfBread компонент..."
git checkout origin/master -- frontend/src/components/ArtOfBread.css

echo "✅ Файлы дизайна обновлены!"

echo "🔄 Перезапускаем Next.js сервер..."
cd frontend
pkill -f "next"
nohup npm run start > /dev/null 2>&1 &

echo "⏳ Ждем запуска сервера..."
sleep 5

echo "🔍 Проверяем статус сервера..."
ps aux | grep next

echo "🌐 Проверяем доступность сайта..."
curl -I http://localhost:3000

echo "✅ Обновление завершено!"

EOF

echo "🎉 Обновление файлов дизайна на сервере завершено!"
