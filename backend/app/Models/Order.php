<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Client;

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
    ];

    protected $appends = ['client_type'];

    protected $casts = [
        'menu_items' => 'array',
        'customer' => 'array',
        'employees' => 'array',
        'recurring_schedule' => 'array',
        'delivery_date' => 'date',
        'delivery_time' => 'datetime',
        'total_amount' => 'float',
        'discount_fixed' => 'float',
        'discount_percent' => 'float',
        'discount_amount' => 'float',
        'items_total' => 'float',
        'final_amount' => 'float',
        'delivery_cost' => 'float',
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
        return $this->belongsTo(Client::class, 'client_id');
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
     * Получить тип клиента
     */
    public function getClientTypeAttribute(): ?string
    {
        return $this->client ? $this->client->client_category : null;
    }
}
