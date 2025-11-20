<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\CreateApplicationRequest;
use App\Models\Application;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ApplicationReceived;


class ApplicationController extends BaseApiController
{
    /**
     * Создание новой заявки с сайта
     */
    public function store(CreateApplicationRequest $request)
    {
        try {
            $validatedData = $request->validated();

            // Если пользователь авторизован и является клиентом, автоматически устанавливаем client_id
            $clientId = $validatedData['client_id'] ?? null;
            if (!$clientId && $request->user() && $request->user()->user_type === 'client') {
                $clientId = $request->user()->id;
            }

            $application = Application::create([
                'first_name' => $validatedData['first_name'],
                'last_name' => $validatedData['last_name'],
                'company_name' => $validatedData['company_name'],
                'phone' => $validatedData['phone'],
                'email' => $validatedData['email'],
                'message' => $validatedData['message'],
                'event_address' => $validatedData['event_address'],
                'event_date' => $validatedData['event_date'],
                'event_time' => $validatedData['event_date'] && $validatedData['event_time'] ?
                    $validatedData['event_date'] . ' ' . $validatedData['event_time'] : null,
                'cart_items' => $validatedData['cart_items'],
                'status' => 'new',
                'client_id' => $clientId,
            ]);

            // Отправляем уведомления
            \Log::info('Application created successfully', ['application_id' => $application->id]);
            try {
                $notificationService = new NotificationService();
                $notificationService->sendNewApplicationNotifications($application);
            } catch (\Exception $e) {
                \Log::error('Notification error: ' . $e->getMessage());
            }

            return $this->createdResponse([
                'application' => $application
            ], 'Заявка успешно создана');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение списка заявок (для координаторов)
     */
    public function index(Request $request)
    {
        try {
            $this->authorize('viewAny', Application::class);
            
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

            if ($request->filled('client_id')) {
                $query->where('client_id', $request->client_id);
            }

            if ($request->filled('client_type')) {
                $query->whereHas('client', function ($q) use ($request) {
                    $q->where('client_category', $request->client_type);
                });
            }
           
            $applications = $query->orderBy('created_at', 'desc')
                                ->paginate(20);

            \Log::info('ApplicationController::index - found applications', [
                'count' => $applications->count(),
                'total' => $applications->total(),
            ]);

            return $this->paginatedResponse($applications, 'Заявки получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение заявки по ID
     */
    public function show(Application $application)
    {
        try {
            $this->authorize('view', $application);
            
            $applicationData = $application->load('coordinator')->toArray();
            
            // Временное логирование для отладки
            \Log::info('📋 Application data being sent to frontend:', [
                'id' => $application->id,
                'event_date' => $application->event_date,
                'event_time' => $application->event_time,
                'event_date_raw' => $application->getAttributes()['event_date'] ?? null,
                'event_time_raw' => $application->getAttributes()['event_time'] ?? null,
                'cart_items_count' => is_array($application->cart_items) ? count($application->cart_items) : 0,
            ]);
            
            return $this->successResponse([
                'application' => $applicationData
            ], 'Заявка получена успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Обновление статуса заявки координатором
     */
    public function updateStatus(Request $request, Application $application)
    {
        try {
            $this->authorize('updateStatus', $application);
            
            $rules = [
                'status' => 'required|in:processing,approved,rejected',
                'coordinator_comment' => 'nullable|string',
            ];

            $validatedData = $this->validateRequest($request, $rules, [
                'status.required' => 'Статус заявки обязателен для заполнения',
                'status.in' => 'Неверный статус заявки',
            ], [
                'status' => 'статус заявки',
                'coordinator_comment' => 'комментарий координатора',
            ]);

            // Сохраняем предыдущий статус для уведомлений
            $previousStatus = $application->status;

            $application->update([
                'status' => $validatedData['status'],
                'coordinator_comment' => $validatedData['coordinator_comment'],
                'coordinator_id' => $request->user()->id,
                'processed_at' => now(),
            ]);

            // Отправляем уведомления об изменении статуса
            $notificationService = new NotificationService();
            $notificationService->sendApplicationStatusChangedNotifications($application, $previousStatus);

            return $this->updatedResponse([
                'application' => $application->fresh()
            ], 'Статус заявки обновлен');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Создание заявки на мероприятие (публичный endpoint, без авторизации)
     */
    public function storeEventApplication(Request $request)
    {
        try {
            \Log::info('Event application request received:', [
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'raw_content' => $request->getContent(),
                'all_data' => $request->all(),
                'json_data' => $request->json()->all()
            ]);
            
            // Получаем данные из JSON или из тела запроса
            $data = $request->json()->all();
            if (empty($data)) {
                $data = json_decode($request->getContent(), true) ?: [];
            }
            
            \Log::info('Parsed data:', $data);
            
            $rules = [
                'eventDate' => 'required|date_format:Y-m-d|after_or_equal:today',
                'eventTime' => 'nullable|date_format:H:i',
                'location' => 'required|string|max:500',
                'budget' => 'required|string|max:100',
                'guestCount' => 'required|string|max:50',
                'details' => 'nullable|string|max:1000',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'name' => 'nullable|string|max:255', // Имя контактного лица
            ];

            $validatedData = $this->validateData($data, $rules, [
                'eventDate.required' => 'Дата мероприятия обязательна',
                'eventDate.date_format' => 'Неверный формат даты',
                'eventDate.after_or_equal' => 'Дата мероприятия должна быть сегодня или в будущем',
                'eventTime.date_format' => 'Неверный формат времени',
                'location.required' => 'Место проведения обязательно',
                'budget.required' => 'Бюджет обязателен',
                'guestCount.required' => 'Количество гостей обязательно',
                'email.required' => 'Email обязателен',
                'email.email' => 'Неверный формат email',
                'phone.required' => 'Телефон обязателен',
            ], [
                'eventDate' => 'дата мероприятия',
                'eventTime' => 'время мероприятия',
                'location' => 'место проведения',
                'budget' => 'бюджет',
                'guestCount' => 'количество гостей',
                'details' => 'дополнительные детали',
                'email' => 'email',
                'phone' => 'телефон',
                'name' => 'имя контактного лица',
            ]);

            \Log::info('Event application data received:', $validatedData);
            
            // Создаем заявку на мероприятие
            $application = Application::create([
                'first_name' => $validatedData['name'] ?? 'Event Organizer',
                'last_name' => null,
                'company_name' => null,
                'contact_person' => $validatedData['name'] ?? null,
                'email' => $validatedData['email'],
                'phone' => $validatedData['phone'],
                'event_address' => $validatedData['location'],
                'event_date' => $validatedData['eventDate'],
                'event_time' => isset($validatedData['eventTime']) 
                    ? $validatedData['eventDate'] . ' ' . $validatedData['eventTime']
                    : null,
                'guest_count' => (int) $validatedData['guestCount'],
                'budget' => $validatedData['budget'],
                'special_requirements' => $validatedData['details'] ?? null,
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

            return $this->createdResponse([
                'application_id' => $application->id
            ], 'Event application submitted successfully! We will contact you soon.');
        } catch (\Exception $e) {
            \Log::error('Event application creation failed: ' . $e->getMessage());
            
            return $this->handleException($e);
        }
    }
}