<?php

namespace App\Http\Controllers\Api;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends BaseApiController
{
    /**
     * Получение уведомлений клиента
     */
    public function getClientNotifications(Request $request): JsonResponse
    {
        try {
            $clientId = $request->user()->id;
            
            $notifications = Notification::forClient($clientId)
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return $this->paginatedResponse($notifications, 'Уведомления получены успешно');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Получение непрочитанных уведомлений клиента
     */
    public function getUnreadNotifications(Request $request): JsonResponse
    {
        try {
            $clientId = $request->user()->id;
            
            $unreadCount = Notification::forClient($clientId)
                ->unread()
                ->count();

            return $this->successResponse(['unread_count' => $unreadCount], 'Количество непрочитанных уведомлений получено');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Отметить уведомление как прочитанное
     */
    public function markAsRead(Request $request, Notification $notification): JsonResponse
    {
        try {
            // Проверяем, что уведомление принадлежит текущему клиенту
            $clientId = $request->user()->id;
            $notificationClientId = $notification->metadata['client_id'] ?? null;
            
            if ($notificationClientId != $clientId) {
                return $this->forbiddenResponse('Доступ запрещен');
            }

            $notification->markAsSent();

            return $this->successResponse(null, 'Уведомление отмечено как прочитанное');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Отметить все уведомления как прочитанные
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $clientId = $request->user()->id;
            
            Notification::forClient($clientId)
                ->unread()
                ->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

            return $this->successResponse(null, 'Все уведомления отмечены как прочитанные');
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }
}