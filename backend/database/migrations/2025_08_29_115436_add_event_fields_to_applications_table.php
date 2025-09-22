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
        Schema::table('applications', function (Blueprint $table) {
            // Поля для данных мероприятия
            $table->string('event_address')->nullable()->after('message'); // Адрес мероприятия
            $table->date('event_date')->nullable()->after('event_address'); // Дата мероприятия
            $table->time('event_time')->nullable()->after('event_date'); // Время мероприятия
            $table->decimal('event_lat', 10, 8)->nullable()->after('event_time'); // Широта координат
            $table->decimal('event_lng', 11, 8)->nullable()->after('event_lat'); // Долгота координат
            
            // Индексы для поиска по дате и координатам
            $table->index(['event_date', 'status']);
            $table->index(['event_lat', 'event_lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['event_date', 'status']);
            $table->dropIndex(['event_lat', 'event_lng']);
            
            $table->dropColumn([
                'event_address',
                'event_date', 
                'event_time',
                'event_lat',
                'event_lng'
            ]);
        });
    }
};
