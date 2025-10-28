<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Services\AlgoritmaService;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

class PaymentControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $coordinator;
    private User $client;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        // Create test users
        $this->coordinator = User::factory()->create([
            'user_type' => 'staff',
            'user_type' => 'staff',
            'status' => 'active',
        ]);

        $this->client = User::factory()->create([
            'user_type' => 'client',
            'client_category' => 'one_time',
            'status' => 'active',
        ]);

        // Create test order
        $this->order = Order::factory()->create([
            'client_id' => $this->client->id,
            'coordinator_id' => $this->coordinator->id,
            'status' => 'submitted',
            'final_amount' => 100.00,
            'payment_status' => 'pending',
            'payment_attempts' => 0
        ]);
        // ensure relation consistency
        $this->order->unsetRelation('client');

        // Mock Algoritma service
        $this->mock(AlgoritmaService::class, function ($mock) {
            $mock->shouldReceive('createOrder')
                ->andReturn([
                    'success' => true,
                    'order_id' => '123456789',
                    'payment_url' => 'https://payment.example.com/pay/123456789'
                ]);
            
            $mock->shouldReceive('checkPaymentStatus')
                ->andReturn([
                    'success' => true,
                    'payment_status' => 'charged',
                    'amount_charged' => '100.00',
                    'data' => ['auth_code' => 'AUTH123']
                ]);
        });

        // Mock Notification service
        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('sendPaymentSuccessNotification');
            $mock->shouldReceive('sendNewOrderNotifications');
        });
    }

    /**
     * Test successful payment creation
     */
    public function test_create_payment_success()
    {
        Sanctum::actingAs($this->coordinator);

        $response = $this->postJson("/api/payment/orders/{$this->order->id}/create");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Платеж создан успешно'
            ])
            ->assertJsonStructure([
                'data' => [
                    'payment_url',
                    'order_id',
                    'attempts'
                ]
            ]);

        // Check order was updated
        $this->order->refresh();
        $this->assertEquals('123456789', $this->order->algoritma_order_id);
        $this->assertEquals('https://payment.example.com/pay/123456789', $this->order->payment_url);
        $this->assertEquals(1, $this->order->payment_attempts);
    }

    /**
     * Test payment creation when order cannot be paid
     */
    public function test_create_payment_order_not_payable()
    {
        $this->order->update(['status' => 'completed']);
        Sanctum::actingAs($this->coordinator);

        $response = $this->postJson("/api/payment/orders/{$this->order->id}/create");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Заказ не может быть оплачен в текущем статусе'
            ]);
    }

    /**
     * Test payment creation when max attempts reached
     */
    public function test_create_payment_max_attempts_reached()
    {
        $this->order->update(['payment_attempts' => 3]);
        Sanctum::actingAs($this->coordinator);

        $response = $this->postJson("/api/payment/orders/{$this->order->id}/create");

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Превышен лимит попыток оплаты (3 попытки)'
            ]);
    }

    /**
     * Test successful payment handling
     */
    public function test_handle_success()
    {
        $this->order->update([
            'algoritma_order_id' => '123456789',
            'payment_status' => 'pending'
        ]);
        Sanctum::actingAs($this->coordinator);

        // Mock successful payment status
        $this->mock(AlgoritmaService::class, function ($mock) {
            $mock->shouldReceive('checkPaymentStatus')
                ->andReturn([
                    'success' => true,
                    'payment_status' => 'charged',
                    'amount_charged' => '100.00',
                    'data' => ['transaction_id' => 'txn_123']
                ]);
        });

        // Mock NotificationService
        $this->mock(NotificationService::class, function ($mock) {
            $mock->shouldReceive('sendPaymentSuccessNotification')->once();
            $mock->shouldReceive('sendNewOrderNotifications')->once();
        });

        $response = $this->postJson("/api/payment/orders/{$this->order->id}/success");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Статус платежа обновлен'
            ]);

        // Check order was updated
        $this->order->refresh();
        $this->assertEquals('charged', $this->order->payment_status);
        $this->assertEquals('paid', $this->order->status);
    }

    /**
     * Test failure payment handling
     */
    public function test_handle_failure()
    {
        $this->order->update([
            'algoritma_order_id' => '123456789',
            'payment_status' => 'pending'
        ]);
        Sanctum::actingAs($this->coordinator);

        // Mock failed payment status
        $this->mock(AlgoritmaService::class, function ($mock) {
            $mock->shouldReceive('checkPaymentStatus')
                ->andReturn([
                    'success' => true,
                    'payment_status' => 'failed',
                    'data' => ['error' => 'Card declined']
                ]);
        });

        $response = $this->postJson("/api/payment/orders/{$this->order->id}/failure");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Статус неуспешного платежа обработан'
            ]);

        // Check order was updated
        $this->order->refresh();
        $this->assertEquals('failed', $this->order->payment_status);
    }

    /**
     * Test get payment info
     */
    public function test_get_payment_info()
    {
        $this->order->update([
            'algoritma_order_id' => '123456789',
            'payment_status' => 'charged'
        ]);
        Sanctum::actingAs($this->coordinator);

        $response = $this->getJson("/api/payment/orders/{$this->order->id}/info");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'data' => [
                    'order_id',
                    'payment_status',
                    'order_status',
                    'amount',
                    'amount_charged',
                    'attempts',
                    'can_retry',
                    'payment_url',
                    'created_at',
                    'completed_at',
                    'details'
                ]
            ]);
    }

    /**
     * Test get payment info when no payment exists
     */
    public function test_get_payment_info_no_payment()
    {
        Sanctum::actingAs($this->coordinator);

        $response = $this->getJson("/api/payment/orders/{$this->order->id}/info");

        $response->assertStatus(404)
            ->assertJson([
                'success' => false,
                'message' => 'Заказ не имеет связанного платежа'
            ]);
    }

    /**
     * Test test connection endpoint
     */
    public function test_test_connection()
    {
        Sanctum::actingAs($this->coordinator);

        $this->mock(AlgoritmaService::class, function ($mock) {
            $mock->shouldReceive('testConnection')
                ->andReturn([
                    'success' => true,
                    'message' => 'PONG!',
                    'date' => '2023-09-30 10:00:00'
                ]);
        });

        $response = $this->getJson('/api/payment/test-connection');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Подключение успешно'
            ]);
    }

    /**
     * Test get test cards endpoint
     */
    public function test_get_test_cards()
    {
        Sanctum::actingAs($this->coordinator);

        // Mock AlgoritmaService getTestCards method
        $this->mock(AlgoritmaService::class, function ($mock) {
            $mock->shouldReceive('getTestCards')
                ->andReturn([
                    'success' => [
                        'number' => '4111111111111111',
                        'description' => 'Success authorization'
                    ],
                    'success_2' => [
                        'number' => '2222400060000007',
                        'description' => 'Success authorization'
                    ],
                    'declined' => [
                        'number' => '4276990011343663',
                        'description' => 'Non 3-D Secure: declined authorization; 3-D Secure: "Unable to verify enrollment" scenario'
                    ],
                    'error' => [
                        'number' => '5555555555555599',
                        'description' => 'Internal system error'
                    ],
                    'not_enrolled' => [
                        'number' => '4276838748917319',
                        'description' => '3-D Secure scenario "Not enrolled"'
                    ],
                    'fraud' => [
                        'number' => '4000000000000002',
                        'description' => 'Declined as fraud'
                    ]
                ]);
        });

        $response = $this->getJson('/api/payment/test-cards');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true
            ])
            ->assertJsonStructure([
                'data' => [
                    'success',
                    'success_2',
                    'declined',
                    'error',
                    'not_enrolled',
                    'fraud'
                ]
            ]);
    }

    /**
     * Test unauthorized access
     */
    public function test_unauthorized_access()
    {
        $response = $this->postJson("/api/payment/orders/{$this->order->id}/create");

        $response->assertStatus(401);
    }

    /**
     * Test client access to payment endpoints
     */
    public function test_client_access_denied()
    {
        Sanctum::actingAs($this->client);

        $response = $this->postJson("/api/payment/orders/{$this->order->id}/create");

        $response->assertStatus(403);
    }
}