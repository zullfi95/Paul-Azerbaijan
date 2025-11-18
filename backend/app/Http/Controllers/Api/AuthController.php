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
use Illuminate\Support\Facades\Mail;

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
                'postal_code' => $validatedData['postal_code'] ?? null,
                'country' => $validatedData['country'] ?? 'Азербайджан',
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
    
    /**
     * Запрос на восстановление пароля
     * НОВОЕ: Реализация forgot-password endpoint
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validatedData = $this->validateData(
                $request->all(),
                ['email' => 'required|email'],
                ['email.required' => 'Email обязателен', 'email.email' => 'Некорректный email']
            );
            
            $user = User::where('email', $validatedData['email'])->first();
            
            if (!$user) {
                // Из соображений безопасности не раскрываем, существует ли email
                return $this->successResponse(null, 'Если email существует в системе, инструкции будут отправлены');
            }
            
            // Генерируем токен для сброса пароля
            $token = \Str::random(64);
            
            // Сохраняем токен в базе данных (добавим поле reset_token и reset_token_expires)
            $user->update([
                'reset_token' => Hash::make($token),
                'reset_token_expires' => now()->addHours(1),
            ]);
            
            // Отправляем email с инструкциями
            $resetLink = config('app.frontend_url', config('app.url')) . '/auth/reset-password?token=' . $token . '&email=' . urlencode($user->email);
            
            try {
                \Mail::raw("Здравствуйте, {$user->name}!\n\nВы запросили восстановление пароля для вашего аккаунта в PAUL Azerbaijan.\n\nПерейдите по ссылке для сброса пароля:\n{$resetLink}\n\nЕсли вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.\n\nСсылка действительна в течение 1 часа.\n\n---\nС уважением,\nКоманда PAUL Azerbaijan\nhttps://paul-azerbaijan.com", function ($message) use ($user) {
                    $message->to($user->email)
                            ->subject('Восстановление пароля - PAUL Azerbaijan');
                });
                
                Log::info('Password reset email sent successfully', [
                    'email' => $user->email,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send password reset email', [
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }
            
            Log::info('Password reset requested', [
                'email' => $user->email,
                'token' => $token,
                'reset_link' => $resetLink
            ]);
            
            return $this->successResponse([
                'message' => 'Инструкции по восстановлению пароля отправлены на email',
                // В тестовом режиме возвращаем токен (в production убрать!)
                'debug_token' => config('app.debug') ? $token : null,
                'debug_link' => config('app.debug') ? config('app.frontend_url') . '/auth/reset-password?token=' . $token . '&email=' . urlencode($user->email) : null,
            ], 'Инструкции отправлены');
            
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
    
    /**
     * Сброс пароля по токену
     * НОВОЕ: Реализация reset-password endpoint
     */
    public function resetPassword(Request $request)
    {
        try {
            $validatedData = $this->validateData(
                $request->all(),
                [
                    'email' => 'required|email',
                    'token' => 'required|string',
                    'password' => 'required|string|min:8|confirmed',
                ],
                [
                    'email.required' => 'Email обязателен',
                    'token.required' => 'Токен обязателен',
                    'password.required' => 'Пароль обязателен',
                    'password.min' => 'Пароль должен быть минимум 8 символов',
                    'password.confirmed' => 'Пароли не совпадают',
                ]
            );
            
            $user = User::where('email', $validatedData['email'])->first();
            
            if (!$user || !$user->reset_token || !$user->reset_token_expires) {
                return $this->errorResponse('Некорректный или истекший токен', 400);
            }
            
            // Проверяем, не истек ли токен
            if (now()->gt($user->reset_token_expires)) {
                return $this->errorResponse('Токен истек. Запросите новый', 400);
            }
            
            // Проверяем токен
            if (!Hash::check($validatedData['token'], $user->reset_token)) {
                return $this->errorResponse('Некорректный токен', 400);
            }
            
            // Обновляем пароль
            $user->update([
                'password' => Hash::make($validatedData['password']),
                'reset_token' => null,
                'reset_token_expires' => null,
            ]);
            
            Log::info('Password reset successful', ['email' => $user->email]);
            
            return $this->successResponse(null, 'Пароль успешно изменен');
            
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
    
    /**
     * Подписка на рассылку новостей
     * НОВОЕ: Newsletter subscription endpoint
     */
    public function subscribeNewsletter(Request $request)
    {
        try {
            $validatedData = $this->validateData(
                $request->all(),
                ['email' => 'required|email'],
                ['email.required' => 'Email обязателен', 'email.email' => 'Некорректный email']
            );
            
            // Сохраняем подписку в БД
            $subscriber = \App\Models\NewsletterSubscriber::subscribe($validatedData['email']);
            
            Log::info('Newsletter subscription', [
                'email' => $validatedData['email'],
                'subscriber_id' => $subscriber->id,
                'is_new' => $subscriber->wasRecentlyCreated
            ]);
            
            // Отправляем приветственное письмо
            try {
                Mail::to($validatedData['email'])->send(
                    new \App\Mail\NewsletterWelcome($subscriber->email, $subscriber->unsubscribe_token)
                );
                Log::info('Newsletter welcome email sent', ['email' => $validatedData['email']]);
            } catch (\Exception $e) {
                // Логируем ошибку отправки, но не прерываем процесс подписки
                Log::error('Failed to send newsletter welcome email', [
                    'email' => $validatedData['email'],
                    'error' => $e->getMessage()
                ]);
            }
            
            return $this->successResponse([
                'email' => $validatedData['email'],
                'message' => 'Спасибо за подписку! Вы будете получать наши новости.',
            ], 'Подписка оформлена успешно');
            
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}