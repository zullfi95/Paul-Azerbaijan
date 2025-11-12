<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveShippingAddressRequest extends BaseFormRequest
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
            'street' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
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
            'street.required' => 'Улица обязательна для заполнения',
            'city.required' => 'Город обязателен для заполнения',
            'country.required' => 'Страна обязательна для заполнения',
            'street.max' => 'Улица не может превышать 255 символов',
            'city.max' => 'Город не может превышать 100 символов',
            'postal_code.max' => 'Почтовый индекс не может превышать 20 символов',
            'country.max' => 'Страна не может превышать 100 символов',
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
            'street' => 'улица',
            'city' => 'город',
            'postal_code' => 'почтовый индекс',
            'country' => 'страна',
        ];
    }
}
