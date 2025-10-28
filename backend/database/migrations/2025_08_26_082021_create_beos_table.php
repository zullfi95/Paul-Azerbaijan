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

            $table->index(['order_id']);
            $table->index(['event_date']);
            $table->index(['event_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beos');
    }
};
