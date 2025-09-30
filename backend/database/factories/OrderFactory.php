<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'company_name' => $this->faker->company(),
            'menu_items' => [
                [
                    'id' => 'test-item-1',
                    'name' => 'Test Item',
                    'quantity' => 1,
                    'price' => 10.00,
                    'server_price' => 10.00,
                ],
            ],
            'comment' => null,
            'status' => 'submitted',
            'coordinator_id' => User::factory()->create([
                'user_type' => 'staff',
                'staff_role' => 'coordinator',
            ])->id,
            'client_id' => User::factory()->create([
                'user_type' => 'client',
                'client_category' => 'corporate',
            ])->id,
            'total_amount' => 10.00,
            'discount_fixed' => 0,
            'discount_percent' => 0,
            'discount_amount' => 0,
            'items_total' => 10.00,
            'final_amount' => 10.00,
            'delivery_date' => null,
            'delivery_time' => null,
            'delivery_type' => 'delivery',
            'delivery_address' => null,
            'delivery_cost' => 0,
            'recurring_schedule' => null,
            'equipment_required' => 0,
            'staff_assigned' => 0,
            'special_instructions' => null,
            // payment-related defaults
            'payment_status' => 'pending',
            'payment_attempts' => 0,
        ];
    }
}
