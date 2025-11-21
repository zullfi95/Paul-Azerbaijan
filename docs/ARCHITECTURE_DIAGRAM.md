# 🏗️ Архитектурные диаграммы проекта PAUL Azerbaijan

## Общая архитектура системы

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "Reverse Proxy"
        Nginx[Nginx<br/>Port 80/443]
    end
    
    subgraph "Application Layer"
        Frontend[Next.js Frontend<br/>Port 3000]
        Backend[Laravel Backend<br/>Port 80]
    end
    
    subgraph "Data Layer"
        MySQL[(MySQL 8.0<br/>Port 3306)]
        Redis[(Redis 7<br/>Port 6379)]
    end
    
    subgraph "Background Jobs"
        Queue[Queue Worker<br/>Laravel]
    end
    
    subgraph "External Services"
        Iiko[iiko API]
        Algoritma[Algoritma Payment]
        Brevo[Brevo SMTP]
    end
    
    Browser --> Nginx
    Mobile --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Frontend --> Backend
    Backend --> MySQL
    Backend --> Redis
    Backend --> Queue
    Queue --> Redis
    Backend --> Iiko
    Backend --> Algoritma
    Backend --> Brevo
```

## Поток данных при создании заказа

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Nginx
    participant Backend
    participant MySQL
    participant Redis
    participant Queue
    participant Algoritma
    participant Brevo
    
    Client->>Frontend: Создание заказа
    Frontend->>Nginx: POST /api/orders
    Nginx->>Backend: Proxy request
    Backend->>Backend: Validate & Authorize
    Backend->>MySQL: Save order
    MySQL-->>Backend: Order created
    Backend->>Algoritma: Create payment
    Algoritma-->>Backend: Payment URL
    Backend->>MySQL: Update order with payment
    Backend->>Queue: Send notification
    Queue->>Brevo: Send email
    Backend-->>Nginx: Response
    Nginx-->>Frontend: JSON response
    Frontend-->>Client: Redirect to payment
```

## Система ролей и прав доступа

```mermaid
graph LR
    subgraph "User Types"
        Staff[Staff]
        Client[Client]
    end
    
    subgraph "Staff Roles"
        Coordinator[Coordinator<br/>Full Access]
        Observer[Observer<br/>Read Only]
    end
    
    subgraph "Client Categories"
        Corporate[Corporate<br/>Regular Orders]
        OneTime[One-time<br/>Single Orders]
    end
    
    subgraph "Permissions"
        P1[Manage Orders]
        P2[Manage Applications]
        P3[Manage Users]
        P4[View Statistics]
        P5[View Own Orders]
        P6[Create Orders]
        P7[Kitchen View]
    end
    
    Staff --> Coordinator
    Staff --> Observer
    Client --> Corporate
    Client --> OneTime
    
    Coordinator --> P1
    Coordinator --> P2
    Coordinator --> P3
    Coordinator --> P4
    Coordinator --> P6
    
    Observer --> P7
    
    Client --> P5
    Client --> P6
```

## Структура базы данных (основные таблицы)

```mermaid
erDiagram
    USERS ||--o{ ORDERS : "creates"
    USERS ||--o{ APPLICATIONS : "creates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    ORDERS }o--|| APPLICATIONS : "created_from"
    ORDERS }o--o| USERS : "coordinator"
    ORDERS }o--o| USERS : "client"
    MENU_CATEGORIES ||--o{ MENU_ITEMS : "contains"
    USERS {
        int id PK
        string name
        string email UK
        string user_type
        string staff_role
        string client_category
        string status
    }
    ORDERS {
        int id PK
        int coordinator_id FK
        int client_id FK
        int application_id FK
        json menu_items
        decimal total_amount
        string status
        string payment_status
    }
    APPLICATIONS {
        int id PK
        int coordinator_id FK
        int client_id FK
        date event_date
        string status
    }
    MENU_ITEMS {
        int id PK
        int category_id FK
        string name
        decimal price
        boolean is_available
    }
    MENU_CATEGORIES {
        int id PK
        string name
        int order
    }
    NOTIFICATIONS {
        int id PK
        int user_id FK
        string type
        string title
        text message
        timestamp read_at
    }
```

## Docker Compose архитектура

```mermaid
graph TB
    subgraph "Docker Network: paul_network"
        subgraph "Data Services"
            MySQL[(MySQL Container<br/>paul_mysql)]
            Redis[(Redis Container<br/>paul_redis)]
        end
        
        subgraph "Application Services"
            Backend[Backend Container<br/>paul_backend<br/>Laravel + Apache]
            Frontend[Frontend Container<br/>paul_frontend<br/>Next.js]
            Queue[Queue Container<br/>paul_queue<br/>Laravel Worker]
        end
        
        subgraph "Proxy Service"
            Nginx[Nginx Container<br/>paul_nginx<br/>Reverse Proxy]
        end
    end
    
    subgraph "Volumes"
        MySQLData[(mysql_data)]
        RedisData[(redis_data)]
        BackendStorage[(backend/storage)]
        FrontendSrc[(frontend/src)]
    end
    
    subgraph "External"
        Internet[Internet<br/>Port 80/443]
    end
    
    Internet --> Nginx
    Nginx --> Frontend
    Nginx --> Backend
    Frontend --> Backend
    Backend --> MySQL
    Backend --> Redis
    Queue --> Redis
    Queue --> MySQL
    MySQL --> MySQLData
    Redis --> RedisData
    Backend --> BackendStorage
    Frontend --> FrontendSrc
```

## Поток аутентификации

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Backend
    participant Sanctum
    participant MySQL
    
    Client->>Frontend: Login form
    Frontend->>Backend: POST /api/login
    Backend->>MySQL: Verify credentials
    MySQL-->>Backend: User data
    Backend->>Sanctum: Create token
    Sanctum-->>Backend: Bearer token
    Backend-->>Frontend: Token + User data
    Frontend->>Frontend: Store token in memory
    Frontend-->>Client: Redirect to dashboard
    
    Note over Frontend,Backend: Subsequent requests
    Client->>Frontend: API request
    Frontend->>Backend: Request + Bearer token
    Backend->>Sanctum: Validate token
    Sanctum-->>Backend: User authenticated
    Backend->>Backend: Check permissions
    Backend-->>Frontend: Response
```

## Интеграция с внешними сервисами

```mermaid
graph TB
    subgraph "PAUL Application"
        Backend[Laravel Backend]
        IikoService[IikoService]
        AlgoritmaService[AlgoritmaService]
        NotificationService[NotificationService]
    end
    
    subgraph "iiko Integration"
        IikoAPI[iiko API<br/>api-ru.iiko.services]
        IikoAuth[Access Token<br/>Cached 50min]
    end
    
    subgraph "Algoritma Integration"
        AlgoritmaAPI[Algoritma API<br/>api.testalgoritma.az]
        PaymentFlow[Payment Flow]
    end
    
    subgraph "Email Integration"
        BrevoSMTP[Brevo SMTP<br/>smtp-relay.brevo.com]
        EmailQueue[Email Queue]
    end
    
    Backend --> IikoService
    Backend --> AlgoritmaService
    Backend --> NotificationService
    
    IikoService --> IikoAuth
    IikoAuth --> IikoAPI
    
    AlgoritmaService --> AlgoritmaAPI
    AlgoritmaAPI --> PaymentFlow
    
    NotificationService --> EmailQueue
    EmailQueue --> BrevoSMTP
```

## Процесс синхронизации меню с iiko

```mermaid
sequenceDiagram
    participant Coordinator
    participant Backend
    participant IikoService
    participant IikoAPI
    participant Cache
    participant MySQL
    
    Coordinator->>Backend: POST /api/iiko/sync-menu
    Backend->>IikoService: syncMenu()
    IikoService->>Cache: Check access token
    alt Token exists
        Cache-->>IikoService: Return token
    else Token expired
        IikoService->>IikoAPI: Get new token
        IikoAPI-->>IikoService: New token
        IikoService->>Cache: Store token (50min)
    end
    IikoService->>IikoAPI: Get organizations
    IikoAPI-->>IikoService: Organizations list
    IikoService->>IikoAPI: Get menu
    IikoAPI-->>IikoService: Menu data
    IikoService->>MySQL: Sync categories
    IikoService->>MySQL: Sync menu items
    MySQL-->>IikoService: Sync complete
    IikoService-->>Backend: Success
    Backend-->>Coordinator: Menu synced
```

## Процесс обработки платежа

```mermaid
sequenceDiagram
    participant Client
    participant Frontend
    participant Backend
    participant AlgoritmaService
    participant AlgoritmaAPI
    participant MySQL
    participant Queue
    participant Brevo
    
    Client->>Frontend: Initiate payment
    Frontend->>Backend: POST /api/payment/orders/{id}/create
    Backend->>Backend: Validate order
    Backend->>AlgoritmaService: createOrder()
    AlgoritmaService->>AlgoritmaAPI: Create payment order
    AlgoritmaAPI-->>AlgoritmaService: Payment URL
    AlgoritmaService->>MySQL: Update order with payment URL
    AlgoritmaService-->>Backend: Payment URL
    Backend-->>Frontend: Payment URL
    Frontend-->>Client: Redirect to Algoritma
    
    Client->>AlgoritmaAPI: Complete payment
    AlgoritmaAPI->>Backend: Webhook (success/failure)
    Backend->>Backend: Validate webhook
    Backend->>MySQL: Update payment status
    Backend->>Queue: Send notification
    Queue->>Brevo: Send email to client
    Backend-->>AlgoritmaAPI: Acknowledge
```

---

## Легенда

**Цвета и стили:**
- 🔵 Синий - Клиентский слой
- 🟢 Зеленый - Приложение
- 🟡 Желтый - Данные
- 🟠 Оранжевый - Внешние сервисы
- 🔴 Красный - Критичные компоненты

**Типы связей:**
- `-->` - HTTP запрос
- `-->>` - Ответ
- `||--o{` - One-to-Many
- `}o--||` - Many-to-One
- `}o--o|` - Optional relationship

---

**Примечание:** Для просмотра Mermaid диаграмм используйте:
- GitHub (автоматически рендерится)
- VS Code с расширением Mermaid
- Онлайн редактор: https://mermaid.live/
