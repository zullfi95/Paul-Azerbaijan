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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            
            // Данные заявителя
            $table->string('first_name'); // Имя
            $table->string('last_name'); // Фамилия
            $table->string('phone'); // Телефон
            $table->string('email'); // Email
            
            // Позиции из корзины (JSON)
            $table->json('cart_items')->nullable(); // [{id, name, quantity, price}]
            
            // Статус заявки
            $table->enum('status', ['new', 'processing', 'approved', 'rejected'])->default('new');
            
            // Комментарий координатора
            $table->text('coordinator_comment')->nullable();
            
            // Кто обработал заявку
            $table->unsignedBigInteger('coordinator_id')->nullable();
            
            // Время обработки
            $table->timestamp('processed_at')->nullable();
            
            $table->timestamps();
            
            // Индексы
            $table->index(['status', 'created_at']);
            $table->index('coordinator_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
