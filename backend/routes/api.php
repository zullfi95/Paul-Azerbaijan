<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\IikoController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\MenuItemController;
use App\Http\Controllers\Api\MenuCategoryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Открытые маршруты (не требуют аутентификации)
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1'); // Rate limiting
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:5,1'); // Rate limiting
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:3,1'); // Rate limiting
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1'); // Rate limiting
Route::post('/newsletter/subscribe', [AuthController::class, 'subscribeNewsletter'])->middleware('throttle:5,1'); // Rate limiting

// Публичный endpoint для получения координаторов (для создания заявок)
Route::get('/coordinators', [UserController::class, 'getCoordinators']);

// Публичный endpoint для создания заявок на мероприятия (без авторизации)
Route::post('/event-applications', [ApplicationController::class, 'storeEventApplication'])->middleware('throttle:5,1'); // Rate limiting

// Публичные маршруты для меню (доступны всем)
Route::prefix('menu')->group(function () {
    Route::get('/categories', [MenuController::class, 'getCategories']);
    Route::get('/items', [MenuController::class, 'getMenuItems']);
    Route::get('/full', [MenuController::class, 'getFullMenu']);
    Route::get('/items/{id}', [MenuController::class, 'getMenuItem']);
    Route::get('/search', [MenuController::class, 'searchMenu']);
    Route::get('/stats', [MenuController::class, 'getMenuStats']);
});

// Тестовый маршрут удалён (безопасность)

// Защищенные маршруты (требуют аутентификации)
Route::middleware(['auth:sanctum'])->group(function () {
    // Создание заявки теперь требует аутентификации
    Route::post('/applications', [ApplicationController::class, 'store'])->middleware('throttle:10,1'); // Rate limiting

    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateUser'])->middleware('throttle:5,1'); // Rate limiting
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Адреса пользователя
    Route::post('/user/address/shipping', [AuthController::class, 'saveShippingAddress'])->middleware('throttle:5,1'); // Rate limiting
    Route::get('/user/address/shipping', [AuthController::class, 'getShippingAddress']);
    
    // Маршруты для координаторов
    Route::middleware('coordinator')->group(function () {
        // Заявки
        Route::get('/applications', [ApplicationController::class, 'index']); // Список заявок
        Route::get('/applications/{application}', [ApplicationController::class, 'show']); // Просмотр заявки
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']); // Обновление статуса
        
        // Пользователи (сотрудники)
        Route::get('/users/statistics', [UserController::class, 'statistics']); // Статистика пользователей - ДОЛЖЕН БЫТЬ ПЕРЕД {user}
        Route::get('/users', [UserController::class, 'index']); // Список пользователей
        Route::get('/users/{user}', [UserController::class, 'show']); // Просмотр пользователя
        Route::post('/users', [UserController::class, 'store'])->middleware('throttle:5,1'); // Rate limiting
        Route::put('/users/{user}', [UserController::class, 'update'])->middleware('throttle:5,1'); // Rate limiting
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('throttle:3,1'); // Rate limiting

        // Клиенты
        Route::get('/clients/statistics', [ClientController::class, 'statistics']); // Статистика клиентов - ДОЛЖЕН БЫТЬ ПЕРЕД {client}
        Route::get('/clients', [ClientController::class, 'index']);
        Route::get('/clients/{client}', [ClientController::class, 'show']);
        Route::post('/clients', [ClientController::class, 'store']);
        Route::put('/clients/{client}', [ClientController::class, 'update']);
        Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
        
        // Заказы (только для координаторов)
        Route::get('/orders/statistics', [OrderController::class, 'statistics']); // Статистика заказов - ДОЛЖЕН БЫТЬ ПЕРЕД {order}
        Route::get('/orders', [OrderController::class, 'index']); // Список заказов
        Route::get('/orders/{order}', [OrderController::class, 'show']); // Просмотр заказа
        Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:10,1'); // Rate limiting
        Route::put('/orders/{order}', [OrderController::class, 'update'])->middleware('throttle:10,1'); // Rate limiting
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->middleware('throttle:10,1'); // Rate limiting
        Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->middleware('throttle:3,1'); // Rate limiting
        Route::post('/applications/{application}/create-order', [OrderController::class, 'createFromApplication']); // Создание заказа из заявки
        // iiko API интеграция
        Route::prefix('iiko')->group(function () {
            Route::get('/test-connection', [IikoController::class, 'testConnection']); // Проверка подключения
            Route::get('/organizations', [IikoController::class, 'getOrganizations']); // Список организаций
            Route::get('/menu', [IikoController::class, 'getMenu']); // Получение меню
            Route::get('/external-menu', [IikoController::class, 'getExternalMenu']); // Получение внешнего меню
            Route::get('/price-categories', [IikoController::class, 'getPriceCategories']); // Категории цен
            Route::post('/sync-menu', [IikoController::class, 'syncMenu']); // Синхронизация меню
            Route::get('/debug-menu-structure', [IikoController::class, 'debugMenuStructure']); // Отладка структуры меню
        });
    });

    // Маршруты для клиентов
    Route::middleware('client')->group(function () {
        // Заказы клиента
        Route::get('/client/orders', [OrderController::class, 'getClientOrders']); // Все заказы клиента
        Route::get('/client/orders/active', [OrderController::class, 'getClientActiveOrders']); // Активные заказы клиента
        Route::get('/client/orders/{order}', [OrderController::class, 'showClientOrder']); // Просмотр конкретного заказа клиента
        
        // Уведомления клиента
        Route::get('/client/notifications', [NotificationController::class, 'getClientNotifications']); // Уведомления клиента
        Route::get('/client/notifications/unread-count', [NotificationController::class, 'getUnreadNotifications']); // Количество непрочитанных
        Route::patch('/client/notifications/{notification}/read', [NotificationController::class, 'markAsRead']); // Отметить как прочитанное
        Route::patch('/client/notifications/read-all', [NotificationController::class, 'markAllAsRead']); // Отметить все как прочитанные
    });
    
    // Algoritma Payment API интеграция (для всех аутентифицированных; права проверяются в контроллере)
    Route::prefix('payment')->group(function () {
        Route::get('/test-connection', [PaymentController::class, 'testConnection']);
        Route::get('/test-cards', [PaymentController::class, 'getTestCards']);
        Route::post('/orders/{order}/create', [PaymentController::class, 'createPayment'])->middleware('throttle:5,1'); // Rate limiting
        Route::get('/orders/{order}/info', [PaymentController::class, 'getPaymentInfo']);
        Route::post('/orders/{order}/success', [PaymentController::class, 'handleSuccess'])->middleware('throttle:10,1'); // Rate limiting
        Route::post('/orders/{order}/failure', [PaymentController::class, 'handleFailure'])->middleware('throttle:10,1'); // Rate limiting
    });
});

// Маршруты для управления меню (доступны только координаторам через Policy)
Route::middleware(['auth:sanctum', 'coordinator'])->group(function () {
    Route::apiResource('menu-items', MenuItemController::class);
    Route::apiResource('menu-categories', MenuCategoryController::class)->only(['index', 'show']);
});
