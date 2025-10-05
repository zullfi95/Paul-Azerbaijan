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
        Schema::create('beo_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('beo_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('content');
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['beo_id']);
            $table->index(['order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beo_sections');
    }
};
