<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateTestCoordinator extends Command
{
    protected $signature = 'create:test-coordinator';
    protected $description = 'Create a test coordinator user';

    public function handle()
    {
        // Проверяем, есть ли уже тестовый координатор
        $existingUser = User::where('email', 'test@coordinator.com')->first();
        
        if ($existingUser) {
            $this->info('Test coordinator already exists!');
            $this->info('Email: test@coordinator.com');
            $this->info('Password: password');
            return;
        }

        // Создаем тестового координатора
        $coordinator = User::create([
            'name' => 'Test Coordinator',
            'email' => 'test@coordinator.com',
            'password' => Hash::make('password'),
            'user_type' => 'staff',
            'staff_role' => 'coordinator',
            'status' => 'active',
        ]);

        $this->info('Test coordinator created successfully!');
        $this->info('Email: test@coordinator.com');
        $this->info('Password: password');
        $this->info('User ID: ' . $coordinator->id);
    }
}