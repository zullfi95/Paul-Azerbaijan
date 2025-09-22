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
            
            // Роль персонала: coordinator (координатор) или observer (наблюдатель)
            $table->enum('staff_role', ['coordinator', 'observer'])->nullable();
            
            // Статус аккаунта
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            
            // Настройки уведомлений
            $table->json('notification_settings')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            
            // Индексы для быстрого поиска
            $table->index('staff_role');
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