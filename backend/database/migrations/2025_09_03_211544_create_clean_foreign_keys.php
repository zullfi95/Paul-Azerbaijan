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
        // Добавляем внешние ключи для applications
        Schema::table('applications', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            // coordinator_id уже существует, добавляем только внешний ключ
            $table->foreign('coordinator_id')->references('id')->on('users')->onDelete('set null');
        });

        // Добавляем внешние ключи для orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->constrained('clients')->onDelete('set null');
            // coordinator_id уже существует, добавляем только внешний ключ (не nullable)
            $table->foreign('coordinator_id')->references('id')->on('users')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['coordinator_id']);
            $table->dropColumn(['client_id', 'coordinator_id']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['client_id']);
            $table->dropForeign(['coordinator_id']);
            $table->dropColumn(['client_id', 'coordinator_id']);
        });
    }
};