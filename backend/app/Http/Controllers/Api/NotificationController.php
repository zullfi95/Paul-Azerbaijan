<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Получение уведомлений клиента
     */
    public function getClientNotifications(Request $request)
    {
        $clientId = $request->user()->id;
        
        $notifications = Notification::forClient($clientId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications
        ]);
    }

    /**
     * Получение непрочитанных уведомлений клиента
     */
    public function getUnreadNotifications(Request $request)
    {
        $clientId = $request->user()->id;
        
        $unreadCount = Notification::forClient($clientId)
            ->unread()
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount
            ]
        ]);
    }

    /**
     * Отметить уведомление как прочитанное
     */
    public function markAsRead(Request $request, Notification $notification)
    {
        // Проверяем, что уведомление принадлежит текущему клиенту
        $clientId = $request->user()->id;
        $notificationClientId = $notification->metadata['client_id'] ?? null;
        
        if ($notificationClientId != $clientId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $notification->markAsSent();

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read'
        ]);
    }

    /**
     * Отметить все уведомления как прочитанные
     */
    public function markAllAsRead(Request $request)
    {
        $clientId = $request->user()->id;
        
        Notification::forClient($clientId)
            ->unread()
            ->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read'
        ]);
    }
}