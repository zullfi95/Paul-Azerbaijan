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
            if (!$this->indexExists('users', 'users_email_index')) {
                $table->index('email'); // Для быстрого поиска по email
            }
            if (!$this->indexExists('users', 'users_user_type_index')) {
                $table->index('user_type'); // Для фильтрации по типу пользователя
            }
            if (!$this->indexExists('users', 'users_staff_role_index')) {
                $table->index('staff_role'); // Для фильтрации по роли персонала
            }
            if (!$this->indexExists('users', 'users_status_index')) {
                $table->index('status'); // Для фильтрации по статусу
            }
            if (!$this->indexExists('users', 'users_user_type_status_index')) {
                $table->index(['user_type', 'status']); // Составной индекс
            }
        });

        // Добавляем индексы для таблицы orders
        Schema::table('orders', function (Blueprint $table) {
            if (!$this->indexExists('orders', 'orders_client_id_index')) {
                $table->index('client_id'); // Для поиска заказов клиента
            }
            if (!$this->indexExists('orders', 'orders_coordinator_id_index')) {
                $table->index('coordinator_id'); // Для поиска заказов координатора
            }
            if (!$this->indexExists('orders', 'orders_status_index')) {
                $table->index('status'); // Для фильтрации по статусу
            }
            if (!$this->indexExists('orders', 'orders_delivery_date_index')) {
                $table->index('delivery_date'); // Для сортировки по дате
            }
            if (!$this->indexExists('orders', 'orders_created_at_index')) {
                $table->index('created_at'); // Для сортировки по дате создания
            }
            if (!$this->indexExists('orders', 'orders_client_id_status_index')) {
                $table->index(['client_id', 'status']); // Составной индекс
            }
            if (!$this->indexExists('orders', 'orders_coordinator_id_status_index')) {
                $table->index(['coordinator_id', 'status']); // Составной индекс
            }
        });

        // Добавляем индексы для таблицы applications
        Schema::table('applications', function (Blueprint $table) {
            if (!$this->indexExists('applications', 'applications_client_id_index')) {
                $table->index('client_id'); // Для поиска заявок клиента
            }
            if (!$this->indexExists('applications', 'applications_status_index')) {
                $table->index('status'); // Для фильтрации по статусу
            }
            if (!$this->indexExists('applications', 'applications_created_at_index')) {
                $table->index('created_at'); // Для сортировки по дате создания
            }
            if (!$this->indexExists('applications', 'applications_client_id_status_index')) {
                $table->index(['client_id', 'status']); // Составной индекс
            }
        });

        // Добавляем индексы для таблицы menu_categories
        Schema::table('menu_categories', function (Blueprint $table) {
            if (!$this->indexExists('menu_categories', 'menu_categories_is_active_index')) {
                $table->index('is_active'); // Для фильтрации активных категорий
            }
            if (!$this->indexExists('menu_categories', 'menu_categories_sort_order_index')) {
                $table->index('sort_order'); // Для сортировки
            }
        });

        // Добавляем индексы для таблицы menu_items
        Schema::table('menu_items', function (Blueprint $table) {
            if (!$this->indexExists('menu_items', 'menu_items_menu_category_id_index')) {
                $table->index('menu_category_id'); // Для поиска по категории
            }
            if (!$this->indexExists('menu_items', 'menu_items_is_available_index')) {
                $table->index('is_available'); // Для фильтрации доступных товаров
            }
            if (!$this->indexExists('menu_items', 'menu_items_sort_order_index')) {
                $table->index('sort_order'); // Для сортировки
            }
            if (!$this->indexExists('menu_items', 'menu_items_menu_category_id_is_available_index')) {
                $table->index(['menu_category_id', 'is_available']); // Составной индекс
            }
        });

        // Добавляем индексы для таблицы notifications
        Schema::table('notifications', function (Blueprint $table) {
            if (!$this->indexExists('notifications', 'notifications_recipient_email_index')) {
                $table->index('recipient_email'); // Для поиска уведомлений пользователя
            }
            if (!$this->indexExists('notifications', 'notifications_status_index')) {
                $table->index('status'); // Для фильтрации по статусу
            }
            if (!$this->indexExists('notifications', 'notifications_created_at_index')) {
                $table->index('created_at'); // Для сортировки по дате
            }
            if (!$this->indexExists('notifications', 'notifications_recipient_email_status_index')) {
                $table->index(['recipient_email', 'status']); // Составной индекс
            }
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
            $table->dropIndex(['recipient_email']);
            $table->dropIndex(['status']);
            $table->dropIndex(['created_at']);
            $table->dropIndex(['recipient_email', 'status']);
        });
    }

    /**
     * Check if index exists
     */
    private function indexExists(string $table, string $index): bool
    {
        try {
            $indexes = Schema::getConnection()->getDoctrineSchemaManager()->listTableIndexes($table);
            return array_key_exists($index, $indexes);
        } catch (\Exception $e) {
            // Если метод не существует, используем альтернативный способ
            $indexes = Schema::getConnection()->select("SHOW INDEX FROM `{$table}`");
            foreach ($indexes as $idx) {
                if ($idx->Key_name === $index) {
                    return true;
                }
            }
            return false;
        }
    }
};
