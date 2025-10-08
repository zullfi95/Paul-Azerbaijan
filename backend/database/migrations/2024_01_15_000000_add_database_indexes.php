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
        // Добавляем индексы для таблицы users
        Schema::table('users', function (Blueprint $table) {
            $table->index('email'); // Для быстрого поиска по email
            $table->index('user_type'); // Для фильтрации по типу пользователя
            $table->index('staff_role'); // Для фильтрации по роли персонала
            $table->index('status'); // Для фильтрации по статусу
            $table->index(['user_type', 'status']); // Составной индекс
        });

        // Добавляем индексы для таблицы orders
        Schema::table('orders', function (Blueprint $table) {
            $table->index('client_id'); // Для поиска заказов клиента
            $table->index('coordinator_id'); // Для поиска заказов координатора
            $table->index('status'); // Для фильтрации по статусу
            $table->index('delivery_date'); // Для сортировки по дате
            $table->index('created_at'); // Для сортировки по дате создания
            $table->index(['client_id', 'status']); // Составной индекс
            $table->index(['coordinator_id', 'status']); // Составной индекс
        });

        // Добавляем индексы для таблицы applications
        Schema::table('applications', function (Blueprint $table) {
            $table->index('client_id'); // Для поиска заявок клиента
            $table->index('status'); // Для фильтрации по статусу
            $table->index('created_at'); // Для сортировки по дате создания
            $table->index(['client_id', 'status']); // Составной индекс
        });

        // Добавляем индексы для таблицы menu_categories
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->index('is_active'); // Для фильтрации активных категорий
            $table->index('sort_order'); // Для сортировки
        });

        // Добавляем индексы для таблицы menu_items
        Schema::table('menu_items', function (Blueprint $table) {
            $table->index('menu_category_id'); // Для поиска по категории
            $table->index('is_available'); // Для фильтрации доступных товаров
            $table->index('sort_order'); // Для сортировки
            $table->index(['menu_category_id', 'is_available']); // Составной индекс
        });

        // Добавляем индексы для таблицы notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->index('user_id'); // Для поиска уведомлений пользователя
            $table->index('is_read'); // Для фильтрации непрочитанных
            $table->index('created_at'); // Для сортировки по дате
            $table->index(['user_id', 'is_read']); // Составной индекс
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Удаляем индексы для таблицы users
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email']);
            $table->dropIndex(['user_type']);
            $table->dropIndex(['staff_role']);
            $table->dropIndex(['status']);
            $table->dropIndex(['user_type', 'status']);
        });

        // Удаляем индексы для таблицы orders
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['client_id']);
            $table->dropIndex(['coordinator_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['delivery_date']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['client_id', 'status']);
            $table->dropIndex(['coordinator_id', 'status']);
        });

        // Удаляем индексы для таблицы applications
        Schema::table('applications', function (Blueprint $table) {
            $table->dropIndex(['client_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['client_id', 'status']);
        });

        // Удаляем индексы для таблицы menu_categories
        Schema::table('menu_categories', function (Blueprint $table) {
            $table->dropIndex(['is_active']);
            $table->dropIndex(['sort_order']);
        });

        // Удаляем индексы для таблицы menu_items
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropIndex(['menu_category_id']);
            $table->dropIndex(['is_available']);
            $table->dropIndex(['sort_order']);
            $table->dropIndex(['menu_category_id', 'is_available']);
        });

        // Удаляем индексы для таблицы notifications
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex(['user_id']);
            $table->dropIndex(['is_read']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['user_id', 'is_read']);
        });
    }
};
