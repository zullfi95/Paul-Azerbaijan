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
            // Удаляем индексы
            $table->dropIndex(['user_group', 'staff_role']);
            $table->dropIndex(['user_group', 'client_category']);
            
            // Удаляем клиентские поля
            $table->dropColumn([
                'client_category',
                'company_name',
                'position',
                'phone',
                'address',
                'contact_person',
            ]);
            
            // Изменяем user_group - теперь только staff
            $table->dropColumn('user_group');
            
            // Добавляем новые индексы только для персонала
            $table->index('staff_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Восстанавливаем поля
            $table->enum('user_group', ['client', 'staff'])->default('staff');
            $table->enum('client_category', ['corporate', 'one_time'])->nullable();
            $table->string('company_name')->nullable();
            $table->string('position')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_person')->nullable();
            
            // Восстанавливаем индексы
            $table->index(['user_group', 'staff_role']);
            $table->index(['user_group', 'client_category']);
            $table->dropIndex(['staff_role']);
        });
    }
};
