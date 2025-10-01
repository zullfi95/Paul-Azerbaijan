<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\AlgoritmaService;

class TestAlgoritmaConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'algoritma:test-connection';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test connection to Algoritma API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Тестирование подключения к Algoritma API...');
        $this->line('==========================================');

        // Показываем конфигурацию
        $this->line('Конфигурация:');
        $this->line('API Key: ' . config('services.algoritma.api_key'));
        $this->line('API Secret: ' . config('services.algoritma.api_secret'));
        $this->line('Base URL: ' . config('services.algoritma.base_url'));
        $this->line('Environment: ' . config('services.algoritma.environment'));
        $this->line('');

        $algoritmaService = new AlgoritmaService();
        $result = $algoritmaService->testConnection();

        $this->line('Результат тестирования:');
        $this->line(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        if ($result['success']) {
            $this->info('✅ Подключение к Algoritma API успешно!');
            $this->line('Сообщение: ' . $result['message']);
            if (isset($result['date'])) {
                $this->line('Дата: ' . $result['date']);
            }
        } else {
            $this->error('❌ Ошибка подключения к Algoritma API!');
            $this->line('Ошибка: ' . $result['error']);
            if (isset($result['exception'])) {
                $this->line('Исключение: ' . $result['exception']);
            }
            if (isset($result['status'])) {
                $this->line('HTTP статус: ' . $result['status']);
            }
        }

        $this->line('==========================================');
        $this->info('Тест завершен.');

        return $result['success'] ? 0 : 1;
    }
}
