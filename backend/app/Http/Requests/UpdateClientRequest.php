<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends BaseFormRequest
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
        $clientId = $this->route('client') ? $this->route('client')->id : null;
        
        return [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $clientId,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'client_category' => 'sometimes|in:corporate,one_time',
            'status' => 'sometimes|in:active,inactive,suspended',
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
            'name.required' => 'Имя клиента обязательно для заполнения',
            'email.email' => 'Неверный формат email',
            'email.unique' => 'Клиент с таким email уже существует',
            'client_category.in' => 'Категория клиента должна быть corporate или one_time',
            'status.in' => 'Статус должен быть active, inactive или suspended',
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
            'name' => 'имя клиента',
            'email' => 'email клиента',
            'phone' => 'телефон',
            'company_name' => 'название компании',
            'position' => 'должность',
            'contact_person' => 'контактное лицо',
            'client_category' => 'категория клиента',
            'status' => 'статус',
        ];
    }
}
