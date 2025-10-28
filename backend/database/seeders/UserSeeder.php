<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
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
            'user_type' => 'staff',
            'status' => 'active',
        ]);

        // Создаем наблюдателя - ПЕРСОНАЛ
        User::create([
            'name' => 'Айгюн Алиева',
            'email' => 'observer@example.com',
            'password' => Hash::make('password123'),
            'user_type' => 'staff',
            'status' => 'active',
        ]);

        // Создаем корпоративного клиента - КЛИЕНТ
        User::create([
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

        // Создаем второго координатора - ПЕРСОНАЛ
        User::create([
            'name' => 'Али Алиев',
            'email' => 'coordinator2@example.com',
            'password' => Hash::make('password123'),
            'staff_role' => 'coordinator',
            'status' => 'active',
            'notification_settings' => json_encode([
                'email' => true,
                'sms' => true,
                'new_applications' => true,
                'order_updates' => true
            ]),
        ]);

        // Создаем второго наблюдателя - ПЕРСОНАЛ
        User::create([
            'name' => 'Фарида Гасанова',
            'email' => 'observer2@example.com',
            'password' => Hash::make('password123'),
            'staff_role' => 'observer',
            'status' => 'active',
            'notification_settings' => json_encode([
                'email' => true,
                'sms' => false,
                'new_applications' => true,
                'order_updates' => false
            ]),
        ]);

        // Создаем разового клиента - КЛИЕНТ
        User::create([
            'name' => 'Лейла Ибрагимова',
            'email' => 'leyla@example.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Лейла Ибрагимова',
            'phone' => '+7 (999) 345-67-89',
            'status' => 'active',
        ]);

        // Создаем второго корпоративного клиента - КЛИЕНТ
        User::create([
            'name' => 'Марьям Абдуллаева',
            'email' => 'maryam@techcorp.com',
            'password' => Hash::make('password123'),
            'client_category' => 'corporate',
            'company_name' => 'ООО "ТехКорп"',
            'position' => 'Директор по развитию',
            'phone' => '+7 (999) 456-78-90',
            'address' => 'г. Баку, ул. Низами, д. 25, оф. 301',
            'status' => 'active',
        ]);

        // Создаем третьего корпоративного клиента - КЛИЕНТ
        User::create([
            'name' => 'Руслан Мамедов',
            'email' => 'ruslan@innovate.az',
            'password' => Hash::make('password123'),
            'client_category' => 'corporate',
            'company_name' => 'ИП "Инновации"',
            'position' => 'Генеральный директор',
            'phone' => '+7 (999) 567-89-01',
            'address' => 'г. Баку, пр. Азербайджан, д. 10, оф. 15',
            'status' => 'active',
        ]);

        // Создаем второго одноразового клиента - КЛИЕНТ
        User::create([
            'name' => 'Айтен Гусейнова',
            'email' => 'ayten@example.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Айтен Гусейнова',
            'phone' => '+7 (999) 678-90-12',
            'status' => 'active',
        ]);

        // Создаем третьего одноразового клиента - КЛИЕНТ
        User::create([
            'name' => 'Эльвин Алиев',
            'email' => 'elvin@example.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Эльвин Алиев',
            'phone' => '+7 (999) 789-01-23',
            'status' => 'active',
        ]);

        // Создаем четвертого одноразового клиента - КЛИЕНТ
        User::create([
            'name' => 'Гюнель Мамедова',
            'email' => 'gunel@example.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Гюнель Мамедова',
            'phone' => '+7 (999) 890-12-34',
            'status' => 'active',
        ]);

        // Создаем пятого одноразового клиента - КЛИЕНТ
        User::create([
            'name' => 'Тофиг Ибрагимов',
            'email' => 'tofig@example.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Тофиг Ибрагимов',
            'phone' => '+7 (999) 901-23-45',
            'status' => 'active',
        ]);

        $this->command->info('Пользователи созданы успешно!');
        $this->command->info('=== ПЕРСОНАЛ (может войти в админку) ===');
        $this->command->info('Email: admin@example.com, Password: password123 (Координатор - Эльдар Мамедов)');
        $this->command->info('Email: coordinator2@example.com, Password: password123 (Координатор - Али Алиев)');
        $this->command->info('Email: observer@example.com, Password: password123 (Наблюдатель - Айгюн Алиева)');
        $this->command->info('Email: observer2@example.com, Password: password123 (Наблюдатель - Фарида Гасанова)');
        $this->command->info('=== КОРПОРАТИВНЫЕ КЛИЕНТЫ (НЕ могут войти в админку) ===');
        $this->command->info('Email: rauf@company.com, Password: password123 (Корпоративный клиент - Рауф Гусейнов)');
        $this->command->info('Email: maryam@techcorp.com, Password: password123 (Корпоративный клиент - Марьям Абдуллаева)');
        $this->command->info('Email: ruslan@innovate.az, Password: password123 (Корпоративный клиент - Руслан Мамедов)');
        $this->command->info('=== ОДНОРАЗОВЫЕ КЛИЕНТЫ (НЕ могут войти в админку) ===');
        $this->command->info('Email: leyla@example.com, Password: password123 (Одноразовый клиент - Лейла Ибрагимова)');
        $this->command->info('Email: ayten@example.com, Password: password123 (Одноразовый клиент - Айтен Гусейнова)');
        $this->command->info('Email: elvin@example.com, Password: password123 (Одноразовый клиент - Эльвин Алиев)');
        $this->command->info('Email: gunel@example.com, Password: password123 (Одноразовый клиент - Гюнель Мамедова)');
        $this->command->info('Email: tofig@example.com, Password: password123 (Одноразовый клиент - Тофиг Ибрагимов)');
    }
}
