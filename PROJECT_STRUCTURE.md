# Paul Project Structure

## Корневая директория

```
Paul/
├── backend/           # Laravel backend приложение
├── frontend/          # Next.js frontend приложение  
├── nginx/             # Nginx конфигурация
├── docs/              # Документация
├── docker/            # Docker конфигурация
│   ├── docker-compose.yml
│   └── docker.env.example
├── scripts/           # Скрипты развертывания
│   ├── deploy-docker.ps1
│   ├── deploy-docker.sh
│   ├── deploy-remote.ps1
│   ├── deploy-remote.sh
│   └── quick-deploy.sh
├── README.md          # Основная документация
├── DOCKER_DEPLOYMENT.md # Docker deployment guide
└── PROJECT_STRUCTURE.md # Этот файл
```

## Описание папок

### `/docker/`
- `docker-compose.yml` - Docker Compose конфигурация для всех сервисов
- `docker.env.example` - Пример переменных окружения для Docker

### `/scripts/`
- `deploy-docker.ps1` - PowerShell скрипт для развертывания Docker
- `deploy-docker.sh` - Bash скрипт для развертывания Docker
- `deploy-remote.ps1` - PowerShell скрипт для удаленного развертывания
- `deploy-remote.sh` - Bash скрипт для удаленного развертывания
- `quick-deploy.sh` - Быстрый скрипт развертывания

### `/backend/`
Laravel приложение с API для управления заявками и заказами

### `/frontend/`
Next.js приложение с React компонентами

### `/nginx/`
Конфигурация Nginx для проксирования запросов

### `/docs/`
Документация по интеграциям и API
