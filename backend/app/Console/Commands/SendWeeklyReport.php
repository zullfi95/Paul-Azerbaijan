<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendWeeklyReport extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notifications:send-weekly-report';

    /**
     * The console command description.
     */
    protected $description = 'Send weekly report to staff';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sending weekly report...');
        
        $notificationService = new NotificationService();
        $notificationService->sendWeeklyReport();
        
        $this->info('Weekly report sent successfully!');
        
        return Command::SUCCESS;
    }
}
