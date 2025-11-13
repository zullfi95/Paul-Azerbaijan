<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration sets a default staff_role for all staff users
     * who don't have one assigned yet.
     */
    public function up(): void
    {
        // Update all staff users without staff_role to have 'observer' as default
        DB::table('users')
            ->where('user_type', 'staff')
            ->whereNull('staff_role')
            ->update(['staff_role' => 'observer']);
        
        // Log the migration
        \Log::info('Set default staff_role for existing staff users');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We don't reverse this as it's a data fix
        // The original data state is lost intentionally
    }
};

