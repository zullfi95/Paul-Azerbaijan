<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUser45 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:check-45';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check user ID 45 details';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $user = User::find(45);
            
            if (!$user) {
                $this->error("User with ID 45 not found!");
                return 1;
            }
            
            $this->info("User ID 45 details:");
            $this->info("Name: " . $user->name);
            $this->info("Email: " . $user->email);
            $this->info("User Type: " . $user->user_type);
            $this->info("Staff Role: " . ($user->staff_role ?? 'null'));
            $this->info("Status: " . $user->status);
            $this->info("Created: " . $user->created_at);
            $this->info("Updated: " . $user->updated_at);
            
            // Check if user can access coordinator endpoints
            if ($user->staff_role === 'coordinator' && $user->status === 'active') {
                $this->info("\n✅ User can access coordinator endpoints");
            } else {
                $this->error("\n❌ User cannot access coordinator endpoints");
                $this->error("Required: staff_role='coordinator' and status='active'");
            }
            
            return 0;
            
        } catch (Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
