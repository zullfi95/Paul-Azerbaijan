<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Client;

class CheckUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'check:users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Проверить созданных пользователей и клиентов';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== ПРОВЕРКА ПОЛЬЗОВАТЕЛЕЙ И КЛИЕНТОВ ===');
        
        // Проверяем пользователей персонала
        $this->info('Пользователи персонала:');
        $users = User::all();
        foreach ($users as $user) {
            $this->line("- {$user->name} ({$user->email}) - {$user->getStaffRoleDisplayName()} - {$user->status}");
        }
        
        $this->newLine();
        
        // Проверяем клиентов
        $this->info('Клиенты:');
        $clients = Client::all();
        foreach ($clients as $client) {
            $category = $client->isCorporate() ? 'Корпоративный' : 'Разовый';
            $this->line("- {$client->name} ({$client->email}) - {$category} - {$client->status}");
            if ($client->isCorporate()) {
                $this->line("  Компания: {$client->company_name}, Должность: {$client->position}");
            }
        }
        
        $this->newLine();
        $this->info("Всего пользователей персонала: " . User::count());
        $this->info("Всего клиентов: " . Client::count());
        
        // Проверяем методы моделей
        $this->newLine();
        $this->info('=== ПРОВЕРКА МЕТОДОВ МОДЕЛЕЙ ===');
        
        $coordinator = User::where('staff_role', 'coordinator')->first();
        if ($coordinator) {
            $this->info("Координатор {$coordinator->name}:");
            $this->line("- isStaff(): " . ($coordinator->isStaff() ? 'true' : 'false'));
            $this->line("- isCoordinator(): " . ($coordinator->isCoordinator() ? 'true' : 'false'));
            $this->line("- isObserver(): " . ($coordinator->isObserver() ? 'true' : 'false'));
            $this->line("- isActive(): " . ($coordinator->isActive() ? 'true' : 'false'));
        }
        
        $corporateClient = Client::where('client_category', 'corporate')->first();
        if ($corporateClient) {
            $this->info("Корпоративный клиент {$corporateClient->name}:");
            $this->line("- isCorporate(): " . ($corporateClient->isCorporate() ? 'true' : 'false'));
            $this->line("- isOneTime(): " . ($corporateClient->isOneTime() ? 'true' : 'false'));
            $this->line("- isActive(): " . ($corporateClient->isActive() ? 'true' : 'false'));
        }
    }
}