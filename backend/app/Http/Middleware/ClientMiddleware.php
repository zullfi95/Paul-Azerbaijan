<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ClientMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        // Логирование для отладки
        \Log::info('ClientMiddleware check', [
            'user_id' => $user ? $user->id : null,
            'user_class' => $user ? get_class($user) : null,
            'email' => $user ? $user->email : null,
            'route' => $request->route()->getName(),
            'url' => $request->url()
        ]);
        
        if (!$user) {
            \Log::warning('ClientMiddleware: User not authenticated');
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Проверяем, что пользователь является клиентом
        if (!$user->isClient()) {
            \Log::warning('ClientMiddleware: User is not a client', [
                'user_id' => $user->id,
                'user_type' => $user->user_type ?? 'not_set',
                'staff_role' => $user->staff_role ?? 'not_set'
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Client access required.'
            ], 403);
        }

        \Log::info('ClientMiddleware: Access granted', ['user_id' => $user->id]);
        return $next($request);
    }
}