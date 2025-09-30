<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Services\AlgoritmaService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AlgoritmaServiceTest extends TestCase
{
    private AlgoritmaService $algoritmaService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Set test environment variables
        config([
            'services.algoritma.api_key' => 'test_api_key',
            'services.algoritma.api_secret' => 'test_api_secret',
            'services.algoritma.base_url' => 'https://api.box:5001',
            'services.algoritma.environment' => 'test',
        ]);
        
        $this->algoritmaService = new AlgoritmaService();
    }

    /**
     * Test connection to Algoritma API
     */
    public function test_connection_success()
    {
        Http::fake([
            '*/ping' => Http::response([
                'message' => 'PONG!',
                'date' => '2023-09-30 10:00:00'
            ], 200)
        ]);

        $result = $this->algoritmaService->testConnection();

        $this->assertTrue($result['success']);
        $this->assertEquals('PONG!', $result['message']);
    }

    /**
     * Test connection failure
     */
    public function test_connection_failure()
    {
        Http::fake([
            '*/ping' => Http::response([], 500)
        ]);

        $result = $this->algoritmaService->testConnection();

        $this->assertFalse($result['success']);
        $this->assertEquals('Connection failed', $result['error']);
    }

    /**
     * Test successful order creation
     */
    public function test_create_order_success()
    {
        Http::fake([
            '*/orders/create' => Http::response([
                'orders' => [
                    [
                        'id' => '123456789',
                        'amount' => '100.00',
                        'status' => 'new'
                    ]
                ]
            ], 201, [
                'Location' => 'https://payment.example.com/pay/123456789'
            ])
        ]);

        $orderData = [
            'amount' => '100.00',
            'currency' => 'USD',
            'merchant_order_id' => '1',
            'description' => 'Test order',
            'client' => [
                'name' => 'Test Client',
                'email' => 'test@example.com'
            ],
            'location' => [
                'ip' => '127.0.0.1'
            ],
            'return_url' => 'https://example.com/success'
        ];

        $result = $this->algoritmaService->createOrder($orderData);

        $this->assertTrue($result['success']);
        $this->assertEquals('123456789', $result['order_id']);
        $this->assertStringContainsString('payment.example.com', $result['payment_url']);
    }

    /**
     * Test order creation failure
     */
    public function test_create_order_failure()
    {
        Http::fake([
            '*/orders/create' => Http::response([
                'failure_type' => 'validation',
                'failure_message' => 'Required field missing'
            ], 422)
        ]);

        $orderData = [
            'amount' => '100.00',
            'currency' => 'USD',
            'merchant_order_id' => '1',
            'description' => 'Test order'
        ];

        $result = $this->algoritmaService->createOrder($orderData);

        $this->assertFalse($result['success']);
        $this->assertEquals('Service unavailable', $result['error']);
    }

    /**
     * Test get order info success
     */
    public function test_get_order_info_success()
    {
        Http::fake([
            '*/orders/123456789' => Http::response([
                'orders' => [
                    [
                        'id' => '123456789',
                        'amount' => '100.00',
                        'status' => 'charged',
                        'amount_charged' => '100.00',
                        'amount_refunded' => '0.00',
                        'operations' => [
                            [
                                'type' => 'authorize',
                                'status' => 'success',
                                'amount' => '100.00'
                            ],
                            [
                                'type' => 'charge',
                                'status' => 'success',
                                'amount' => '100.00'
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);

        $result = $this->algoritmaService->getOrderInfo('123456789');

        $this->assertTrue($result['success']);
        $this->assertEquals('123456789', $result['data']['orders'][0]['id']);
    }

    /**
     * Test check payment status - charged
     */
    public function test_check_payment_status_charged()
    {
        Http::fake([
            'https://api.box:5001/orders/123456789*' => Http::response([
                'orders' => [
                    [
                        'id' => '123456789',
                        'status' => 'charged',
                        'amount_charged' => '100.00',
                        'amount_refunded' => '0.00',
                        'operations' => [
                            [
                                'type' => 'charge',
                                'status' => 'success',
                                'amount' => '100.00'
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);

        $result = $this->algoritmaService->checkPaymentStatus('123456789');

        $this->assertTrue($result['success']);
        $this->assertEquals('charged', $result['payment_status']);
        $this->assertEquals('100.00', $result['amount_charged']);
    }

    /**
     * Test check payment status - failed
     */
    public function test_check_payment_status_failed()
    {
        Http::fake([
            'https://api.box:5001/orders/123456789*' => Http::response([
                'orders' => [
                    [
                        'id' => '123456789',
                        'status' => 'declined',
                        'amount_charged' => '0.00',
                        'amount_refunded' => '0.00',
                        'operations' => [
                            [
                                'type' => 'authorize',
                                'status' => 'failure',
                                'amount' => '100.00'
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);

        $result = $this->algoritmaService->checkPaymentStatus('123456789');

        $this->assertTrue($result['success']);
        $this->assertEquals('failed', $result['payment_status']);
    }

    /**
     * Test get test cards
     */
    public function test_get_test_cards()
    {
        $testCards = $this->algoritmaService->getTestCards();

        $this->assertIsArray($testCards);
        $this->assertArrayHasKey('success', $testCards);
        $this->assertArrayHasKey('declined', $testCards);
        $this->assertArrayHasKey('fraud', $testCards);
        $this->assertEquals('4111111111111111', $testCards['success']['number']);
    }

    /**
     * Test order status mapping - authorized
     */
    public function test_order_status_mapping_authorized()
    {
        Http::fake([
            'https://api.box:5001/orders/123456789*' => Http::response([
                'orders' => [
                    [
                        'id' => '123456789',
                        'status' => 'authorized',
                        'amount_charged' => '0.00',
                        'amount_refunded' => '0.00',
                        'operations' => []
                    ]
                ]
            ], 200)
        ]);

        $result = $this->algoritmaService->checkPaymentStatus('123456789');
        $this->assertTrue($result['success']);
        $this->assertEquals('authorized', $result['payment_status']);
    }

    /**
     * Test order status mapping - new
     */
    public function test_order_status_mapping_new()
    {
        Http::fake([
            'https://api.box:5001/orders/123456789*' => Http::response([
                'orders' => [
                    [
                        'id' => '123456789',
                        'status' => 'new',
                        'amount_charged' => '0.00',
                        'amount_refunded' => '0.00',
                        'operations' => []
                    ]
                ]
            ], 200)
        ]);

        $result = $this->algoritmaService->checkPaymentStatus('123456789');
        $this->assertTrue($result['success']);
        $this->assertEquals('pending', $result['payment_status']);
    }
}