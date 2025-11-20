<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

trait HandlesValidation
{
    /**
     * Validate request data with custom rules and messages
     */
    protected function validateRequest(Request $request, array $rules, array $messages = [], array $attributes = []): array
    {
        $validator = Validator::make($request->all(), $rules, $messages, $attributes);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    /**
     * Validate array data directly
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
     * Common validation rules for menu items
     */
    protected function getMenuItemsValidationRules(): array
    {
        return [
            'menu_items' => 'required|array|min:1',
            'menu_items.*.id' => 'required|string',
            'menu_items.*.name' => 'required|string',
            'menu_items.*.quantity' => 'required|integer|min:1',
            'menu_items.*.price' => 'required|numeric|min:0',
        ];
    }

    /**
     * Common validation rules for delivery
     */
    protected function getDeliveryValidationRules(): array
    {
        return [
            'delivery_date' => 'nullable|date',
            'delivery_time' => 'nullable|date_format:H:i',
            'delivery_type' => 'nullable|in:delivery,pickup,buffet',
            'delivery_address' => 'nullable|string|max:500',
            'delivery_cost' => 'nullable|numeric|min:0',
        ];
    }

    /**
     * Common validation rules for discounts
     */
    protected function getDiscountValidationRules(): array
    {
        return [
            'discount_fixed' => 'nullable|numeric|min:0',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
        ];
    }

    /**
     * Common validation rules for recurring schedule
     */
    protected function getRecurringScheduleValidationRules(): array
    {
        return [
            'recurring_schedule' => 'nullable|array',
            'recurring_schedule.enabled' => 'boolean',
            'recurring_schedule.frequency' => 'nullable|in:weekly,monthly',
            'recurring_schedule.days' => 'nullable|array',
            'recurring_schedule.delivery_time' => 'nullable|date_format:H:i',
            'recurring_schedule.notes' => 'nullable|string|max:500',
        ];
    }

    /**
     * Common validation rules for additional order fields
     */
    protected function getAdditionalOrderFieldsValidationRules(): array
    {
        return [
            'equipment_required' => 'nullable|integer|min:0',
            'staff_assigned' => 'nullable|integer|min:0',
            'special_instructions' => 'nullable|string',
            'kitchen_comment' => 'nullable|string',
            'operation_comment' => 'nullable|string',
            'desserts_comment' => 'nullable|string',
        ];
    }

    /**
     * Common validation messages
     */
    protected function getCommonValidationMessages(): array
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
     * Common validation attributes
     */
    protected function getCommonValidationAttributes(): array
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
