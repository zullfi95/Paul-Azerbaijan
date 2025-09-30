<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Клиент и тип
            $table->enum('client_type', ['corporate', 'one_time'])->default('one_time')->after('company_name');
            $table->json('customer')->nullable()->after('client_type');
            $table->json('employees')->nullable()->after('customer');
            $table->unsignedBigInteger('client_id')->nullable()->after('employees');

            // Денежные поля и скидки
            $table->decimal('discount_fixed', 10, 2)->default(0)->after('total_amount');
            $table->decimal('discount_percent', 5, 2)->default(0)->after('discount_fixed');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('discount_percent');
            $table->decimal('items_total', 10, 2)->default(0)->after('discount_amount');
            $table->decimal('final_amount', 10, 2)->default(0)->after('items_total');
            
            // Внешние ключи
            $table->foreign('client_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropColumn([
                'client_type',
                'customer',
                'employees',
                'client_id',
                'discount_fixed',
                'discount_percent',
                'discount_amount',
                'items_total',
                'final_amount',
            ]);
        });
    }
};



