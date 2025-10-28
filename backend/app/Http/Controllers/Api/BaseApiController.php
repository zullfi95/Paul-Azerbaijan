<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

abstract class BaseApiController extends Controller
{
    use AuthorizesRequests;
    /**
     * Возвращает успешный ответ с данными
     */
    protected function successResponse($data = null, string $message = 'Успешно', int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Возвращает ответ об ошибке
     */
    protected function errorResponse(string $message = 'Произошла ошибка', int $statusCode = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Возвращает ответ об ошибке валидации
     */
    protected function validationErrorResponse($errors, string $message = 'Ошибка валидации'): JsonResponse
    {
        return $this->errorResponse($message, 422, $errors);
    }

    /**
     * Возвращает ответ о неавторизованном доступе
     */
    protected function unauthorizedResponse(string $message = 'Пользователь не авторизован'): JsonResponse
    {
        return $this->errorResponse($message, 401);
    }

    /**
     * Возвращает ответ о запрещенном доступе
     */
    protected function forbiddenResponse(string $message = 'Доступ запрещен'): JsonResponse
    {
        return $this->errorResponse($message, 403);
    }

    /**
     * Возвращает ответ о ненайденном ресурсе
     */
    protected function notFoundResponse(string $message = 'Ресурс не найден'): JsonResponse
    {
        return $this->errorResponse($message, 404);
    }

    /**
     * Возвращает ответ о внутренней ошибке сервера
     */
    protected function serverErrorResponse(string $message = 'Внутренняя ошибка сервера'): JsonResponse
    {
        return $this->errorResponse($message, 500);
    }

    /**
     * Проверяет авторизацию пользователя
     */
    protected function checkAuthentication(Request $request): bool
    {
        return $request->user() !== null;
    }

    /**
     * Получает авторизованного пользователя или возвращает ошибку
     */
    protected function getAuthenticatedUser(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            throw new \Exception('Пользователь не авторизован');
        }

        return $user;
    }

    /**
     * Проверяет права координатора
     */
    protected function checkCoordinatorAccess(Request $request): bool
    {
        $user = $request->user();
        return $user && $user->isCoordinator();
    }

    /**
     * Проверяет права клиента
     */
    protected function checkClientAccess(Request $request): bool
    {
        $user = $request->user();
        return $user && $user->isClient();
    }

    /**
     * Валидирует данные с помощью Validator
     */
    protected function validateData(array $data, array $rules, array $messages = [], array $attributes = []): array
    {
        $validator = Validator::make($data, $rules, $messages, $attributes);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Обрабатывает исключения и возвращает соответствующий ответ
     */
    protected function handleException(\Exception $e): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return $this->validationErrorResponse($e->errors());
        }

        if ($e->getMessage() === 'Пользователь не авторизован') {
            return $this->unauthorizedResponse();
        }

        // Логируем неожиданные ошибки
        \Log::error('API Exception', [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);

        return $this->serverErrorResponse('Произошла неожиданная ошибка');
    }

    /**
     * Создает ответ для пагинированных данных
     */
    protected function paginatedResponse($paginatedData, string $message = 'Данные получены успешно'): JsonResponse
    {
        return $this->successResponse($paginatedData, $message);
    }

    /**
     * Создает ответ для созданного ресурса
     */
    protected function createdResponse($data, string $message = 'Ресурс создан успешно'): JsonResponse
    {
        return $this->successResponse($data, $message, 201);
    }

    /**
     * Создает ответ для обновленного ресурса
     */
    protected function updatedResponse($data, string $message = 'Ресурс обновлен успешно'): JsonResponse
    {
        return $this->successResponse($data, $message);
    }

    /**
     * Создает ответ для удаленного ресурса
     */
    protected function deletedResponse(string $message = 'Ресурс удален успешно'): JsonResponse
    {
        return $this->successResponse(null, $message);
    }
}
