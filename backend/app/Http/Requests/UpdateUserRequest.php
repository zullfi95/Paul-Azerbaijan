<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends BaseFormRequest
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
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'user_type' => 'sometimes|string|in:staff,client',
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
            'name.string' => 'Имя должно быть строкой',
            'name.max' => 'Имя не может превышать 255 символов',
            'email.email' => 'Неверный формат email',
            'email.max' => 'Email не может превышать 255 символов',
            'phone.string' => 'Телефон должен быть строкой',
            'phone.max' => 'Телефон не может превышать 20 символов',
            'user_type.in' => 'Неверный тип пользователя',
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
            'phone' => 'телефон',
            'user_type' => 'тип пользователя',
            'status' => 'статус',
        ];
    }
}
