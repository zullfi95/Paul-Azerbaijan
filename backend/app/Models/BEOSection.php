<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BEOSection extends Model
{
    use HasFactory;

    protected $table = 'beo_sections';

    protected $fillable = [
        'beo_id',
        'title',
        'content',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /**
     * Get the BEO that owns the section.
     */
    public function beo(): BelongsTo
    {
        return $this->belongsTo(BEO::class);
    }
}
