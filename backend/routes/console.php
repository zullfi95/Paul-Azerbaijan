<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Console\Commands\UpdateOrderStatuses;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Регистрируем команду для обновления статусов заказов
// Команда регистрируется автоматически через ServiceProvider

// Планировщик задач
Schedule::command('orders:update-statuses')
    ->dailyAt('00:00') // Каждый день в полночь
    ->withoutOverlapping()
    ->runInBackground();

Schedule::command('notifications:send-reminders')
    ->dailyAt('09:00') // Каждый день в 9 утра
    ->withoutOverlapping()
    ->runInBackground();
