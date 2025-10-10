<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

class CheckAuth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check authentication status and tokens';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            $this->info("=== Authentication Status Check ===");
            
            // Check all users with tokens
            $tokens = PersonalAccessToken::with('tokenable')->get();
            
            if ($tokens->isEmpty()) {
                $this->warn("No active tokens found");
            } else {
                $this->info("Active tokens:");
                foreach ($tokens as $token) {
                    $user = $token->tokenable;
                    if ($user) {
                        $this->info("- User ID: {$user->id}, Email: {$user->email}, Role: {$user->staff_role}, Token: " . substr($token->token, 0, 20) . "...");
                    }
                }
            }
            
            // Check coordinator users
            $coordinators = User::where('staff_role', 'coordinator')->get();
            $this->info("\n=== Coordinator Users ===");
            foreach ($coordinators as $coordinator) {
                $this->info("- ID: {$coordinator->id}, Email: {$coordinator->email}, Status: {$coordinator->status}");
            }
            
            return 0;
            
        } catch (Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
}
