<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Services\AlgoritmaService;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\URL;

class PaymentController extends BaseApiController
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
            $this->authorize('createPayment', $order);
            
            Log::info('PaymentController::createPayment called', [
                'order_id' => $order->id,
                'user_id' => $request->user()?->id,
                'user_type' => $request->user()?->user_type,
                'user_status' => $request->user()?->status,
            ]);

            $user = $this->getAuthenticatedUser($request);

            // Проверяем, что заказ может быть оплачен
            if (!$order->isPendingPayment()) {
                return $this->errorResponse('Заказ не может быть оплачен в текущем статусе', 400);
            }

            // Проверяем лимит попыток оплаты
            if (!$order->canRetryPayment()) {
                return $this->errorResponse('Превышен лимит попыток оплаты (3 попытки)', 400);
            }

            // Проверяем наличие клиента
            $order->loadMissing('client');
            $client = $order->client ?: User::find($order->client_id);
            
            Log::info('Checking client for payment', [
                'client_exists' => !!$client,
                'client_category' => $client ? $client->client_category : null,
                'order_client_id' => $order->client_id,
            ]);
            
            if (!$client) {
                Log::warning('Payment denied - client not found', [
                    'order_client_id' => $order->client_id,
                ]);
                return $this->errorResponse('Клиент не найден', 400);
            }
            
            // Корпоративные клиенты оплачивают по счету, для них онлайн-оплата недоступна
            if ($client->client_category === 'corporate') {
                Log::warning('Payment denied - corporate client', [
                    'client_id' => $client->id,
                    'client_category' => $client->client_category,
                ]);
                return $this->errorResponse('Корпоративные клиенты оплачивают по счету. Онлайн-оплата недоступна.', 400);
            }

            // Увеличиваем счетчик попыток
            $order->incrementPaymentAttempts();

            // Подготавливаем данные для создания платежа
            $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
            $returnUrl = $frontendUrl . '/payment/success/' . $order->id;
            $failureUrl = $frontendUrl . '/payment/failure/' . $order->id;

            $orderData = [
                'amount' => number_format($order->final_amount, 2, '.', ''),
                'currency' => 'AZN', // Азербайджанский манат
                'merchant_order_id' => (string) $order->id,
                'description' => "Заказ №{$order->id} - PAUL Catering",
                'client' => [
                    'name' => $client->name,
                    'email' => $client->email,
                    'phone' => $client->phone ?? '',
                ],
                'location' => [
                    // Используем публичный IP для тестового окружения
                    'ip' => $this->getPublicIp($request),
                ],
                'return_url' => $returnUrl,
                'language' => 'ru',
                'template' => '1',
                // Не передаем mobile, так как уже есть template
            ];

            Log::info('Creating payment with Algoritma', [
                'order_id' => $order->id,
                'amount' => $orderData['amount'],
                'merchant_order_id' => $orderData['merchant_order_id'],
                'return_url' => $returnUrl,
            ]);

            // Создаем платеж через Algoritma
            $result = $this->algoritmaService->createOrder($orderData);

            if (!$result['success']) {
                Log::error('Failed to create payment with Algoritma', [
                    'order_id' => $order->id,
                    'error' => $result['error'] ?? 'Unknown error',
                ]);
                return $this->errorResponse('Не удалось создать платеж: ' . ($result['error'] ?? 'Неизвестная ошибка'), 500);
            }

            // Обновляем заказ с информацией о платеже
            $order->update([
                'algoritma_order_id' => $result['order_id'],
                'payment_url' => $result['payment_url'],
                'payment_status' => 'pending',
                'payment_created_at' => now(),
            ]);

            Log::info('Payment created successfully', [
                'order_id' => $order->id,
                'algoritma_order_id' => $result['order_id'],
                'payment_url' => $result['payment_url'],
            ]);

            return $this->successResponse([
                'payment_url' => $result['payment_url'],
                'order_id' => $order->id,
                'attempts' => $order->payment_attempts,
            ], 'Платеж создан успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить информацию о платеже
     */
    public function getPaymentInfo(Request $request, Order $order): JsonResponse
    {
        try {
            $this->authorize('viewPayment', $order);
            
            if (!$order->algoritma_order_id) {
                return $this->notFoundResponse('Заказ не имеет связанного платежа');
            }

            // Получаем информацию о платеже от Algoritma
            $paymentInfo = $this->algoritmaService->getOrderInfo($order->algoritma_order_id);

            if (!$paymentInfo['success']) {
                Log::error('Failed to get payment info from Algoritma', [
                    'order_id' => $order->id,
                    'algoritma_order_id' => $order->algoritma_order_id,
                    'error' => $paymentInfo['error'] ?? 'Unknown error',
                ]);
                return $this->errorResponse('Не удалось получить информацию о платеже', 500);
            }

            $algoritmaOrder = $paymentInfo['data']['orders'][0] ?? null;
            if (!$algoritmaOrder) {
                return $this->notFoundResponse('Платеж не найден в системе Algoritma');
            }

            return $this->successResponse([
                'order_id' => $order->id,
                'payment_status' => $order->payment_status,
                'order_status' => $order->status,
                'amount' => $order->final_amount,
                'amount_charged' => $algoritmaOrder['amount_charged'] ?? '0.00',
                'attempts' => $order->payment_attempts,
                'can_retry' => $order->canRetryPayment(),
                'payment_url' => $order->payment_url,
                'created_at' => $order->payment_created_at,
                'completed_at' => $order->payment_completed_at,
                'details' => $algoritmaOrder,
            ], 'Информация о платеже получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обработка успешного возврата с Payment Page
     */
    public function handleSuccess(Request $request, Order $order): JsonResponse
    {
        try {
            $this->authorize('viewPayment', $order);
            
            if (!$order->algoritma_order_id) {
                return $this->errorResponse('Заказ не имеет связанного платежа', 400);
            }

            Log::info('Payment success callback received', [
                'order_id' => $order->id,
                'algoritma_order_id' => $order->algoritma_order_id,
                'request_data' => $request->all(),
            ]);

            // Проверяем статус платежа в Algoritma
            $paymentStatus = $this->algoritmaService->checkPaymentStatus($order->algoritma_order_id);

            if (!$paymentStatus['success']) {
                Log::error('Failed to check payment status', [
                    'order_id' => $order->id,
                    'algoritma_order_id' => $order->algoritma_order_id,
                    'error' => $paymentStatus['error'] ?? 'Unknown error',
                ]);
                return $this->errorResponse('Не удалось проверить статус платежа', 500);
            }

            Log::info('Payment status checked', [
                'order_id' => $order->id,
                'payment_status' => $paymentStatus['payment_status'],
                'amount_charged' => $paymentStatus['amount_charged'] ?? '0.00',
            ]);

            // Обновляем статус платежа в заказе
            $order->updatePaymentStatus($paymentStatus['payment_status'], $paymentStatus);

            // Если платеж успешен, отправляем уведомления
            if ($paymentStatus['payment_status'] === Order::PAYMENT_STATUS_CHARGED) {
                $this->notificationService->sendPaymentSuccessNotification($order);
                $this->notificationService->sendNewOrderNotifications($order);
            }

            return $this->successResponse([
                'order_id' => $order->id,
                'payment_status' => $paymentStatus['payment_status'],
                'amount_charged' => $paymentStatus['amount_charged'] ?? '0.00',
            ], 'Статус платежа обновлен');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обработка неуспешного возврата с Payment Page
     */
    public function handleFailure(Request $request, Order $order): JsonResponse
    {
        try {
            $this->authorize('viewPayment', $order);
            
            if (!$order->algoritma_order_id) {
                return $this->errorResponse('Заказ не имеет связанного платежа', 400);
            }

            Log::info('Payment failure callback received', [
                'order_id' => $order->id,
                'algoritma_order_id' => $order->algoritma_order_id,
                'request_data' => $request->all(),
            ]);

            // Проверяем статус платежа в Algoritma
            $paymentStatus = $this->algoritmaService->checkPaymentStatus($order->algoritma_order_id);

            if (!$paymentStatus['success']) {
                Log::error('Failed to check payment status', [
                    'order_id' => $order->id,
                    'algoritma_order_id' => $order->algoritma_order_id,
                    'error' => $paymentStatus['error'] ?? 'Unknown error',
                ]);
                return $this->errorResponse('Не удалось проверить статус платежа', 500);
            }

            // Обновляем статус платежа в заказе
            $order->updatePaymentStatus($paymentStatus['payment_status'], $paymentStatus);

            return $this->successResponse([
                'order_id' => $order->id,
                'payment_status' => $paymentStatus['payment_status'],
            ], 'Статус неуспешного платежа обработан');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Тест подключения к Algoritma
     */
    public function testConnection(): JsonResponse
    {
        try {
            $result = $this->algoritmaService->testConnection();

            if ($result['success']) {
                return $this->successResponse([
                    'message' => $result['message'],
                    'date' => $result['date'] ?? null,
                    'response_data' => $result['response_data'] ?? null,
                ], 'Подключение успешно');
            } else {
                return $this->errorResponse('Ошибка подключения: ' . ($result['error'] ?? 'Неизвестная ошибка'), 500);
            }
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить тестовые карты
     */
    public function getTestCards(): JsonResponse
    {
        try {
            $testCards = $this->algoritmaService->getTestCards();

            return $this->successResponse($testCards, 'Тестовые карты получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получить публичный IP адрес
     * Для тестового окружения возвращает фиктивный публичный IP
     */
    private function getPublicIp(Request $request): string
    {
        $ip = $request->ip();
        
        // Проверяем, является ли IP приватным (локальным)
        if ($this->isPrivateIp($ip)) {
            // Для тестового окружения используем публичный IP Google DNS
            return '8.8.8.8';
        }
        
        return $ip;
    }

    /**
     * Проверить, является ли IP адрес приватным
     */
    private function isPrivateIp(string $ip): bool
    {
        // Проверяем стандартные диапазоны приватных IP
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
        ) === false;
    }
}