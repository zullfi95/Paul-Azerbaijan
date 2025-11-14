<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    protected $signature = 'create:admin {email?} {password?}';
    protected $description = 'Create an admin user (coordinator)';

    public function handle()
    {
        $email = $this->argument('email') ?: 'fidan@paul.az';
        $password = $this->argument('password') ?: 'password';
        
        // Проверяем, есть ли уже пользователь с таким email
        $existingUser = User::where('email', $email)->first();
        
        if ($existingUser) {
            $this->warn("Пользователь с email {$email} уже существует!");
            if ($this->confirm('Хотите обновить пароль и роль?')) {
                $existingUser->update([
                    'password' => Hash::make($password),
                    'user_type' => 'staff',
                    'staff_role' => 'coordinator',
                    'status' => 'active',
                ]);
                $this->info("Пользователь обновлен успешно!");
                $this->info("Email: {$email}");
                $this->info("Password: {$password}");
                $this->info("User ID: {$existingUser->id}");
                $this->info("Role: Coordinator (Admin)");
            }
            return;
        }

        // Создаем администратора
        $admin = User::create([
            'name' => 'Fidan',
            'email' => $email,
            'password' => Hash::make($password),
            'user_type' => 'staff',
            'staff_role' => 'coordinator',
            'status' => 'active',
        ]);

        $this->info('Администратор создан успешно!');
        $this->info("Email: {$email}");
        $this->info("Password: {$password}");
        $this->info("User ID: {$admin->id}");
        $this->info("Role: Coordinator (Admin)");
    }
}

