<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AlgoritmaService;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class PaymentController extends Controller
{
    private AlgoritmaService $algoritmaService;
    private NotificationService $notificationService;

    public function __construct(AlgoritmaService $algoritmaService, NotificationService $notificationService)
    {
        $this->algoritmaService = $algoritmaService;
        $this->notificationService = $notificationService;
    }

    /**
     * Создать платеж для заказа
     */
    public function createPayment(Request $request, Order $order): JsonResponse
    {
        try {
            Log::info('PaymentController::createPayment called', [
                'order_id' => $order->id,
                'user_id' => $request->user()?->id,
                'user_type' => $request->user()?->user_type,
                'user_status' => $request->user()?->status,
            ]);

            $user = $request->user();
            if (!$user || !$user->isActive()) {
                Log::warning('Payment authorization failed', [
                    'user_exists' => !!$user,
                    'user_active' => $user ? $user->isActive() : false,
                    'user_status' => $user ? $user->status : null,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Доступ запрещен. Требуется авторизация.'
                ], 403);
            }

            // Проверяем права доступа к заказу
            $hasAccess = false;
            
            Log::info('Checking payment access rights', [
                'user_type' => $user->user_type,
                'user_role' => $user->staff_role,
                'is_coordinator' => $user->isCoordinator(),
                'is_client' => $user->isClient(),
                'order_client_id' => $order->client_id,
                'user_id' => $user->id,
            ]);
            
            // Координаторы могут создавать платежи для любых заказов
            if ($user->isCoordinator()) {
                $hasAccess = true;
            }
            // Клиенты могут создавать платежи только для своих заказов
            elseif ($user->isClient() && $order->client_id === $user->id) {
                $hasAccess = true;
            }
            
            if (!$hasAccess) {
                Log::warning('Payment access denied', [
                    'user_type' => $user->user_type,
                    'order_client_id' => $order->client_id,
                    'user_id' => $user->id,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Доступ запрещен. Нет прав для создания платежа для этого заказа.'
                ], 403);
            }
            // Разрешены оплаты только для одноразовых клиентов (грузим клиента явно)
            $order->loadMissing('client');
            $client = $order->client ?: User::find($order->client_id);
            
            Log::info('Checking client category for payment', [
                'client_exists' => !!$client,
                'client_category' => $client ? $client->client_category : null,
                'order_client_id' => $order->client_id,
            ]);
            
            if (!$client || $client->client_category !== 'one_time') {
                Log::warning('Payment denied - client category check failed', [
                    'client_exists' => !!$client,
                    'client_category' => $client ? $client->client_category : null,
                    'required_category' => 'one_time',
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Оплата доступна только для одноразовых клиентов.'
                ], 400);
            }

            // Проверяем, что заказ может быть оплачен
            Log::info('Checking order payment status', [
                'order_status' => $order->status,
                'payment_status' => $order->payment_status,
                'can_pay' => $order->isPendingPayment(),
            ]);
            
            if (!$order->isPendingPayment()) {
                Log::warning('Payment denied - order status check failed', [
                    'order_status' => $order->status,
                    'payment_status' => $order->payment_status,
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Заказ не может быть оплачен в текущем статусе'
                ], 400);
            }

            // Проверяем лимит попыток (разрешаем до 3 попыток, независимо от статуса)
            if (($order->payment_attempts ?? 0) >= 3) {
                return response()->json([
                    'success' => false,
                    'message' => 'Превышен лимит попыток оплаты (3 попытки)'
                ], 400);
            }

            // Увеличиваем счетчик попыток
            $order->incrementPaymentAttempts();

            // Подготавливаем данные для Algoritma
            $orderData = [
                'amount' => (string) $order->final_amount,
                'currency' => 'USD',
                'merchant_order_id' => (string) $order->id,
                'description' => "Заказ #{$order->id} - {$order->company_name}",
                'client' => [
                    'name' => $order->client->name ?? 'Client',
                    'email' => $order->client->email ?? '',
                    'phone' => $order->client->phone ?? '',
                ],
                'location' => [
                    'ip' => $request->ip(),
                ],
                'return_url' => URL::to("/payment/success/{$order->id}"),
                'language' => 'en',
                'template' => '1',
                'mobile' => '1',
            ];

            // Создаем заказ в Algoritma
            Log::info('Creating Algoritma order', [
                'order_data' => $orderData,
            ]);
            
            $result = $this->algoritmaService->createOrder($orderData);
            
            Log::info('Algoritma order creation result', [
                'success' => $result['success'] ?? false,
                'order_id' => $result['order_id'] ?? null,
                'payment_url' => $result['payment_url'] ?? null,
                'error' => $result['error'] ?? null,
            ]);

            if ($result['success']) {
                // Обновляем заказ с информацией о платеже
                $order->update([
                    'algoritma_order_id' => $result['order_id'],
                    'payment_url' => $result['payment_url'],
                    'payment_created_at' => now(),
                    'payment_status' => 'pending',
                ]);

                Log::info('Payment created successfully', [
                    'order_id' => $order->id,
                    'algoritma_order_id' => $result['order_id'],
                    'payment_url' => $result['payment_url']
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Платеж создан успешно',
                    'data' => [
                        'payment_url' => $result['payment_url'],
                        'order_id' => $order->id,
                        'attempts' => $order->payment_attempts,
                    ]
                ]);
            } else {
                Log::error('Failed to create payment', [
                    'order_id' => $order->id,
                    'error' => $result['error'] ?? 'Unknown error'
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка создания платежа: ' . ($result['error'] ?? 'Неизвестная ошибка')
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Exception in createPayment', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }

    /**
     * Обработка успешного возврата с Payment Page
     */
    public function handleSuccess(Request $request, Order $order): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user || !$user->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Доступ запрещен. Требуется авторизация.'
                ], 403);
            }

            // Проверяем права доступа к заказу
            $hasAccess = false;
            
            // Координаторы могут обрабатывать любые заказы
            if ($user->isCoordinator()) {
                $hasAccess = true;
            }
            // Клиенты могут обрабатывать только свои заказы
            elseif ($user->isClient() && $order->client_id === $user->id) {
                $hasAccess = true;
            }
            
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'Доступ запрещен. Нет прав для обработки этого заказа.'
                ], 403);
            }
            if (!$order->algoritma_order_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Заказ не найден или не имеет связанного платежа'
                ], 404);
            }

            // Проверяем статус платежа в Algoritma
            $paymentStatus = $this->algoritmaService->checkPaymentStatus($order->algoritma_order_id);

            if (!$paymentStatus['success']) {
                Log::error('Failed to check payment status', [
                    'order_id' => $order->id,
                    'algoritma_order_id' => $order->algoritma_order_id,
                    'error' => $paymentStatus['error'] ?? 'Unknown error'
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка проверки статуса платежа'
                ], 500);
            }

            $status = $paymentStatus['payment_status'] ?? 'unknown';
            $details = $paymentStatus['data'] ?? [];

            // Обновляем статус платежа
            $order->updatePaymentStatus($status, $details);

            // Отправляем уведомления
            if ($status === 'charged') {
                $this->notificationService->sendPaymentSuccessNotification($order);
                $this->notificationService->sendNewOrderNotifications($order);
            }

            Log::info('Payment status updated', [
                'order_id' => $order->id,
                'payment_status' => $status,
                'algoritma_order_id' => $order->algoritma_order_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Статус платежа обновлен',
                'data' => [
                    'order_id' => $order->id,
                    'payment_status' => $status,
                    'order_status' => $order->status,
                    'amount_charged' => $paymentStatus['amount_charged'] ?? '0.00',
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in handleSuccess', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }

    /**
     * Обработка неуспешного возврата с Payment Page
     */
    public function handleFailure(Request $request, Order $order): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user || !$user->isActive()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Доступ запрещен. Требуется авторизация.'
                ], 403);
            }

            // Проверяем права доступа к заказу
            $hasAccess = false;
            
            // Координаторы могут обрабатывать любые заказы
            if ($user->isCoordinator()) {
                $hasAccess = true;
            }
            // Клиенты могут обрабатывать только свои заказы
            elseif ($user->isClient() && $order->client_id === $user->id) {
                $hasAccess = true;
            }
            
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'Доступ запрещен. Нет прав для обработки этого заказа.'
                ], 403);
            }
            if (!$order->algoritma_order_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Заказ не найден или не имеет связанного платежа'
                ], 404);
            }

            // Проверяем статус платежа в Algoritma
            $paymentStatus = $this->algoritmaService->checkPaymentStatus($order->algoritma_order_id);

            if ($paymentStatus['success']) {
                $status = $paymentStatus['payment_status'];
                $details = $paymentStatus['data'] ?? [];

                // Обновляем статус платежа
                $order->updatePaymentStatus($status, $details);

                Log::info('Payment failure status updated', [
                    'order_id' => $order->id,
                    'payment_status' => $status,
                    'algoritma_order_id' => $order->algoritma_order_id
                ]);
            } else {
                // Если не удалось проверить статус, помечаем как неуспешный
                $order->updatePaymentStatus('failed', [
                    'error' => $paymentStatus['error'] ?? 'Unknown error'
                ]);

                Log::error('Payment status check failed, marked as failed', [
                    'order_id' => $order->id,
                    'algoritma_order_id' => $order->algoritma_order_id,
                    'error' => $paymentStatus['error'] ?? 'Unknown error'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Статус неуспешного платежа обработан',
                'data' => [
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                    'can_retry' => $order->canRetryPayment(),
                    'attempts' => $order->payment_attempts,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in handleFailure', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }

    /**
     * Получить информацию о платеже
     */
    public function getPaymentInfo(Order $order): JsonResponse
    {
        try {
            if (!$order->algoritma_order_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Заказ не имеет связанного платежа'
                ], 404);
            }

            // Получаем актуальную информацию о платеже
            $paymentStatus = $this->algoritmaService->checkPaymentStatus($order->algoritma_order_id);

            if (!$paymentStatus['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Ошибка получения информации о платеже'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'payment_status' => $paymentStatus['payment_status'],
                    'order_status' => $order->status,
                    'amount' => $order->final_amount,
                    'amount_charged' => $paymentStatus['amount_charged'] ?? '0.00',
                    'amount_refunded' => $paymentStatus['amount_refunded'] ?? '0.00',
                    'attempts' => $order->payment_attempts,
                    'can_retry' => $order->canRetryPayment(),
                    'payment_url' => $order->payment_url,
                    'created_at' => $order->payment_created_at,
                    'completed_at' => $order->payment_completed_at,
                    'details' => $paymentStatus['data'] ?? [],
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in getPaymentInfo', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }

    /**
     * Тест подключения к Algoritma API
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->algoritmaService->testConnection();

            return response()->json([
                'success' => $result['success'],
                'message' => $result['success'] ? 'Подключение успешно' : 'Ошибка подключения',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in testConnection', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }

    /**
     * Получить тестовые карты
     */
    public function getTestCards(): JsonResponse
    {
        try {
            $testCards = $this->algoritmaService->getTestCards();

            return response()->json([
                'success' => true,
                'data' => $testCards
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in getTestCards', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Внутренняя ошибка сервера'
            ], 500);
        }
    }
}
