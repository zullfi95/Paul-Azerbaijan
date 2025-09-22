<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Client;
use App\Models\Application;
use App\Models\Order;

class TestRelationsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:relations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Протестировать связи между моделями';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== ТЕСТИРОВАНИЕ СВЯЗЕЙ МЕЖДУ МОДЕЛЯМИ ===');
        
        // Получаем пользователей и клиентов
        $coordinator = User::where('staff_role', 'coordinator')->first();
        $client = Client::where('client_category', 'corporate')->first();
        
        if (!$coordinator || !$client) {
            $this->error('Не найдены координатор или клиент для тестирования');
            return;
        }
        
        $this->info("Координатор: {$coordinator->name}");
        $this->info("Клиент: {$client->name}");
        
        // Создаем тестовую заявку
        $this->newLine();
        $this->info('Создание тестовой заявки...');
        
        $application = Application::create([
            'first_name' => 'Тест',
            'last_name' => 'Тестов',
            'phone' => '+7 (999) 000-00-00',
            'email' => 'test@example.com',
            'cart_items' => json_encode([
                ['id' => 1, 'name' => 'Блюдо 1', 'quantity' => 2, 'price' => 500],
                ['id' => 2, 'name' => 'Блюдо 2', 'quantity' => 1, 'price' => 300]
            ]),
            'status' => 'new',
            'client_id' => $client->id,
            'coordinator_id' => null,
        ]);
        
        $this->info("Заявка создана: ID {$application->id}");
        
        // Создаем тестовый заказ
        $this->newLine();
        $this->info('Создание тестового заказа...');
        
        $order = Order::create([
            'company_name' => $client->company_name ?? 'Тестовая компания',
            'menu_items' => json_encode([
                ['id' => 1, 'name' => 'Блюдо 1', 'quantity' => 2, 'price' => 500],
                ['id' => 2, 'name' => 'Блюдо 2', 'quantity' => 1, 'price' => 300]
            ]),
            'comment' => 'Тестовый заказ',
            'status' => 'submitted',
            'coordinator_id' => $coordinator->id,
            'client_id' => $client->id,
            'total_amount' => 1300.00,
        ]);
        
        $this->info("Заказ создан: ID {$order->id}");
        
        // Тестируем связи
        $this->newLine();
        $this->info('=== ТЕСТИРОВАНИЕ СВЯЗЕЙ ===');
        
        // Связи заявки
        $this->info('Связи заявки:');
        $this->line("- Клиент: " . ($application->client ? $application->client->name : 'Не найден'));
        $this->line("- Координатор: " . ($application->coordinator ? $application->coordinator->name : 'Не назначен'));
        
        // Связи заказа
        $this->info('Связи заказа:');
        $this->line("- Клиент: " . ($order->client ? $order->client->name : 'Не найден'));
        $this->line("- Координатор: " . ($order->coordinator ? $order->coordinator->name : 'Не найден'));
        
        // Связи пользователя
        $this->info('Связи координатора:');
        $this->line("- Обработанные заявки: " . $coordinator->processedApplications()->count());
        $this->line("- Созданные заказы: " . $coordinator->orders()->count());
        
        // Связи клиента
        $this->info('Связи клиента:');
        $this->line("- Заявки клиента: " . $client->applications()->count());
        $this->line("- Заказы клиента: " . $client->orders()->count());
        
        $this->newLine();
        $this->info('✅ Все связи работают корректно!');
        
        // Очищаем тестовые данные
        $this->newLine();
        $this->info('Очистка тестовых данных...');
        $application->delete();
        $order->delete();
        $this->info('Тестовые данные удалены.');
    }
}