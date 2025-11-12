<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateApplicationRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Публичные заявки разрешены всем
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'message' => 'nullable|string|max:1000',
            'event_address' => 'nullable|string|max:500',
            'event_date' => 'nullable|date|after:today',
            'event_time' => 'nullable|date_format:H:i',
            'cart_items' => 'nullable|array',
            'cart_items.*.id' => 'required_with:cart_items|string',
            'cart_items.*.name' => 'required_with:cart_items|string',
            'cart_items.*.quantity' => 'required_with:cart_items|integer|min:1',
            'cart_items.*.price' => 'required_with:cart_items|numeric|min:0',
            'coordinator_id' => 'nullable|exists:users,id,user_type,staff',
            'client_id' => 'nullable|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'Имя обязательно для заполнения',
            'phone.required' => 'Телефон обязателен для заполнения',
            'email.required' => 'Email обязателен для заполнения',
            'email.email' => 'Неверный формат email',
            'event_date.after' => 'Дата мероприятия должна быть в будущем',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'first_name' => 'имя',
            'last_name' => 'фамилия',
            'company_name' => 'название компании',
            'phone' => 'телефон',
            'email' => 'email',
            'event_address' => 'адрес мероприятия',
            'event_date' => 'дата мероприятия',
            'event_time' => 'время мероприятия',
        ];
    }
}
