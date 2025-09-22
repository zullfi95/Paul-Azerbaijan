<?php

namespace App\Console\Commands;

use App\Services\NotificationService;
use Illuminate\Console\Command;

class SendUpcomingEventReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'notifications:send-reminders';

    /**
     * The console command description.
     */
    protected $description = 'Send reminders for upcoming events';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Sending upcoming event reminders...');
        
        $notificationService = new NotificationService();
        $notificationService->sendUpcomingEventReminders();
        
        $this->info('Upcoming event reminders sent successfully!');
        
        return Command::SUCCESS;
    }
}
