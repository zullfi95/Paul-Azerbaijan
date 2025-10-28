<?php

namespace App\Policies;

use App\Models\User;

class ClientPolicy
{
    /**
     * Определить, может ли пользователь просматривать список клиентов
     */
    public function viewAny(User $user): bool
    {
        // Только координаторы могут видеть список клиентов
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь просматривать конкретного клиента
     */
    public function view(User $user, User $client): bool
    {
        // Координаторы могут видеть всех клиентов
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут видеть только свою информацию
        if ($user->isClient()) {
            return $user->id === $client->id;
        }

        return false;
    }

    /**
     * Определить, может ли пользователь создавать клиентов
     */
    public function create(User $user): bool
    {
        // Только координаторы могут создавать клиентов
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь обновлять клиента
     */
    public function update(User $user, User $client): bool
    {
        // Координаторы могут обновлять всех клиентов
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут обновлять только свою информацию
        if ($user->isClient()) {
            return $user->id === $client->id;
        }

        return false;
    }

    /**
     * Определить, может ли пользователь удалять клиента
     */
    public function delete(User $user, User $client): bool
    {
        // Только координаторы могут удалять клиентов
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь просматривать статистику клиентов
     */
    public function viewStatistics(User $user): bool
    {
        // Только координаторы могут видеть статистику клиентов
        return $user->isCoordinator();
    }
}
