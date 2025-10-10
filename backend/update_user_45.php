<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

try {
    // Check if user ID 45 exists
    $user = User::find(45);
    
    if (!$user) {
        echo "User with ID 45 not found!\n";
        exit(1);
    }
    
    echo "Found user ID 45:\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Current user_type: " . $user->user_type . "\n";
    echo "Current staff_role: " . ($user->staff_role ?? 'null') . "\n";
    echo "Current status: " . $user->status . "\n";
    
    // Update user to coordinator
    $user->update([
        'user_type' => 'staff',
        'staff_role' => 'coordinator',
        'status' => 'active'
    ]);
    
    echo "\nUser updated successfully!\n";
    echo "New user_type: " . $user->user_type . "\n";
    echo "New staff_role: " . $user->staff_role . "\n";
    echo "New status: " . $user->status . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
