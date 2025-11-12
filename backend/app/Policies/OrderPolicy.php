<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Order;

class OrderPolicy
{
    /**
     * Определить, может ли пользователь просматривать заказы
     */
    public function viewAny(User $user): bool
    {
        // Координаторы могут видеть все заказы
        if ($user->isCoordinator()) {
            return true;
        }
        
        // Клиенты могут видеть свои заказы
        if ($user->isClient()) {
            return true;
        }
        
        return false;
    }

    /**
     * Определить, может ли пользователь просматривать конкретный заказ
     */
    public function view(User $user, Order $order): bool
    {
        // Координаторы могут видеть все заказы
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут видеть только свои заказы
        if ($user->isClient()) {
            return $order->client_id === $user->id;
        }

        return false;
    }

    /**
     * Определить, может ли пользователь создавать заказы
     */
    public function create(User $user): bool
    {
        // Только координаторы могут создавать заказы
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь обновлять заказ
     */
    public function update(User $user, Order $order): bool
    {
        // Координаторы могут обновлять все заказы
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты не могут обновлять заказы
        return false;
    }

    /**
     * Определить, может ли пользователь удалять заказ
     */
    public function delete(User $user, Order $order): bool
    {
        // Только координаторы могут удалять заказы
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь обновлять статус заказа
     */
    public function updateStatus(User $user, Order $order): bool
    {
        // Только координаторы могут обновлять статус
        return $user->isCoordinator();
    }

    /**
     * Определить, может ли пользователь создавать платежи для заказа
     */
    public function createPayment(User $user, Order $order): bool
    {
        // Координаторы могут создавать платежи для любых заказов
        if ($user->isCoordinator()) {
            return true;
        }
        
        // Клиенты могут создавать платежи только для своих заказов
        if ($user->isClient() && $order->client_id === $user->id) {
            return true;
        }
        
        return false;
    }

    /**
     * Определить, может ли пользователь просматривать информацию о платеже
     */
    public function viewPayment(User $user, Order $order): bool
    {
        // Координаторы могут видеть информацию о всех платежах
        if ($user->isCoordinator()) {
            return true;
        }

        // Клиенты могут видеть информацию о платежах только своих заказов
        if ($user->isClient()) {
            return $order->client_id === $user->id;
        }

        return false;
    }
}
