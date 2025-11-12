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
    
    // Константы статусов заказа
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_PENDING_PAYMENT = 'pending_payment';
    public const STATUS_PAID = 'paid';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_CANCELLED = 'cancelled';
    
    // Константы статусов платежа
    public const PAYMENT_STATUS_PENDING = 'pending';
    public const PAYMENT_STATUS_AUTHORIZED = 'authorized';
    public const PAYMENT_STATUS_CHARGED = 'charged';
    public const PAYMENT_STATUS_FAILED = 'failed';
    public const PAYMENT_STATUS_REFUNDED = 'refunded';
    
    // Максимальное количество попыток оплаты
    public const MAX_PAYMENT_ATTEMPTS = 3;
    
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
        'is_urgent',
        'application_id',
        // Поля для платежей
        'algoritma_order_id',
        'payment_status',
        'payment_url',
        'payment_attempts',
        'payment_created_at',
        'payment_completed_at',
    ];

    protected $casts = [
        'menu_items' => 'array',
        'customer' => 'array',
        'employees' => 'array',
        'recurring_schedule' => 'array',
        'equipment_required' => 'integer',
        'staff_assigned' => 'integer',
        'delivery_date' => 'date',
        'delivery_time' => 'datetime',
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
        return $this->status === self::STATUS_DRAFT;
    }

    /**
     * Проверяет, отправлен ли заказ
     */
    public function isSubmitted(): bool
    {
        return in_array($this->status, [
            self::STATUS_SUBMITTED, 
            self::STATUS_PROCESSING, 
            self::STATUS_COMPLETED
        ]);
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
        // Разрешаем оплату для заказов в статусе pending_payment или submitted
        // (submitted - когда заказ только создан и требует оплаты для one_time клиентов)
        return in_array($this->status, [
            self::STATUS_PENDING_PAYMENT, 
            self::STATUS_SUBMITTED
        ]);
    }

    /**
     * Проверяет, оплачен ли заказ
     */
    public function isPaid(): bool
    {
        return in_array($this->payment_status, [
            self::PAYMENT_STATUS_CHARGED, 
            self::PAYMENT_STATUS_AUTHORIZED
        ]);
    }

    /**
     * Проверяет, можно ли попробовать оплатить снова
     * 
     * ИСПРАВЛЕНО: Теперь учитывает случай первой попытки (payment_status = null)
     */
    public function canRetryPayment(): bool
    {
        // Инициализируем payment_attempts значением по умолчанию, если null
        $attempts = $this->payment_attempts ?? 0;
        
        // Разрешаем оплату если:
        // 1. Количество попыток меньше максимального (3)
        // 2. И статус платежа один из:
        //    - null (первая попытка, платеж еще не создавался)
        //    - pending (платеж создан, но не завершен)
        //    - failed (предыдущая попытка неудачна)
        
        $isAttemptsAllowed = $attempts < self::MAX_PAYMENT_ATTEMPTS;
        $isStatusAllowed = is_null($this->payment_status) || 
                          in_array($this->payment_status, [
                              self::PAYMENT_STATUS_PENDING, 
                              self::PAYMENT_STATUS_FAILED
                          ]);
        
        return $isAttemptsAllowed && $isStatusAllowed;
    }

    /**
     * Увеличивает счетчик попыток оплаты
     */
    public function incrementPaymentAttempts(): void
    {
        // Инициализируем значение 0 если payment_attempts null
        if (is_null($this->payment_attempts)) {
            $this->payment_attempts = 0;
        }
        
        $this->increment('payment_attempts');
    }

    /**
     * Обновляет статус платежа
     * 
     * ИСПРАВЛЕНО: Использует константы и добавляет payment_completed_at
     */
    public function updatePaymentStatus(string $status): void
    {
        $updateData = [
            'payment_status' => $status,
        ];
        
        // Если платеж завершен (успешно или с ошибкой), записываем время завершения
        if (in_array($status, [
            self::PAYMENT_STATUS_CHARGED, 
            self::PAYMENT_STATUS_FAILED, 
            self::PAYMENT_STATUS_REFUNDED
        ])) {
            $updateData['payment_completed_at'] = now();
        }
        
        $this->update($updateData);

        // Обновляем статус заказа в зависимости от статуса платежа
        if ($status === self::PAYMENT_STATUS_CHARGED) {
            // Платеж успешен - переводим заказ в статус "оплачен"
            $this->update(['status' => self::STATUS_PAID]);
        } elseif ($status === self::PAYMENT_STATUS_FAILED) {
            // Платеж не прошел - проверяем количество попыток
            $attempts = $this->payment_attempts ?? 0;
            if ($attempts >= self::MAX_PAYMENT_ATTEMPTS) {
                // Превышен лимит попыток - отменяем заказ
                $this->update(['status' => self::STATUS_CANCELLED]);
            }
            // Иначе заказ остается в статусе pending_payment для повторной попытки
        }
    }
}
