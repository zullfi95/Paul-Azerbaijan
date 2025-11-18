<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

echo "=== Brevo SMTP Connection Test ===\n\n";

echo "Configuration:\n";
echo "MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
echo "MAIL_PORT: " . config('mail.mailers.smtp.port') . "\n";
echo "MAIL_USERNAME: " . config('mail.mailers.smtp.username') . "\n";
echo "MAIL_ENCRYPTION: " . config('mail.mailers.smtp.encryption') . "\n";
echo "MAIL_FROM: " . config('mail.from.address') . "\n\n";

$testEmail = $argv[1] ?? 'xaxaxaxa28@gmail.com';

echo "Attempting to send test email to: $testEmail\n\n";

// Try different configurations
$configs = [
    ['port' => 587, 'encryption' => 'tls'],
    ['port' => 465, 'encryption' => 'ssl'],
    ['port' => 2525, 'encryption' => 'tls'],
];

foreach ($configs as $index => $config) {
    echo "--- Attempt " . ($index + 1) . ": Port {$config['port']}, Encryption {$config['encryption']} ---\n";
    
    // Temporarily override config
    Config::set('mail.mailers.smtp.port', $config['port']);
    Config::set('mail.mailers.smtp.encryption', $config['encryption']);
    
    try {
        Mail::raw('Test email from PAUL Azerbaijan - Configuration test ' . ($index + 1), function ($message) use ($testEmail, $config) {
            $message->to($testEmail)
                    ->subject('PAUL Test - Port ' . $config['port'] . ' ' . $config['encryption']);
        });
        
        echo "✅ SUCCESS with Port {$config['port']}, Encryption {$config['encryption']}!\n";
        echo "Please check your inbox.\n\n";
        break;
    } catch (\Exception $e) {
        echo "❌ Failed: " . $e->getMessage() . "\n\n";
    }
}

