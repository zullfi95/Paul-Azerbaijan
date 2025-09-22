/**
 * Utility functions for safe number operations
 */

/**
 * Safely formats a total amount that might be a number or string
 * @param totalAmount - The total amount (number or string)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string with proper decimal places
 */
export function formatTotalAmount(totalAmount: number | string | null | undefined, decimals: number = 2): string {
  if (totalAmount === null || totalAmount === undefined) {
    return `0.${'0'.repeat(decimals)}`;
  }
  
  if (typeof totalAmount === 'number') {
    return totalAmount.toFixed(decimals);
  }
  
  const parsed = parseFloat(totalAmount);
  return isNaN(parsed) ? `0.${'0'.repeat(decimals)}` : parsed.toFixed(decimals);
}

/**
 * Safely converts a total amount to a number for calculations
 * @param totalAmount - The total amount (number or string)
 * @returns Number value, defaults to 0 if invalid
 */
export function parseTotalAmount(totalAmount: number | string | null | undefined): number {
  if (totalAmount === null || totalAmount === undefined) {
    return 0;
  }
  
  if (typeof totalAmount === 'number') {
    return totalAmount;
  }
  
  const parsed = parseFloat(totalAmount);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Safely calculates the sum of total amounts from an array of orders
 * @param orders - Array of orders with total_amount field
 * @returns Total sum as a number
 */
export function calculateTotalAmountSum(orders: Array<{ total_amount: number | string | null | undefined }>): number {
  return orders.reduce((sum, order) => {
    return sum + parseTotalAmount(order.total_amount);
  }, 0);
}
