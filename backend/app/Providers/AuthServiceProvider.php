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
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
        App\Models\Order::class => App\Policies\OrderPolicy::class,
        App\Models\Application::class => App\Policies\ApplicationPolicy::class,
        App\Models\MenuItem::class => App\Policies\MenuItemPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
