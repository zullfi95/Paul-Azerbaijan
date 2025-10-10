<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetPassword45 extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:reset-password-45 {password=password123}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset password for user ID 45';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $password = $this->argument('password');
            
            // Find user ID 45
            $user = User::find(45);
            
            if (!$user) {
                $this->error("User with ID 45 not found!");
                return 1;
            }
            
            // Update password
            $user->update([
                'password' => Hash::make($password)
            ]);
            
            $this->info("Password updated successfully!");
            $this->info("Email: " . $user->email);
            $this->info("New password: " . $password);
            
            return 0;
            
        } catch (Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
