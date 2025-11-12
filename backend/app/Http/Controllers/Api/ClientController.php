<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CreateClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\User;
use Illuminate\Http\Request;

class ClientController extends BaseApiController
{
    /**
     * Получение списка клиентов
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', User::class);
            
            $query = User::where('user_type', 'client');

            if ($request->filled('client_category')) {
                $query->where('client_category', $request->client_category);
            }

            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('company_name')) {
                $query->where('company_name', 'like', '%' . $request->company_name . '%');
            }

            $clients = $query->orderBy('created_at', 'desc')->paginate(20);

            return $this->paginatedResponse($clients, 'Клиенты получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение клиента по ID
     */
    public function show(User $client)
    {
        try {
            $this->authorize('view', $client);
            
            // Проверяем, что это клиент
            if ($client->user_type !== 'client') {
                return $this->notFoundResponse('Пользователь не является клиентом');
            }

            return $this->successResponse([
                'client' => $client,
            ], 'Клиент получен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Создание нового клиента
     */
    public function store(CreateClientRequest $request)
    {
        try {
            $this->authorize('create', User::class);
            
            $validatedData = $request->validated();
            $validatedData['user_type'] = 'client';
            $validatedData['password'] = bcrypt('password123'); // Временный пароль
            
            $client = User::create($validatedData);

            return $this->createdResponse([
                'client' => $client,
            ], 'Клиент успешно создан');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обновление клиента
     */
    public function update(UpdateClientRequest $request, User $client)
    {
        try {
            $this->authorize('update', $client);
            
            // Проверяем, что это клиент
            if ($client->user_type !== 'client') {
                return $this->notFoundResponse('Пользователь не является клиентом');
            }

            $validatedData = $request->validated();

            $client->update($validatedData);

            return $this->updatedResponse([
                'client' => $client->fresh()
            ], 'Клиент успешно обновлен');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Удаление клиента
     */
    public function destroy(User $client)
    {
        try {
            $this->authorize('delete', $client);
            
            // Проверяем, что это клиент
            if ($client->user_type !== 'client') {
                return $this->notFoundResponse('Пользователь не является клиентом');
            }

            $client->delete();

            return $this->deletedResponse('Клиент успешно удален');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение статистики клиентов
     */
    /**
     * Получить статистику клиентов
     * УЛУЧШЕНО: Добавлена статистика по заказам клиентов и активности
     */
    public function statistics(Request $request)
    {
        try {
            $this->authorize('viewStatistics', User::class);
            
            // Базовая статистика клиентов
            $clientStats = [
                'total' => User::where('user_type', 'client')->count(),
                'corporate' => User::where('user_type', 'client')->where('client_category', 'corporate')->count(),
                'one_time' => User::where('user_type', 'client')->where('client_category', 'one_time')->count(),
                'active' => User::where('user_type', 'client')->where('status', 'active')->count(),
                'inactive' => User::where('user_type', 'client')->where('status', 'inactive')->count(),
                'suspended' => User::where('user_type', 'client')->where('status', 'suspended')->count(),
            ];
            
            // Статистика заказов клиентов
            $orderStats = [
                'clients_with_orders' => Order::distinct('client_id')->count('client_id'),
                'average_orders_per_client' => $clientStats['total'] > 0 
                    ? round(Order::count() / $clientStats['total'], 2) 
                    : 0,
                'top_clients' => User::where('user_type', 'client')
                    ->withCount('orders')
                    ->orderBy('orders_count', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'email', 'company_name'])
                    ->map(function ($client) {
                        return [
                            'id' => $client->id,
                            'name' => $client->name,
                            'email' => $client->email,
                            'company' => $client->company_name,
                            'orders_count' => $client->orders_count,
                        ];
                    }),
            ];
            
            // Статистика за текущий месяц
            $currentMonth = now()->startOfMonth();
            $monthStats = [
                'new_clients_this_month' => User::where('user_type', 'client')
                    ->where('created_at', '>=', $currentMonth)->count(),
                'active_clients_this_month' => Order::where('created_at', '>=', $currentMonth)
                    ->distinct('client_id')->count('client_id'),
            ];
            
            // Статистика по выручке клиентов
            $revenueStats = [
                'total_revenue_from_clients' => Order::whereIn('status', [
                    Order::STATUS_PAID,
                    Order::STATUS_PROCESSING,
                    Order::STATUS_COMPLETED
                ])->sum('final_amount'),
                'average_revenue_per_client' => $clientStats['total'] > 0 
                    ? round(Order::whereIn('status', [
                        Order::STATUS_PAID,
                        Order::STATUS_PROCESSING,
                        Order::STATUS_COMPLETED
                    ])->sum('final_amount') / $clientStats['total'], 2)
                    : 0,
            ];

            $stats = [
                'clients' => $clientStats,
                'orders' => $orderStats,
                'current_month' => $monthStats,
                'revenue' => $revenueStats,
                'overview' => [
                    'total_clients' => $clientStats['total'],
                    'active_clients' => $clientStats['active'],
                    'clients_with_orders' => $orderStats['clients_with_orders'],
                    'conversion_rate' => $clientStats['total'] > 0 
                        ? round(($orderStats['clients_with_orders'] / $clientStats['total']) * 100, 2)
                        : 0,
                ],
            ];

            return $this->successResponse($stats, 'Статистика клиентов получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}