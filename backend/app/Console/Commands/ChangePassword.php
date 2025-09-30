<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ChangePassword extends Command
{
    protected $signature = 'user:change-password {email} {password}';
    protected $description = 'Change password for a user';

    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');

        $user = User::where('email', $email)->first();

        if (!$user) {
            $this->error("User with email {$email} not found!");
            return;
        }

        $user->password = Hash::make($password);
        $user->save();

        $this->info("Password changed successfully for {$user->name} ({$user->email})");
        $this->info("New password: {$password}");
    }
}