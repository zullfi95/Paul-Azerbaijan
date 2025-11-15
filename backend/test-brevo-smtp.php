<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

echo "=== Testing Brevo SMTP Connection ===\n\n";

echo "Configuration:\n";
echo "MAIL_MAILER: " . Config::get('mail.default') . "\n";
echo "SMTP Host: " . Config::get('mail.mailers.smtp.host') . "\n";
echo "SMTP Port: " . Config::get('mail.mailers.smtp.port') . "\n";
echo "SMTP Username: " . Config::get('mail.mailers.smtp.username') . "\n";
echo "SMTP Encryption: " . Config::get('mail.mailers.smtp.encryption') . "\n";
echo "MAIL_FROM_ADDRESS: " . Config::get('mail.from.address') . "\n";
echo "MAIL_FROM_NAME: " . Config::get('mail.from.name') . "\n\n";

$testEmail = $argv[1] ?? 'alliyev.zulfi95@gmail.com';

echo "Attempting to send test email to: $testEmail\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n\n";

try {
    Mail::raw('This is a test email from PAUL Azerbaijan to verify Brevo SMTP configuration. If you receive this, SMTP is working correctly!', function ($message) use ($testEmail) {
        $message->to($testEmail)
                ->subject('PAUL Catering - SMTP Test Email');
    });
    
    echo "✅ Email sent successfully!\n";
    echo "Please check your inbox (and spam folder) for the test email.\n";
} catch (\Exception $e) {
    echo "❌ Error sending email:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

