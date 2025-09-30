<?php

namespace App\Console\Commands;

use App\Services\IikoService;
use Illuminate\Console\Command;

class SyncIikoMenu extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'iiko:sync-menu {organization_id?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync menu from iiko API for specified organization';

    /**
     * Execute the console command.
     */
    public function handle(IikoService $iikoService)
    {
        $organizationId = $this->argument('organization_id');

        if (!$organizationId) {
            // Получаем список организаций и предлагаем выбрать
            $this->info('Getting organizations...');
            $organizations = $iikoService->getOrganizations();
            
            if (empty($organizations)) {
                $this->error('No organizations found');
                return 1;
            }

            $this->table(
                ['Index', 'ID', 'Name'],
                collect($organizations)->map(function ($org, $index) {
                    return [
                        $index,
                        $org['id'] ?? 'N/A',
                        $org['name'] ?? 'N/A'
                    ];
                })->toArray()
            );

            $selectedIndex = $this->ask('Select organization index');
            $organizationId = $organizations[$selectedIndex]['id'] ?? null;

            if (!$organizationId) {
                $this->error('Invalid organization selected');
                return 1;
            }
        }

        $this->info("Syncing menu for organization: {$organizationId}");

        try {
            $result = $iikoService->syncMenu($organizationId);
            
            if ($result['success']) {
                $this->info('✓ Menu synced successfully');
                $this->info($result['message']);
                
                // Показываем краткую статистику
                if (isset($result['data']['groups'])) {
                    $this->info('Menu groups: ' . count($result['data']['groups']));
                }
                
                if (isset($result['data']['products'])) {
                    $this->info('Products: ' . count($result['data']['products']));
                }
            } else {
                $this->error('Failed to sync menu: ' . $result['message']);
                return 1;
            }

            return 0;

        } catch (\Exception $e) {
            $this->error('Error syncing menu: ' . $e->getMessage());
            return 1;
        }
    }
}
