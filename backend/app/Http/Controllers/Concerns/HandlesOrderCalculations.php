<?php

namespace App\Http\Controllers\Concerns;

use App\Models\User;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

trait HandlesOrderCalculations
{
    /**
     * Resolve menu items against server catalog (if available).
     * Returns items with authoritative server_price when found, otherwise keeps client price.
     */
    protected function resolveMenuItems(array $items): array
    {
        // Try to detect a menu_items/products table with price column
        $catalogTable = null;
        if (Schema::hasTable('menu_items')) {
            $catalogTable = 'menu_items';
        } elseif (Schema::hasTable('products')) {
            $catalogTable = 'products';
        } elseif (Schema::hasTable('items')) {
            $catalogTable = 'items';
        }

        if (!$catalogTable) {
            // No catalog table found — return items but ensure numeric prices and rounding
            return array_map(function ($it) {
                $it['price'] = isset($it['price']) ? round((float) $it['price'], 2) : 0.0;
                return $it;
            }, $items);
        }

        // Collect ids
        $ids = array_values(array_unique(array_filter(array_map(function ($it) {
            return $it['id'] ?? null;
        }, $items))));

        if (empty($ids)) {
            return array_map(function ($it) {
                $it['price'] = isset($it['price']) ? round((float) $it['price'], 2) : 0.0;
                return $it;
            }, $items);
        }

        // Fetch prices from catalog
        $rows = DB::table($catalogTable)
            ->whereIn('id', $ids)
            ->select('id', 'price')
            ->get()
            ->keyBy('id')
            ->toArray();

        // Map back
        return array_map(function ($it) use ($rows) {
            $id = $it['id'] ?? null;
            $serverPrice = null;
            if ($id && isset($rows[$id])) {
                $serverPrice = (float) $rows[$id]->price;
            }

            $it['quantity'] = isset($it['quantity']) ? (int) $it['quantity'] : 1;
            $it['price'] = isset($it['price']) ? round((float) $it['price'], 2) : 0.0;
            if (!is_null($serverPrice)) {
                $it['server_price'] = round($serverPrice, 2);
                // optionally override price used for calculations — keep client price for reference
            }

            return $it;
        }, $items);
    }

    /**
     * Calculate order totals based on menu items and discounts
     */
    protected function calculateOrderTotals(array $menuItems, float $discountFixed = 0, float $discountPercent = 0, float $deliveryCost = 0): array
    {
        // Resolve menu items prices from catalog (if exists) and compute authoritative subtotal
        $resolvedItems = $this->resolveMenuItems($menuItems);

        $subtotal = collect($resolvedItems)->sum(function ($item) {
            // ensure rounding to 2 decimals and use server price
            $price = isset($item['server_price']) ? (float) $item['server_price'] : (float) ($item['price'] ?? 0);
            return round($item['quantity'] * $price, 2);
        });

        $discountAmount = $discountFixed + ($subtotal * $discountPercent / 100);
        $itemsTotal = max(0, $subtotal - $discountAmount);
        $finalAmount = $itemsTotal + $deliveryCost;

        return [
            'resolved_items' => $resolvedItems,
            'subtotal' => round($subtotal, 2),
            'discount_amount' => round($discountAmount, 2),
            'items_total' => round($itemsTotal, 2),
            'delivery_cost' => round($deliveryCost, 2),
            'final_amount' => round($finalAmount, 2),
        ];
    }

    /**
     * Get client by ID or current user
     */
    protected function getClientForOrder(Request $request, ?int $clientId = null): User
    {
        $user = $request->user();
        if (!$user) {
            throw new \Exception('Пользователь не авторизован');
        }
        
        $targetClientId = $clientId ?? $user->id;
        $client = User::where('id', $targetClientId)->first();
        
        if (!$client) {
            throw new \Exception('Клиент не найден');
        }

        return $client;
    }

    /**
     * Validate and prepare order data
     */
    protected function prepareOrderData(array $data, User $client): array
    {
        $totals = $this->calculateOrderTotals(
            $data['menu_items'] ?? [],
            (float) ($data['discount_fixed'] ?? 0),
            (float) ($data['discount_percent'] ?? 0),
            (float) ($data['delivery_cost'] ?? 0)
        );

        return [
            'client_id' => $client->id,
            'company_name' => $client->company_name ?? $client->name,
            'client_type' => $client->client_category ?? 'one_time',
            'menu_items' => $totals['resolved_items'],
            'comment' => $data['comment'] ?? null,
            'status' => 'submitted',
            'coordinator_id' => auth()->id(),
            'total_amount' => $totals['subtotal'],
            'discount_fixed' => (float) ($data['discount_fixed'] ?? 0),
            'discount_percent' => (float) ($data['discount_percent'] ?? 0),
            'discount_amount' => $totals['discount_amount'],
            'items_total' => $totals['items_total'],
            'final_amount' => $totals['final_amount'],
            'delivery_date' => $data['delivery_date'] ?? null,
            'delivery_time' => isset($data['delivery_date']) && isset($data['delivery_time'])
                ? $data['delivery_date'] . ' ' . $data['delivery_time']
                : null,
            'delivery_type' => $data['delivery_type'] ?? 'delivery',
            'delivery_address' => $data['delivery_address'] ?? null,
            'delivery_cost' => $totals['delivery_cost'],
            'recurring_schedule' => $data['recurring_schedule'] ?? null,
            'application_id' => $data['application_id'] ?? null,
            'equipment_required' => $data['equipment_required'] ?? 0,
            'staff_assigned' => $data['staff_assigned'] ?? 0,
            'special_instructions' => $data['special_instructions'] ?? null,
        ];
    }
}
