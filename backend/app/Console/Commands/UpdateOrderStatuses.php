<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class UpdateOrderStatuses extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'orders:update-statuses';

    /**
     * The console command description.
     */
    protected $description = 'Автоматически обновляет статусы заказов на основе даты доставки';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Обновление статусов заказов...');
        
        $updatedProcessing = 0;
        $updatedCompleted = 0;
        
        // Заказы, которые должны перейти в статус "готовится" (processing)
        // За 2 дня до даты доставки
        $twoDaysFromNow = now()->addDays(2)->format('Y-m-d');
        
        $ordersForProcessing = Order::whereDate('delivery_date', $twoDaysFromNow)
            ->where('status', Order::STATUS_PAID) // Только оплаченные заказы (еще не готовятся)
            ->where('status', '!=', Order::STATUS_COMPLETED) // И не завершенные
            ->where('status', '!=', Order::STATUS_CANCELLED) // И не отмененные
            ->get();
        
        foreach ($ordersForProcessing as $order) {
            $order->update([
                'status' => Order::STATUS_PROCESSING
            ]);
            $updatedProcessing++;
            
            Log::info('Order status updated to processing', [
                'order_id' => $order->id,
                'delivery_date' => $order->delivery_date,
                'previous_status' => 'paid'
            ]);
        }
        
        // Заказы, которые должны перейти в статус "отправлено" (completed)
        // В день доставки
        $today = now()->format('Y-m-d');
        
        $ordersForCompletion = Order::whereDate('delivery_date', $today)
            ->whereIn('status', [
                Order::STATUS_PAID, // Оплаченные заказы
                Order::STATUS_PROCESSING // Или уже готовящиеся
            ])
            ->where('status', '!=', Order::STATUS_COMPLETED) // Еще не завершенные
            ->where('status', '!=', Order::STATUS_CANCELLED) // И не отмененные
            ->get();
        
        foreach ($ordersForCompletion as $order) {
            $order->update([
                'status' => Order::STATUS_COMPLETED
            ]);
            $updatedCompleted++;
            
            Log::info('Order status updated to completed', [
                'order_id' => $order->id,
                'delivery_date' => $order->delivery_date,
                'previous_status' => $order->getOriginal('status')
            ]);
        }
        
        $this->info("✅ Обновлено статусов:");
        $this->info("   - В статус 'готовится': {$updatedProcessing}");
        $this->info("   - В статус 'отправлено': {$updatedCompleted}");
        
        return Command::SUCCESS;
    }
}

