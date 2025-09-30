<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Получение списка всех пользователей
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Все пользователи - только сотрудники

        // Фильтрация по роли
        if ($request->has('role')) {
            if ($request->role === 'coordinator') {
                $query->where('staff_role', 'coordinator');
            } elseif ($request->role === 'observer') {
                $query->where('staff_role', 'observer');
            }
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Получение пользователя по ID
     */
    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * Создание нового пользователя
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'staff_role' => 'required|in:coordinator,observer',
            'status' => 'in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        $userData = [
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'user_type' => 'staff',
            'staff_role' => $request->staff_role,
            'status' => $request->status ?? 'active',
        ];

        $user = User::create($userData);

        return response()->json([
            'success' => true,
            'message' => 'Пользователь успешно создан',
            'data' => [
                'user' => $user
            ]
        ], 201);
    }

    /**
     * Обновление пользователя
     */
    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'staff_role' => 'sometimes|in:coordinator,observer',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['name', 'email', 'staff_role', 'status']);
        $updateData['user_type'] = 'staff';

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Пользователь успешно обновлен',
            'data' => [
                'user' => $user->fresh()
            ]
        ]);
    }

    /**
     * Удаление пользователя
     */
    public function destroy(User $user)
    {
        // Нельзя удалить самого себя
        if ($user->id === auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Нельзя удалить свой аккаунт'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Пользователь успешно удален'
        ]);
    }

    /**
     * Получение статистики по пользователям
     */
    public function statistics()
    {
        $stats = [
            'total' => User::count(),
            'coordinators' => User::where('staff_role', 'coordinator')->count(),
            'observers' => User::where('staff_role', 'observer')->count(),
            'active' => User::where('status', 'active')->count(),
            'inactive' => User::where('status', 'inactive')->count(),
            'suspended' => User::where('status', 'suspended')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Получение списка координаторов (публичный endpoint)
     */
    public function getCoordinators()
    {
        $coordinators = User::where('staff_role', 'coordinator')
            ->where('status', 'active')
            ->select('id', 'name', 'email')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $coordinators
        ]);
    }
}
