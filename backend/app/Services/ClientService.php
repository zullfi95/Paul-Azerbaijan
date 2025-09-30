<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientService
{
    /**
     * Найти существующего пользователя-клиента по email или создать нового
     */
    public function findOrCreateUser(array $userData): User
    {
        $email = $userData['email'] ?? null;

        if (!$email) {
            throw new \InvalidArgumentException('Email обязателен для создания пользователя');
        }

        // Ищем существующего пользователя по email
        $existingUser = User::where('email', $email)
                          ->where('user_type', 'client')
                          ->first();

        if ($existingUser) {
            return $existingUser;
        }

        // Создаем нового пользователя
        $password = $this->generatePassword();

        $user = User::create([
            'name' => trim($userData['name'] ?? ''),
            'last_name' => trim($userData['last_name'] ?? ''),
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => $userData['phone'] ?? null,
            'address' => $userData['address'] ?? null,
            'company_name' => $userData['company_name'] ?? null,
            'position' => $userData['position'] ?? null,
            'contact_person' => $userData['contact_person'] ?? null,
            'user_type' => 'client',
            'client_category' => $userData['client_category'] ?? 'one_time',
            'status' => $userData['status'] ?? 'active',
        ]);

        // Сохраняем сгенерированный пароль для отправки по email
        $user->generated_password = $password;

        return $user;
    }

    /**
     * Генерирует случайный пароль
     */
    private function generatePassword(): string
    {
        return Str::random(10);
    }

    /**
     * Получить данные для email уведомления
     */
    public function getClientNotificationData(User $user): array
    {
        return [
            'client' => $user,
            'password' => $user->generated_password ?? 'Установите новый пароль',
            'login_url' => config('app.url') . '/login',
        ];
    }
}
