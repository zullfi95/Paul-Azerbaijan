<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestAlgoritmaCredentials extends Command
{
    protected $signature = 'algoritma:test-credentials';
    protected $description = 'Test different credential formats for Algoritma API';

    public function handle()
    {
        $this->info('Тестирование различных форматов учетных данных...');
        $this->line('================================================');

        $baseUrl = 'https://api.testalgoritma.az';
        
        // Различные варианты учетных данных
        $credentials = [
            ['username' => 'Zulfi', 'password' => 'Zulfi01102025'],
            ['username' => 'zulfi', 'password' => 'zulfi01102025'],
            ['username' => 'ZULFI', 'password' => 'ZULFI01102025'],
            ['username' => 'Zulfi', 'password' => 'Zulfi01102025'],
        ];

        foreach ($credentials as $index => $cred) {
            $this->line(($index + 1) . ". Тестирование: {$cred['username']} / {$cred['password']}");
            
            try {
                $response = Http::withBasicAuth($cred['username'], $cred['password'])
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get($baseUrl . '/pingTest');
                
                $this->line("   Статус: {$response->status()}");
                $this->line("   Ответ: " . $response->body());
                
                if ($response->successful()) {
                    $this->info("   ✅ УСПЕХ! Эти учетные данные работают!");
                    return 0;
                }
            } catch (\Exception $e) {
                $this->line("   Ошибка: " . $e->getMessage());
            }
            
            $this->line('');
        }

        // Попробуем также другие эндпоинты
        $this->line('Тестирование других эндпоинтов...');
        $endpoints = ['/ping', '/pingTest', '/test', '/health', '/status'];
        
        foreach ($endpoints as $endpoint) {
            $this->line("Тестирование эндпоинта: {$endpoint}");
            try {
                $response = Http::withBasicAuth('Zulfi', 'Zulfi01102025')
                    ->withHeaders(['Accept' => 'application/json'])
                    ->get($baseUrl . $endpoint);
                
                $this->line("   Статус: {$response->status()}");
                $this->line("   Ответ: " . $response->body());
                
                if ($response->successful()) {
                    $this->info("   ✅ Эндпоинт {$endpoint} работает!");
                }
            } catch (\Exception $e) {
                $this->line("   Ошибка: " . $e->getMessage());
            }
            $this->line('');
        }

        $this->line('================================================');
        $this->info('Тест завершен.');
        
        return 1;
    }
}

