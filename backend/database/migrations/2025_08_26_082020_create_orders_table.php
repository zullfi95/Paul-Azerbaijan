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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            
            // Компания для заказа
            $table->string('company_name'); // Название компании
            
            // Данные заказа
            $table->json('menu_items'); // Позиции из меню [{id, name, quantity, price}]
            $table->text('comment')->nullable(); // Комментарий координатора
            
            // Статус заказа
            $table->enum('status', ['draft', 'submitted', 'processing', 'completed', 'cancelled'])->default('submitted');
            
            // Кто создал заказ
            $table->unsignedBigInteger('coordinator_id');
            
            // Общая сумма заказа
            $table->decimal('total_amount', 10, 2)->default(0);
            
            // Дата выполнения
            $table->date('delivery_date')->nullable();
            $table->time('delivery_time')->nullable();
            
            $table->timestamps();
            
            // Индексы
            $table->index(['company_name', 'status']);
            $table->index(['coordinator_id', 'created_at']);
            $table->index('delivery_date');
            
            // Внешние ключи
            $table->foreign('coordinator_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['coordinator_id']);
        });
        Schema::dropIfExists('orders');
    }
};
