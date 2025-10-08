<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CoordinatorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        
        if (config('app.debug')) {
            \Log::info('CoordinatorMiddleware::handle', [
                'user_id' => $user?->id,
                'staff_role' => $user?->staff_role,
                'status' => $user?->status,
                'route' => $request->route()?->getName(),
                'url' => $request->url(),
            ]);
        }
        
        if (!$user) {
            if (config('app.debug')) {
                \Log::warning('CoordinatorMiddleware: No user found');
            }
            return response()->json([
                'success' => false,
                'message' => 'Требуется аутентификация.'
            ], 401);
        }
        
        if ($user->staff_role !== 'coordinator') {
            if (config('app.debug')) {
                \Log::warning('CoordinatorMiddleware: User is not coordinator', [
                    'staff_role' => $user->staff_role,
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен. Требуются права координатора.'
            ], 403);
        }
        
        if ($user->status !== 'active') {
            if (config('app.debug')) {
                \Log::warning('CoordinatorMiddleware: User account is not active', [
                    'status' => $user->status,
                ]);
            }
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен. Аккаунт неактивен.'
            ], 403);
        }

        if (config('app.debug')) {
            \Log::info('CoordinatorMiddleware: Access granted');
        }
        return $next($request);
    }
}
