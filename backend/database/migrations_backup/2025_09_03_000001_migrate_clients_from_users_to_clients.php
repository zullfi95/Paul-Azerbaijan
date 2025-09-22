<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Переносим всех клиентов из таблицы users в таблицу clients
        $clients = DB::table('users')
            ->where('user_group', 'client')
            ->get();

        foreach ($clients as $client) {
            DB::table('clients')->insert([
                'name' => $client->name,
                'email' => $client->email,
                'phone' => $client->phone,
                'address' => $client->address,
                'company_name' => $client->company_name,
                'position' => $client->position,
                'contact_person' => $client->contact_person,
                'client_category' => $client->client_category ?? 'one_time',
                'status' => $client->status ?? 'active',
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at,
            ]);
        }

        // Удаляем клиентов из таблицы users
        DB::table('users')
            ->where('user_group', 'client')
            ->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // В случае отката переносим клиентов обратно в users
        $clients = DB::table('clients')->get();

        foreach ($clients as $client) {
            DB::table('users')->insert([
                'name' => $client->name,
                'email' => $client->email,
                'password' => '', // Пароль будет нужно восстановить отдельно
                'user_group' => 'client',
                'client_category' => $client->client_category,
                'company_name' => $client->company_name,
                'position' => $client->position,
                'phone' => $client->phone,
                'address' => $client->address,
                'contact_person' => $client->contact_person,
                'status' => $client->status,
                'created_at' => $client->created_at,
                'updated_at' => $client->updated_at,
            ]);
        }

        // Очищаем таблицу clients
        DB::table('clients')->truncate();
    }
};
