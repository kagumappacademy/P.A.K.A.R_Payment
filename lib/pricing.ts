export function calculatePrice(prices: number[], discounts: { comboTwo: number; comboThree: number; comboAll: number }, availableCount: number) {
  const subtotal = Math.round(prices.reduce((sum, p) => sum + p, 0) * 100);
  const count = prices.length;
  const percent = count > 1 && count === availableCount ? discounts.comboAll : count >= 3 ? discounts.comboThree : count === 2 ? discounts.comboTwo : 0;
  const discount = Math.round(subtotal * percent / 100);
  return { subtotal: subtotal / 100, discount: discount / 100, discountPercent: percent, total: (subtotal - discount) / 100 };
}
export function money(value: number) { return `RM${Number(value).toFixed(2)}`; }
