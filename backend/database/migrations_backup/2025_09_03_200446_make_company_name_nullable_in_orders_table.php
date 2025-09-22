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
        Schema::table('orders', function (Blueprint $table) {
            // Делаем company_name nullable
            $table->string('company_name')->nullable()->change();
            
            // Также делаем client_type nullable, так как мы теперь ссылаемся на клиента
            $table->enum('client_type', ['corporate', 'one_time'])->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Возвращаем обратно NOT NULL ограничения
            $table->string('company_name')->nullable(false)->change();
            $table->enum('client_type', ['corporate', 'one_time'])->nullable(false)->change();
        });
    }
};