<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Application;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Получение списка всех заказов
     */
    public function index(Request $request)
    {
        $orders = Order::with('coordinator')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Resolve menu items against server catalog (if available).
     * Returns items with authoritative server_price when found, otherwise keeps client price.
     *
     * @param array $items
     * @return array
     */
    protected function resolveMenuItems(array $items): array
    {
        // Try to detect a menu_items/products table with price column
        $catalogTable = null;
        if (Schema::hasTable('menu_items')) {
            $catalogTable = 'menu_items';
        } elseif (Schema::hasTable('products')) {
            $catalogTable = 'products';
        } elseif (Schema::hasTable('items')) {
            $catalogTable = 'items';
        }

        if (!$catalogTable) {
            // No catalog table found — return items but ensure numeric prices and rounding
            return array_map(function ($it) {
                $it['price'] = isset($it['price']) ? round((float) $it['price'], 2) : 0.0;
                return $it;
            }, $items);
        }

        // Collect ids
        $ids = array_values(array_unique(array_filter(array_map(function ($it) {
            return $it['id'] ?? null;
        }, $items))));

        if (empty($ids)) {
            return array_map(function ($it) {
                $it['price'] = isset($it['price']) ? round((float) $it['price'], 2) : 0.0;
                return $it;
            }, $items);
        }

        // Fetch prices from catalog
        $rows = DB::table($catalogTable)
            ->whereIn('id', $ids)
            ->select('id', 'price')
            ->get()
            ->keyBy('id')
            ->toArray();

        // Map back
        return array_map(function ($it) use ($rows) {
            $id = $it['id'] ?? null;
            $serverPrice = null;
            if ($id && isset($rows[$id])) {
                $serverPrice = (float) $rows[$id]->price;
            }

            $it['quantity'] = isset($it['quantity']) ? (int) $it['quantity'] : 1;
            $it['price'] = isset($it['price']) ? round((float) $it['price'], 2) : 0.0;
            if (!is_null($serverPrice)) {
                $it['server_price'] = round($serverPrice, 2);
                // optionally override price used for calculations — keep client price for reference
            }

            return $it;
        }, $items);
    }

    /**
     * Получение заказа по ID
     */
    public function show(Order $order)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order->load('coordinator')
            ]
        ]);
    }

    /**
     * Создание заказа на основе заявки
     */
    public function store(Request $request)
    {
        $data = $request->all();
        Log::info('Initial request data', ['data' => $data]);
        Log::info('Request content', ['content' => $request->getContent()]);
        Log::info('Request isJson', ['is_json' => $request->isJson()]);
        
        // Handle cases where data is double-encoded JSON string
        if ($request->isJson() && is_string($request->getContent())) {
             $decoded = json_decode($request->getContent(), true);
             Log::info('Direct JSON decode attempt', ['decoded' => $decoded, 'is_string' => is_string($decoded)]);
             
             // If first decode results in a string, try to decode it again (double-encoded JSON)
             if (is_string($decoded)) {
                 $doubleDecoded = json_decode($decoded, true);
                 Log::info('Double JSON decode attempt', ['decoded' => $doubleDecoded, 'is_array' => is_array($doubleDecoded)]);
                 if (is_array($doubleDecoded)) {
                     $data = $doubleDecoded;
                 }
             } elseif (is_array($decoded)) {
                $data = $decoded;
             }
        }
        
        // Handle cases where data comes wrapped in a 'data' array with JSON string
        if (isset($data['data']) && is_array($data['data']) && count($data['data']) === 1 && is_string($data['data'][0])) {
            Log::info('Attempting to decode JSON from data array', ['json_string' => $data['data'][0]]);
            $decodedData = json_decode($data['data'][0], true);
            if (is_array($decodedData)) {
                Log::info('JSON decoded successfully', ['decoded_keys' => array_keys($decodedData)]);
                $data = $decodedData;
            } else {
                Log::error('Failed to decode JSON', ['json_error' => json_last_error_msg()]);
            }
        } else {
            Log::info('Data structure check', [
                'has_data_key' => isset($data['data']),
                'is_array' => isset($data['data']) ? is_array($data['data']) : false,
                'count' => isset($data['data']) && is_array($data['data']) ? count($data['data']) : 0,
                'first_is_string' => isset($data['data'][0]) ? is_string($data['data'][0]) : false
            ]);
        }
        
        Log::info('Order creation request received', ['data' => $data]);
        Log::info('Order creation - parsed data keys', ['keys' => array_keys($data)]);

        $validator = Validator::make($data, [
            // Клиент
            'client_id' => 'required|exists:users,id,user_type,client',
            
            // Товары
            'menu_items' => 'required|array|min:1',
            'menu_items.*.id' => 'required|string',
            'menu_items.*.name' => 'required|string',
            'menu_items.*.quantity' => 'required|integer|min:1',
            'menu_items.*.price' => 'required|numeric|min:0',
            
            // Скидки
            'discount_fixed' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            
            // Доставка
            'delivery_date' => 'nullable|date',
            'delivery_time' => 'nullable|date_format:H:i',
            'delivery_type' => 'nullable|in:delivery,pickup,buffet',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_cost' => 'nullable|numeric|min:0',
            
            // Расписание
            'recurring_schedule' => 'nullable|array',
            'recurring_schedule.enabled' => 'boolean',
            'recurring_schedule.frequency' => 'nullable|in:weekly,monthly',
            'recurring_schedule.days' => 'nullable|array',
            'recurring_schedule.delivery_time' => 'nullable|date_format:H:i',
            'recurring_schedule.notes' => 'nullable|string|max:500',
            
            // Дополнительные поля
            'equipment_required' => 'nullable|integer|min:0',
            'staff_assigned' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string',
            
            // Комментарий
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            Log::error('Order creation validation failed', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }
        
        Log::info('Order creation validation passed');

        // Получаем клиента
        $client = User::where('id', $data['client_id'])
                    ->where('user_type', 'client')
                    ->first();
        
        Log::info('Client lookup result', ['client_found' => $client ? $client->toArray() : null]);

        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Клиент не найден',
                'errors' => ['client_id' => ['Клиент с указанным ID не существует']]
            ], 422);
        }

        // Resolve menu items prices from catalog (if exists) and compute authoritative subtotal
        $requestedItems = $data['menu_items'] ?? [];
        $resolvedItems = $this->resolveMenuItems($requestedItems);

        $subtotal = collect($resolvedItems)->sum(function ($item) {
            // ensure rounding to 2 decimals and use server price
            $price = isset($item['server_price']) ? (float) $item['server_price'] : (float) ($item['price'] ?? 0);
            return round($item['quantity'] * $price, 2);
        });

        $discountFixed = (float) ($data['discount_fixed'] ?? 0);
        $discountPercent = (float) ($data['discount_percent'] ?? 0);
        $discountAmount = $discountFixed + ($subtotal * $discountPercent / 100);
        $itemsTotal = max(0, $subtotal - $discountAmount);
        $deliveryCost = (float) ($data['delivery_cost'] ?? 0);
        $finalAmount = $itemsTotal + $deliveryCost;

        Log::info('Calculated order amounts', [
            'subtotal' => $subtotal,
            'finalAmount' => $finalAmount,
            'client_company' => $client->company_name,
            'client_category' => $client->client_category
        ]);

        $order = Order::create([
            'client_id' => $client->id,
            'company_name' => $client->company_name ?? $client->name,
            'client_type' => $client->client_category,
            // store resolved menu items (authoritative prices included)
            'menu_items' => $resolvedItems,
            'comment' => $data['comment'],
            'status' => 'submitted',
            'coordinator_id' => $request->user()->id,
            'total_amount' => round($subtotal, 2),
            'discount_fixed' => $discountFixed,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'items_total' => $itemsTotal,
            'final_amount' => round($finalAmount, 2),
            'delivery_date' => $data['delivery_date'] ?? null,
            'delivery_time' => ($data['delivery_date'] && $data['delivery_time'])
                ? $data['delivery_date'] . ' ' . $data['delivery_time'] 
                : null,
            'delivery_type' => $data['delivery_type'] ?? 'delivery',
            'delivery_address' => $data['delivery_address'] ?? null,
            'delivery_cost' => $deliveryCost,
            'recurring_schedule' => $data['recurring_schedule'] ?? null,
            
            // Дополнительные поля
            'equipment_required' => $data['equipment_required'] ?? 0,
            'staff_assigned' => $data['staff_assigned'] ?? 0,
            'special_instructions' => $data['special_instructions'] ?? null,
        ]);

        // Отправляем уведомления о новом заказе
        $notificationService = new NotificationService();
        $notificationService->sendNewOrderNotifications($order);

        return response()->json([
            'success' => true,
            'message' => 'Заказ успешно создан',
            'data' => [
                'order' => $order->load('coordinator')
            ]
        ], 201);
    }

    /**
     * Обновление статуса заказа
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,submitted,processing,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $previousStatus = $order->status;
        $order->update(['status' => $request->status]);

        // Отправляем уведомления об изменении статуса
        if ($previousStatus !== $request->status) {
            $notificationService = new NotificationService();
            $notificationService->sendOrderStatusChangedNotifications($order, $previousStatus);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => [
                'order' => $order->load('coordinator')
            ]
        ]);
    }

    /**
     * Обновление заказа
     */
    public function update(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            // Тип клиента
            'client_type' => 'sometimes|in:corporate,one_time',
            
            // Корпоративный клиент
            'company_name' => 'sometimes|string|max:255',
            'employees' => 'sometimes|array',
            'employees.*.first_name' => 'required_with:employees|string|max:255',
            'employees.*.last_name' => 'required_with:employees|string|max:255',
            'employees.*.email' => 'nullable|email|max:255',
            'employees.*.phone' => 'nullable|string|max:20',
            
            // Разовый клиент
            'customer' => 'sometimes|array',
            'customer.first_name' => 'required_with:customer|string|max:255',
            'customer.last_name' => 'required_with:customer|string|max:255',
            'customer.email' => 'nullable|email|max:255',
            'customer.phone' => 'nullable|string|max:20',
            
            // Товары
            'menu_items' => 'sometimes|array',
            'menu_items.*.id' => 'required_with:menu_items|string',
            'menu_items.*.name' => 'required_with:menu_items|string',
            'menu_items.*.quantity' => 'required_with:menu_items|integer|min:1',
            'menu_items.*.price' => 'required_with:menu_items|numeric|min:0',
            
            // Скидки
            'discount_fixed' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            
            // Доставка
            'delivery_date' => 'nullable|date',
            'delivery_time' => 'nullable|date_format:H:i',
            'delivery_type' => 'nullable|in:delivery,pickup,buffet',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_cost' => 'nullable|numeric|min:0',
            
            // Расписание
            'recurring_schedule' => 'nullable|array',
            'recurring_schedule.enabled' => 'boolean',
            'recurring_schedule.frequency' => 'nullable|in:weekly,monthly',
            'recurring_schedule.days' => 'nullable|array',
            'recurring_schedule.delivery_time' => 'nullable|date_format:H:i',
            'recurring_schedule.notes' => 'nullable|string|max:500',
            
            // Дополнительные поля
            'equipment_required' => 'nullable|integer|min:0',
            'staff_assigned' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string',
            
            // Статус и комментарий
            'status' => 'sometimes|in:draft,submitted,processing,completed,cancelled',
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only([
            'client_type', 'company_name', 'customer', 'employees',
            'comment', 'status', 'delivery_date', 'delivery_type', 
            'delivery_address', 'delivery_cost', 'recurring_schedule',
            'equipment_required', 'staff_assigned', 'special_instructions'
        ]);

        // Пересчитываем суммы если изменились товары или скидки
        if ($request->has('menu_items') || $request->has('discount_fixed') || 
            $request->has('discount_percent') || $request->has('delivery_cost')) {
            
            $menuItems = $request->menu_items ?? $order->menu_items;
            $subtotal = collect($menuItems)->sum(function ($item) {
                return $item['quantity'] * $item['price'];
            });

            // По умолчанию при обновлении считаем скидку как отправлено в запросе,
            // отсутствующие поля считаем равными 0, а не берём из заказа
            $discountFixed = (float) ($request->discount_fixed ?? 0);
            $discountPercent = (float) ($request->discount_percent ?? 0);
            $discountAmount = $discountFixed + ($subtotal * $discountPercent / 100);
            $itemsTotal = max(0, $subtotal - $discountAmount);
            $deliveryCost = (float) ($request->delivery_cost ?? 0);
            $finalAmount = $itemsTotal + $deliveryCost;

            $updateData = array_merge($updateData, [
                'menu_items' => $menuItems,
                'total_amount' => $subtotal,
                'discount_fixed' => $discountFixed,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'items_total' => $itemsTotal,
                'final_amount' => $finalAmount,
            ]);
        }

        if ($request->delivery_date && $request->delivery_time) {
            $updateData['delivery_time'] = $request->delivery_date . ' ' . $request->delivery_time;
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Заказ успешно обновлен',
            'data' => [
                'order' => $order->fresh()->load('coordinator')
            ]
        ]);
    }

    /**
     * Удаление заказа
     */
    public function destroy(Order $order)
    {
        $order->delete();

        return response()->json([
            'success' => true,
            'message' => 'Заказ успешно удален'
        ]);
    }

    /**
     * Создание заказа на основе заявки
     */
    public function createFromApplication(Request $request, Application $application)
    {
        $validator = Validator::make($request->all(), [
            'client_id' => 'nullable|exists:users,id,user_type,client', // Существующий клиент
            'menu_items' => 'required|array|min:1',
            'menu_items.*.id' => 'required|string',
            'menu_items.*.name' => 'required|string',
            'menu_items.*.quantity' => 'required|integer|min:1',
            'menu_items.*.price' => 'required|numeric|min:0',
            'comment' => 'nullable|string',
            'delivery_date' => 'nullable|date',
            'delivery_time' => 'nullable|date_format:H:i',
            'delivery_type' => 'nullable|in:delivery,pickup,buffet',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_cost' => 'nullable|numeric|min:0',
            'discount_fixed' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'recurring_schedule' => 'nullable|array',
            'recurring_schedule.enabled' => 'boolean',
            'recurring_schedule.frequency' => 'nullable|in:weekly,monthly',
            'recurring_schedule.days' => 'nullable|array',
            'recurring_schedule.delivery_time' => 'nullable|date_format:H:i',
            'recurring_schedule.notes' => 'nullable|string|max:500',
            
            // Дополнительные поля
            'equipment_required' => 'nullable|integer|min:0',
            'staff_assigned' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        // Требуем обязательного указания client_id
        if (!$request->client_id) {
            return response()->json([
                'success' => false,
                'message' => 'Необходимо указать ID клиента',
                'errors' => ['client_id' => ['Поле client_id обязательно для заполнения']]
            ], 422);
        }

        // Ищем существующего клиента
        $client = User::where('id', $request->client_id)
                    ->where('user_type', 'client')
                    ->first();
        
        if (!$client) {
            return response()->json([
                'success' => false,
                'message' => 'Клиент не найден',
                'errors' => ['client_id' => ['Клиент с указанным ID не существует']]
            ], 422);
        }

        // Resolve menu items and compute authoritative subtotal
        $requestedItems = $request->menu_items ?? [];
        $resolvedItems = $this->resolveMenuItems($requestedItems);

        $subtotal = collect($resolvedItems)->sum(function ($item) {
            $price = isset($item['server_price']) ? (float) $item['server_price'] : (float) ($item['price'] ?? 0);
            return round($item['quantity'] * $price, 2);
        });

        $discountFixed = (float) ($request->discount_fixed ?? 0);
        $discountPercent = (float) ($request->discount_percent ?? 0);
        $discountAmount = $discountFixed + ($subtotal * $discountPercent / 100);
        $itemsTotal = max(0, $subtotal - $discountAmount);
        $deliveryCost = (float) ($request->delivery_cost ?? 0);
        $finalAmount = $itemsTotal + $deliveryCost;

        $order = Order::create([
            'client_id' => $client->id,
            'company_name' => $client->company_name ?? $client->name,
            'client_type' => $client->client_category,
            'menu_items' => $resolvedItems,
            'comment' => $request->comment,
            'status' => 'submitted',
            'coordinator_id' => $request->user()->id,
            'total_amount' => round($subtotal, 2),
            'discount_fixed' => $discountFixed,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'items_total' => $itemsTotal,
            'final_amount' => round($finalAmount, 2),
            'delivery_date' => $request->delivery_date,
            'delivery_time' => $request->delivery_date && $request->delivery_time
                ? $request->delivery_date . ' ' . $request->delivery_time
                : null,
            'delivery_type' => $request->delivery_type ?? 'delivery',
            'delivery_address' => $request->delivery_address,
            'delivery_cost' => $deliveryCost,
            'recurring_schedule' => $request->recurring_schedule,
            
            // Дополнительные поля
            'equipment_required' => $request->equipment_required ?? 0,
            'staff_assigned' => $request->staff_assigned ?? 0,
            'special_instructions' => $request->special_instructions ?? null,
        ]);

        // Отправляем уведомления о новом заказе
        $notificationService = new NotificationService();
        $notificationService->sendNewOrderNotifications($order);

        // Обновляем статус заявки на "approved" и привязываем клиента
        $application->update([
            'status' => 'approved',
            'coordinator_id' => $request->user()->id,
            'client_id' => $client->id,
            'processed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Заказ создан на основе заявки',
            'data' => [
                'order' => $order->load(['coordinator', 'client']),
                'application' => $application->fresh()->load('client')
            ]
        ], 201);
    }

    /**
     * Получение активных заказов клиента
     */
    public function getClientActiveOrders(Request $request)
    {
        $clientId = $request->user()->id; // Предполагаем, что клиент авторизован
        
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

        return response()->json([
            'success' => true,
            'data' => $activeOrders
        ]);
    }

    /**
     * Получение всех заказов клиента
     */
    public function getClientOrders(Request $request)
    {
        $clientId = $request->user()->id;
        
        $orders = Order::where('client_id', $clientId)
            ->with('coordinator')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Получение статистики по заказам
     */
    public function statistics()
    {
        $stats = [
            'total' => Order::count(),
            'draft' => Order::where('status', 'draft')->count(),
            'submitted' => Order::where('status', 'submitted')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'completed' => Order::where('status', 'completed')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
            'total_amount' => Order::where('status', '!=', 'cancelled')->sum('total_amount'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Получение заказа клиента по ID (с проверкой прав доступа)
     */
    public function showClientOrder(Request $request, Order $order)
    {
        $user = $request->user();
        
        // Проверяем, что заказ принадлежит клиенту
        if ($order->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен. Заказ не принадлежит клиенту.'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order->load('coordinator')
            ]
        ]);
    }
}
