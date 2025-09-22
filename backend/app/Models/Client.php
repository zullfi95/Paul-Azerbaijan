<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Client extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'last_name',
        'email',
        'password',
        'phone',
        'address',
        'company_name',
        'position',
        'contact_person',
        'client_category',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isCorporate(): bool
    {
        return $this->client_category === 'corporate';
    }

    public function isOneTime(): bool
    {
        return $this->client_category === 'one_time';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Возвращает полное имя клиента
     */
    public function getFullNameAttribute(): string
    {
        if (!empty($this->last_name)) {
            return trim($this->name . ' ' . $this->last_name);
        }
        return $this->name;
    }

    /**
     * Заявки клиента
     */
    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Заказы клиента
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}


