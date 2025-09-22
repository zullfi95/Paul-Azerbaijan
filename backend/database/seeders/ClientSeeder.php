<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Client;
use Illuminate\Support\Facades\Hash;

class ClientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Создаем дополнительных корпоративных клиентов
        Client::create([
            'name' => 'Анна Петрова',
            'email' => 'anna.petrova@techcorp.ru',
            'password' => Hash::make('password123'),
            'client_category' => 'corporate',
            'company_name' => 'ООО "ТехКорп"',
            'position' => 'Директор по закупкам',
            'phone' => '+7 (495) 123-45-67',
            'address' => 'г. Москва, ул. Тверская, д. 10, оф. 205',
            'status' => 'active',
        ]);

        Client::create([
            'name' => 'Михаил Сидоров',
            'email' => 'mikhail.sidorov@innovate.com',
            'password' => Hash::make('password123'),
            'client_category' => 'corporate',
            'company_name' => 'ИП "Инновации"',
            'position' => 'Менеджер',
            'phone' => '+7 (812) 987-65-43',
            'address' => 'г. Санкт-Петербург, Невский проспект, д. 50',
            'status' => 'active',
        ]);

        // Создаем дополнительных разовых клиентов
        Client::create([
            'name' => 'Елена Козлова',
            'email' => 'elena.kozlova@gmail.com',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Елена Козлова',
            'phone' => '+7 (999) 111-22-33',
            'address' => 'г. Казань, ул. Баумана, д. 25, кв. 10',
            'status' => 'active',
        ]);

        Client::create([
            'name' => 'Дмитрий Волков',
            'email' => 'dmitry.volkov@yandex.ru',
            'password' => Hash::make('password123'),
            'client_category' => 'one_time',
            'contact_person' => 'Дмитрий Волков',
            'phone' => '+7 (999) 444-55-66',
            'address' => 'г. Екатеринбург, ул. Ленина, д. 15',
            'status' => 'inactive',
        ]);

        // Создаем приостановленного клиента
        Client::create([
            'name' => 'Ольга Морозова',
            'email' => 'olga.morozova@mail.ru',
            'password' => Hash::make('password123'),
            'client_category' => 'corporate',
            'company_name' => 'ООО "Мороз и Ко"',
            'position' => 'Закупщик',
            'phone' => '+7 (999) 777-88-99',
            'address' => 'г. Новосибирск, ул. Красный проспект, д. 30',
            'status' => 'suspended',
        ]);

        $this->command->info('Дополнительные клиенты созданы успешно!');
        $this->command->info('=== ДОПОЛНИТЕЛЬНЫЕ КЛИЕНТЫ ===');
        $this->command->info('Корпоративные:');
        $this->command->info('- anna.petrova@techcorp.ru (Анна Петрова, ТехКорп)');
        $this->command->info('- mikhail.sidorov@innovate.com (Михаил Сидоров, Инновации)');
        $this->command->info('Разовые:');
        $this->command->info('- elena.kozlova@gmail.com (Елена Козлова)');
        $this->command->info('- dmitry.volkov@yandex.ru (Дмитрий Волков, неактивный)');
        $this->command->info('Приостановленный:');
        $this->command->info('- olga.morozova@mail.ru (Ольга Морозова, Мороз и Ко)');
    }
}