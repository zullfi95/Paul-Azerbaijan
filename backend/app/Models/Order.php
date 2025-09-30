<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Application;

class Order extends Model
{
    use HasFactory;
    protected $fillable = [
        'company_name',
        'client_type',
        'customer',
        'employees',
        'menu_items',
        'comment',
        'status',
        'coordinator_id',
        'client_id',
        'total_amount',
        'discount_fixed',
        'discount_percent',
        'discount_amount',
        'items_total',
        'final_amount',
        'delivery_date',
        'delivery_time',
        'delivery_type',
        'delivery_address',
        'delivery_cost',
        'recurring_schedule',
        'equipment_required',
        'staff_assigned',
        'special_instructions',
        'beo_file_path',
        'beo_generated_at',
        'preparation_timeline',
        'is_urgent',
        'order_deadline',
        'modification_deadline',
        'application_id',
        // Поля для платежей
        'algoritma_order_id',
        'payment_status',
        'payment_url',
        'payment_attempts',
        'payment_created_at',
        'payment_completed_at',
        'payment_details',
    ];

    protected $casts = [
        'menu_items' => 'array',
        'customer' => 'array',
        'employees' => 'array',
        'recurring_schedule' => 'array',
        'equipment_required' => 'integer',
        'staff_assigned' => 'integer',
        'preparation_timeline' => 'array',
        'delivery_date' => 'date',
        'delivery_time' => 'datetime',
        'beo_generated_at' => 'datetime',
        'order_deadline' => 'datetime',
        'modification_deadline' => 'datetime',
        'total_amount' => 'float',
        'discount_fixed' => 'float',
        'discount_percent' => 'float',
        'discount_amount' => 'float',
        'items_total' => 'float',
        'final_amount' => 'float',
        'delivery_cost' => 'float',
        'is_urgent' => 'boolean',
        // Поля для платежей
        'payment_attempts' => 'integer',
        'payment_created_at' => 'datetime',
        'payment_completed_at' => 'datetime',
        'payment_details' => 'array',
    ];

    /**
     * Координатор, создавший заказ
     */
    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    /**
     * Клиент, которому принадлежит заказ
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Заявка, на основе которой создан заказ
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    /**
     * Проверяет, черновик ли заказ
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Проверяет, отправлен ли заказ
     */
    public function isSubmitted(): bool
    {
        return in_array($this->status, ['submitted', 'processing', 'completed']);
    }

    /**
     * Полная дата и время доставки
     */
    public function getFullDeliveryDateTimeAttribute(): string
    {
        if ($this->delivery_date && $this->delivery_time) {
            return $this->delivery_date->format('d.m.Y') . ' ' . $this->delivery_time->format('H:i');
        }
        return 'Не указано';
    }

    /**
     * Проверяет, ожидает ли заказ оплаты
     */
    public function isPendingPayment(): bool
    {
        return $this->payment_status === 'pending' && $this->status === 'submitted';
    }

    /**
     * Проверяет, оплачен ли заказ
     */
    public function isPaid(): bool
    {
        return in_array($this->payment_status, ['charged', 'authorized']);
    }

    /**
     * Проверяет, можно ли попробовать оплатить снова
     */
    public function canRetryPayment(): bool
    {
        return $this->payment_attempts < 3 && $this->payment_status === 'failed';
    }

    /**
     * Увеличивает счетчик попыток оплаты
     */
    public function incrementPaymentAttempts(): void
    {
        $this->increment('payment_attempts');
    }

    /**
     * Обновляет статус платежа
     */
    public function updatePaymentStatus(string $status, array $details = []): void
    {
        $this->update([
            'payment_status' => $status,
            'payment_details' => $details,
            'payment_completed_at' => $status === 'charged' ? now() : null,
        ]);

        // Обновляем статус заказа в зависимости от статуса платежа
        if ($status === 'charged') {
            $this->update(['status' => 'paid']);
        } elseif ($status === 'failed' && $this->payment_attempts >= 3) {
            $this->update(['status' => 'cancelled']);
        }
    }
}
