import { useMemo, useState } from "react";
import { getVariant } from "../utils/productDetails";

const DEFAULT_QUANTITY = 1;

/** Pick the first in-stock variant, falling back to the very first one. */
export function pickDefaultVariant(variants) {
  return variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null;
}

/**
 * Owns the colour / size / quantity selection for the product details page.
 * Selection is kept separate from rendering so it can later be driven by
 * server-side inventory without touching the UI components.
 */
export default function useProductVariant(variants) {
  const [color, setColor] = useState(() => pickDefaultVariant(variants)?.color ?? "");
  const [size, setSize] = useState(() => pickDefaultVariant(variants)?.size ?? "");
  const [quantity, setQuantity] = useState(DEFAULT_QUANTITY);

  const selectedVariant = useMemo(
    () => getVariant(variants, color, size),
    [variants, color, size],
  );

  const maxQuantity = Math.max(1, selectedVariant?.stock ?? 1);
  // Clamped on read, so switching variants never leaves an impossible quantity.
  const safeQuantity = Math.min(quantity, maxQuantity);
  const isAvailable = Boolean(selectedVariant && selectedVariant.stock > 0);

  return {
    color,
    size,
    quantity: safeQuantity,
    setColor,
    setSize,
    setQuantity,
    selectedVariant,
    maxQuantity,
    isAvailable,
  };
}