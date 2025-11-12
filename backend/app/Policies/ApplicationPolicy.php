<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Application;

class ApplicationPolicy
{
    /**
     * Определить, может ли пользователь просматривать заявки
     */
    public function viewAny(User $user): bool
    {
        // Координаторы могут видеть все заявки
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут видеть только свои заявки
        if ($user->isClient()) {
            return true;
        }

        return false;
    }

    /**
     * Определить, может ли пользователь просматривать конкретную заявку
     */
    public function view(User $user, Application $application): bool
    {
        // Координаторы могут видеть все заявки
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут видеть только свои заявки
        if ($user->isClient()) {
            return $application->client_id === $user->id;
        }

        return false;
    }

    /**
     * Определить, может ли пользователь создавать заявки
     */
    public function create(User $user): bool
    {
        // Все авторизованные пользователи могут создавать заявки
        // Публичные заявки обрабатываются отдельно
        return true;
    }

    /**
     * Определить, может ли пользователь обновлять заявку
     */
    public function update(User $user, Application $application): bool
    {
        // Координаторы могут обновлять все заявки
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут обновлять только свои заявки в статусе "new"
        if ($user->isClient() && $application->client_id === $user->id) {
            return $application->status === 'new';
        }

        return false;
    }

    /**
     * Определить, может ли пользователь удалять заявку
     */
    public function delete(User $user, Application $application): bool
    {
        // Координаторы могут удалять все заявки
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут удалять только свои заявки в статусе "new"
        if ($user->isClient() && $application->client_id === $user->id) {
            return $application->status === 'new';
        }

        return false;
    }

    /**
     * Определить, может ли пользователь обновлять статус заявки
     */
    public function updateStatus(User $user, Application $application): bool
    {
        // Только координаторы могут обновлять статус заявок
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь создавать заказ на основе заявки
     */
    public function createOrderFromApplication(User $user, Application $application): bool
    {
        // Только координаторы могут создавать заказы на основе заявок
        return $user->isCoordinator();
    }
}
