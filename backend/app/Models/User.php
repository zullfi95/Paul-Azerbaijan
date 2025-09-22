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
        'email',
        'password',
        'staff_role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
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
        ];
    }

    /**
     * Проверяет, является ли пользователь персоналом
     * Все пользователи в таблице users являются персоналом
     */
    public function isStaff(): bool
    {
        return true;
    }

    /**
     * Проверяет, является ли пользователь координатором
     */
    public function isCoordinator(): bool
    {
        return $this->staff_role === 'coordinator';
    }

    /**
     * Проверяет, является ли пользователь наблюдателем
     */
    public function isObserver(): bool
    {
        return $this->staff_role === 'observer';
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
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'coordinator_id');
    }


}
