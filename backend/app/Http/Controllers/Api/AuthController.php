<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Регистрация нового пользователя
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email',
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка валидации',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'user_type' => 'client',
                'status' => 'active',
            ]);

            // Создаем Sanctum токен для автоматического входа
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Пользователь успешно зарегистрирован',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ], 201);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при регистрации: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Вход пользователя
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        // Проверяем в таблице users (все пользователи)
        $user = User::where('email', $request->email)->first();
        $authenticatedUser = null;
        $userType = null;

        if ($user && Hash::check($request->password, $user->password) && $user->isActive()) {
            $authenticatedUser = $user;
            $userType = $user->user_type;
        }

        if (!$authenticatedUser) {
            return response()->json([
                'success' => false,
                'message' => 'Неверные учетные данные'
            ], 401);
        }

        // Создаем Sanctum токен
        $token = $authenticatedUser->createToken('auth-token')->plainTextToken;

        // Добавляем user_type и staff_role в объект пользователя для фронтенда
        $userArray = $authenticatedUser->toArray();
        $userArray['user_type'] = $userType;
        if ($authenticatedUser instanceof User) {
            $userArray['staff_role'] = $authenticatedUser->staff_role;
        }

        return response()->json([
            'success' => true,
            'message' => 'Успешный вход',
            'data' => [
                'user' => $userArray,
                'user_type' => $userType,
                'token' => $token,
            ]
        ]);
    }

    /**
     * Получение информации о текущем пользователе
     */
    public function user(Request $request)
    {
        // Sanctum автоматически определит пользователя по токену
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Не аутентифицирован'
            ], 401);
        }

        $userType = $user->user_type;

        // Добавляем user_type и staff_role в объект пользователя для фронтенда
        $userArray = $user->toArray();
        $userArray['user_type'] = $userType;
        if ($user instanceof User) {
            $userArray['staff_role'] = $user->staff_role;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $userArray,
                'user_type' => $userType,
            ]
        ]);
    }

    /**
     * Обновление данных текущего пользователя
     */
    public function updateUser(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Не аутентифицирован'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Обновляем только переданные поля
            $updateData = $request->only(['name', 'email', 'phone']);
            
            // Проверяем уникальность email, если он изменяется
            if (isset($updateData['email']) && $updateData['email'] !== $user->email) {
                $emailExists = false;
                
                // Проверяем в таблице users
                if ($user instanceof User) {
                    $emailExists = User::where('email', $updateData['email'])
                        ->where('id', '!=', $user->id)
                        ->exists();
                }
                
                // Проверяем в таблице clients
                if (!$emailExists) {
                    $emailExists = User::where('email', $updateData['email'])
                        ->where('user_type', 'client')
                        ->where('id', '!=', $user->id)
                        ->exists();
                }
                
                if ($emailExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email уже используется другим пользователем'
                    ], 422);
                }
            }

            // Обновляем пользователя
            $user->update($updateData);

            // Определяем тип пользователя
            $userType = $user->user_type;

            // Подготавливаем данные для ответа
            $userArray = $user->toArray();
            $userArray['user_type'] = $userType;
            if ($user instanceof User) {
                $userArray['staff_role'] = $user->staff_role;
            }

            return response()->json([
                'success' => true,
                'message' => 'Данные успешно обновлены',
                'data' => [
                    'user' => $userArray,
                    'user_type' => $userType,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка при обновлении данных'
            ], 500);
        }
    }

    /**
     * Выход пользователя (удаление токена)
     */
    public function logout(Request $request)
    {
        // Удаляем все токены текущего пользователя
        $request->user()->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Успешный выход'
        ]);
    }

    /**
     * Сохранение адреса доставки пользователя
     */
    public function saveShippingAddress(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'street' => 'required|string|max:255',
                'city' => 'required|string|max:100',
                'postal_code' => 'nullable|string|max:20',
                'country' => 'required|string|max:100',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = $request->user();
            
            // Сохраняем адрес в JSON поле или отдельной таблице
            $shippingAddress = [
                'street' => $request->street,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'country' => $request->country,
                'updated_at' => now()
            ];

            // Обновляем поле shipping_address в таблице users
            $user->update([
                'shipping_address' => json_encode($shippingAddress)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Delivery address saved successfully',
                'data' => $shippingAddress
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save delivery address: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Получение адреса доставки пользователя
     */
    public function getShippingAddress(Request $request)
    {
        try {
            $user = $request->user();
            
            $shippingAddress = null;
            if ($user->shipping_address) {
                $shippingAddress = json_decode($user->shipping_address, true);
            }

            return response()->json([
                'success' => true,
                'data' => $shippingAddress
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get delivery address: ' . $e->getMessage()
            ], 500);
        }
    }
}