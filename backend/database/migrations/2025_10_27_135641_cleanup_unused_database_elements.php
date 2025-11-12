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
        // 1. Удаляем неиспользуемые таблицы
        Schema::dropIfExists('beo_sections');
        Schema::dropIfExists('beos');
        Schema::dropIfExists('sessions');
        
        // 2. Очищаем таблицу users от неиспользуемых полей
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'notification_settings',
                'billing_street', 
                'billing_city', 
                'billing_postal_code', 
                'billing_country',
                'shipping_street', 
                'shipping_city', 
                'shipping_postal_code', 
                'shipping_country',
                'remember_token'
            ]);
        });
        
        // 3. Очищаем таблицу orders от неиспользуемых полей
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'preparation_timeline',
                'order_deadline',
                'modification_deadline',
                'beo_file_path',
                'beo_generated_at',
                'payment_details',
                'payment_created_at',
                'payment_completed_at'
            ]);
        });
        
        // 4. Очищаем таблицу applications от неиспользуемых полей
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'event_lat', 
                'event_lng',
                'event_type', 
                'guest_count', 
                'budget', 
                'special_requirements'
            ]);
        });
        
        // 5. Упрощаем роли - оставляем только coordinator
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('staff_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Восстанавливаем роли
        Schema::table('users', function (Blueprint $table) {
            $table->enum('staff_role', ['coordinator', 'observer'])->nullable();
        });
        
        // Восстанавливаем поля applications
        Schema::table('applications', function (Blueprint $table) {
            $table->decimal('event_lat', 8, 6)->nullable();
            $table->decimal('event_lng', 9, 6)->nullable();
            $table->string('event_type')->nullable();
            $table->integer('guest_count')->nullable();
            $table->string('budget')->nullable();
            $table->text('special_requirements')->nullable();
        });
        
        // Восстанавливаем поля orders
        Schema::table('orders', function (Blueprint $table) {
            $table->json('preparation_timeline')->nullable();
            $table->timestamp('order_deadline')->nullable();
            $table->timestamp('modification_deadline')->nullable();
            $table->string('beo_file_path')->nullable();
            $table->timestamp('beo_generated_at')->nullable();
            $table->json('payment_details')->nullable();
            $table->timestamp('payment_created_at')->nullable();
            $table->timestamp('payment_completed_at')->nullable();
        });
        
        // Восстанавливаем поля users
        Schema::table('users', function (Blueprint $table) {
            $table->json('notification_settings')->nullable();
            $table->string('billing_street')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_postal_code')->nullable();
            $table->string('billing_country')->nullable();
            $table->string('shipping_street')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_country')->nullable();
            $table->rememberToken();
        });
        
        // Восстанавливаем таблицы
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->text('payload');
            $table->integer('last_activity')->index();
        });
        
        Schema::create('beos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->string('event_name');
            $table->date('event_date');
            $table->datetime('event_time');
            $table->string('venue');
            $table->integer('guest_count');
            $table->string('contact_person');
            $table->string('contact_phone');
            $table->string('contact_email');
            $table->text('special_instructions')->nullable();
            $table->text('setup_requirements')->nullable();
            $table->text('dietary_restrictions')->nullable();
            $table->timestamps();
        });
        
        Schema::create('beo_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beo_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }
};