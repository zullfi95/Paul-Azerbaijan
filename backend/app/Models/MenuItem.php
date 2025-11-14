<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

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
        'images_urls', // Добавляем полные URL изображений
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
        
        $images = is_array($this->images) ? $this->images : [];
        if (empty($images)) {
            return null;
        }
        
        return $this->getImageUrl($images[0]);
    }

    /**
     * Получить полный URL изображения
     */
    protected function getImageUrl(string $path): string
    {
        // Если это уже полный URL (http/https), возвращаем как есть
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }
        
        // Если путь уже начинается с /storage/, возвращаем как есть (уже полный путь)
        if (str_starts_with($path, '/storage/')) {
            return url($path);
        }
        
        // Если это относительный путь, начинающийся с /, формируем полный URL
        if (str_starts_with($path, '/')) {
            return url($path);
        }
        
        // Если путь относительно storage (menu_items/...), используем Storage::url и преобразуем в полный URL
        if (str_starts_with($path, 'menu_items/')) {
            return url(Storage::url($path));
        }
        
        // Если путь уже содержит public/, убираем его
        if (str_starts_with($path, 'public/')) {
            $path = substr($path, 7); // Убираем "public/"
        }
        
        // По умолчанию добавляем /storage/ и формируем полный URL
        return url('/storage/' . ltrim($path, '/'));
    }

    /**
     * Получить массив URL изображений с полными путями
     */
    public function getImagesUrlsAttribute(): array
    {
        if (empty($this->images)) {
            return [];
        }
        
        $images = is_array($this->images) ? $this->images : [];
        
        return array_map(function ($path) {
            return $this->getImageUrl($path);
        }, $images);
    }

    /**
     * Получить имя категории для JSON
     */
    public function getCategoryAttribute(): ?string
    {
        return $this->menuCategory?->name;
    }

    /**
     * Подготовить модель к сериализации массива
     */
    protected function serializeDate($date)
    {
        return $date->format('Y-m-d H:i:s');
    }

    /**
     * Преобразовать модель в массив
     */
    public function toArray(): array
    {
        $array = parent::toArray();
        
        // Заменяем images на полные URL
        if (isset($array['images']) && !empty($array['images'])) {
            $images = is_array($array['images']) ? $array['images'] : [];
            $array['images'] = array_map(function ($path) {
                return $this->getImageUrl($path);
            }, $images);
        }
        
        return $array;
    }
}
