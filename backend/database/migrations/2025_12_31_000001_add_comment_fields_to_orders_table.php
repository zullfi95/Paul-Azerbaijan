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
            // Добавляем три новых поля для комментариев после menu_items
            $table->text('kitchen_comment')->nullable()->after('menu_items');
            $table->text('operation_comment')->nullable()->after('kitchen_comment');
            $table->text('desserts_comment')->nullable()->after('operation_comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'kitchen_comment',
                'operation_comment',
                'desserts_comment'
            ]);
        });
    }
};

