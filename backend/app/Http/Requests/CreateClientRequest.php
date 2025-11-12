<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateClientRequest extends BaseFormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Только координаторы могут создавать клиентов
        return $this->user() && $this->user()->isCoordinator();
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'client_category' => 'required|in:corporate,one_time',
            'status' => 'in:active,inactive,suspended',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Имя клиента обязательно для заполнения',
            'email.required' => 'Email клиента обязателен для заполнения',
            'email.unique' => 'Клиент с таким email уже существует',
            'client_category.required' => 'Необходимо указать категорию клиента',
            'client_category.in' => 'Категория клиента должна быть corporate или one_time',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'имя клиента',
            'email' => 'email клиента',
            'phone' => 'телефон',
            'company_name' => 'название компании',
            'position' => 'должность',
            'contact_person' => 'контактное лицо',
            'client_category' => 'категория клиента',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Устанавливаем статус по умолчанию
        if (!$this->has('status')) {
            $this->merge(['status' => 'active']);
        }
    }
}
