<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CreateOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Controllers\Concerns\HandlesJsonData;
use App\Http\Controllers\Concerns\HandlesOrderCalculations;
use App\Http\Controllers\Concerns\HandlesValidation;
use App\Models\Order;
use App\Models\Application;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderController extends BaseApiController
{
    use HandlesJsonData, HandlesOrderCalculations, HandlesValidation;

    /**
     * Получение списка всех заказов
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Order::class);
            
            $orders = Order::with(['coordinator', 'client'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return $this->paginatedResponse($orders, 'Заказы получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение заказа по ID
     */
    public function show(Order $order)
    {
        try {
            $this->authorize('view', $order);
            
            return $this->successResponse([
                'order' => $order->load(['coordinator', 'client'])
            ], 'Заказ получен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Создание заказа
     */
    public function store(CreateOrderRequest $request)
    {
        try {
            $this->authorize('create', Order::class);
            
            Log::info('Order creation request received', ['data' => $request->validated()]);

            // Получаем клиента
            $client = $this->getClientForOrder($request, $request->validated()['client_id'] ?? null);
            
            Log::info('Client lookup result', [
                'client_found' => $client->toArray(),
                'client_id' => $client->id
            ]);

            // Подготавливаем данные заказа
            $orderData = $this->prepareOrderData($request->validated(), $client);
            
            Log::info('Calculated order amounts', [
                'subtotal' => $orderData['total_amount'],
                'finalAmount' => $orderData['final_amount'],
                'client_company' => $client->company_name,
                'client_category' => $client->client_category
            ]);

            // Создаем заказ
            $order = Order::create($orderData);
            
            // Загружаем связи для уведомлений (важно для отправки email клиенту)
            $order->load('client', 'coordinator');

            // Отправляем уведомления о новом заказе
            $notificationService = new NotificationService();
            $notificationService->sendNewOrderNotifications($order);

            return $this->createdResponse([
                'order' => $order->load('coordinator')
            ], 'Заказ успешно создан');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обновление статуса заказа
     */
    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        try {
            $this->authorize('updateStatus', $order);
            
            $previousStatus = $order->status;
            $order->update([
                'status' => $request->validated()['status'],
                'coordinator_comment' => $request->validated()['coordinator_comment'] ?? null,
            ]);

            // Отправляем уведомления об изменении статуса
            if ($previousStatus !== $request->validated()['status']) {
                $notificationService = new NotificationService();
                $notificationService->sendOrderStatusChangedNotifications($order, $previousStatus);
            }

            return $this->updatedResponse([
                'order' => $order->load('coordinator')
            ], 'Статус заказа обновлен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обновление заказа
     */
    public function update(Request $request, Order $order)
    {
        try {
            $this->authorize('update', $order);
            
            // Объединяем правила валидации
            $rules = array_merge(
                $this->getMenuItemsValidationRules(),
                $this->getDeliveryValidationRules(),
                $this->getDiscountValidationRules(),
                $this->getRecurringScheduleValidationRules(),
                $this->getAdditionalOrderFieldsValidationRules(),
                [
                    'client_type' => 'sometimes|in:corporate,one_time',
                    'company_name' => 'sometimes|string|max:255',
                    'status' => 'sometimes|in:draft,submitted,processing,completed,cancelled',
                ]
            );

            $validatedData = $this->validateRequest($request, $rules, $this->getCommonValidationMessages(), $this->getCommonValidationAttributes());

            $updateData = $request->only([
                'client_type', 'company_name', 'comment', 'status', 
                'delivery_date', 'delivery_type', 'delivery_address', 
                'recurring_schedule', 'equipment_required', 'staff_assigned', 
                'special_instructions'
            ]);

            // Пересчитываем суммы если изменились товары или скидки
            if ($request->has('menu_items') || $request->has('discount_fixed') || 
                $request->has('discount_percent') || $request->has('delivery_cost')) {
                
                $totals = $this->calculateOrderTotals(
                    $request->menu_items ?? $order->menu_items,
                    (float) ($request->discount_fixed ?? 0),
                    (float) ($request->discount_percent ?? 0),
                    (float) ($request->delivery_cost ?? 0)
                );

                $updateData = array_merge($updateData, [
                    'menu_items' => $totals['resolved_items'],
                    'total_amount' => $totals['subtotal'],
                    'discount_fixed' => (float) ($request->discount_fixed ?? 0),
                    'discount_percent' => (float) ($request->discount_percent ?? 0),
                    'discount_amount' => $totals['discount_amount'],
                    'items_total' => $totals['items_total'],
                    'final_amount' => $totals['final_amount'],
                ]);
            }

            if ($request->delivery_date && $request->delivery_time) {
                $updateData['delivery_time'] = $request->delivery_date . ' ' . $request->delivery_time;
            }

            $order->update($updateData);

            return $this->updatedResponse([
                'order' => $order->fresh()->load('coordinator')
            ], 'Заказ успешно обновлен');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Удаление заказа
     */
    public function destroy(Order $order)
    {
        try {
            $this->authorize('delete', $order);
            
            $order->delete();

            return $this->deletedResponse('Заказ успешно удален');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Создание заказа на основе заявки
     */
    public function createFromApplication(Request $request, Application $application)
    {
        try {
            $this->authorize('createOrderFromApplication', $application);
            
            Log::info('=== CREATE FROM APPLICATION START ===');
            Log::info('Request data:', $request->all());
            Log::info('Application data:', $application->toArray());
            
            $user = $this->getAuthenticatedUser($request);
            Log::info('User authenticated:', ['user_id' => $user->id, 'user_name' => $user->name]);
            
            // Парсим JSON данные из request
            $data = $this->parseJsonDataForApplication($request);
            
            // Подставляем данные из заявки, если они не указаны в request
            if (!isset($data['delivery_date']) && $application->event_date) {
                $data['delivery_date'] = $application->event_date->format('Y-m-d');
            }
            
            if (!isset($data['delivery_time']) && $application->event_time) {
                $data['delivery_time'] = $application->event_time->format('H:i');
            }
            
            if (!isset($data['delivery_address']) && $application->event_address) {
                $data['delivery_address'] = $application->event_address;
            }
            
            // Подставляем позиции меню из заявки, если не указаны
            if (!isset($data['menu_items']) && $application->cart_items) {
                $data['menu_items'] = $application->cart_items;
            }
            
            // Объединяем правила валидации
            $rules = array_merge(
                [
                    'client_id' => 'nullable|exists:users,id,user_type,client',
                ],
                $this->getMenuItemsValidationRules(),
                $this->getDeliveryValidationRules(),
                $this->getDiscountValidationRules(),
                $this->getRecurringScheduleValidationRules(),
                $this->getAdditionalOrderFieldsValidationRules()
            );

            $validatedData = $this->validateData($data, $rules, $this->getCommonValidationMessages(), $this->getCommonValidationAttributes());

            // Если client_id не указан, используем client_id из заявки или ищем/создаем клиента
            if (!isset($validatedData['client_id'])) {
                if ($application->client_id) {
                    // Используем существующего клиента из заявки
                    $validatedData['client_id'] = $application->client_id;
                } else {
                    // Создаем нового клиента на основе данных заявки
                    $client = User::where('email', $application->email)->where('user_type', 'client')->first();
                    
                    if (!$client) {
                        $client = User::create([
                            'name' => $application->first_name,
                            'last_name' => $application->last_name,
                            'email' => $application->email,
                            'phone' => $application->phone,
                            'company_name' => $application->company_name,
                            'contact_person' => $application->contact_person,
                            'user_type' => 'client',
                            'client_category' => 'one_time',
                            'password' => bcrypt(Str::random(16)), // Временный пароль
                            'status' => 'active',
                        ]);
                        
                        Log::info('Created new client from application', ['client_id' => $client->id]);
                    }
                    
                    $validatedData['client_id'] = $client->id;
                }
            }

            // Ищем клиента
            $client = User::where('id', $validatedData['client_id'])
                        ->where('user_type', 'client')
                        ->first();
            
            if (!$client) {
                return $this->validationErrorResponse([
                    'client_id' => ['Клиент с указанным ID не существует']
                ], 'Клиент не найден');
            }

            // Подготавливаем данные заказа
            $orderData = $this->prepareOrderData($validatedData, $client);
            $orderData['application_id'] = $application->id; // Связываем заказ с заявкой

            // Создаем заказ
            $order = Order::create($orderData);
            
            // Загружаем связи для уведомлений (важно для отправки email клиенту)
            $order->load('client', 'coordinator');

            // Отправляем уведомления о новом заказе
            $notificationService = new NotificationService();
            $notificationService->sendNewOrderNotifications($order);

            // Обновляем статус заявки на "approved" и привязываем клиента
            $application->update([
                'status' => 'approved',
                'coordinator_id' => $user->id,
                'client_id' => $client->id,
                'processed_at' => now(),
            ]);

            return $this->createdResponse([
                'order' => $order->load(['coordinator', 'client']),
                'application' => $application->fresh()->load('client')
            ], 'Заказ создан на основе заявки');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение активных заказов клиента
     */
    public function getClientActiveOrders(Request $request)
    {
        try {
            $this->authorize('viewAny', Order::class);
            
            $user = $this->getAuthenticatedUser($request);
            $clientId = $user->id;
            
            // Активные заказы - это заказы со статусом "submitted" или "processing" 
            // и датой доставки не раньше сегодняшнего дня
            $activeOrders = Order::where('client_id', $clientId)
                ->whereIn('status', ['submitted', 'processing'])
                ->where(function($query) {
                    $query->whereNull('delivery_date')
                          ->orWhere('delivery_date', '>=', now()->startOfDay());
                })
                ->with('coordinator')
                ->orderBy('delivery_date', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->successResponse($activeOrders, 'Активные заказы получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение всех заказов клиента
     */
    public function getClientOrders(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            
            // Проверяем, что пользователь активен
            if (!$user->isActive()) {
                return $this->forbiddenResponse('Доступ запрещен. Аккаунт неактивен.');
            }
            
            // Проверяем, что пользователь является клиентом
            if (!$user->isClient()) {
                return $this->forbiddenResponse('Доступ запрещен. Только клиенты могут просматривать свои заказы.');
            }
            
            $clientId = $user->id;
            
            $orders = Order::where('client_id', $clientId)
                ->with('coordinator')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return $this->paginatedResponse($orders, 'Заказы клиента получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение статистики по заказам
     */
    /**
     * Получить статистику заказов
     * УЛУЧШЕНО: Добавлена подробная статистика по платежам, суммам и датам
     */
    public function statistics(Request $request)
    {
        try {
            $this->authorize('viewAny', Order::class);
            
            // Статистика по статусам заказов
            $statusStats = [
                'total' => Order::count(),
                'draft' => Order::where('status', Order::STATUS_DRAFT)->count(),
                'submitted' => Order::where('status', Order::STATUS_SUBMITTED)->count(),
                'pending_payment' => Order::where('status', Order::STATUS_PENDING_PAYMENT)->count(),
                'paid' => Order::where('status', Order::STATUS_PAID)->count(),
                'processing' => Order::where('status', Order::STATUS_PROCESSING)->count(),
                'completed' => Order::where('status', Order::STATUS_COMPLETED)->count(),
                'cancelled' => Order::where('status', Order::STATUS_CANCELLED)->count(),
            ];
            
            // Статистика по платежам
            $paymentStats = [
                'total_revenue' => Order::whereIn('status', [
                    Order::STATUS_PAID,
                    Order::STATUS_PROCESSING,
                    Order::STATUS_COMPLETED
                ])->sum('final_amount'),
                'pending_payments' => Order::where('status', Order::STATUS_PENDING_PAYMENT)->sum('final_amount'),
                'paid_count' => Order::whereIn('payment_status', [
                    Order::PAYMENT_STATUS_CHARGED,
                    Order::PAYMENT_STATUS_AUTHORIZED
                ])->count(),
                'failed_payments' => Order::where('payment_status', Order::PAYMENT_STATUS_FAILED)->count(),
                'average_order_value' => Order::whereIn('status', [
                    Order::STATUS_PAID,
                    Order::STATUS_PROCESSING,
                    Order::STATUS_COMPLETED
                ])->avg('final_amount'),
            ];
            
            // Статистика за текущий месяц
            $currentMonth = now()->startOfMonth();
            $monthStats = [
                'orders_this_month' => Order::where('created_at', '>=', $currentMonth)->count(),
                'revenue_this_month' => Order::where('created_at', '>=', $currentMonth)
                    ->whereIn('status', [
                        Order::STATUS_PAID,
                        Order::STATUS_PROCESSING,
                        Order::STATUS_COMPLETED
                    ])->sum('final_amount'),
                'completed_this_month' => Order::where('status', Order::STATUS_COMPLETED)
                    ->where('updated_at', '>=', $currentMonth)->count(),
            ];
            
            // Статистика по типам клиентов
            $clientStats = [
                'corporate_orders' => Order::where('client_type', 'corporate')->count(),
                'one_time_orders' => Order::where('client_type', 'one_time')->count(),
            ];
            
            // Статистика по типам доставки
            $deliveryStats = [
                'delivery' => Order::where('delivery_type', 'delivery')->count(),
                'pickup' => Order::where('delivery_type', 'pickup')->count(),
                'buffet' => Order::where('delivery_type', 'buffet')->count(),
            ];

            $stats = [
                'status' => $statusStats,
                'payment' => $paymentStats,
                'current_month' => $monthStats,
                'clients' => $clientStats,
                'delivery' => $deliveryStats,
                'overview' => [
                    'total_orders' => $statusStats['total'],
                    'active_orders' => $statusStats['submitted'] + $statusStats['pending_payment'] + 
                                      $statusStats['paid'] + $statusStats['processing'],
                    'total_revenue' => $paymentStats['total_revenue'],
                    'completion_rate' => $statusStats['total'] > 0 
                        ? round(($statusStats['completed'] / $statusStats['total']) * 100, 2) 
                        : 0,
                ],
            ];

            return $this->successResponse($stats, 'Статистика заказов получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение заказа клиента по ID (с проверкой прав доступа)
     */
    public function showClientOrder(Request $request, Order $order)
    {
        try {
            $this->authorize('view', $order);
            
            return $this->successResponse([
                'order' => $order->load('coordinator')
            ], 'Заказ клиента получен успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение данных для кухни (наблюдатель)
     * Возвращает позиции меню сгруппированные по датам доставки
     */
    public function kitchenView(Request $request)
    {
        try {
            $user = $this->getAuthenticatedUser($request);
            
            // Проверяем, что пользователь является наблюдателем
            if (!$user->isObserver()) {
                return $this->errorResponse('Доступ запрещен. Только наблюдатели могут просматривать данные кухни.', 403);
            }

            // Получаем только подтвержденные заказы (со статусом processing)
            // Кухня должна видеть только заказы, которые подтверждены координатором и готовы к приготовлению
            $orders = Order::where('status', Order::STATUS_PROCESSING)
            ->whereNotNull('delivery_date')
            ->where('delivery_date', '>=', now()->startOfDay())
            ->orderBy('delivery_date', 'asc')
            ->orderBy('delivery_time', 'asc')
            ->get();

            // Группируем позиции по датам и позициям меню
            $itemsByDate = [];
            $itemsSummary = []; // Общая сводка по позициям

            foreach ($orders as $order) {
                $deliveryDate = $order->delivery_date->format('Y-m-d');
                $deliveryDateFormatted = $order->delivery_date->format('d.m.Y');
                
                if (!isset($itemsByDate[$deliveryDate])) {
                    $itemsByDate[$deliveryDate] = [
                        'date' => $deliveryDate,
                        'date_formatted' => $deliveryDateFormatted,
                        'orders' => [],
                        'items' => []
                    ];
                }

                // Добавляем заказ
                $itemsByDate[$deliveryDate]['orders'][] = [
                    'id' => $order->id,
                    'company_name' => $order->company_name,
                    'delivery_time' => $order->delivery_time ? $order->delivery_time->format('H:i') : null,
                    'status' => $order->status,
                ];

                // Обрабатываем позиции меню
                if (is_array($order->menu_items)) {
                    foreach ($order->menu_items as $menuItem) {
                        $itemId = $menuItem['id'] ?? $menuItem['name'];
                        $itemName = $menuItem['name'] ?? 'Неизвестная позиция';
                        $quantity = (int)($menuItem['quantity'] ?? 1);
                        $price = (float)($menuItem['price'] ?? 0);

                        // Добавляем в сводку по дате
                        if (!isset($itemsByDate[$deliveryDate]['items'][$itemId])) {
                            $itemsByDate[$deliveryDate]['items'][$itemId] = [
                                'id' => $itemId,
                                'name' => $itemName,
                                'quantity' => 0,
                                'price' => $price,
                                'orders' => []
                            ];
                        }
                        $itemsByDate[$deliveryDate]['items'][$itemId]['quantity'] += $quantity;
                        $itemsByDate[$deliveryDate]['items'][$itemId]['orders'][] = [
                            'order_id' => $order->id,
                            'company_name' => $order->company_name,
                            'quantity' => $quantity,
                        ];

                        // Добавляем в общую сводку
                        if (!isset($itemsSummary[$itemId])) {
                            $itemsSummary[$itemId] = [
                                'id' => $itemId,
                                'name' => $itemName,
                                'total_quantity' => 0,
                                'price' => $price,
                                'dates' => []
                            ];
                        }
                        $itemsSummary[$itemId]['total_quantity'] += $quantity;
                        if (!in_array($deliveryDate, $itemsSummary[$itemId]['dates'])) {
                            $itemsSummary[$itemId]['dates'][] = $deliveryDate;
                        }
                    }
                }
            }

            // Преобразуем массивы в списки
            foreach ($itemsByDate as &$dateData) {
                $dateData['items'] = array_values($dateData['items']);
            }

            // Преобразуем сводку в список
            $itemsSummary = array_values($itemsSummary);

            return $this->successResponse([
                'items_by_date' => array_values($itemsByDate),
                'items_summary' => $itemsSummary,
                'total_orders' => count($orders),
                'date_range' => [
                    'from' => count($itemsByDate) > 0 ? min(array_keys($itemsByDate)) : null,
                    'to' => count($itemsByDate) > 0 ? max(array_keys($itemsByDate)) : null,
                ]
            ], 'Данные для кухни получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}