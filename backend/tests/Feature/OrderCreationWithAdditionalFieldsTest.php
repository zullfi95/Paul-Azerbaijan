<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderCreationWithAdditionalFieldsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Запускаем миграции с сидами
        $this->artisan('migrate:fresh');
        
        // Создаем таблицу sessions для тестов
        $this->artisan('session:table');
        $this->artisan('migrate');
    }

    /**
     * Тест создания заказа с новыми полями (equipment_required, staff_assigned, special_instructions)
     */
    public function test_order_creation_with_additional_fields(): void
    {
        // Создаем координатора
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
            'status' => 'active',
            'email' => 'coordinator@test.com'
        ]);

        // Создаем клиента
        $client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'corporate',
            'company_name' => 'Test Company',
            'email' => 'client@test.com'
        ]);

        // Данные для создания заказа с новыми полями
        $orderData = [
            'client_id' => $client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 2,
                    'price' => 50.00
                ]
            ],
            'delivery_date' => '2025-10-15',
            'delivery_time' => '14:00',
            'delivery_type' => 'delivery',
            'delivery_address' => 'Test Address 123',
            'delivery_cost' => 10.00,
            'discount_fixed' => 5.00,
            'discount_percent' => 10,
            'comment' => 'Test order comment',
            
            // Новые поля
            'equipment_required' => 5,
            'staff_assigned' => 3,
            'special_instructions' => 'Нужны столы и стулья, особое внимание к сервировке',
        ];

        // Отправляем запрос на создание заказа
        $response = $this->actingAs($coordinator)
            ->postJson('/api/orders', $orderData);

        // Проверяем успешный ответ
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Заказ успешно создан',
            ]);

        // Проверяем что заказ создан в БД
        $this->assertDatabaseHas('orders', [
            'client_id' => $client->id,
            'coordinator_id' => $coordinator->id,
            'delivery_address' => 'Test Address 123',
            'delivery_cost' => 10.00,
            'discount_fixed' => 5.00,
            'discount_percent' => 10,
            'equipment_required' => 5,
            'staff_assigned' => 3,
            'special_instructions' => 'Нужны столы и стулья, особое внимание к сервировке',
        ]);

        // Получаем созданный заказ
        $order = Order::where('client_id', $client->id)->first();
        
        // Проверяем типы данных
        $this->assertIsInt($order->equipment_required);
        $this->assertIsInt($order->staff_assigned);
        $this->assertIsString($order->special_instructions);
        
        // Проверяем значения
        $this->assertEquals(5, $order->equipment_required);
        $this->assertEquals(3, $order->staff_assigned);
        $this->assertEquals('Нужны столы и стулья, особое внимание к сервировке', $order->special_instructions);
    }

    /**
     * Тест создания заказа с нулевыми значениями новых полей
     */
    public function test_order_creation_with_zero_additional_fields(): void
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
            'status' => 'active',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'one_time',
        ]);

        $orderData = [
            'client_id' => $client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 1,
                    'price' => 30.00
                ]
            ],
            'delivery_date' => '2025-10-20',
            'delivery_time' => '12:00',
            'delivery_type' => 'pickup',
            'equipment_required' => 0,
            'staff_assigned' => 0,
        ];

        $response = $this->actingAs($coordinator)
            ->postJson('/api/orders', $orderData);

        $response->assertStatus(201);

        $order = Order::where('client_id', $client->id)->first();
        $this->assertEquals(0, $order->equipment_required);
        $this->assertEquals(0, $order->staff_assigned);
    }

    /**
     * Тест создания заказа без указания новых полей (должны использоваться значения по умолчанию)
     */
    public function test_order_creation_without_additional_fields(): void
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
            'status' => 'active',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'corporate',
        ]);

        $orderData = [
            'client_id' => $client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 1,
                    'price' => 100.00
                ]
            ],
            'delivery_date' => '2025-11-01',
            'delivery_time' => '18:00',
        ];

        $response = $this->actingAs($coordinator)
            ->postJson('/api/orders', $orderData);

        $response->assertStatus(201);

        $order = Order::where('client_id', $client->id)->first();
        
        // Проверяем значения по умолчанию
        $this->assertEquals(0, $order->equipment_required);
        $this->assertEquals(0, $order->staff_assigned);
        $this->assertNull($order->special_instructions);
    }

    /**
     * Тест валидации: отрицательные значения должны быть отклонены
     */
    public function test_validation_rejects_negative_values(): void
    {
        $coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
            'status' => 'active',
        ]);

        $client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'corporate',
        ]);

        $orderData = [
            'client_id' => $client->id,
            'menu_items' => [
                [
                    'id' => '1',
                    'name' => 'Test Item',
                    'quantity' => 1,
                    'price' => 50.00
                ]
            ],
            'delivery_date' => '2025-10-15',
            'equipment_required' => -5, // Отрицательное значение
            'staff_assigned' => -3, // Отрицательное значение
        ];

        $response = $this->actingAs($coordinator)
            ->postJson('/api/orders', $orderData);

        // Ожидаем ошибку валидации
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['equipment_required', 'staff_assigned']);
    }
}