<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Mail\ApplicationReceived;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class ApplicationController extends Controller
{
    /**
     * Создание новой заявки с сайта
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'message' => 'nullable|string|max:1000',
            'event_address' => 'nullable|string|max:500',
            'event_date' => 'nullable|date|after:today',
            'event_time' => 'nullable|date_format:H:i',
            'event_lat' => 'nullable|numeric|between:-90,90',
            'event_lng' => 'nullable|numeric|between:-180,180',
            'cart_items' => 'nullable|array',
            'cart_items.*.id' => 'required_with:cart_items|string',
            'cart_items.*.name' => 'required_with:cart_items|string',
            'cart_items.*.quantity' => 'required_with:cart_items|integer|min:1',
            'cart_items.*.price' => 'required_with:cart_items|numeric|min:0',
            'coordinator_id' => 'nullable|exists:users,id,user_type,staff,staff_role,coordinator',
            'client_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        // Если пользователь авторизован и является клиентом, автоматически устанавливаем client_id
        $clientId = $request->client_id;
        if (!$clientId && $request->user() && $request->user()->user_type === 'client') {
            $clientId = $request->user()->id;
        }

        $application = Application::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'phone' => $request->phone,
            'email' => $request->email,
            'message' => $request->message,
            'event_address' => $request->event_address,
            'event_date' => $request->event_date,
            'event_time' => $request->event_date && $request->event_time ?
                $request->event_date . ' ' . $request->event_time : null,
            'event_lat' => $request->event_lat,
            'event_lng' => $request->event_lng,
            'cart_items' => $request->cart_items,
            'status' => 'new',
            'client_id' => $clientId,
        ]);

        // Отправляем уведомления
        $notificationService = new NotificationService();
        $notificationService->sendNewApplicationNotifications($application);

        return response()->json([
            'success' => true,
            'message' => 'Заявка успешно создана',
            'data' => [
                'application' => $application
            ]
        ], 201);
    }

    /**
     * Получение списка заявок (для координаторов)
     */
    public function index(Request $request)
    {
        \Log::info('ApplicationController::index called', [
            'user_id' => $request->user()?->id,
            'user_type' => $request->user()?->user_type,
            'staff_role' => $request->user()?->staff_role,
        ]);

        // Если пользователь клиент, показываем только его заявки
        $query = Application::with(['coordinator', 'client']);
        
        if ($request->user()->isClient()) {
            $query->where('client_id', $request->user()->id);
        }
        
        $applications = $query->orderBy('created_at', 'desc')
                            ->paginate(20);

        \Log::info('ApplicationController::index - found applications', [
            'count' => $applications->count(),
            'total' => $applications->total(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Получение заявки по ID
     */
    public function show(Application $application)
    {
        return response()->json([
            'success' => true,
            'data' => $application->load('coordinator')
        ]);
    }

    /**
     * Обновление статуса заявки координатором
     */
    public function updateStatus(Request $request, Application $application)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:processing,approved,rejected',
            'coordinator_comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $validator->errors()
            ], 422);
        }

        // Сохраняем предыдущий статус для уведомлений
        $previousStatus = $application->status;

        $application->update([
            'status' => $request->status,
            'coordinator_comment' => $request->coordinator_comment,
            'coordinator_id' => $request->user()->id,
            'processed_at' => now(),
        ]);

        // Отправляем уведомления об изменении статуса
        $notificationService = new NotificationService();
        $notificationService->sendApplicationStatusChangedNotifications($application, $previousStatus);

        return response()->json([
            'success' => true,
            'message' => 'Статус заявки обновлен',
            'data' => [
                'application' => $application->fresh()
            ]
        ]);
    }

    /**
     * Создание заявки на мероприятие (публичный endpoint, без авторизации)
     */
    public function storeEventApplication(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'eventDate' => 'required|date_format:Y-m-d|after:today',
            'location' => 'required|string|max:500',
            'budget' => 'required|string|max:100',
            'guestCount' => 'required|string|max:50',
            'details' => 'nullable|string|max:1000',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'name' => 'nullable|string|max:255', // Имя контактного лица
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            \Log::info('Event application data received:', $request->all());
            
            // Создаем заявку на мероприятие
            $application = Application::create([
                'first_name' => $request->name ?: 'Event',
                'last_name' => 'Organizer',
                'company_name' => $request->name ?: 'Event Planning Request',
                'contact_person' => $request->name ?: 'Event Organizer',
                'email' => $request->email,
                'phone' => $request->phone,
                'event_type' => 'Event Planning',
                'event_date' => $request->eventDate,
                'event_time' => '12:00:00', // Default time
                'guest_count' => (int) $request->guestCount,
                'budget' => $request->budget,
                'special_requirements' => $request->details,
                'status' => 'new',
                'client_id' => null, // Публичная заявка
                'coordinator_id' => null, // Будет назначен координатором
            ]);

            \Log::info('Event application created successfully:', ['id' => $application->id]);

            // Отправляем уведомление координаторам
            $notificationService = new NotificationService();
            $notificationService->sendNewApplicationNotifications($application);

            // Отправляем email подтверждение клиенту
            try {
                Mail::to($request->email)->send(new ApplicationReceived($application));
            } catch (\Exception $e) {
                // Логируем ошибку, но не прерываем процесс
                \Log::error('Failed to send confirmation email: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Event application submitted successfully! We will contact you soon.',
                'data' => [
                    'application_id' => $application->id
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Event application creation failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit event application. Please try again.'
            ], 500);
        }
    }
}
