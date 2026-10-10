/**
 * Shop-page constants: sorting, pagination, availability and rating options.
 * Kept here (not inside components) so both the UI and the filtering logic
 * reference a single source of truth.
 */

export const ALL_CATEGORY = "all";

export const PRODUCTS_PER_PAGE = 8;

export const DEFAULT_SORT = "featured";

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
];

export const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All products" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" },
];

export const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 4, label: "4 stars & up" },
  { value: 3, label: "3 stars & up" },
  { value: 2, label: "2 stars & up" },
];