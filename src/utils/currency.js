/** Format a numeric amount as a localised currency string. */
export function formatCurrency(amount, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(Number(amount) || 0);
}

export default formatCurrency;
