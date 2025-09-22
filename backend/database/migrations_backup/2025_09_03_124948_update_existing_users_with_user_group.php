<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Обновляем существующих пользователей
        // Устанавливаем user_group = 'staff' для пользователей с staff_role
        DB::table('users')
            ->whereNotNull('staff_role')
            ->where(function ($query) {
                $query->whereNull('user_group')
                      ->orWhere('user_group', '');
            })
            ->update(['user_group' => 'staff']);

        // Устанавливаем user_group = 'client' для остальных пользователей
        DB::table('users')
            ->where(function ($query) {
                $query->whereNull('user_group')
                      ->orWhere('user_group', '');
            })
            ->update(['user_group' => 'client']);

        // Для пользователей, у которых staff_role не установлена, но user_group = 'staff',
        // устанавливаем staff_role = 'observer' по умолчанию
        DB::table('users')
            ->where('user_group', 'staff')
            ->whereNull('staff_role')
            ->update(['staff_role' => 'observer']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Очищаем поля user_group и staff_role, установленные этой миграцией
        DB::table('users')
            ->where('user_group', 'staff')
            ->where('staff_role', 'observer')
            ->update([
                'user_group' => null,
                'staff_role' => null
            ]);

        DB::table('users')
            ->where('user_group', 'client')
            ->update(['user_group' => null]);
    }
};
