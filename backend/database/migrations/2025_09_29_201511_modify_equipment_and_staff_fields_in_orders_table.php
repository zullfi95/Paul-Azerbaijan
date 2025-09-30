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
        // Сначала обнулим существующие значения
        DB::table('orders')->update([
            'equipment_required' => 0,
            'staff_assigned' => 0
        ]);

        Schema::table('orders', function (Blueprint $table) {
            // Удаляем старые колонки типа JSON
            $table->dropColumn(['equipment_required', 'staff_assigned']);
        });

        Schema::table('orders', function (Blueprint $table) {
            // Создаем новые колонки типа integer
            $table->integer('equipment_required')->default(0)->after('special_instructions');
            $table->integer('staff_assigned')->default(0)->after('equipment_required');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['equipment_required', 'staff_assigned']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->json('equipment_required')->nullable();
            $table->json('staff_assigned')->nullable();
        });
    }
};