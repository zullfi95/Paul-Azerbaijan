<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Создаем координатора (администратора) - ПЕРСОНАЛ
        User::create([
            'name' => 'Эльдар Мамедов',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'staff_role' => 'coordinator',
            'status' => 'active',
            'notification_settings' => json_encode([
                'email' => true,
                'sms' => false,
                'new_applications' => true,
                'order_updates' => true
            ]),
        ]);

        // Создаем наблюдателя - ПЕРСОНАЛ
        User::create([
            'name' => 'Айгюн Алиева',
            'email' => 'observer@example.com',
            'password' => Hash::make('password123'),
            'staff_role' => 'observer',
            'status' => 'active',
            'notification_settings' => json_encode([
                'email' => true,
                'sms' => true,
                'new_applications' => false,
                'order_updates' => true
            ]),
        ]);

        // Создаем корпоративного клиента - КЛИЕНТ
        Client::create([
            'name' => 'Рауф Гусейнов',
            'email' => 'rauf@company.com',
            'password' => Hash::make('password123'),
            'client_category' => 'corporate',
            'company_name' => 'ООО "Технологии будущего"',
            'position' => 'Менеджер по закупкам',
            'phone' => '+7 (999) 234-56-78',
            'address' => 'г. Москва, ул. Ленина, д. 1, оф. 100',
            'status' => 'active',
        ]);

        // Создаем разового клиента - КЛИЕНТ
        Client::create([
            'name' => 'Лейла Ибрагимова',
            'email' => 'leyla@example.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Лейла Ибрагимова',
            'phone' => '+7 (999) 345-67-89',
            'status' => 'active',
        ]);

        $this->command->info('Пользователи созданы успешно!');
        $this->command->info('=== ПЕРСОНАЛ (может войти в админку) ===');
        $this->command->info('Email: admin@example.com, Password: password123 (Координатор - Эльдар Мамедов)');
        $this->command->info('Email: observer@example.com, Password: password123 (Наблюдатель - Айгюн Алиева)');
        $this->command->info('=== КЛИЕНТЫ (НЕ могут войти в админку) ===');
        $this->command->info('Email: rauf@company.com, Password: password123 (Корпоративный клиент - Рауф Гусейнов)');
        $this->command->info('Email: leyla@example.com, Password: password123 (Разовый клиент - Лейла Ибрагимова)');
    }
}
