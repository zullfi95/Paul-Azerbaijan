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
            // Проверяем, существует ли уже колонка client_id
            if (!Schema::hasColumn('applications', 'client_id')) {
                $table->unsignedBigInteger('client_id')->nullable()->after('coordinator_id');
                $table->foreign('client_id')->references('id')->on('clients')->onDelete('set null');
                $table->index('client_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'client_id')) {
                $table->dropForeign(['client_id']);
                $table->dropIndex(['client_id']);
                $table->dropColumn('client_id');
            }
        });
    }
};