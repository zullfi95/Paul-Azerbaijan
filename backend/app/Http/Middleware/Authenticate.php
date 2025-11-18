<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Для API запросов не редиректим, возвращаем null
        // Laravel автоматически вернет JSON ответ с 401
        if ($request->is('api/*') || $request->expectsJson()) {
            return null;
        }
        
        return '/login';
    }
    
    /**
     * Handle an unauthenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function unauthenticated($request, array $guards)
    {
        // Для API запросов возвращаем JSON ответ вместо редиректа
        // Не передаем redirectTo, чтобы Laravel не пытался использовать route('login')
        if ($request->is('api/*') || $request->expectsJson()) {
            throw new AuthenticationException(
                'Unauthenticated.',
                $guards
            );
        }
        
        throw new AuthenticationException(
            'Unauthenticated.',
            $guards,
            '/login' // Используем прямой путь вместо route('login')
        );
    }
}

