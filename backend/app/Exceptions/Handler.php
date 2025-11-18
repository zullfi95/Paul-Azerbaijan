<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Routing\Exceptions\RouteNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        // Обрабатываем только API запросы
        if ($request->is('api/*') || $request->expectsJson()) {
            return $this->handleApiException($request, $exception);
        }

        return parent::render($request, $exception);
    }

    /**
     * Handle API exceptions
     *
     * @param Request $request
     * @param Throwable $exception
     * @return JsonResponse
     */
    public function handleApiException(Request $request, Throwable $exception): JsonResponse
    {
        // Обработка ошибок аутентификации
        if ($exception instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }
        
        // Обработка ошибки "Route [login] not defined" для API запросов
        // Это происходит, когда Laravel пытается использовать route('login') для редиректа
        if ($exception instanceof RouteNotFoundException && str_contains($exception->getMessage(), 'Route [login] not defined')) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        // Обработка ошибок авторизации
        if ($exception instanceof AuthorizationException) {
            return response()->json([
                'success' => false,
                'message' => 'This action is unauthorized'
            ], 403);
        }

        // Обработка ошибок валидации
        if ($exception instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Ошибка валидации',
                'errors' => $exception->errors()
            ], 422);
        }

        // Обработка 404 ошибок
        if ($exception instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Ресурс не найден'
            ], 404);
        }

        // Обработка 405 ошибок (метод не разрешен)
        if ($exception instanceof MethodNotAllowedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Метод не разрешен'
            ], 405);
        }

        // Обработка 401 ошибок (неавторизован)
        if ($exception instanceof UnauthorizedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не авторизован'
            ], 401);
        }

        // Обработка 403 ошибок (доступ запрещен)
        if ($exception instanceof AccessDeniedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен'
            ], 403);
        }

        // Обработка остальных исключений
        $statusCode = method_exists($exception, 'getStatusCode') ? $exception->getStatusCode() : 500;
        $message = $exception->getMessage() ?: 'Внутренняя ошибка сервера';

        // Логируем неожиданные ошибки
        if ($statusCode >= 500) {
            \Log::error('API Exception', [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
                'user_id' => $request->user()?->id,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $message
        ], $statusCode);
    }
}
