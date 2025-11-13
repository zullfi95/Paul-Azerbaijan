<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseApiController
{
    /**
     * Получение списка всех пользователей
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', User::class);
            
            $query = User::query();

            // Фильтрация по роли
            if ($request->has('role')) {
                $role = $request->role;
                if (in_array($role, ['coordinator', 'observer', 'chef', 'operations_manager'])) {
                    $query->where('user_type', 'staff')->where('staff_role', $role);
                }
            }

            $users = $query->orderBy('created_at', 'desc')->paginate(20);

            return $this->paginatedResponse($users, 'Пользователи получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение пользователя по ID
     */
    public function show(User $user)
    {
        try {
            $this->authorize('view', $user);
            
            return $this->successResponse([
                'user' => $user
            ], 'Пользователь получен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Создание нового пользователя
     */
    public function store(CreateUserRequest $request)
    {
        try {
            $this->authorize('create', User::class);
            
            $validatedData = $request->validated();

            $userData = $validatedData;
            $userData['password'] = Hash::make($validatedData['password']);
            $userData['status'] = $validatedData['status'] ?? 'active';

            // Устанавливаем user_type и staff_role
            if (($validatedData['user_type'] ?? 'client') === 'staff') {
                $userData['user_type'] = 'staff';
                $userData['staff_role'] = $validatedData['staff_role'] ?? 'observer'; // По умолчанию 'observer'
            } else {
                $userData['user_type'] = 'client';
                $userData['client_category'] = $validatedData['client_category'] ?? 'one_time';
            }
            
            $user = User::create($userData);

            return $this->createdResponse([
                'user' => $user
            ], 'Пользователь успешно создан');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обновление пользователя
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $this->authorize('update', $user);
            
            $validatedData = $request->validated();

            $user->update($validatedData);

            return $this->updatedResponse([
                'user' => $user->fresh()
            ], 'Пользователь успешно обновлен');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Удаление пользователя
     */
    public function destroy(User $user)
    {
        try {
            $this->authorize('delete', $user);
            
            $user->delete();

            return $this->deletedResponse('Пользователь успешно удален');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение статистики пользователей
     */
    public function statistics(Request $request)
    {
        try {
            $this->authorize('viewStatistics', User::class);
            
            $stats = [
                'total' => User::count(),
                'staff' => User::where('user_type', 'staff')->count(),
                'clients' => User::where('user_type', 'client')->count(),
                'coordinators' => User::where('user_type', 'staff')->where('staff_role', 'coordinator')->count(),
                'observers' => User::where('user_type', 'staff')->where('staff_role', 'observer')->count(),
                'active' => User::where('status', 'active')->count(),
                'inactive' => User::where('status', 'inactive')->count(),
            ];

            return $this->successResponse($stats, 'Статистика пользователей получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение списка координаторов
     */
    public function getCoordinators()
    {
        try {
            $coordinators = User::where('user_type', 'staff')
                ->where('staff_role', 'coordinator')
                ->where('status', 'active')
                ->select('id', 'name', 'email', 'phone')
                ->get();

            return $this->successResponse($coordinators, 'Координаторы получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}