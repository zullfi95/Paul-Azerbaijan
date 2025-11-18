<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Mail Configuration Check ===\n\n";
echo "Environment Variables:\n";
echo "MAIL_MAILER: " . env('MAIL_MAILER', 'not set') . "\n";
echo "MAIL_HOST: " . env('MAIL_HOST', 'not set') . "\n";
echo "MAIL_PORT: " . env('MAIL_PORT', 'not set') . "\n";
echo "MAIL_USERNAME: " . env('MAIL_USERNAME', 'not set') . "\n";
echo "MAIL_PASSWORD: " . (env('MAIL_PASSWORD') ? '***SET***' : 'not set') . "\n";
echo "MAIL_FROM_ADDRESS: " . env('MAIL_FROM_ADDRESS', 'not set') . "\n\n";

echo "Laravel Config:\n";
echo "mail.default: " . config('mail.default') . "\n";
echo "mail.mailers.smtp.host: " . config('mail.mailers.smtp.host') . "\n";
echo "mail.mailers.smtp.port: " . config('mail.mailers.smtp.port') . "\n";
echo "mail.mailers.smtp.username: " . config('mail.mailers.smtp.username') . "\n";
echo "mail.from.address: " . config('mail.from.address') . "\n";
echo "mail.from.name: " . config('mail.from.name') . "\n\n";

echo "Mailer Instance:\n";
$mailer = app('mailer');
echo "Mailer class: " . get_class($mailer) . "\n";
$transport = $mailer->getSymfonyTransport();
echo "Transport class: " . get_class($transport) . "\n";

