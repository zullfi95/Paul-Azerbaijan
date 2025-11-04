<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\LoginUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\SaveShippingAddressRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AuthController extends BaseApiController
{
    /**
     * Регистрация нового пользователя
     */
    public function register(CreateUserRequest $request)
    {
        try {
            $validatedData = $request->validated();

            $user = User::create([
                'name' => $validatedData['name'],
                'last_name' => $validatedData['surname'] ?? $validatedData['last_name'] ?? null,
                'phone' => $validatedData['phone'] ?? null,
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'user_type' => 'client',
                'status' => 'active',
            ]);

            // Создаем Sanctum токен для автоматического входа
            $token = $user->createToken('auth-token')->plainTextToken;

            return $this->createdResponse([
                'user' => $user,
                'token' => $token
            ], 'Пользователь успешно зарегистрирован');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Вход пользователя
     */
    public function login(LoginUserRequest $request)
    {
        try {
            $validatedData = $request->validated();

            // Проверяем в таблице users (все пользователи)
            $user = User::where('email', $validatedData['email'])->first();
            $authenticatedUser = null;
            $userType = null;

            if ($user && Hash::check($validatedData['password'], $user->password) && $user->isActive()) {
                $authenticatedUser = $user;
                $userType = $user->user_type;
            }

            if (!$authenticatedUser) {
                return $this->errorResponse('Неверные учетные данные', 401);
            }

            // Создаем Sanctum токен
            $token = $authenticatedUser->createToken('auth-token')->plainTextToken;

            // Добавляем user_type и staff_role в объект пользователя для фронтенда
            $userArray = $authenticatedUser->toArray();
            $userArray['user_type'] = $userType;
            if ($authenticatedUser instanceof User) {
                $userArray['staff_role'] = $authenticatedUser->staff_role;
            }

            return $this->successResponse([
                'user' => $userArray,
                'user_type' => $userType,
                'token' => $token,
            ], 'Успешный вход');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение информации о текущем пользователе
     */
    public function user(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            $userType = $user->user_type;

            // Добавляем user_type и staff_role в объект пользователя для фронтенда
            $userArray = $user->toArray();
            $userArray['user_type'] = $userType;
            if ($user instanceof User) {
                $userArray['staff_role'] = $user->staff_role;
            }

            return $this->successResponse([
                'user' => $userArray,
                'user_type' => $userType,
            ], 'Информация о пользователе получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обновление данных текущего пользователя
     */
    public function updateUser(UpdateUserRequest $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            $validatedData = $request->validated();

            // Проверяем уникальность email, если он изменяется
            if (isset($validatedData['email']) && $validatedData['email'] !== $user->email) {
                $emailExists = User::where('email', $validatedData['email'])
                    ->where('id', '!=', $user->id)
                    ->exists();
                
                if ($emailExists) {
                    return $this->validationErrorResponse([
                        'email' => ['Email уже используется другим пользователем']
                    ], 'Email уже используется');
                }
            }

            // Обновляем пользователя
            $user->update($validatedData);

            // Определяем тип пользователя
            $userType = $user->user_type;

            // Подготавливаем данные для ответа
            $userArray = $user->toArray();
            $userArray['user_type'] = $userType;
            if ($user instanceof User) {
                $userArray['staff_role'] = $user->staff_role;
            }

            return $this->updatedResponse([
                'user' => $userArray,
                'user_type' => $userType,
            ], 'Данные успешно обновлены');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Выход пользователя (удаление токена)
     */
    public function logout(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            
            // Удаляем все токены текущего пользователя
            $user->tokens()->delete();

            return $this->successResponse(null, 'Успешный выход');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Сохранение адреса доставки пользователя
     */
    public function saveShippingAddress(SaveShippingAddressRequest $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            $validatedData = $request->validated();
            
            // Сохраняем адрес в JSON поле
            $shippingAddress = [
                'street' => $validatedData['street'],
                'city' => $validatedData['city'],
                'postal_code' => $validatedData['postal_code'],
                'country' => $validatedData['country'],
                'updated_at' => now()
            ];

            // Обновляем поле shipping_address в таблице users
            $user->update([
                'shipping_address' => json_encode($shippingAddress)
            ]);

            return $this->successResponse($shippingAddress, 'Адрес доставки сохранен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение адреса доставки пользователя
     */
    public function getShippingAddress(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            
            $shippingAddress = null;
            if ($user->shipping_address) {
                $shippingAddress = json_decode($user->shipping_address, true);
            }

            return $this->successResponse($shippingAddress, 'Адрес доставки получен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}