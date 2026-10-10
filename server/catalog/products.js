import { products as catalogue } from "../../src/data/products.js";
import { buildVariants } from "../../src/utils/productDetails.js";

/**
 * Server-side catalogue — the single source of truth for pricing and stock
 * validation. It imports the same data module the storefront renders, so the
 * server always recomputes totals from the exact prices the customer saw and
 * a client-supplied price can never be trusted.
 */
export const products = catalogue;

/** Look a product up by id (accepts number or numeric string). */
export function findProduct(id) {
  const numeric = Number(id);
  return products.find((product) => product.id === numeric) ?? null;
}

/** Find a real colour/size variant, including the same stock shown in the shop. */
export function findVariant(product, color, size) {
  if (!product) return null;
  return (
    buildVariants(product).find(
      (variant) => variant.color === color && variant.size === size,
    ) ?? null
  );
}

/** True when colour + size is a real combination on this product. */
export function isValidVariant(product, color, size) {
  return Boolean(findVariant(product, color, size));
}
