<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BEO;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class BEOController extends Controller
{
    /**
     * Display a listing of the BEOs.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = BEO::with(['order', 'order.client', 'sections']);

            // Фильтрация по дате
            if ($request->has('date_from')) {
                $query->where('event_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('event_date', '<=', $request->date_to);
            }

            // Фильтрация по статусу заказа
            if ($request->has('order_status')) {
                $query->whereHas('order', function ($q) use ($request) {
                    $q->where('status', $request->order_status);
                });
            }

            // Сортировка
            $sortBy = $request->get('sort_by', 'event_date');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Пагинация
            $perPage = $request->get('per_page', 15);
            $beos = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $beos->items(),
                'pagination' => [
                    'current_page' => $beos->currentPage(),
                    'last_page' => $beos->lastPage(),
                    'per_page' => $beos->perPage(),
                    'total' => $beos->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка загрузки BEO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store a newly created BEO.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'event_name' => 'required|string|max:255',
                'event_date' => 'required|date',
                'event_time' => 'required|string',
                'venue' => 'required|string|max:255',
                'guest_count' => 'required|integer|min:1',
                'contact_person' => 'required|string|max:255',
                'contact_phone' => 'required|string|max:20',
                'contact_email' => 'required|email|max:255',
                'special_instructions' => 'nullable|string',
                'setup_requirements' => 'nullable|string',
                'dietary_restrictions' => 'nullable|string',
            ]);

            // Проверяем, что заказ существует и не имеет BEO
            $order = Order::findOrFail($validated['order_id']);
            $existingBEO = BEO::where('order_id', $validated['order_id'])->first();
            
            if ($existingBEO) {
                return response()->json([
                    'success' => false,
                    'message' => 'Для этого заказа уже создан BEO',
                ], 422);
            }

            $beo = BEO::create($validated);

            // Загружаем связанные данные
            $beo->load(['order', 'order.client', 'sections']);

            return response()->json([
                'success' => true,
                'data' => $beo,
                'message' => 'BEO успешно создан',
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка создания BEO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified BEO.
     */
    public function show(BEO $beo): JsonResponse
    {
        try {
            $beo->load(['order', 'order.client', 'order.items.menuItem', 'sections']);

            return response()->json([
                'success' => true,
                'data' => $beo,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка загрузки BEO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update the specified BEO.
     */
    public function update(Request $request, BEO $beo): JsonResponse
    {
        try {
            $validated = $request->validate([
                'event_name' => 'sometimes|string|max:255',
                'event_date' => 'sometimes|date',
                'event_time' => 'sometimes|string',
                'venue' => 'sometimes|string|max:255',
                'guest_count' => 'sometimes|integer|min:1',
                'contact_person' => 'sometimes|string|max:255',
                'contact_phone' => 'sometimes|string|max:20',
                'contact_email' => 'sometimes|email|max:255',
                'special_instructions' => 'nullable|string',
                'setup_requirements' => 'nullable|string',
                'dietary_restrictions' => 'nullable|string',
            ]);

            $beo->update($validated);
            $beo->load(['order', 'order.client', 'sections']);

            return response()->json([
                'success' => true,
                'data' => $beo,
                'message' => 'BEO успешно обновлен',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка обновления BEO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified BEO.
     */
    public function destroy(BEO $beo): JsonResponse
    {
        try {
            $beo->delete();

            return response()->json([
                'success' => true,
                'message' => 'BEO успешно удален',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка удаления BEO',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get orders without BEO.
     */
    public function ordersWithoutBEO(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['client', 'items.menuItem'])
                ->whereNotIn('id', function ($query) {
                    $query->select('order_id')
                        ->from('beos');
                });

            // Фильтрация по статусу
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Фильтрация по дате
            if ($request->has('date_from')) {
                $query->where('event_date', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('event_date', '<=', $request->date_to);
            }

            $orders = $query->orderBy('event_date', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $orders,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка загрузки заказов',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate BEO PDF.
     */
    public function generatePDF(BEO $beo): JsonResponse
    {
        try {
            $beo->load(['order', 'order.client', 'order.items.menuItem', 'sections']);

            // Здесь можно добавить логику генерации PDF
            // Например, используя библиотеку DomPDF или TCPDF

            return response()->json([
                'success' => true,
                'message' => 'PDF будет сгенерирован',
                'data' => [
                    'beo_id' => $beo->id,
                    'download_url' => route('beo.pdf', $beo->id),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка генерации PDF',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
