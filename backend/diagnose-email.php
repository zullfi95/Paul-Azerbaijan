<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;

echo "═══════════════════════════════════════════════════════\n";
echo "📧 ДИАГНОСТИКА BREVO EMAIL\n";
echo "═══════════════════════════════════════════════════════\n\n";

echo "🔍 Шаг 1: Проверка конфигурации\n";
echo "─────────────────────────────────────────────────────\n";
echo "MAIL_MAILER: " . config('mail.default') . "\n";
echo "MAIL_HOST: " . config('mail.mailers.smtp.host') . "\n";
echo "MAIL_PORT: " . config('mail.mailers.smtp.port') . "\n";
echo "MAIL_ENCRYPTION: " . config('mail.mailers.smtp.encryption') . "\n";
echo "MAIL_USERNAME: " . config('mail.mailers.smtp.username') . "\n";
$password = config('mail.mailers.smtp.password');
if ($password) {
    echo "MAIL_PASSWORD: " . substr($password, 0, 20) . "..." . substr($password, -10) . " (" . strlen($password) . " символов)\n";
} else {
    echo "MAIL_PASSWORD: ❌ НЕ УСТАНОВЛЕН!\n";
}
echo "MAIL_FROM: " . config('mail.from.address') . "\n";
echo "MAIL_FROM_NAME: " . config('mail.from.name') . "\n";

echo "\n🔍 Шаг 2: Тест подключения к SMTP\n";
echo "─────────────────────────────────────────────────────\n";

try {
    $transport = Mail::mailer()->getSymfonyTransport();
    echo "✅ Transport создан: " . get_class($transport) . "\n";
} catch (\Exception $e) {
    echo "❌ Ошибка создания transport: " . $e->getMessage() . "\n";
}

echo "\n🔍 Шаг 3: Попытка отправки письма\n";
echo "─────────────────────────────────────────────────────\n";
echo "Отправка на: alliyev.zulfi95@gmail.com\n";
echo "⏳ Ждем...\n\n";

try {
    Mail::raw(
        "🎉 Диагностическое письмо от PAUL Azerbaijan!\n\n" .
        "Это письмо отправлено с полной диагностикой.\n\n" .
        "Отправлено: " . date('d.m.Y H:i:s') . "\n" .
        "Попытка №3",
        function ($message) {
            $message->to('alliyev.zulfi95@gmail.com')
                    ->subject('🔍 Диагностика Brevo SMTP - PAUL Azerbaijan');
        }
    );
    
    echo "✅ Mail::raw() выполнен БЕЗ ОШИБОК!\n";
    echo "✅ Письмо добавлено в очередь отправки\n\n";
    
} catch (\Swift_TransportException $e) {
    echo "❌ ОШИБКА SMTP TRANSPORT:\n";
    echo $e->getMessage() . "\n\n";
    echo "Возможные причины:\n";
    echo "- Неверный SMTP ключ\n";
    echo "- Проблемы с сетью\n";
    echo "- Блокировка порта 587\n\n";
    exit(1);
    
} catch (\Exception $e) {
    echo "❌ ОБЩАЯ ОШИБКА:\n";
    echo get_class($e) . ": " . $e->getMessage() . "\n\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n\n";
    exit(1);
}

echo "🔍 Шаг 4: Проверка очереди\n";
echo "─────────────────────────────────────────────────────\n";
echo "QUEUE_CONNECTION: " . config('queue.default') . "\n";

if (config('queue.default') === 'database') {
    try {
        $jobs = \DB::table('jobs')->count();
        echo "Задач в очереди: {$jobs}\n";
        if ($jobs > 0) {
            echo "⚠️  Есть задачи в очереди! Запустите: php artisan queue:work\n";
        }
    } catch (\Exception $e) {
        echo "❌ Не удалось проверить очередь: " . $e->getMessage() . "\n";
    }
}

echo "\n═══════════════════════════════════════════════════════\n";
echo "📋 ИТОГИ:\n";
echo "═══════════════════════════════════════════════════════\n\n";

echo "1. Проверьте входящие на alliyev.zulfi95@gmail.com\n";
echo "2. Проверьте папку СПАМ\n";
echo "3. Проверьте Brevo Dashboard:\n";
echo "   https://app.brevo.com → Email logs\n";
echo "4. Если письма нет в Brevo logs - проблема в Laravel\n";
echo "5. Если письмо в Brevo logs но не пришло - проблема доставки\n\n";

echo "🔍 Проверить логи Laravel:\n";
echo "   tail -f storage/logs/laravel.log\n\n";


