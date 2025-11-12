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
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('iiko_id')->nullable()->unique(); // ID из iiko API
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('AZN');
            $table->foreignId('menu_category_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('organization_id')->nullable(); // ID организации из iiko
            $table->json('images')->nullable(); // Массив URL изображений
            $table->json('allergens')->nullable(); // Массив аллергенов
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['menu_category_id', 'is_active', 'is_available']);
            $table->index(['organization_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menu_items');
    }
};
