<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Application;
use App\Models\MenuCategory;
use App\Models\MenuItem;
use App\Services\AlgoritmaService;
use App\Services\IikoService;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

class ComprehensiveSystemTest extends TestCase
{
    use RefreshDatabase;

    private User $coordinator;
    private User $client;
    private User $observer;
    private Order $order;
    private Application $application;

    protected function setUp(): void
    {
        parent::setUp();

        // Создаем тестовых пользователей
        $this->coordinator = User::factory()->staff()->create([
            'status' => 'active',
        ]);

        $this->client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'one_time',
            'status' => 'active',
        ]);

        $this->observer = User::factory()->staff()->create([
            'status' => 'active',
        ]);

        // Создаем тестовые данные
        $this->order = Order::factory()->create([
            'client_id' => $this->client->id,
            'coordinator_id' => $this->coordinator->id,
            'status' => 'pending_payment',
            'final_amount' => 100.00,
        ]);

        $this->application = Application::factory()->create([
            'client_id' => $this->client->id,
            'status' => 'new',
        ]);

        // Создаем тестовое меню
        $this->createTestMenu();
    }

    /**
     * Создание тестового меню
     */
    private function createTestMenu(): void
    {
        $category = MenuCategory::create([
            'name' => 'Test Category',
            'description' => 'Test category description',
            'is_active' => true,
        ]);

        MenuItem::create([
            'category_id' => $category->id,
            'name' => 'Test Item',
            'description' => 'Test item description',
            'price' => 25.00,
            'is_available' => true,
        ]);
    }

    /**
     * Тест 1: Аутентификация и авторизация
     */
    public function test_authentication_and_authorization()
    {
        // Тест регистрации
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'token'
                ]
            ]);

        // Тест входа
        $response = $this->postJson('/api/login', [
            'email' => $this->client->email,
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user',
                    'user_type',
                    'token'
                ]
            ]);

        // Тест получения профиля
        Sanctum::actingAs($this->client);
        $response = $this->getJson('/api/user');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 2: Управление заявками
     */
    public function test_application_management()
    {
        Sanctum::actingAs($this->client);

        // Тест создания заявки
        $response = $this->postJson('/api/applications', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'company_name' => 'Test Company',
            'phone' => '+1234567890',
            'email' => 'john@example.com',
            'message' => 'Test application',
            'event_date' => now()->addDays(7)->format('Y-m-d'),
            'event_time' => '18:00',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Тест получения списка заявок
        $response = $this->getJson('/api/applications');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест обновления статуса заявки (координатором)
        Sanctum::actingAs($this->coordinator);
        $response = $this->patchJson("/api/applications/{$this->application->id}/status", [
            'status' => 'approved',
            'coordinator_comment' => 'Approved by coordinator',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 3: Управление заказами
     */
    public function test_order_management()
    {
        Sanctum::actingAs($this->coordinator);

        // Тест создания заказа
        $response = $this->postJson('/api/orders', [
            'client_id' => $this->client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 2,
                    'price' => 25.00,
                ]
            ],
            'delivery_date' => now()->addDays(3)->format('Y-m-d'),
            'delivery_time' => '12:00',
            'delivery_address' => 'Test Address',
            'kitchen_comment' => 'Test kitchen comment',
            'operation_comment' => 'Test operation comment',
            'desserts_comment' => 'Test desserts comment',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Тест получения списка заказов
        $response = $this->getJson('/api/orders');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест обновления статуса заказа
        $response = $this->patchJson("/api/orders/{$this->order->id}/status", [
            'status' => 'processing',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 4: Управление клиентами
     */
    public function test_client_management()
    {
        Sanctum::actingAs($this->coordinator);

        // Тест создания клиента
        $response = $this->postJson('/api/clients', [
            'name' => 'New Client',
            'email' => 'newclient@example.com',
            'phone' => '+1234567890',
            'client_category' => 'corporate',
            'company_name' => 'Test Company',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Тест получения списка клиентов
        $response = $this->getJson('/api/clients');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест обновления клиента
        $response = $this->putJson("/api/clients/{$this->client->id}", [
            'name' => 'Updated Client Name',
            'phone' => '+9876543210',
        ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 5: Управление пользователями
     */
    public function test_user_management()
    {
        Sanctum::actingAs($this->coordinator);

        // Тест создания пользователя
        $response = $this->postJson('/api/users', [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'user_type' => 'staff',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Тест получения списка пользователей
        $response = $this->getJson('/api/users');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения координаторов
        $response = $this->getJson('/api/coordinators');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 6: Управление меню
     */
    public function test_menu_management()
    {
        // Тест получения категорий меню
        $response = $this->getJson('/api/menu/categories?organization_id=test_org');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения позиций меню
        $response = $this->getJson('/api/menu/items?organization_id=test_org');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения полного меню
        $response = $this->getJson('/api/menu/full?organization_id=test_org');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест поиска по меню
        $response = $this->getJson('/api/menu/search?query=test&organization_id=test_org');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 7: Платежная система
     */
    public function test_payment_system()
    {
        Sanctum::actingAs($this->coordinator);

        // Тест создания платежа
        $response = $this->postJson("/api/payment/orders/{$this->order->id}/create");
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения информации о платеже
        $response = $this->getJson("/api/payment/orders/{$this->order->id}/info");
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест подключения к платежной системе
        $response = $this->getJson('/api/payment/test-connection');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения тестовых карт
        $response = $this->getJson('/api/payment/test-cards');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 8: IIKO интеграция
     */
    public function test_iiko_integration()
    {
        Sanctum::actingAs($this->coordinator);

        // Мокаем HTTP запросы к IIKO
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200),
            'api-ru.iiko.services/api/1/organizations' => Http::response([
                'organizations' => [
                    [
                        'id' => 'org_1',
                        'name' => 'Test Organization',
                    ]
                ]
            ], 200),
        ]);

        // Тест подключения к IIKO
        $response = $this->getJson('/api/iiko/test-connection');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения организаций
        $response = $this->getJson('/api/iiko/organizations');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 9: Статистика и аналитика
     */
    public function test_statistics_and_analytics()
    {
        Sanctum::actingAs($this->coordinator);

        // Тест статистики заказов
        $response = $this->getJson('/api/orders/statistics');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест статистики клиентов
        $response = $this->getJson('/api/clients/statistics');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест статистики пользователей
        $response = $this->getJson('/api/users/statistics');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест статистики меню
        $response = $this->getJson('/api/menu/stats');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 10: Права доступа и безопасность
     */
    public function test_access_control_and_security()
    {
        // Тест доступа без авторизации
        $response = $this->getJson('/api/orders');
        $response->assertStatus(401);

        // Тест доступа клиента к функциям координатора
        Sanctum::actingAs($this->client);
        $response = $this->getJson('/api/users');
        $response->assertStatus(403);

        // Тест доступа наблюдателя к функциям координатора
        Sanctum::actingAs($this->observer);
        $response = $this->postJson('/api/orders', []);
        $response->assertStatus(403);

        // Тест доступа клиента только к своим заказам
        Sanctum::actingAs($this->client);
        $response = $this->getJson('/api/client/orders');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    /**
     * Тест 11: Валидация данных
     */
    public function test_data_validation()
    {
        Sanctum::actingAs($this->client);

        // Тест валидации при создании заявки
        $response = $this->postJson('/api/applications', [
            'first_name' => '', // Пустое имя
            'email' => 'invalid-email', // Неверный email
            'phone' => '', // Пустой телефон
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors'
            ]);

        // Тест валидации при создании заказа
        Sanctum::actingAs($this->coordinator);
        $response = $this->postJson('/api/orders', [
            'menu_items' => [], // Пустой список товаров
            'client_id' => 99999, // Несуществующий клиент
        ]);

        $response->assertStatus(422)
            ->assertJsonStructure([
                'success',
                'message',
                'errors'
            ]);
    }

    /**
     * Тест 12: Обработка ошибок
     */
    public function test_error_handling()
    {
        Sanctum::actingAs($this->coordinator);

        // Тест обращения к несуществующему ресурсу
        $response = $this->getJson('/api/orders/99999');
        $response->assertStatus(404);

        // Тест обращения к несуществующему клиенту
        $response = $this->getJson('/api/clients/99999');
        $response->assertStatus(404);

        // Тест обращения к несуществующей заявке
        $response = $this->getJson('/api/applications/99999');
        $response->assertStatus(404);
    }

    /**
     * Тест 13: Производительность
     */
    public function test_performance()
    {
        Sanctum::actingAs($this->coordinator);

        // Создаем много тестовых данных
        for ($i = 0; $i < 50; $i++) {
            Order::factory()->create([
                'client_id' => $this->client->id,
                'coordinator_id' => $this->coordinator->id,
            ]);
        }

        // Тест производительности получения списка заказов
        $startTime = microtime(true);
        $response = $this->getJson('/api/orders');
        $endTime = microtime(true);

        $response->assertStatus(200);
        $this->assertLessThan(1.0, $endTime - $startTime); // Должно выполняться менее чем за 1 секунду
    }

    /**
     * Тест 14: Интеграционные тесты
     */
    public function test_integration_scenarios()
    {
        Sanctum::actingAs($this->coordinator);

        // Сценарий: Создание заказа из заявки
        $response = $this->postJson("/api/applications/{$this->application->id}/create-order", [
            'client_id' => $this->client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 1,
                    'price' => 25.00,
                ]
            ],
            'delivery_date' => now()->addDays(3)->format('Y-m-d'),
            'delivery_time' => '12:00',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Проверяем, что статус заявки изменился
        $this->application->refresh();
        $this->assertEquals('approved', $this->application->status);
    }

    /**
     * Тест 15: Уведомления
     */
    public function test_notifications()
    {
        Sanctum::actingAs($this->client);

        // Тест получения уведомлений клиента
        $response = $this->getJson('/api/client/notifications');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        // Тест получения количества непрочитанных уведомлений
        $response = $this->getJson('/api/client/notifications/unread-count');
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }
}
