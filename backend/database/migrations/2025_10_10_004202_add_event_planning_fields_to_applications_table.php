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
            // Event planning fields
            $table->string('company_name')->nullable()->after('last_name');
            $table->string('contact_person')->nullable()->after('company_name');
            $table->string('event_type')->nullable()->after('contact_person');
            $table->integer('guest_count')->nullable()->after('event_type');
            $table->string('budget')->nullable()->after('guest_count');
            $table->text('special_requirements')->nullable()->after('budget');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'contact_person',
                'event_type',
                'guest_count',
                'budget',
                'special_requirements'
            ]);
        });
    }
};
