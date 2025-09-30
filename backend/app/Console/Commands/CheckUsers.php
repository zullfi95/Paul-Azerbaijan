<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class CheckUsers extends Command
{
    protected $signature = 'check:users';
    protected $description = 'Check users in database';

    public function handle()
    {
        $users = User::all(['id', 'name', 'email', 'user_type', 'staff_role', 'status']);
        
        $this->info('Total users: ' . $users->count());
        
        if ($users->count() > 0) {
            $this->table(
                ['ID', 'Name', 'Email', 'Type', 'Role', 'Status'],
                $users->map(function($user) {
                    return [
                        $user->id,
                        $user->name,
                        $user->email,
                        $user->user_type,
                        $user->staff_role ?? 'N/A',
                        $user->status
                    ];
                })->toArray()
            );
        } else {
            $this->warn('No users found in database!');
        }
    }
}