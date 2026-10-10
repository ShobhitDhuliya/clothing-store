/**
 * Calculate a whole-number discount percentage from a current and an
 * original price. Returns 0 when there is no genuine markdown.
 */
export function calculateDiscountPercent(price, originalPrice) {
  const current = Number(price);
  const original = Number(originalPrice);

  if (!original || original <= current) return 0;

  return Math.round(((original - current) / original) * 100);
}

export default calculateDiscountPercent;