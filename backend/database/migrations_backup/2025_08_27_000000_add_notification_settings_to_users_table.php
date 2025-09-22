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
            // Настройки уведомлений для пользователей
            $table->json('notification_settings')->nullable()->after('status');
            $table->timestamp('last_notification_sent_at')->nullable()->after('notification_settings');
            
            // Дополнительные поля для корпоративных клиентов
            $table->decimal('discount_percentage', 5, 2)->nullable()->after('last_notification_sent_at');
            $table->text('special_terms')->nullable()->after('discount_percentage');
            $table->date('contract_start_date')->nullable()->after('special_terms');
            $table->date('contract_end_date')->nullable()->after('contract_start_date');
            
            // Статистика
            $table->integer('orders_count')->default(0)->after('contract_end_date');
            $table->decimal('total_spent', 10, 2)->default(0)->after('orders_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'notification_settings',
                'last_notification_sent_at',
                'discount_percentage',
                'special_terms',
                'contract_start_date',
                'contract_end_date',
                'orders_count',
                'total_spent'
            ]);
        });
    }
};
