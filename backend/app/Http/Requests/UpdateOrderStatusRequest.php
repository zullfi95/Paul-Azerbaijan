<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Только координаторы могут обновлять статус заказа
        return $this->user() && $this->user()->isCoordinator();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'status' => 'required|in:draft,submitted,processing,completed,cancelled',
            'coordinator_comment' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'status.required' => 'Статус заказа обязателен для заполнения',
            'status.in' => 'Неверный статус заказа',
            'coordinator_comment.max' => 'Комментарий координатора не может превышать 1000 символов',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'status' => 'статус заказа',
            'coordinator_comment' => 'комментарий координатора',
        ];
    }
}
