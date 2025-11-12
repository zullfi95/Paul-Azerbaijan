<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'iiko_id',
        'name',
        'description',
        'price',
        'currency',
        'menu_category_id',
        'organization_id',
        'images',
        'allergens',
        'is_available',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'images' => 'array',
        'allergens' => 'array',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'category', // Добавляем имя категории в JSON
    ];

    /**
     * Получить категорию меню
     */
    public function menuCategory(): BelongsTo
    {
        return $this->belongsTo(MenuCategory::class);
    }

    /**
     * Scope для активных элементов
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope для доступных элементов
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope для организации
     */
    public function scopeForOrganization($query, string $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }

    /**
     * Получить отформатированную цену
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2) . ' ' . $this->currency;
    }

    /**
     * Получить главное изображение
     */
    public function getMainImageAttribute(): ?string
    {
        if (empty($this->images)) {
            return null;
        }
        
        return is_array($this->images) ? $this->images[0] : null;
    }

    /**
     * Получить имя категории для JSON
     */
    public function getCategoryAttribute(): ?string
    {
        return $this->menuCategory?->name;
    }
}
