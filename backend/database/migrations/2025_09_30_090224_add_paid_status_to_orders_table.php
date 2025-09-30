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
        // Изменяем enum для добавления статуса 'paid'
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('draft', 'submitted', 'processing', 'completed', 'cancelled', 'paid') DEFAULT 'submitted'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Возвращаем обратно к исходному enum
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('draft', 'submitted', 'processing', 'completed', 'cancelled') DEFAULT 'submitted'");
    }
};