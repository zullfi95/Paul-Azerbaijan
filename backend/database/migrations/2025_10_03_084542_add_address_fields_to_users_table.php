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
            // Billing address fields
            $table->string('billing_street')->nullable();
            $table->string('billing_city')->nullable();
            $table->string('billing_postal_code')->nullable();
            $table->string('billing_country')->nullable();
            
            // Shipping address fields
            $table->string('shipping_street')->nullable();
            $table->string('shipping_city')->nullable();
            $table->string('shipping_postal_code')->nullable();
            $table->string('shipping_country')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop billing address fields
            $table->dropColumn([
                'billing_street',
                'billing_city',
                'billing_postal_code',
                'billing_country'
            ]);
            
            // Drop shipping address fields
            $table->dropColumn([
                'shipping_street',
                'shipping_city',
                'shipping_postal_code',
                'shipping_country'
            ]);
        });
    }
};
