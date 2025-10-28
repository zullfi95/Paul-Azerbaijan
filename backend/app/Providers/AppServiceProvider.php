<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Models\Order;
use App\Models\Application;
use App\Policies\UserPolicy;
use App\Policies\OrderPolicy;
use App\Policies\ApplicationPolicy;
use App\Policies\ClientPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Order::class => OrderPolicy::class,
        Application::class => ApplicationPolicy::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Регистрируем Policy классы
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(Application::class, ApplicationPolicy::class);
        
        // Для клиентов используем User модель с ClientPolicy
        Gate::define('view-client', [ClientPolicy::class, 'view']);
        Gate::define('create-client', [ClientPolicy::class, 'create']);
        Gate::define('update-client', [ClientPolicy::class, 'update']);
        Gate::define('delete-client', [ClientPolicy::class, 'delete']);
        Gate::define('view-client-statistics', [ClientPolicy::class, 'viewStatistics']);
    }
}