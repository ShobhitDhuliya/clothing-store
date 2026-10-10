/** Cart & checkout constants shared by the cart page, checkout and summary. */

export const CART_STORAGE_KEY = "atelier_cart";

export const FREE_SHIPPING_THRESHOLD = 75;
export const STANDARD_SHIPPING_FEE = 5.99;
export const EXPRESS_SHIPPING_FEE = 12.99;

export const DELIVERY_METHODS = [
  {
    id: "standard",
    label: "Standard delivery",
    description: "3–5 business days",
  },
  {
    id: "express",
    label: "Express delivery",
    description: "1–2 business days",
  },
];

export const PAYMENT_METHODS = [
  {
    id: "card",
    label: "Credit / debit card",
    description: "Placeholder — no real payment gateway is connected yet.",
  },
  {
    id: "cod",
    label: "Cash on delivery",
    description: "Pay in cash when your order arrives.",
  },
];