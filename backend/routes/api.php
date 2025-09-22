<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\NotificationController;

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
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']); // Убираем web middleware для избежания CSRF конфликта

// Публичный endpoint для получения координаторов (для создания заявок)
Route::get('/coordinators', [UserController::class, 'getCoordinators']);

// Тестовый маршрут удалён (безопасность)

// Защищенные маршруты (требуют аутентификации)
Route::middleware(['auth:sanctum'])->group(function () {
    // Создание заявки теперь требует аутентификации
    Route::post('/applications', [ApplicationController::class, 'store']); // Создание заявки с сайта (только для залогиненных)

    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user', [AuthController::class, 'updateUser']); // Обновление данных текущего пользователя
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Маршруты для координаторов
    Route::middleware('coordinator')->group(function () {
        // Заявки
        Route::get('/applications', [ApplicationController::class, 'index']); // Список заявок
        Route::get('/applications/{application}', [ApplicationController::class, 'show']); // Просмотр заявки
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']); // Обновление статуса
        
        // Пользователи (сотрудники)
        Route::get('/users', [UserController::class, 'index']); // Список пользователей
        Route::get('/users/{user}', [UserController::class, 'show']); // Просмотр пользователя
        Route::post('/users', [UserController::class, 'store']); // Создание пользователя
        Route::put('/users/{user}', [UserController::class, 'update']); // Обновление пользователя
        Route::delete('/users/{user}', [UserController::class, 'destroy']); // Удаление пользователя
        Route::get('/users/statistics', [UserController::class, 'statistics']); // Статистика пользователей

        // Клиенты
        Route::get('/clients', [ClientController::class, 'index']);
        Route::get('/clients/{client}', [ClientController::class, 'show']);
        Route::post('/clients', [ClientController::class, 'store']);
        Route::put('/clients/{client}', [ClientController::class, 'update']);
        Route::delete('/clients/{client}', [ClientController::class, 'destroy']);
        Route::get('/clients/statistics', [ClientController::class, 'statistics']);
        
        // Заказы
        Route::get('/orders', [OrderController::class, 'index']); // Список заказов
        Route::get('/orders/{order}', [OrderController::class, 'show']); // Просмотр заказа
        Route::post('/orders', [OrderController::class, 'store']); // Создание заказа
        Route::put('/orders/{order}', [OrderController::class, 'update']); // Обновление заказа
        Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus']); // Обновление статуса заказа
        Route::delete('/orders/{order}', [OrderController::class, 'destroy']); // Удаление заказа
        Route::post('/applications/{application}/create-order', [OrderController::class, 'createFromApplication']); // Создание заказа из заявки
        Route::get('/orders/statistics', [OrderController::class, 'statistics']); // Статистика заказов
    });

    // Маршруты для клиентов
    Route::middleware('client')->group(function () {
        // Заказы клиента
        Route::get('/client/orders', [OrderController::class, 'getClientOrders']); // Все заказы клиента
        Route::get('/client/orders/active', [OrderController::class, 'getClientActiveOrders']); // Активные заказы клиента
        
        // Уведомления клиента
        Route::get('/client/notifications', [NotificationController::class, 'getClientNotifications']); // Уведомления клиента
        Route::get('/client/notifications/unread-count', [NotificationController::class, 'getUnreadNotifications']); // Количество непрочитанных
        Route::patch('/client/notifications/{notification}/read', [NotificationController::class, 'markAsRead']); // Отметить как прочитанное
        Route::patch('/client/notifications/read-all', [NotificationController::class, 'markAllAsRead']); // Отметить все как прочитанные
    });
});
