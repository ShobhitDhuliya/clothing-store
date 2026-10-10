import { CLOTHING_SIZES } from "../constants/sizes";
import { ALL_CATEGORY, PRODUCTS_PER_PAGE } from "../constants/shop";

/**
 * Pure, framework-free filtering logic for the shop page. Every function takes
 * plain data in and returns plain data out, so the same helpers will work
 * unchanged once products arrive from the Express/MySQL API.
 */

/** Order sizes by the standard clothing run, then alphabetically. */
function compareSizes(a, b) {
  const aIndex = CLOTHING_SIZES.indexOf(a);
  const bIndex = CLOTHING_SIZES.indexOf(b);

  if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  if (aIndex !== -1) return -1;
  if (bIndex !== -1) return 1;
  return a.localeCompare(b);
}

/** A fresh filter state, seeded with the full price range. */
export function createDefaultFilters(priceRange) {
  return {
    search: "",
    sizes: [],
    colors: [],
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    minRating: 0,
    availability: "all",
  };
}

/**
 * Derive the available filter values (sizes, colors, price bounds) from the
 * product list itself, so the filters stay correct when the data changes.
 */
export function getFilterOptions(products) {
  const sizes = new Set();
  const colors = new Set();
  let min = Infinity;
  let max = -Infinity;

  products.forEach((product) => {
    (product.sizes ?? []).forEach((size) => sizes.add(size));
    (product.colors ?? []).forEach((color) => colors.add(color));

    if (typeof product.price === "number") {
      min = Math.min(min, product.price);
      max = Math.max(max, product.price);
    }
  });

  if (!Number.isFinite(min)) {
    min = 0;
    max = 0;
  }

  return {
    sizes: [...sizes].sort(compareSizes),
    colors: [...colors].sort((a, b) => a.localeCompare(b)),
    priceRange: { min: Math.floor(min), max: Math.ceil(max) },
  };
}

/** Apply search, category, size, color, price, rating and availability filters. */
export function filterProducts(products, filters, category = ALL_CATEGORY) {
  const query = filters.search.trim().toLowerCase();

  return products.filter((product) => {
    if (category !== ALL_CATEGORY && product.categorySlug !== category) {
      return false;
    }

    if (query) {
      const haystack = `${product.name} ${product.category}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (
      filters.sizes.length &&
      !filters.sizes.some((size) => (product.sizes ?? []).includes(size))
    ) {
      return false;
    }

    if (
      filters.colors.length &&
      !filters.colors.some((color) => (product.colors ?? []).includes(color))
    ) {
      return false;
    }

    if (
      typeof product.price === "number" &&
      (product.price < filters.minPrice || product.price > filters.maxPrice)
    ) {
      return false;
    }

    if (filters.minRating && product.rating < filters.minRating) return false;

    if (filters.availability === "in" && product.stock <= 0) return false;
    if (filters.availability === "out" && product.stock > 0) return false;

    return true;
  });
}

/** Return a sorted copy — the input array is never mutated. */
export function sortProducts(products, sortKey) {
  const list = [...products];

  switch (sortKey) {
    case "newest":
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort((a, b) => b.rating - a.rating);
    case "featured":
    default:
      return list.sort(
        (a, b) =>
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          b.rating - a.rating,
      );
  }
}

/** Slice a page of results, clamping the requested page to the valid range. */
export function paginate(items, page, perPage = PRODUCTS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;

  return {
    items: items.slice(start, start + perPage),
    totalPages,
    page: safePage,
  };
}

/** How many filter controls deviate from their defaults (search excluded). */
export function countActiveFilters(filters, priceRange, category = ALL_CATEGORY) {
  let count = 0;

  if (category !== ALL_CATEGORY) count += 1;
  if (filters.sizes.length) count += 1;
  if (filters.colors.length) count += 1;
  if (filters.minPrice !== priceRange.min || filters.maxPrice !== priceRange.max) {
    count += 1;
  }
  if (filters.minRating) count += 1;
  if (filters.availability !== "all") count += 1;

  return count;
}