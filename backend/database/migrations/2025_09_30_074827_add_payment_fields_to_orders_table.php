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
            // Поля для интеграции с Algoritma
            $table->string('algoritma_order_id')->nullable()->after('id');
            $table->string('payment_status')->default('pending')->after('status');
            $table->string('payment_url')->nullable()->after('payment_status');
            $table->integer('payment_attempts')->default(0)->after('payment_url');
            $table->timestamp('payment_created_at')->nullable()->after('payment_attempts');
            $table->timestamp('payment_completed_at')->nullable()->after('payment_created_at');
            $table->json('payment_details')->nullable()->after('payment_completed_at');
            
            // Индексы для быстрого поиска
            $table->index('algoritma_order_id');
            $table->index('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['algoritma_order_id']);
            $table->dropIndex(['payment_status']);
            
            $table->dropColumn([
                'algoritma_order_id',
                'payment_status',
                'payment_url',
                'payment_attempts',
                'payment_created_at',
                'payment_completed_at',
                'payment_details'
            ]);
        });
    }
};
