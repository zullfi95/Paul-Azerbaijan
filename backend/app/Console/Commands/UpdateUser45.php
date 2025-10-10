<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class UpdateUser45 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:update-45';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update user ID 45 to coordinator role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Check if user ID 45 exists
            $user = User::find(45);
            
            if (!$user) {
                $this->error("User with ID 45 not found!");
                return 1;
            }
            
            $this->info("Found user ID 45:");
            $this->info("Name: " . $user->name);
            $this->info("Email: " . $user->email);
            $this->info("Current user_type: " . $user->user_type);
            $this->info("Current staff_role: " . ($user->staff_role ?? 'null'));
            $this->info("Current status: " . $user->status);
            
            // Update user to coordinator
            $user->update([
                'user_type' => 'staff',
                'staff_role' => 'coordinator',
                'status' => 'active'
            ]);
            
            $this->info("\nUser updated successfully!");
            $this->info("New user_type: " . $user->user_type);
            $this->info("New staff_role: " . $user->staff_role);
            $this->info("New status: " . $user->status);
            
            return 0;
            
        } catch (Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
