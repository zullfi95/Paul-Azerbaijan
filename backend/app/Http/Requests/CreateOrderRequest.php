<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Проверяем, что пользователь авторизован
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Клиент - теперь необязательно, если не указан, используется текущий пользователь
            'client_id' => 'nullable|exists:users,id',
            'client_type' => 'nullable|in:corporate,one_time',
            'application_id' => 'nullable|exists:applications,id',
            
            // Товары
            'menu_items' => 'required|array|min:1',
            'menu_items.*.id' => 'required|string',
            'menu_items.*.name' => 'required|string',
            'menu_items.*.quantity' => 'required|integer|min:1',
            'menu_items.*.price' => 'required|numeric|min:0',
            
            // Скидки
            'discount_fixed' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            
            // Доставка
            'delivery_date' => 'nullable|date',
            'delivery_time' => 'nullable|date_format:H:i',
            'delivery_type' => 'nullable|in:delivery,pickup,buffet',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_cost' => 'nullable|numeric|min:0',
            
            // Расписание
            'recurring_schedule' => 'nullable|array',
            'recurring_schedule.enabled' => 'boolean',
            'recurring_schedule.frequency' => 'nullable|in:weekly,monthly',
            'recurring_schedule.days' => 'nullable|array',
            'recurring_schedule.delivery_time' => 'nullable|date_format:H:i',
            'recurring_schedule.notes' => 'nullable|string|max:500',
            
            // Дополнительные поля
            'equipment_required' => 'nullable|integer|min:0',
            'staff_assigned' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string',
            
            // Комментарий
            'comment' => 'nullable|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'menu_items.required' => 'Необходимо выбрать хотя бы один товар',
            'menu_items.*.quantity.min' => 'Количество товара должно быть больше 0',
            'menu_items.*.price.min' => 'Цена товара не может быть отрицательной',
            'discount_percent.max' => 'Скидка не может превышать 100%',
            'delivery_date.date' => 'Неверный формат даты доставки',
            'delivery_time.date_format' => 'Неверный формат времени доставки',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'menu_items' => 'товары',
            'delivery_date' => 'дата доставки',
            'delivery_time' => 'время доставки',
            'delivery_address' => 'адрес доставки',
            'discount_fixed' => 'фиксированная скидка',
            'discount_percent' => 'процентная скидка',
        ];
    }
}
