<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'surname' => 'nullable|string|max:255', // Для совместимости с frontend
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'user_type' => 'required|string|in:staff,client',
            'staff_role' => 'nullable|required_if:user_type,staff|in:coordinator,observer,chef,operations_manager',
            'client_category' => 'nullable|required_if:user_type,client|in:corporate,one_time',
            'status' => 'sometimes|string|in:active,inactive',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно для заполнения',
            'email.required' => 'Email обязателен для заполнения',
            'email.email' => 'Неверный формат email',
            'email.unique' => 'Пользователь с таким email уже существует',
            'password.required' => 'Пароль обязателен для заполнения',
            'password.min' => 'Пароль должен содержать минимум 6 символов',
            'user_type.in' => 'Неверный тип пользователя',
            'staff_role.required_if' => 'Роль обязательна для сотрудников',
            'staff_role.in' => 'Выбрана неверная роль для сотрудника',
            'client_category.required_if' => 'Категория обязательна для клиентов',
            'client_category.in' => 'Выбрана неверная категория для клиента',
            'status.in' => 'Неверный статус пользователя',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'имя',
            'email' => 'email',
            'password' => 'пароль',
            'user_type' => 'тип пользователя',
            'staff_role' => 'роль сотрудника',
            'client_category' => 'категория клиента',
            'status' => 'статус',
        ];
    }
}
