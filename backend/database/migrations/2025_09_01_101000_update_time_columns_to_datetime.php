<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
     public function up(): void
     {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // Applications: convert event_time (TIME) to DATETIME using a temp column
            DB::statement('ALTER TABLE applications ADD COLUMN event_time_tmp DATETIME NULL AFTER event_date');
            DB::statement('UPDATE applications SET event_time_tmp = CASE
                WHEN event_time IS NOT NULL AND event_date IS NOT NULL THEN CONCAT(event_date, " ", event_time)
                WHEN event_time IS NOT NULL AND event_time REGEXP "^[0-9]{4}-[0-9]{2}-[0-9]{2}" THEN event_time
                ELSE NULL END');
            DB::statement('ALTER TABLE applications DROP COLUMN event_time');
            DB::statement('ALTER TABLE applications CHANGE COLUMN event_time_tmp event_time DATETIME NULL');

            // Orders: convert delivery_time (TIME) to DATETIME using a temp column
            DB::statement('ALTER TABLE orders ADD COLUMN delivery_time_tmp DATETIME NULL AFTER delivery_date');
            DB::statement('UPDATE orders SET delivery_time_tmp = CASE
                WHEN delivery_time IS NOT NULL AND delivery_date IS NOT NULL THEN CONCAT(delivery_date, " ", delivery_time)
                WHEN delivery_time IS NOT NULL AND delivery_time REGEXP "^[0-9]{4}-[0-9]{2}-[0-9]{2}" THEN delivery_time
                ELSE NULL END');
            DB::statement('ALTER TABLE orders DROP COLUMN delivery_time');
            DB::statement('ALTER TABLE orders CHANGE COLUMN delivery_time_tmp delivery_time DATETIME NULL');
        } elseif ($driver === 'pgsql') {
            // Applications
            DB::statement('ALTER TABLE applications ADD COLUMN event_time_tmp timestamp NULL');
            DB::statement("UPDATE applications SET event_time_tmp = CASE\n                WHEN event_time IS NOT NULL AND event_date IS NOT NULL THEN (event_date::text || ' ' || event_time::text)::timestamp\n                WHEN event_time IS NOT NULL AND event_time ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN event_time::timestamp\n                ELSE NULL END");
            DB::statement('ALTER TABLE applications DROP COLUMN event_time');
            DB::statement('ALTER TABLE applications RENAME COLUMN event_time_tmp TO event_time');

            // Orders
            DB::statement('ALTER TABLE orders ADD COLUMN delivery_time_tmp timestamp NULL');
            DB::statement("UPDATE orders SET delivery_time_tmp = CASE\n                WHEN delivery_time IS NOT NULL AND delivery_date IS NOT NULL THEN (delivery_date::text || ' ' || delivery_time::text)::timestamp\n                WHEN delivery_time IS NOT NULL AND delivery_time ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN delivery_time::timestamp\n                ELSE NULL END");
            DB::statement('ALTER TABLE orders DROP COLUMN delivery_time');
            DB::statement('ALTER TABLE orders RENAME COLUMN delivery_time_tmp TO delivery_time');
        } else {
            // SQLite or other: no-op since SQLite stores values as TEXT/NUMERIC and casts will work.
        }
     }

    /**
     * Reverse the migrations.
     */
     public function down(): void
     {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            // Applications: revert to TIME
            DB::statement('ALTER TABLE applications ADD COLUMN event_time_old TIME NULL AFTER event_date');
            DB::statement('UPDATE applications SET event_time_old = CASE WHEN event_time IS NOT NULL THEN TIME(event_time) ELSE NULL END');
            DB::statement('ALTER TABLE applications DROP COLUMN event_time');
            DB::statement('ALTER TABLE applications CHANGE COLUMN event_time_old event_time TIME NULL');

            // Orders: revert to TIME
            DB::statement('ALTER TABLE orders ADD COLUMN delivery_time_old TIME NULL AFTER delivery_date');
            DB::statement('UPDATE orders SET delivery_time_old = CASE WHEN delivery_time IS NOT NULL THEN TIME(delivery_time) ELSE NULL END');
            DB::statement('ALTER TABLE orders DROP COLUMN delivery_time');
            DB::statement('ALTER TABLE orders CHANGE COLUMN delivery_time_old delivery_time TIME NULL');
        } elseif ($driver === 'pgsql') {
            // Applications
            DB::statement('ALTER TABLE applications ADD COLUMN event_time_old time NULL');
            DB::statement('UPDATE applications SET event_time_old = CASE WHEN event_time IS NOT NULL THEN TO_CHAR(event_time, \"HH24:MI:SS\")::time ELSE NULL END');
            DB::statement('ALTER TABLE applications DROP COLUMN event_time');
            DB::statement('ALTER TABLE applications RENAME COLUMN event_time_old TO event_time');

            // Orders
            DB::statement('ALTER TABLE orders ADD COLUMN delivery_time_old time NULL');
            DB::statement('UPDATE orders SET delivery_time_old = CASE WHEN delivery_time IS NOT NULL THEN TO_CHAR(delivery_time, \"HH24:MI:SS\")::time ELSE NULL END');
            DB::statement('ALTER TABLE orders DROP COLUMN delivery_time');
            DB::statement('ALTER TABLE orders RENAME COLUMN delivery_time_old TO delivery_time');
        } else {
            // SQLite or other: no-op
        }
     }
};


