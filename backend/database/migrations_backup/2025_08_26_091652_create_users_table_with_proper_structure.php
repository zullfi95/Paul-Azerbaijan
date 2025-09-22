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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            
            // Группа пользователя: client (клиент) или staff (персонал)
            $table->enum('user_group', ['client', 'staff'])->default('client');
            
            // Роль персонала: coordinator (координатор) или observer (наблюдатель)
            $table->enum('staff_role', ['coordinator', 'observer'])->nullable();
            
            // Категория клиента: corporate (корпоративный) или one_time (разовый)
            $table->enum('client_category', ['corporate', 'one_time'])->nullable();
            
            // Дополнительные поля для корпоративных клиентов
            $table->string('company_name')->nullable(); // Название компании
            $table->string('position')->nullable(); // Должность
            $table->string('phone')->nullable(); // Телефон
            $table->text('address')->nullable(); // Адрес
            
            // Поля для разовых клиентов
            $table->string('contact_person')->nullable(); // Контактное лицо
            
            // Статус аккаунта
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            
            $table->rememberToken();
            $table->timestamps();
            
            // Индексы для быстрого поиска
            $table->index(['user_group', 'staff_role']);
            $table->index(['user_group', 'client_category']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
