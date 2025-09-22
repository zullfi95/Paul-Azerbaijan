<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'recipient_email',
        'recipient_role',
        'subject',
        'content',
        'metadata',
        'status',
        'sent_at',
        'error_message',
        'retry_count',
        'next_retry_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'sent_at' => 'datetime',
        'next_retry_at' => 'datetime',
    ];

    /**
     * Получение уведомлений для клиента
     */
    public function scopeForClient($query, $clientId)
    {
        return $query->where('recipient_role', 'client')
                    ->whereJsonContains('metadata->client_id', $clientId);
    }

    /**
     * Получение непрочитанных уведомлений
     */
    public function scopeUnread($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Получение отправленных уведомлений
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Отметить уведомление как отправленное
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Отметить уведомление как неудачное
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'retry_count' => $this->retry_count + 1,
            'next_retry_at' => now()->addMinutes(5 * $this->retry_count),
        ]);
    }
}