<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Application;
use App\Http\Requests\CreateOrderRequest;
use App\Http\Requests\CreateApplicationRequest;
use App\Http\Requests\CreateClientRequest;
use App\Policies\OrderPolicy;
use App\Policies\ApplicationPolicy;
use App\Policies\UserPolicy;
use App\Services\AlgoritmaService;
use App\Services\IikoService;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

class AdvancedSystemTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Тест Form Request классов
     */
    public function test_form_request_classes()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        // Тест CreateOrderRequest
        $request = new CreateOrderRequest();
        $request->setUserResolver(function () use ($coordinator) {
            return $coordinator;
        });

        $this->assertTrue($request->authorize());

        // Тест CreateApplicationRequest
        $request = new CreateApplicationRequest();
        $request->setUserResolver(function () use ($client) {
            return $client;
        });

        $this->assertTrue($request->authorize());

        // Тест CreateClientRequest
        $request = new CreateClientRequest();
        $request->setUserResolver(function () use ($coordinator) {
            return $coordinator;
        });

        $this->assertTrue($request->authorize());
    }

    /**
     * Тест Policy классов
     */
    public function test_policy_classes()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        $order = Order::factory()->create([
            'client_id' => $client->id,
        ]);

        $application = Application::factory()->create([
            'client_id' => $client->id,
        ]);

        // Тест OrderPolicy
        $orderPolicy = new OrderPolicy();
        $this->assertTrue($orderPolicy->viewAny($coordinator));
        $this->assertTrue($orderPolicy->view($coordinator, $order));
        $this->assertTrue($orderPolicy->create($coordinator));
        $this->assertTrue($orderPolicy->update($coordinator, $order));
        $this->assertTrue($orderPolicy->delete($coordinator, $order));

        // Тест ApplicationPolicy
        $applicationPolicy = new ApplicationPolicy();
        $this->assertTrue($applicationPolicy->viewAny($coordinator));
        $this->assertTrue($applicationPolicy->view($coordinator, $application));
        $this->assertTrue($applicationPolicy->create($client));
        $this->assertTrue($applicationPolicy->update($coordinator, $application));

        // Тест UserPolicy
        $userPolicy = new UserPolicy();
        $this->assertTrue($userPolicy->viewAny($coordinator));
        $this->assertTrue($userPolicy->view($coordinator, $client));
        $this->assertTrue($userPolicy->create($coordinator));
        $this->assertTrue($userPolicy->update($coordinator, $client));
    }

    /**
     * Тест трейтов
     */
    public function test_traits_functionality()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        Sanctum::actingAs($coordinator);

        // Тест HandlesJsonData трейта через OrderController
        $jsonData = [
            'client_id' => $coordinator->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 2,
                    'price' => 25.00,
                ]
            ],
            'delivery_date' => now()->addDays(3)->format('Y-m-d'),
        ];

        $response = $this->postJson('/api/orders', $jsonData);
        $response->assertStatus(201)
            ->assertJson(['success' => true]);

        // Тест HandlesOrderCalculations трейта
        $order = Order::latest()->first();
        $this->assertNotNull($order->subtotal);
        $this->assertNotNull($order->final_amount);
    }

    /**
     * Тест BaseApiController
     */
    public function test_base_api_controller()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        Sanctum::actingAs($coordinator);

        // Тест успешного ответа
        $response = $this->getJson('/api/users');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data'
            ]);

        // Тест ответа об ошибке
        $response = $this->getJson('/api/users/99999');
        $response->assertStatus(404)
            ->assertJsonStructure([
                'success',
                'message'
            ]);
    }

    /**
     * Тест AlgoritmaService
     */
    public function test_algoritma_service()
    {
        // Настраиваем конфигурацию для тестирования
        config([
            'services.algoritma.api_key' => 'your_api_key',
            'services.algoritma.api_secret' => 'your_api_secret',
            'services.algoritma.base_url' => 'https://test.example.com',
            'services.algoritma.environment' => 'test',
        ]);

        // Мокаем HTTP запросы
        Http::fake([
            'test.example.com/api/orders' => Http::response([
                'success' => true,
                'order_id' => 'test_order_123',
                'payment_url' => 'https://test.example.com/pay/test_order_123',
            ], 200),
            'test.example.com/api/orders/test_order_123' => Http::response([
                'success' => true,
                'data' => [
                    'order_id' => 'test_order_123',
                    'status' => 'pending',
                    'amount' => '100.00',
                ]
            ], 200),
        ]);

        $algoritmaService = new AlgoritmaService();

        // Тест создания заказа
        $result = $algoritmaService->createOrder([
            'amount' => '100.00',
            'currency' => 'USD',
            'merchant_order_id' => '123',
            'description' => 'Test order',
        ]);

        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('order_id', $result);

        // Тест получения информации о заказе
        $result = $algoritmaService->getOrderInfo('test_order_123');
        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('data', $result);
    }

    /**
     * Тест IikoService
     */
    public function test_iiko_service()
    {
        // Мокаем HTTP запросы
        Http::fake([
            'api-ru.iiko.services/api/1/access_token' => Http::response([
                'token' => 'test_token_123'
            ], 200),
            'api-ru.iiko.services/api/1/organizations' => Http::response([
                'organizations' => [
                    [
                        'id' => 'org_1',
                        'name' => 'Test Organization',
                        'isActive' => true,
                    ]
                ]
            ], 200),
            'api-ru.iiko.services/api/1/organizations/org_1/menu' => Http::response([
                'groups' => [
                    [
                        'id' => 'group_1',
                        'name' => 'Test Group',
                        'items' => [
                            [
                                'id' => 'item_1',
                                'name' => 'Test Item',
                                'price' => 25.00,
                            ]
                        ]
                    ]
                ]
            ], 200),
        ]);

        $iikoService = new IikoService();

        // Тест получения токена
        $result = $iikoService->getAccessToken();
        $this->assertNotNull($result);

        // Тест получения организаций
        $result = $iikoService->getOrganizations();
        $this->assertIsArray($result);

        // Тест получения меню
        $result = $iikoService->getMenu('org_1');
        $this->assertIsArray($result);
    }

    /**
     * Тест NotificationService
     */
    public function test_notification_service()
    {
        $client = User::factory()->create([
            'user_type' => 'client',
            'email' => 'test@example.com',
        ]);

        $order = Order::factory()->create([
            'client_id' => $client->id,
        ]);

        $application = Application::factory()->create([
            'client_id' => $client->id,
        ]);

        $notificationService = new NotificationService();

        // Тест отправки уведомления о новом заказе
        $notificationService->sendNewOrderNotifications($order);
        $this->assertTrue(true); // Метод не возвращает значение

        // Тест отправки уведомления об успешной оплате
        $notificationService->sendPaymentSuccessNotification($order);
        $this->assertTrue(true); // Метод не возвращает значение

        // Тест отправки уведомления о новой заявке
        $notificationService->sendNewApplicationNotifications($application);
        $this->assertTrue(true); // Метод не возвращает значение
    }

    /**
     * Тест валидации данных в Form Request
     */
    public function test_form_request_validation()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        Sanctum::actingAs($coordinator);

        // Тест валидации CreateOrderRequest
        $response = $this->postJson('/api/orders', [
            'menu_items' => [], // Пустой массив товаров
            'client_id' => 99999, // Несуществующий клиент
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['menu_items', 'client_id']);

        // Тест валидации CreateClientRequest
        $response = $this->postJson('/api/clients', [
            'name' => '', // Пустое имя
            'email' => 'invalid-email', // Неверный email
            'client_category' => 'invalid_category', // Неверная категория
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'client_category']);
    }

    /**
     * Тест авторизации через Policy
     */
    public function test_policy_authorization()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
        ]);

        $order = Order::factory()->create([
            'client_id' => $client->id,
            'coordinator_id' => $coordinator->id,
        ]);

        // Тест доступа координатора к заказу
        Sanctum::actingAs($coordinator);
        $response = $this->getJson("/api/orders/{$order->id}");
        $response->assertStatus(200);

        // Тест доступа клиента к своему заказу
        Sanctum::actingAs($client);
        $response = $this->getJson("/api/orders/{$order->id}");
        $response->assertStatus(200);

        // Тест доступа клиента к чужому заказу
        $otherClient = User::factory()->create([
            'user_type' => 'client',
        ]);
        Sanctum::actingAs($otherClient);
        $response = $this->getJson("/api/orders/{$order->id}");
        $response->assertStatus(403);
    }

    /**
     * Тест обработки исключений
     */
    public function test_exception_handling()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        Sanctum::actingAs($coordinator);

        // Тест обработки несуществующего ресурса
        $response = $this->getJson('/api/orders/99999');
        $response->assertStatus(404);

        // Тест обработки неверного метода
        $response = $this->patchJson('/api/orders/99999', []);
        $response->assertStatus(404);
    }

    /**
     * Тест производительности API
     */
    public function test_api_performance()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        // Создаем много тестовых данных
        for ($i = 0; $i < 100; $i++) {
            User::factory()->create([
                'user_type' => 'client',
            ]);
        }

        Sanctum::actingAs($coordinator);

        // Тест производительности получения списка клиентов
        $startTime = microtime(true);
        $response = $this->getJson('/api/clients');
        $endTime = microtime(true);

        $response->assertStatus(200);
        $this->assertLessThan(2.0, $endTime - $startTime); // Должно выполняться менее чем за 2 секунды
    }

    /**
     * Тест безопасности API
     */
    public function test_api_security()
    {
        // Тест доступа без токена
        $response = $this->getJson('/api/orders');
        $response->assertStatus(401);

        // Тест доступа с неверным токеном
        $response = $this->withHeaders([
            'Authorization' => 'Bearer invalid_token',
        ])->getJson('/api/orders');
        $response->assertStatus(401);

        // Тест доступа неактивного пользователя
        $inactiveUser = User::factory()->create([
            'user_type' => 'client',
            'status' => 'inactive',
        ]);

        Sanctum::actingAs($inactiveUser);
        $response = $this->getJson('/api/client/orders');
        $response->assertStatus(403);
    }

    /**
     * Тест интеграционных сценариев
     */
    public function test_integration_scenarios()
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'one_time',
        ]);

        Sanctum::actingAs($coordinator);

        // Сценарий: Создание заказа и платежа
        $orderResponse = $this->postJson('/api/orders', [
            'client_id' => $client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 1,
                    'price' => 100.00,
                ]
            ],
            'delivery_date' => now()->addDays(3)->format('Y-m-d'),
        ]);

        $orderResponse->assertStatus(201);
        $orderId = $orderResponse->json('data.order.id');

        // Устанавливаем статус заказа для оплаты
        $order = Order::find($orderId);
        $order->update(['status' => 'pending_payment']);

        // Создание платежа
        $paymentResponse = $this->postJson("/api/payment/orders/{$orderId}/create");
        $paymentResponse->assertStatus(200)
            ->assertJson(['success' => true]);

        // Проверяем, что заказ обновился
        $order = Order::find($orderId);
        $this->assertNotNull($order->algoritma_order_id);
        $this->assertNotNull($order->payment_url);
    }
}
