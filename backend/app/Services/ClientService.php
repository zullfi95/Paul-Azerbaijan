<?php

namespace App\Services;

use App\Models\Client;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClientService
{
    /**
     * Найти существующего клиента по email или создать нового
     */
    public function findOrCreateClient(array $clientData): Client
    {
        $email = $clientData['email'] ?? null;

        if (!$email) {
            throw new \InvalidArgumentException('Email обязателен для создания клиента');
        }

        // Ищем существующего клиента по email
        $existingClient = Client::where('email', $email)->first();

        if ($existingClient) {
            return $existingClient;
        }

        // Создаем нового клиента
        $password = $this->generatePassword();

        $client = Client::create([
            'name' => trim(($clientData['first_name'] ?? '') . ''),
            'last_name' => trim($clientData['last_name'] ?? ''),
            'email' => $email,
            'password' => Hash::make($password),
            'phone' => $clientData['phone'] ?? null,
            'address' => $clientData['address'] ?? null,
            'company_name' => $clientData['company_name'] ?? null,
            'position' => $clientData['position'] ?? null,
            'contact_person' => $clientData['contact_person'] ?? null,
            'client_category' => $clientData['client_category'] ?? 'one_time',
            'status' => 'active',
        ]);

        // Сохраняем сгенерированный пароль для отправки по email
        $client->generated_password = $password;

        return $client;
    }

    /**
     * Генерирует случайный пароль
     */
    private function generatePassword(): string
    {
        return Str::random(10);
    }

    /**
     * Получить данные для email уведомления
     */
    public function getClientNotificationData(Client $client): array
    {
        return [
            'client' => $client,
            'password' => $client->generated_password ?? 'Установите новый пароль',
            'login_url' => config('app.url') . '/login',
        ];
    }
}
