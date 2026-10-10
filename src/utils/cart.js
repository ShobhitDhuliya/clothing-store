import {
  EXPRESS_SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "../constants/cart";
import { buildVariants } from "./productDetails";

/**
 * Pure cart maths, kept out of the UI so it can later be validated against
 * server-side pricing without touching a single component.
 */

/**
 * Stable identity for a cart line: the product plus the chosen variant.
 * The same shirt in Black/M and Black/L is therefore two separate lines.
 */
export function getCartLineKey(item) {
  if (!item) return "";
  return item.id ?? `${item.productId}-${item.color}-${item.size}`;
}

/** Merge a new line into the cart, summing quantities for the same variant. */
export function mergeCartItem(items, nextItem) {
  const key = getCartLineKey(nextItem);

  if (!items.some((item) => getCartLineKey(item) === key)) {
    return [...items, nextItem];
  }

  return items.map((item) =>
    getCartLineKey(item) === key
      ? { ...item, quantity: item.quantity + nextItem.quantity }
      : item,
  );
}

/** Sum of price × quantity across every line. */
export function getCartSubtotal(items) {
  return items.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );
}

/** Shipping fee for a given subtotal and delivery method. */
export function getShippingFee(subtotal, method = "standard") {
  if (subtotal <= 0) return 0;
  if (method === "express") return EXPRESS_SHIPPING_FEE;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

/**
 * Enrich stored cart lines with live catalogue/inventory data.
 *
 * A cart line only stores what the shopper chose (variant + price at the time
 * it was added). Category, current/original price and local catalogue stock
 * are derived here. The API revalidates the current variant stock at checkout.
 */
export function resolveCartLines(items, catalogue = []) {
  return items.map((line) => {
    const key = getCartLineKey(line);
    const product =
      catalogue.find((entry) => entry.id === line.productId) ?? null;

    const variant = product
      ? buildVariants(product).find(
          (entry) => entry.color === line.color && entry.size === line.size,
        )
      : null;

    const stock =
      variant && typeof variant.stock === "number"
        ? variant.stock
        : product && typeof product.stock === "number"
          ? product.stock
          : null;

    const quantity = Math.max(1, Number(line.quantity) || 1);
    const effectiveQuantity = Math.min(
      quantity,
      stock === null ? quantity : Math.max(0, stock),
    );

    const price = Number(product?.price ?? line.price ?? 0);
    const originalPrice =
      Number(product?.originalPrice ?? line.originalPrice ?? 0) || null;
    const hasDiscount = originalPrice !== null && originalPrice > price;
    const unitSavings = hasDiscount ? originalPrice - price : 0;

    return {
      ...line,
      key,
      name: product?.name ?? line.name ?? "",
      slug: product?.slug ?? line.slug ?? "",
      category: product?.category ?? line.category ?? null,
      categorySlug: product?.categorySlug ?? line.categorySlug ?? null,
      image: product?.image ?? line.image ?? null,
      accentHue: product?.accentHue ?? line.accentHue ?? 30,
      price,
      originalPrice,
      stock,
      quantity,
      effectiveQuantity,
      isAvailable: effectiveQuantity > 0,
      wasReduced: effectiveQuantity < quantity,
      lineTotal: price * effectiveQuantity,
      lineSavings: unitSavings * effectiveQuantity,
      discountPercent: hasDiscount
        ? Math.round((unitSavings / originalPrice) * 100)
        : 0,
    };
  });
}

/** Derived totals for the cart page — a pure function of the resolved lines. */
export function getCartTotals(lines) {
  const totals = lines.reduce(
    (acc, line) => {
      acc.subtotal += line.lineTotal;
      acc.savings += line.lineSavings;
      acc.itemCount += line.effectiveQuantity;
      return acc;
    },
    { subtotal: 0, savings: 0, itemCount: 0 },
  );

  totals.shipping = getShippingFee(totals.subtotal);
  totals.total = totals.subtotal + totals.shipping;

  return totals;
}

/** Progress toward the free-shipping threshold for the standard rate. */
export function getFreeShippingProgress(subtotal) {
  const threshold = FREE_SHIPPING_THRESHOLD;
  const remaining = Math.max(0, threshold - subtotal);

  return {
    threshold,
    remaining,
    percent:
      threshold > 0
        ? Math.min(100, Math.round((subtotal / threshold) * 100))
        : 100,
    unlocked: remaining === 0,
  };
}