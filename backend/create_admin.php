<?php

/**
 * Скрипт для создания администратора
 * Запуск: php create_admin.php
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'fidan@paul.az';
$password = 'password';

// Проверяем, есть ли уже пользователь с таким email
$existingUser = User::where('email', $email)->first();

if ($existingUser) {
    echo "Пользователь с email {$email} уже существует!\n";
    echo "Обновляем пароль и роль...\n";
    
    $existingUser->update([
        'password' => Hash::make($password),
        'user_type' => 'staff',
        'staff_role' => 'coordinator',
        'status' => 'active',
    ]);
    
    echo "✓ Пользователь обновлен успешно!\n";
    echo "Email: {$email}\n";
    echo "Password: {$password}\n";
    echo "User ID: {$existingUser->id}\n";
    echo "Role: Coordinator (Admin)\n";
} else {
    // Создаем администратора
    $admin = User::create([
        'name' => 'Fidan',
        'email' => $email,
        'password' => Hash::make($password),
        'user_type' => 'staff',
        'staff_role' => 'coordinator',
        'status' => 'active',
    ]);

    echo "✓ Администратор создан успешно!\n";
    echo "Email: {$email}\n";
    echo "Password: {$password}\n";
    echo "User ID: {$admin->id}\n";
    echo "Role: Coordinator (Admin)\n";
}

