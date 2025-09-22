<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Order;
use App\Models\User;
use App\Mail\ApplicationReceived;
use App\Mail\ApplicationStatusChanged;
use App\Mail\OrderCreated;
use App\Mail\StaffNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Отправка уведомления о получении новой заявки
     */
    public function sendNewApplicationNotifications(Application $application): void
    {
        try {
            // Уведомление клиенту
            Mail::to($application->email)->send(new ApplicationReceived($application));
            
            // Уведомления персоналу
            $this->sendStaffNotifications('new_application', $application);
            
            Log::info('New application notifications sent', ['application_id' => $application->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send new application notifications', [
                'application_id' => $application->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомления об изменении статуса заявки
     */
    public function sendApplicationStatusChangedNotifications(Application $application, string $previousStatus): void
    {
        try {
            // Уведомление клиенту
            Mail::to($application->email)->send(new ApplicationStatusChanged($application, $previousStatus));
            
            // Уведомления персоналу
            $this->sendStaffNotifications('application_status_changed', $application);
            
            Log::info('Application status changed notifications sent', [
                'application_id' => $application->id,
                'previous_status' => $previousStatus,
                'current_status' => $application->status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send application status changed notifications', [
                'application_id' => $application->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомления о создании нового заказа
     */
    public function sendNewOrderNotifications(Order $order): void
    {
        try {
            // Уведомления персоналу (включая координатора, шефов, операционного менеджера)
            $this->sendStaffNotifications('new_order', $order);
            
            // Уведомление клиенту о создании заказа
            $this->sendClientOrderNotification($order);
            
            Log::info('New order notifications sent', ['order_id' => $order->id]);
        } catch (\Exception $e) {
            Log::error('Failed to send new order notifications', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомления клиенту о создании заказа
     */
    public function sendClientOrderNotification(Order $order): void
    {
        try {
            if ($order->client && $order->client->email) {
                // Определяем тип уведомления в зависимости от типа клиента
                $isOneTimeClient = $order->client->client_category === 'one_time';
                $notificationType = $isOneTimeClient ? 'order_created_payment_required' : 'order_created';
                
                // Создаем запись в таблице уведомлений
                \App\Models\Notification::create([
                    'type' => 'email',
                    'recipient_email' => $order->client->email,
                    'recipient_role' => 'client',
                    'subject' => $isOneTimeClient ? 
                        'Sifariş yaradıldı - Ödəniş gözlənilir - PAUL Catering' : 
                        'Yeni sifariş yaradıldı - PAUL Catering',
                    'content' => $this->generateClientOrderNotificationContent($order, $isOneTimeClient),
                    'metadata' => [
                        'order_id' => $order->id,
                        'client_id' => $order->client->id,
                        'notification_type' => $notificationType,
                        'client_type' => $order->client->client_category,
                        'payment_required' => $isOneTimeClient
                    ],
                    'status' => 'pending'
                ]);

                // Отправляем email уведомление
                if ($isOneTimeClient) {
                    $this->sendPaymentRequiredEmail($order);
                }

                Log::info('Client order notification created', [
                    'order_id' => $order->id,
                    'client_email' => $order->client->email,
                    'client_type' => $order->client->client_category,
                    'payment_required' => $isOneTimeClient
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create client order notification', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Генерация контента уведomления для клиента
     */
    private function generateClientOrderNotificationContent(Order $order, bool $isOneTimeClient = false): string
    {
        $deliveryDate = $order->delivery_date ? 
            \Carbon\Carbon::parse($order->delivery_date)->format('d.m.Y') : 
            'Təyin edilməyib';
        
        $deliveryTime = $order->delivery_time ? 
            \Carbon\Carbon::parse($order->delivery_time)->format('H:i') : 
            'Təyin edilməyib';

        $itemsList = '';
        foreach ($order->menu_items as $item) {
            $itemsList .= "• {$item['name']} - {$item['quantity']} ədəd\n";
        }

        $baseContent = "Salam {$order->client->name}!\n\n" .
               "Sizin üçün yeni sifariş yaradıldı.\n\n" .
               "Sifariş məlumatları:\n" .
               "Sifariş №: {$order->id}\n" .
               "Şirkət: {$order->company_name}\n" .
               "Çatdırılma tarixi: {$deliveryDate}\n" .
               "Çatdırılma vaxtı: {$deliveryTime}\n" .
               "Ünvan: {$order->delivery_address}\n\n" .
               "Sifariş edilən məhsullar:\n{$itemsList}\n" .
               "Ümumi məbləğ: {$order->final_amount} ₼\n\n";

        if ($isOneTimeClient) {
            $paymentUrl = config('app.frontend_url', 'http://localhost:3000') . "/payment/{$order->id}";
            $baseContent .= "⚠️ ÖDƏNİŞ TƏLƏB OLUNUR ⚠️\n\n" .
                           "Sifarişinizin təsdiqlənməsi üçün ödəniş tələb olunur.\n" .
                           "Ödəniş linki: {$paymentUrl}\n\n" .
                           "Ödəniş edildikdən sonra sifarişiniz hazırlanma prosesinə keçəcək.\n\n";
        } else {
            $baseContent .= "Sifarişiniz qəbul edildi və hazırlanma prosesindədir.\n\n";
        }

        $baseContent .= "PAUL Catering komandası";
        
        return $baseContent;
    }

    /**
     * Отправка email уведомления об оплате для разовых клиентов
     */
    private function sendPaymentRequiredEmail(Order $order): void
    {
        try {
            $paymentUrl = config('app.frontend_url', 'http://localhost:3000') . "/payment/{$order->id}";
            
            $deliveryDate = $order->delivery_date ? 
                \Carbon\Carbon::parse($order->delivery_date)->format('d.m.Y') : 
                'Təyin edilməyib';
            
            $deliveryTime = $order->delivery_time ? 
                \Carbon\Carbon::parse($order->delivery_time)->format('H:i') : 
                'Təyin edilməyib';

            $itemsList = '';
            foreach ($order->menu_items as $item) {
                $itemsList .= "<li>{$item['name']} - {$item['quantity']} ədəd</li>";
            }

            $emailContent = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <div style='background: linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;'>
                        <h1 style='margin: 0; font-size: 28px; font-weight: bold;'>PAUL Catering</h1>
                        <p style='margin: 10px 0 0 0; opacity: 0.9;'>Sifarişiniz yaradıldı</p>
                    </div>
                    
                    <div style='background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);'>
                        <h2 style='color: #1A1A1A; margin-bottom: 20px;'>Salam {$order->client->name}!</h2>
                        
                        <p style='color: #4A4A4A; line-height: 1.6; margin-bottom: 20px;'>
                            Sizin üçün yeni sifariş yaradıldı. Sifarişinizin təsdiqlənməsi üçün ödəniş tələb olunur.
                        </p>
                        
                        <div style='background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 10px; padding: 20px; margin: 20px 0;'>
                            <h3 style='color: #D97706; margin: 0 0 10px 0;'>⚠️ Ödəniş Tələb Olunur</h3>
                            <p style='color: #92400E; margin: 0; font-weight: 500;'>
                                Sifarişinizin hazırlanması üçün ödəniş edilməlidir.
                            </p>
                        </div>
                        
                        <div style='background: #F8FAFC; border-radius: 10px; padding: 20px; margin: 20px 0;'>
                            <h3 style='color: #1A1A1A; margin: 0 0 15px 0;'>Sifariş Məlumatları</h3>
                            <p style='margin: 5px 0; color: #4A4A4A;'><strong>Sifariş №:</strong> {$order->id}</p>
                            <p style='margin: 5px 0; color: #4A4A4A;'><strong>Şirkət:</strong> {$order->company_name}</p>
                            <p style='margin: 5px 0; color: #4A4A4A;'><strong>Çatdırılma tarixi:</strong> {$deliveryDate}</p>
                            <p style='margin: 5px 0; color: #4A4A4A;'><strong>Çatdırılma vaxtı:</strong> {$deliveryTime}</p>
                            <p style='margin: 5px 0; color: #4A4A4A;'><strong>Ünvan:</strong> {$order->delivery_address}</p>
                        </div>
                        
                        <div style='background: #F8FAFC; border-radius: 10px; padding: 20px; margin: 20px 0;'>
                            <h3 style='color: #1A1A1A; margin: 0 0 15px 0;'>Sifariş Edilən Məhsullar</h3>
                            <ul style='margin: 0; padding-left: 20px; color: #4A4A4A;'>
                                {$itemsList}
                            </ul>
                        </div>
                        
                        <div style='background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); color: white; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center;'>
                            <h3 style='margin: 0 0 10px 0; font-size: 24px;'>Ümumi Məbləğ</h3>
                            <p style='margin: 0; font-size: 32px; font-weight: bold;'>{$order->final_amount} ₼</p>
                        </div>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{$paymentUrl}' style='background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);'>
                                💳 Ödəniş Et
                            </a>
                        </div>
                        
                        <p style='color: #6B7280; font-size: 14px; line-height: 1.6; margin-top: 20px;'>
                            Ödəniş edildikdən sonra sifarişiniz hazırlanma prosesinə keçəcək və sizə məlumat veriləcək.
                        </p>
                    </div>
                    
                    <div style='text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px;'>
                        <p>PAUL Catering komandası</p>
                        <p>Bu email avtomatik olaraq göndərilmişdir.</p>
                    </div>
                </div>
            ";

            // Отправляем email
            Mail::send([], [], function ($message) use ($order, $emailContent) {
                $message->to($order->client->email, $order->client->name)
                        ->subject('Sifariş yaradıldı - Ödəniş gözlənilir - PAUL Catering')
                        ->setBody($emailContent, 'text/html');
            });

            Log::info('Payment required email sent', [
                'order_id' => $order->id,
                'client_email' => $order->client->email
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send payment required email', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомления об изменении статуса заказа
     */
    public function sendOrderStatusChangedNotifications(Order $order, string $previousStatus): void
    {
        try {
            // Уведомления персоналу
            $this->sendStaffNotifications('order_status_changed', $order);

            // Уведомление клиенту при определенных изменениях статуса
            if ($order->client && $order->client->email) {
                $this->sendClientOrderStatusNotification($order, $previousStatus);
            }

            Log::info('Order status changed notifications sent', [
                'order_id' => $order->id,
                'previous_status' => $previousStatus,
                'new_status' => $order->status
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send order status changed notifications', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомления клиенту об изменении статуса заказа
     */
    private function sendClientOrderStatusNotification(Order $order, string $previousStatus): void
    {
        try {
            $statusMessages = [
                'draft' => 'Черновик',
                'submitted' => 'Заказ принят',
                'processing' => 'Заказ в обработке',
                'completed' => 'Заказ выполнен',
                'cancelled' => 'Заказ отменен'
            ];

            $content = "Salam {$order->client->name}!\n\n" .
                      "Sifarişinizin statusu dəyişdi:\n" .
                      "Sifariş №: {$order->id}\n" .
                      "Əvvəlki status: " . (isset($statusMessages[$previousStatus]) ? $statusMessages[$previousStatus] : $previousStatus) . "\n" .
                      "Yeni status: " . (isset($statusMessages[$order->status]) ? $statusMessages[$order->status] : $order->status) . "\n\n";

            if ($order->status === 'processing') {
                $content .= "Sifarişiniz hazırlandı və tezliklə çatdırılacaq.\n\n";
            } elseif ($order->status === 'completed') {
                $content .= "Sifarişiniz uğurla tamamlandı. Sizə xidmət etdiyimiz üçün təşəkkür edirik!\n\n";
            } elseif ($order->status === 'cancelled') {
                $content .= "Sifarişiniz ləğv edildi. Daha ətraflı məlumat üçün bizimlə əlaqə saxlayın.\n\n";
            }

            $content .= "PAUL Catering komandası";

            \App\Models\Notification::create([
                'type' => 'email',
                'recipient_email' => $order->client->email,
                'recipient_role' => 'client',
                'subject' => 'Sifariş statusu dəyişdi - PAUL Catering',
                'content' => $content,
                'metadata' => [
                    'order_id' => $order->id,
                    'client_id' => $order->client->id,
                    'notification_type' => 'order_status_changed',
                    'previous_status' => $previousStatus,
                    'new_status' => $order->status
                ],
                'status' => 'pending'
            ]);

            Log::info('Client order status notification created', [
                'order_id' => $order->id,
                'client_email' => $order->client->email,
                'previous_status' => $previousStatus,
                'new_status' => $order->status
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create client order status notification', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомления об обновлении заказа
     */
    public function sendOrderUpdatedNotifications(Order $order, array $changes = []): void
    {
        try {
            // Уведомления персоналу
            $this->sendStaffNotifications('order_updated', $order);

            Log::info('Order updated notifications sent', [
                'order_id' => $order->id,
                'changes' => $changes
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send order updated notifications', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Отправка уведомлений персоналу
     */
    private function sendStaffNotifications(string $notificationType, $data): void
    {
        // Получаем список email адресов для уведомлений
        $staffEmails = $this->getStaffEmails();
        
        foreach ($staffEmails as $email => $role) {
            try {
                Mail::to($email)->send(new StaffNotification($notificationType, $data, $role));
            } catch (\Exception $e) {
                Log::error('Failed to send staff notification', [
                    'email' => $email,
                    'role' => $role,
                    'notification_type' => $notificationType,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Получение списка email адресов персонала для уведомлений
     */
    private function getStaffEmails(): array
    {
        $emails = [];
        
        // Координаторы
        $coordinators = User::where('staff_role', 'coordinator')
            ->where('status', 'active')
            ->get();
            
        foreach ($coordinators as $coordinator) {
            $emails[$coordinator->email] = 'coordinator';
        }
        
        // Наблюдатели (например, шефы, операционные менеджеры)
        $observers = User::where('staff_role', 'observer')
            ->where('status', 'active')
            ->get();
            
        foreach ($observers as $observer) {
            $emails[$observer->email] = 'observer';
        }
        
        // Дополнительные email адреса из конфигурации
        $additionalEmails = config('notifications.additional_staff_emails', []);
        foreach ($additionalEmails as $email => $role) {
            $emails[$email] = $role;
        }
        
        return $emails;
    }

    /**
     * Отправка напоминаний о предстоящих мероприятиях
     */
    public function sendUpcomingEventReminders(): void
    {
        // Находим заказы на завтра
        $tomorrowOrders = Order::whereDate('delivery_date', now()->addDay())
            ->where('status', '!=', 'cancelled')
            ->with('coordinator')
            ->get();
            
        foreach ($tomorrowOrders as $order) {
            try {
                $this->sendStaffNotifications('upcoming_event', $order);
                
                Log::info('Upcoming event reminder sent', ['order_id' => $order->id]);
            } catch (\Exception $e) {
                Log::error('Failed to send upcoming event reminder', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Отправка еженедельного отчета
     */
    public function sendWeeklyReport(): void
    {
        try {
            $weekStart = now()->startOfWeek();
            $weekEnd = now()->endOfWeek();
            
            // Статистика за неделю
            $weeklyStats = [
                'applications_count' => Application::whereBetween('created_at', [$weekStart, $weekEnd])->count(),
                'orders_count' => Order::whereBetween('created_at', [$weekStart, $weekEnd])->count(),
                'total_amount' => Order::whereBetween('created_at', [$weekStart, $weekEnd])->sum('total_amount'),
                'completed_orders' => Order::whereBetween('created_at', [$weekStart, $weekEnd])
                    ->where('status', 'completed')->count(),
            ];
            
            $this->sendStaffNotifications('weekly_report', $weeklyStats);
            
            Log::info('Weekly report sent', $weeklyStats);
        } catch (\Exception $e) {
            Log::error('Failed to send weekly report', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Тестовое уведомление (для проверки настроек email)
     */
    public function sendTestNotification(string $email): bool
    {
        try {
            Mail::raw('Bu PAUL Azerbaijan katerinq sistemindən test mesajıdır. Sistem düzgün işləyir!', function ($message) use ($email) {
                $message->to($email)
                    ->subject('PAUL Katerinq - Test mesajı');
            });
            
            Log::info('Test notification sent', ['email' => $email]);
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send test notification', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
