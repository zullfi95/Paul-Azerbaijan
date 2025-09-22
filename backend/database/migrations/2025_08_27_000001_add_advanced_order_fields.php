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
            // Дополнительные поля для заказов
            $table->string('delivery_type')->default('delivery')->after('delivery_time'); // delivery, pickup, buffet
            $table->text('delivery_address')->nullable()->after('delivery_type');
            $table->decimal('delivery_cost', 8, 2)->default(0)->after('delivery_address');
            $table->json('equipment_required')->nullable()->after('delivery_cost');
            $table->json('staff_assigned')->nullable()->after('equipment_required');
            $table->text('special_instructions')->nullable()->after('staff_assigned');
            
            // BEO связанные поля
            $table->string('beo_file_path')->nullable()->after('special_instructions');
            $table->timestamp('beo_generated_at')->nullable()->after('beo_file_path');
            $table->json('preparation_timeline')->nullable()->after('beo_generated_at');
            
            // Временные ограничения
            $table->boolean('is_urgent')->default(false)->after('preparation_timeline');
            $table->timestamp('order_deadline')->nullable()->after('is_urgent');
            $table->timestamp('modification_deadline')->nullable()->after('order_deadline');
            
            // Связь с заявкой
            $table->foreignId('application_id')->nullable()->constrained()->after('modification_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['application_id']);
            $table->dropColumn([
                'delivery_type',
                'delivery_address',
                'delivery_cost',
                'equipment_required',
                'staff_assigned',
                'special_instructions',
                'beo_file_path',
                'beo_generated_at',
                'preparation_timeline',
                'is_urgent',
                'order_deadline',
                'modification_deadline',
                'application_id'
            ]);
        });
    }
};
