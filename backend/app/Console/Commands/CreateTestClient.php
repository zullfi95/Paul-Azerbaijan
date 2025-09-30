<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateTestClient extends Command
{
    protected $signature = 'create:test-client';
    protected $description = 'Create a test client user';

    public function handle()
    {
        // Проверяем, есть ли уже тестовый клиент
        $existingUser = User::where('email', 'test@client.com')->first();
        
        if ($existingUser) {
            $this->info('Test client already exists!');
            $this->info('Email: test@client.com');
            $this->info('Password: password');
            return;
        }

        // Создаем тестового клиента
        $client = User::create([
            'name' => 'Test Client',
            'email' => 'test@client.com',
            'password' => Hash::make('password'),
            'user_type' => 'client',
            'client_category' => 'corporate',
            'company_name' => 'Test Company Ltd',
            'status' => 'active',
        ]);

        $this->info('Test client created successfully!');
        $this->info('Email: test@client.com');
        $this->info('Password: password');
        $this->info('User ID: ' . $client->id);
        $this->info('Company: ' . $client->company_name);
    }
}