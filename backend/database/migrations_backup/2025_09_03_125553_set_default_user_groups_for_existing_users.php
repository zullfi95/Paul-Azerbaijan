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
        // Устанавливаем user_group = 'staff' для всех пользователей
        DB::table('users')->update(['user_group' => 'staff']);

        // Первый пользователь становится координатором, остальные - наблюдателями
        $firstUser = DB::table('users')->orderBy('id')->first();
        if ($firstUser) {
            DB::table('users')
                ->where('id', $firstUser->id)
                ->update(['staff_role' => 'coordinator']);

            // Остальные пользователи - наблюдатели
            DB::table('users')
                ->where('id', '!=', $firstUser->id)
                ->update(['staff_role' => 'observer']);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Очищаем значения, установленные этой миграцией
        DB::table('users')->update([
            'user_group' => null,
            'staff_role' => null
        ]);
    }
};
