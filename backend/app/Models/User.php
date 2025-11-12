<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'phone',
        'address',
        'shipping_address',
        'company_name',
        'position',
        'contact_person',
        'status',
        'user_type', // 'staff' or 'client'
        'client_category', // 'corporate' | 'one_time'
        'reset_token', // Токен для сброса пароля
        'reset_token_expires', // Срок действия токена
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'shipping_address' => 'array',
            'reset_token_expires' => 'datetime',
        ];
    }

    /**
     * Проверяет, является ли пользователь персоналом
     */
    public function isStaff(): bool
    {
        return $this->user_type === 'staff';
    }

    /**
     * Проверяет, является ли пользователь координатором
     */
    public function isCoordinator(): bool
    {
        return $this->user_type === 'staff' && $this->staff_role === 'coordinator';
    }

    /**
     * Проверяет, является ли пользователь наблюдателем (observer)
     */
    public function isObserver(): bool
    {
        return $this->user_type === 'staff' && $this->staff_role === 'observer';
    }

    /**
     * Проверяет, является ли пользователь клиентом
     */
    public function isClient(): bool
    {
        return $this->user_type === 'client';
    }

    /**
     * Проверяет, корпоративный ли клиент
     */
    public function isCorporate(): bool
    {
        return $this->client_category === 'corporate';
    }

    /**
     * Проверяет, разовый ли клиент
     */
    public function isOneTime(): bool
    {
        return $this->client_category === 'one_time';
    }

    /**
     * Полное имя пользователя (клиента или сотрудника)
     */
    public function getFullNameAttribute(): string
    {
        if ($this->isClient() && !empty($this->last_name)) {
            return trim($this->name . ' ' . $this->last_name);
        }
        return $this->name;
    }



    /**
     * Проверяет, активен ли аккаунт
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Получает отображаемое имя группы пользователя
     */
    public function getUserGroupDisplayName(): string
    {
        return 'Персонал';
    }

    /**
     * Получает отображаемое имя роли персонала
     */
    public function getStaffRoleDisplayName(): string
    {
        return match($this->staff_role) {
            'coordinator' => 'Координатор',
            'observer' => 'Наблюдатель',
            default => 'Неизвестно'
        };
    }



    /**
     * Заявки, обработанные координатором
     */
    public function processedApplications(): HasMany
    {
        return $this->hasMany(Application::class, 'coordinator_id');
    }

    /**
     * Заказы, созданные координатором
     */
    public function createdOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'coordinator_id');
    }

    /**
     * Заказы клиента (если пользователь - клиент)
     */
    public function clientOrders(): HasMany
    {
        return $this->hasMany(Order::class, 'client_id');
    }
    
    /**
     * Алиас для clientOrders() для упрощения использования withCount('orders')
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    /**
     * Заявки клиента (если пользователь - клиент)
     */
    public function clientApplications(): HasMany
    {
        return $this->hasMany(Application::class, 'client_id');
    }
    
    /**
     * Алиас для clientApplications() для упрощения использования withCount('applications')
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'client_id');
    }


}
