<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;

class Application extends Model
{
    use HasFactory;
    protected $fillable = [
        'first_name',
        'last_name',
        'company_name',
        'contact_person',
        'phone',
        'email',
        'message',
        'event_address',
        'event_date',
        'event_time',
        'cart_items',
        'event_type',
        'guest_count',
        'budget',
        'special_requirements',
        'status',
        'coordinator_comment',
        'coordinator_id',
        'client_id',
        'processed_at',
    ];

    protected $casts = [
        'cart_items' => 'array',
        'event_date' => 'date',
        'processed_at' => 'datetime',
    ];

    /**
     * Координатор, обработавший заявку
     */
    public function coordinator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coordinator_id');
    }

    /**
     * Клиент, создавший заявку
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Полное имя заявителя
     */
    public function getFullNameAttribute(): string
    {
        if ($this->last_name) {
            return "{$this->first_name} {$this->last_name}";
        }
        return $this->first_name;
    }

    /**
     * Проверяет, новая ли заявка
     */
    public function isNew(): bool
    {
        return $this->status === 'new';
    }

    /**
     * Проверяет, обработана ли заявка
     */
    public function isProcessed(): bool
    {
        return in_array($this->status, ['approved', 'rejected']);
    }

    /**
     * Получает координаты мероприятия
     */
    public function getEventCoordinatesAttribute(): ?array
    {
        // Координаты больше не поддерживаются
        return null;
    }

    /**
     * Проверяет, есть ли координаты мероприятия
     */
    public function hasEventCoordinates(): bool
    {
        return false;
    }
}
