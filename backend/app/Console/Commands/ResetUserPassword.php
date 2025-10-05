<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:reset-password {email} {password?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset user password by email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password') ?? 'newpassword123';

        $this->info("Поиск пользователя с email: $email");

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("Пользователь с email $email не найден в базе данных.");
            return 1;
        }

        $this->info("Пользователь найден: " . $user->name);
        $this->info("Тип пользователя: " . $user->user_type);

        // Обновляем пароль
        $user->password = Hash::make($password);
        $user->save();

        $this->info("Пароль успешно сброшен!");
        $this->info("Новый пароль: $password");
        $this->info("Пользователь может войти в систему с новым паролем.");

        return 0;
    }
}
