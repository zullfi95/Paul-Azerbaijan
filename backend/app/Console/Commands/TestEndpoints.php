<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

class TestEndpoints extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:endpoints';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test API endpoints for coordinator access';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Find user ID 45
            $user = User::find(45);
            
            if (!$user) {
                $this->error("User with ID 45 not found!");
                return 1;
            }
            
            $this->info("Testing endpoints for user: " . $user->email);
            
            // Create a token for the user
            $token = $user->createToken('test-token')->plainTextToken;
            $this->info("Created token: " . substr($token, 0, 20) . "...");
            
            // Test applications endpoint
            $this->info("\nTesting /api/applications endpoint...");
            $response = $this->testEndpoint('/api/applications', $token);
            $this->info("Status: " . $response['status']);
            $this->info("Response: " . substr($response['body'], 0, 200) . "...");
            
            // Test orders endpoint
            $this->info("\nTesting /api/orders endpoint...");
            $response = $this->testEndpoint('/api/orders', $token);
            $this->info("Status: " . $response['status']);
            $this->info("Response: " . substr($response['body'], 0, 200) . "...");
            
            // Clean up token
            $user->tokens()->delete();
            $this->info("\n✅ Test completed, token cleaned up");
            
            return 0;
            
        } catch (Exception $e) {
            $this->error("Error: " . $e->getMessage());
            return 1;
        }
    }
    
    private function testEndpoint($url, $token)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000' . $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Authorization: Bearer ' . $token,
        ]);
        
        $response = curl_exec($ch);
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return [
            'status' => $status,
            'body' => $response
        ];
    }
}
