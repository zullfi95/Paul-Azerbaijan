<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BEO extends Model
{
    use HasFactory;

    protected $table = 'beos';

    protected $fillable = [
        'order_id',
        'event_name',
        'event_date',
        'event_time',
        'venue',
        'guest_count',
        'contact_person',
        'contact_phone',
        'contact_email',
        'special_instructions',
        'setup_requirements',
        'dietary_restrictions',
    ];

    protected $casts = [
        'event_date' => 'date',
        'event_time' => 'datetime',
        'guest_count' => 'integer',
    ];

    /**
     * Get the order that owns the BEO.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the sections for the BEO.
     */
    public function sections()
    {
        return $this->hasMany(BEOSection::class);
    }

    /**
     * Get the formatted event date.
     */
    public function getFormattedEventDateAttribute(): string
    {
        return $this->event_date->format('d.m.Y');
    }

    /**
     * Get the formatted event time.
     */
    public function getFormattedEventTimeAttribute(): string
    {
        return $this->event_time;
    }

    /**
     * Get the full event datetime.
     */
    public function getEventDateTimeAttribute(): string
    {
        return $this->event_date->format('Y-m-d') . ' ' . $this->event_time;
    }
}
