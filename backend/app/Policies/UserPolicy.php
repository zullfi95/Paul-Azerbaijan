<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Определить, может ли пользователь просматривать список пользователей
     */
    public function viewAny(User $user): bool
    {
        // Только координаторы могут видеть список пользователей
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь просматривать конкретного пользователя
     */
    public function view(User $user, User $model): bool
    {
        // Координаторы могут видеть всех пользователей
        if ($user->isCoordinator()) {
            return true;
        }

        // Пользователи могут видеть только свою информацию
        return $user->id === $model->id;
    }

    /**
     * Определить, может ли пользователь создавать пользователей
     */
    public function create(User $user): bool
    {
        // Только координаторы могут создавать пользователей
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь обновлять пользователя
     */
    public function update(User $user, User $model): bool
    {
        // Координаторы могут обновлять всех пользователей
        if ($user->isCoordinator()) {
            return true;
        }

        // Пользователи могут обновлять только свою информацию
        return $user->id === $model->id;
    }

    /**
     * Определить, может ли пользователь удалять пользователя
     */
    public function delete(User $user, User $model): bool
    {
        // Только координаторы могут удалять пользователей
        // Нельзя удалить самого себя
        return $user->isCoordinator() && $user->id !== $model->id;
    }

    /**
     * Определить, может ли пользователь просматривать статистику пользователей
     */
    public function viewStatistics(User $user): bool
    {
        // Только координаторы могут видеть статистику
        return $user->isCoordinator();
    }
}
