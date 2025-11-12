<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Application;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\DB;

class PerformanceTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Тест производительности создания заказов
     */
    public function test_order_creation_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Создаем 10 заказов
        for ($i = 0; $i < 10; $i++) {
            $response = $this->postJson('/api/orders', [
                'client_id' => $client->id,
                'menu_items' => [
                    [
                        'id' => '1',
                        'name' => "Test Item {$i}",
                        'quantity' => 1,
                        'price' => 25.00,
                    ]
                ],
                'delivery_date' => now()->addDays($i)->format('Y-m-d'),
            ]);

            $response->assertStatus(201);
        }

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        // Проверяем, что создание 10 заказов занимает менее 5 секунд
        $this->assertLessThan(5.0, $executionTime);

        // Проверяем, что все заказы созданы
        $this->assertEquals(10, Order::count());
    }

    /**
     * Тест производительности получения списка заказов
     */
    public function test_order_listing_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        // Создаем 100 заказов
        for ($i = 0; $i < 100; $i++) {
            Order::factory()->create([
                'client_id' => $client->id,
                'coordinator_id' => $coordinator->id,
            ]);
        }

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        $response = $this->getJson('/api/orders');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что получение списка заказов занимает менее 1 секунды
        $this->assertLessThan(1.0, $executionTime);

        // Проверяем, что возвращается правильное количество заказов
        $this->assertEquals(20, count($response->json('data.data'))); // Пагинация по 20
    }

    /**
     * Тест производительности поиска клиентов
     */
    public function test_client_search_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        // Создаем 200 клиентов
        for ($i = 0; $i < 200; $i++) {
            User::factory()->create([
                'user_type' => 'client',
                'name' => "Client {$i}",
                'email' => "client{$i}@example.com",
            ]);
        }

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Тест поиска по имени
        $response = $this->getJson('/api/clients?company_name=Client 1');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что поиск занимает менее 1 секунды
        $this->assertLessThan(1.0, $executionTime);
    }

    /**
     * Тест производительности статистики
     */
    public function test_statistics_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        // Создаем тестовые данные
        for ($i = 0; $i < 50; $i++) {
            $client = User::factory()->create([
                'user_type' => 'client',
            ]);

            Order::factory()->create([
                'client_id' => $client->id,
                'coordinator_id' => $coordinator->id,
            ]);
        }

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        $response = $this->getJson('/api/orders/statistics');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что получение статистики занимает менее 1 секунды
        $this->assertLessThan(1.0, $executionTime);
    }

    /**
     * Тест производительности базы данных
     */
    public function test_database_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $startTime = microtime(true);

        // Тест вставки данных
        for ($i = 0; $i < 100; $i++) {
            User::factory()->create([
                'user_type' => 'client',
            ]);
        }

        $insertTime = microtime(true) - $startTime;

        // Проверяем, что вставка 100 записей занимает менее 2 секунд
        $this->assertLessThan(2.0, $insertTime);

        $startTime = microtime(true);

        // Тест выборки данных
        $clients = User::where('user_type', 'client')->get();

        $selectTime = microtime(true) - $startTime;

        // Проверяем, что выборка 100 записей занимает менее 0.5 секунды
        $this->assertLessThan(0.5, $selectTime);
        $this->assertEquals(100, $clients->count());
    }

    /**
     * Тест производительности API с пагинацией
     */
    public function test_pagination_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        // Создаем 1000 клиентов
        for ($i = 0; $i < 1000; $i++) {
            User::factory()->create([
                'user_type' => 'client',
            ]);
        }

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Тест первой страницы
        $response = $this->getJson('/api/clients?page=1');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что получение первой страницы занимает менее 1 секунды
        $this->assertLessThan(1.0, $executionTime);

        // Проверяем структуру ответа
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'data',
                'current_page',
                'per_page',
                'total',
                'last_page',
            ]
        ]);
    }

    /**
     * Тест производительности сложных запросов
     */
    public function test_complex_query_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        // Создаем сложные данные
        for ($i = 0; $i < 100; $i++) {
            $client = User::factory()->create([
                'user_type' => 'client',
                'client_category' => $i % 2 === 0 ? 'corporate' : 'one_time',
            ]);

            for ($j = 0; $j < 5; $j++) {
                Order::factory()->create([
                    'client_id' => $client->id,
                    'coordinator_id' => $coordinator->id,
                    'status' => ['submitted', 'processing', 'completed'][$j % 3],
                ]);
            }
        }

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Тест сложного запроса с фильтрацией
        $response = $this->getJson('/api/orders?status=processing&client_category=corporate');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что сложный запрос занимает менее 1 секунды
        $this->assertLessThan(1.0, $executionTime);
    }

    /**
     * Тест производительности авторизации
     */
    public function test_authorization_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $order = Order::factory()->create([
            'coordinator_id' => $coordinator->id,
        ]);

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Тест множественных проверок авторизации
        for ($i = 0; $i < 100; $i++) {
            $response = $this->getJson("/api/orders/{$order->id}");
            $response->assertStatus(200);
        }

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        // Проверяем, что 100 проверок авторизации занимают менее 5 секунд
        $this->assertLessThan(5.0, $executionTime);
    }

    /**
     * Тест производительности валидации
     */
    public function test_validation_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Тест множественных валидаций
        for ($i = 0; $i < 50; $i++) {
            $response = $this->postJson('/api/orders', [
                'client_id' => 99999, // Несуществующий клиент для валидации
                'menu_items' => [], // Пустой массив для валидации
            ]);

            $response->assertStatus(422);
        }

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        // Проверяем, что 50 валидаций занимают менее 3 секунд
        $this->assertLessThan(3.0, $executionTime);
    }

    /**
     * Тест производительности уведомлений
     */
    public function test_notification_performance()
    {
        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        Sanctum::actingAs($client);

        $startTime = microtime(true);

        // Тест получения уведомлений
        $response = $this->getJson('/api/client/notifications');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что получение уведомлений занимает менее 0.5 секунды
        $this->assertLessThan(0.5, $executionTime);
    }

    /**
     * Тест производительности интеграций
     */
    public function test_integration_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        Sanctum::actingAs($coordinator);

        $startTime = microtime(true);

        // Тест подключения к IIKO
        $response = $this->getJson('/api/iiko/test-connection');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что тест подключения занимает менее 2 секунд
        $this->assertLessThan(2.0, $executionTime);
    }

    /**
     * Тест производительности поиска по меню
     */
    public function test_menu_search_performance()
    {
        $startTime = microtime(true);

        // Тест поиска по меню
        $response = $this->getJson('/api/menu/search?q=test');

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        $response->assertStatus(200);
        
        // Проверяем, что поиск по меню занимает менее 0.5 секунды
        $this->assertLessThan(0.5, $executionTime);
    }

    /**
     * Тест производительности создания заявок
     */
    public function test_application_creation_performance()
    {
        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        Sanctum::actingAs($client);

        $startTime = microtime(true);

        // Создаем 20 заявок
        for ($i = 0; $i < 20; $i++) {
            $response = $this->postJson('/api/applications', [
                'first_name' => "Test {$i}",
                'phone' => "+123456789{$i}",
                'email' => "test{$i}@example.com",
                'message' => "Test message {$i}",
            ]);

            $response->assertStatus(201);
        }

        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;

        // Проверяем, что создание 20 заявок занимает менее 3 секунд
        $this->assertLessThan(3.0, $executionTime);

        // Проверяем, что все заявки созданы
        $this->assertEquals(20, Application::count());
    }
}
