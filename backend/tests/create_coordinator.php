<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Check if this specific coordinator already exists
$existingCoordinator = User::where('email', 'fidan@paul.az')->first();

if ($existingCoordinator) {
    echo "Coordinator fidan@paul.az already exists with ID: " . $existingCoordinator->id . "\n";
} else {
    // Create coordinator
    $coordinator = User::create([
        'name' => 'Fidan',
        'email' => 'fidan@paul.az',
        'password' => Hash::make('password123'),
        'user_type' => 'staff',
        'staff_role' => 'coordinator',
        'status' => 'active',
        'notification_settings' => json_encode([
            'email' => true,
            'sms' => false,
            'new_applications' => true,
            'order_updates' => true
        ]),
    ]);
    
    echo "Coordinator created successfully!\n";
    echo "Email: fidan@paul.az\n";
    echo "Password: password123\n";
}

// Also update the current user (ID 57) to be a coordinator for testing
$currentUser = User::find(57);
if ($currentUser) {
    $currentUser->update([
        'user_type' => 'staff',
        'staff_role' => 'coordinator',
        'status' => 'active'
    ]);
    echo "Updated user ID 57 to be a coordinator\n";
}
