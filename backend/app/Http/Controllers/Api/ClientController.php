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
    public function statistics(Request $request)
    {
        try {
            $this->authorize('viewStatistics', User::class);
            
            $stats = [
                'total' => User::where('user_type', 'client')->count(),
                'corporate' => User::where('user_type', 'client')->where('client_category', 'corporate')->count(),
                'one_time' => User::where('user_type', 'client')->where('client_category', 'one_time')->count(),
                'active' => User::where('user_type', 'client')->where('status', 'active')->count(),
                'inactive' => User::where('user_type', 'client')->where('status', 'inactive')->count(),
                'suspended' => User::where('user_type', 'client')->where('status', 'suspended')->count(),
            ];

            return $this->successResponse($stats, 'Статистика клиентов получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}