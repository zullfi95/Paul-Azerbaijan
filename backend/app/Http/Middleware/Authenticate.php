<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpFoundation\Response;

class Authenticate extends Middleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string[]  ...$guards
     * @return mixed
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    public function handle($request, \Closure $next, ...$guards)
    {
        // Для API запросов проверяем аутентификацию напрямую, не вызывая родительский метод
        // чтобы избежать вызова route('login') в ApplicationBuilder
        if ($request->is('api/*') || $request->expectsJson()) {
            $this->authenticate($request, $guards);
            return $next($request);
        }
        
        // Для веб-запросов используем стандартное поведение
        return parent::handle($request, $next, ...$guards);
    }
    
    /**
     * Determine if the user is logged in to any of the given guards.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  array  $guards
     * @return void
     *
     * @throws \Illuminate\Auth\AuthenticationException
     */
    protected function authenticate($request, array $guards)
    {
        if (empty($guards)) {
            $guards = [null];
        }

        foreach ($guards as $guard) {
            if ($this->auth->guard($guard)->check()) {
                return $this->auth->shouldUse($guard);
            }
        }

        // Для API запросов возвращаем JSON ответ напрямую
        if ($request->is('api/*') || $request->expectsJson()) {
            throw new AuthenticationException(
                'Unauthenticated.',
                $guards
            );
        }
        
        throw new AuthenticationException(
            'Unauthenticated.',
            $guards,
            $this->redirectTo($request)
        );
    }
    
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
}

