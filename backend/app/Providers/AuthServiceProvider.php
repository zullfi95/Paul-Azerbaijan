<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\Application;
use App\Models\User;
use App\Policies\OrderPolicy;
use App\Policies\ApplicationPolicy;
use App\Policies\UserPolicy;
use App\Policies\ClientPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Order::class => OrderPolicy::class,
        Application::class => ApplicationPolicy::class,
        User::class => UserPolicy::class,
        // Для клиентов используем UserPolicy с ClientPolicy
        'App\Models\User' => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
