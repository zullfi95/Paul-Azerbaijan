<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Добавляем поле user_group обратно
            $table->enum('user_group', ['client', 'staff'])->default('staff')->after('password');

            // Добавляем поле staff_role, если его нет
            if (!Schema::hasColumn('users', 'staff_role')) {
                $table->enum('staff_role', ['coordinator', 'observer'])->nullable()->after('user_group');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_group', 'staff_role']);
        });
    }
};
