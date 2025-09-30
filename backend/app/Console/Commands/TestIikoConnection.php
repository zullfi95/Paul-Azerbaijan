<?php

namespace App\Console\Commands;

use App\Services\IikoService;
use Illuminate\Console\Command;

class TestIikoConnection extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'iiko:test-connection';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test connection to iiko API';

    /**
     * Execute the console command.
     */
    public function handle(IikoService $iikoService)
    {
        $this->info('Testing connection to iiko API...');

        try {
            // Проверяем получение токена
            $token = $iikoService->getAccessToken();
            
            if (!$token) {
                $this->error('Failed to get access token');
                return 1;
            }

            $this->info('✓ Access token obtained successfully');

            // Проверяем получение организаций
            $organizations = $iikoService->getOrganizations();
            
            if (empty($organizations)) {
                $this->warn('No organizations found or failed to get organizations');
            } else {
                $this->info('✓ Organizations retrieved successfully');
                $this->table(
                    ['ID', 'Name', 'Type'],
                    collect($organizations)->map(function ($org) {
                        return [
                            $org['id'] ?? 'N/A',
                            $org['name'] ?? 'N/A',
                            $org['type'] ?? 'N/A'
                        ];
                    })->toArray()
                );
            }

            $this->info('iiko API connection test completed successfully!');
            return 0;

        } catch (\Exception $e) {
            $this->error('Error testing iiko API connection: ' . $e->getMessage());
            return 1;
        }
    }
}
