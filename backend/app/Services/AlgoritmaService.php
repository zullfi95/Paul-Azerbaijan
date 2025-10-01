<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class AlgoritmaService
{
    private string $apiKey;
    private string $apiSecret;
    private string $baseUrl;
    private string $environment;

    public function __construct()
    {
        $this->apiKey = (string) (config('services.algoritma.api_key') ?? '');
        $this->apiSecret = (string) (config('services.algoritma.api_secret') ?? '');
        $this->baseUrl = (string) (config('services.algoritma.base_url') ?? '');
        $this->environment = (string) (config('services.algoritma.environment', 'test'));

        if ($this->baseUrl === '') {
            $this->baseUrl = 'https://example.test';
        }
    }

    /**
     * Создать заказ для оплаты через Payment Page
     */
    public function createOrder(array $orderData): array
    {
        // Временная мок-версия для тестирования
        Log::info('Algoritma createOrder called', [
            'api_key' => $this->apiKey,
            'api_secret' => $this->apiSecret,
            'base_url' => $this->baseUrl
        ]);
        
        if ($this->apiKey === 'your_api_key' || $this->apiSecret === 'your_api_secret') {
            Log::info('Using mock Algoritma response for testing');
            return [
                'success' => true,
                'order_id' => 'mock_order_' . time(),
                'payment_url' => 'http://localhost:3000/payment-mock.html?order_id=' . ($orderData['merchant_order_id'] ?? 'test'),
                'status' => 'created'
            ];
        }

        try {
            $payload = [
                'amount' => $orderData['amount'],
                'currency' => $orderData['currency'] ?? 'USD',
                'merchant_order_id' => $orderData['merchant_order_id'],
                'description' => $orderData['description'] ?? 'Order payment',
                'client' => $orderData['client'] ?? [],
                'location' => $orderData['location'] ?? [],
                'options' => [
                    'return_url' => $orderData['return_url'],
                    'language' => $orderData['language'] ?? 'en',
                    'template' => $orderData['template'] ?? '1',
                    'mobile' => $orderData['mobile'] ?? '1',
                ]
            ];

            $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                ->post($this->baseUrl . '/orders/create', $payload);

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Algoritma order created successfully', [
                    'order_id' => $orderData['merchant_order_id'],
                    'algoritma_order_id' => $data['orders'][0]['id'] ?? null,
                    'payment_url' => $response->header('Location')
                ]);

                return [
                    'success' => true,
                    'order_id' => $data['orders'][0]['id'] ?? null,
                    'payment_url' => $response->header('Location'),
                    'data' => $data
                ];
            } else {
                // Попробуем извлечь failure_message из тела ответа
                $error = null;
                try {
                    $json = $response->json();
                    $error = $json['failure_message'] ?? null;
                } catch (\Throwable $t) {
                    // ignore
                }
                Log::error('Failed to create Algoritma order', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'order_id' => $orderData['merchant_order_id']
                ]);

                return [
                    'success' => false,
                    'error' => $error ?? 'Unknown error',
                    'status' => $response->status()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Exception in Algoritma createOrder', [
                'error' => $e->getMessage(),
                'order_id' => $orderData['merchant_order_id'] ?? null
            ]);

            return [
                'success' => false,
                'error' => 'Service unavailable',
                'exception' => $e->getMessage()
            ];
        }
    }

    /**
     * Получить информацию о заказе
     */
    public function getOrderInfo(string $algoritmaOrderId, array $expand = []): array
    {
        // Временная мок-версия для тестирования
        if ($this->apiKey === 'your_api_key' || $this->apiSecret === 'your_api_secret') {
            Log::info('Using mock Algoritma getOrderInfo response for testing', [
                'algoritma_order_id' => $algoritmaOrderId
            ]);
            
            // Имитируем успешный заказ
            return [
                'success' => true,
                'data' => [
                    'orders' => [
                        [
                            'id' => $algoritmaOrderId,
                            'status' => 'charged',
                            'amount' => '20.00',
                            'amount_charged' => '20.00',
                            'amount_refunded' => '0.00',
                            'currency' => 'USD',
                            'created' => now()->format('Y-m-d H:i:s'),
                            'updated' => now()->format('Y-m-d H:i:s'),
                            'operations' => [
                                [
                                    'type' => 'authorize',
                                    'status' => 'success',
                                    'amount' => '20.00',
                                    'created' => now()->format('Y-m-d H:i:s')
                                ],
                                [
                                    'type' => 'charge',
                                    'status' => 'success',
                                    'amount' => '20.00',
                                    'created' => now()->format('Y-m-d H:i:s')
                                ]
                            ]
                        ]
                    ]
                ]
            ];
        }

        try {
            $queryParams = [];
            if (!empty($expand)) {
                $queryParams['expand'] = implode(',', $expand);
            }

            $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->get($this->baseUrl . '/orders/' . $algoritmaOrderId, $queryParams);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'data' => $data
                ];
            } else {
                Log::error('Failed to get Algoritma order info', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'algoritma_order_id' => $algoritmaOrderId
                ]);

                return [
                    'success' => false,
                    'error' => $response->json()['failure_message'] ?? 'Unknown error',
                    'status' => $response->status()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Exception in Algoritma getOrderInfo', [
                'error' => $e->getMessage(),
                'algoritma_order_id' => $algoritmaOrderId
            ]);

            return [
                'success' => false,
                'error' => 'Service unavailable',
                'exception' => $e->getMessage()
            ];
        }
    }

    /**
     * Проверить статус платежа
     */
    public function checkPaymentStatus(string $algoritmaOrderId): array
    {
        $orderInfo = $this->getOrderInfo($algoritmaOrderId, ['operations']);
        
        if (!$orderInfo['success']) {
            return $orderInfo;
        }

        $order = $orderInfo['data']['orders'][0] ?? null;
        if (!$order) {
            return [
                'success' => false,
                'error' => 'Order not found'
            ];
        }

        $status = $order['status'] ?? 'unknown';
        $operations = $order['operations'] ?? [];

        // Определяем статус платежа на основе статуса заказа и операций
        $paymentStatus = $this->mapOrderStatusToPaymentStatus($status, $operations);

        return [
            'success' => true,
            'status' => $status,
            'payment_status' => $paymentStatus,
            'amount_charged' => $order['amount_charged'] ?? '0.00',
            'amount_refunded' => $order['amount_refunded'] ?? '0.00',
            'operations' => $operations,
            'data' => $order
        ];
    }

    /**
     * Маппинг статусов заказа Algoritma в статусы платежа
     */
    private function mapOrderStatusToPaymentStatus(string $orderStatus, array $operations): string
    {
        switch ($orderStatus) {
            case 'new':
            case 'prepared':
                return 'pending';
            
            case 'authorized':
                return 'authorized';
            
            case 'charged':
                return 'charged';
            
            case 'reversed':
                return 'failed';
            
            case 'refunded':
                return 'refunded';
            
            case 'rejected':
            case 'fraud':
            case 'declined':
            case 'chargedback':
            case 'error':
                return 'failed';
            
            case 'credited':
                return 'credited';
            
            default:
                return 'unknown';
        }
    }

    /**
     * Тест подключения к API
     */
    public function testConnection(): array
    {
        try {
            Log::info('Algoritma testConnection attempt', [
                'api_key' => $this->apiKey,
                'api_secret' => $this->apiSecret,
                'base_url' => $this->baseUrl,
                'endpoint' => $this->baseUrl . '/ping'
            ]);

            $response = Http::withBasicAuth($this->apiKey, $this->apiSecret)
                ->withHeaders([
                    'Accept' => 'application/json',
                ])
                ->get($this->baseUrl . '/ping');

            Log::info('Algoritma testConnection response', [
                'status' => $response->status(),
                'body' => $response->body(),
                'headers' => $response->headers()
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'message' => $data['message'] ?? 'PONG!',
                    'date' => $data['date'] ?? null,
                    'response_data' => $data
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Connection failed',
                    'status' => $response->status(),
                    'response_body' => $response->body()
                ];
            }
        } catch (\Exception $e) {
            Log::error('Algoritma testConnection exception', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'error' => 'Connection failed',
                'exception' => $e->getMessage()
            ];
        }
    }

    public function getTestCards(): array
    {
        return [
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
        ];
    }
}
