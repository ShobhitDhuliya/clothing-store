import { CLOTHING_SIZES } from "../constants/sizes.js";

/**
 * Pure, framework-free logic for the product details page.
 *
 * Everything here works on plain product objects, so when the Express/MySQL
 * API starts returning real `variants` / `images` arrays the UI keeps working
 * without modification — the helpers simply prefer the server data.
 */

/** How many placeholder "views" to synthesise for image-less mock products. */
const PLACEHOLDER_VIEWS = 3;

function slugify(value) {
  return String(value).toLowerCase().replace(/\s+/g, "-");
}

/** Find a product by its URL slug. Returns null when nothing matches. */
export function findProductBySlug(products, slug) {
  if (!slug) return null;
  return products.find((product) => product.slug === slug) ?? null;
}

/**
 * Deterministic per-variant stock derived from the product's total stock.
 * Some variants are intentionally left empty so both UI states are realistic.
 */
function deriveVariantStock(totalStock, index, slots) {
  const total = Number(totalStock) || 0;
  if (total <= 0) return 0;
  if (total < slots) return index < total ? 1 : 0;

  const base = Math.floor(total / slots);
  const remainder = total % slots;
  const value = base + (index < remainder ? 1 : 0);

  if (value > 1 && index % 5 === 3) return 0;
  return value;
}

/**
 * Build the product's variant list (colour × size, each with its own stock).
 *
 * If the API returns an explicit `product.variants` array it is used as-is;
 * otherwise variants are derived from the product's colours/sizes so the page
 * works with today's mock data.
 */
export function buildVariants(product) {
  if (!product) return [];

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.map((variant) => ({
      ...variant,
      inStock: variant.stock > 0,
    }));
  }

  const colors = product.colors ?? [];
  const sizes = product.sizes ?? [];
  const slots = Math.max(1, colors.length * sizes.length);
  const variants = [];

  colors.forEach((color, colorIndex) => {
    sizes.forEach((size, sizeIndex) => {
      const index = colorIndex * sizes.length + sizeIndex;
      const stock = deriveVariantStock(product.stock, index, slots);

      variants.push({
        id: `${product.id}-${slugify(color)}-${slugify(size)}`,
        productId: product.id,
        color,
        size,
        sku: `${product.id}-${slugify(color)}-${slugify(size)}`.toUpperCase(),
        price: product.price,
        stock,
        inStock: stock > 0,
      });
    });
  });

  return variants;
}

/** Find a variant by colour + size. */
export function getVariant(variants, color, size) {
  return variants.find((v) => v.color === color && v.size === size) ?? null;
}

/** Sizes with at least one unit in stock for the given colour. */
export function getAvailableSizes(variants, color) {
  return variants
    .filter((variant) => variant.color === color && variant.stock > 0)
    .map((variant) => variant.size);
}

/** True when the colour has any stock across its sizes. */
export function isColorAvailable(variants, color) {
  return variants.some((variant) => variant.color === color && variant.stock > 0);
}

/** Total stock across every variant. */
export function getTotalVariantStock(variants) {
  return variants.reduce((sum, variant) => sum + variant.stock, 0);
}

/** Order sizes by the standard clothing run, then alphabetically. */
export function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const aIndex = CLOTHING_SIZES.indexOf(a);
    const bIndex = CLOTHING_SIZES.indexOf(b);

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
}

/**
 * Gallery items for a product.
 * - Real `images` (or a single `image`) are used when present.
 * - Products with no imagery fall back to CSS placeholder "views" so the
 *   gallery and its thumbnails still work with mock data.
 */
export function getProductGallery(product) {
  if (!product) return [];

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];

  if (images.length > 0) {
    return images.map((src, index) => ({
      id: `${product.id}-image-${index}`,
      src,
      hue: product.accentHue ?? 30,
      label: `${product.name} — view ${index + 1}`,
    }));
  }

  const baseHue = product.accentHue ?? 30;
  const offsets = [0, 14, -14];

  return Array.from({ length: PLACEHOLDER_VIEWS }, (_, index) => ({
    id: `${product.id}-placeholder-${index}`,
    src: null,
    hue: (baseHue + offsets[index] + 360) % 360,
    label: `${product.name} — view ${index + 1}`,
  }));
}

/** Related products: same category first, then the rest, excluding current. */
export function getRelatedProducts(products, product, limit = 4) {
  if (!product) return [];

  const others = products.filter((item) => item.id !== product.id);
  const sameCategory = others.filter(
    (item) => item.categorySlug === product.categorySlug,
  );
  const rest = others.filter((item) => item.categorySlug !== product.categorySlug);

  return [...sameCategory, ...rest].slice(0, limit);
}