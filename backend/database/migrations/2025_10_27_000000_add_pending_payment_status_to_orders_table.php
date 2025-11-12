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
        // Изменяем enum для добавления статуса 'pending_payment'
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('draft', 'submitted', 'processing', 'completed', 'cancelled', 'paid', 'pending_payment') DEFAULT 'submitted'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Возвращаем обратно к предыдущему enum
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('draft', 'submitted', 'processing', 'completed', 'cancelled', 'paid') DEFAULT 'submitted'");
    }
};
