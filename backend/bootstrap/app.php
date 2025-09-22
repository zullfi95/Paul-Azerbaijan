<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->api(append: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        // Заменяем стандартный CSRF middleware на наш кастомный
        $middleware->web(replace: [
            \Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class => \App\Http\Middleware\VerifyCsrfToken::class,
        ]);
        
        // Регистрируем кастомные middleware
        $middleware->alias([
            'coordinator' => \App\Http\Middleware\CoordinatorMiddleware::class,
            'client' => \App\Http\Middleware\ClientMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
