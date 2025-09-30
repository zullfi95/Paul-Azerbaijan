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
            $table->string('last_name')->nullable();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('company_name')->nullable();
            $table->string('position')->nullable();
            $table->string('contact_person')->nullable();

            // Тип пользователя и роль
            $table->enum('user_type', ['staff', 'client'])->default('client');
            $table->enum('staff_role', ['coordinator', 'observer'])->nullable();
            $table->enum('client_category', ['corporate', 'one_time'])->nullable();
            
            // Статус
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            
            // Настройки уведомлений
            $table->json('notification_settings')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
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
