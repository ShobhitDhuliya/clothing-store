import { useCallback, useMemo, useState } from "react";
import { ALL_CATEGORY, DEFAULT_SORT, PRODUCTS_PER_PAGE } from "../constants/shop";
import {
  countActiveFilters,
  createDefaultFilters,
  filterProducts,
  getFilterOptions,
  paginate,
  sortProducts,
} from "../utils/productFilters";

/**
 * Owns all shop-page state (filters, sorting, pagination) and derives the
 * visible page of products. The component stays presentational while this hook
 * holds the behaviour, keeping data / logic / UI cleanly separated.
 *
 * `category` is controlled from outside (the URL) via `onCategoryChange`.
 */
export default function useProductFilters(
  products,
  { category = ALL_CATEGORY, onCategoryChange } = {},
) {
  const options = useMemo(() => getFilterOptions(products), [products]);
  const [filters, setFilters] = useState(() =>
    createDefaultFilters(options.priceRange),
  );
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const toggleFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
    setPage(1);
  }, []);

  const setPriceRange = useCallback((minPrice, maxPrice) => {
    setFilters((prev) => ({ ...prev, minPrice, maxPrice }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(createDefaultFilters(options.priceRange));
    setSort(DEFAULT_SORT);
    setPage(1);
    onCategoryChange?.(ALL_CATEGORY);
  }, [options.priceRange, onCategoryChange]);

  const filtered = useMemo(
    () => filterProducts(products, filters, category),
    [products, filters, category],
  );

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const { items: pageItems, totalPages, page: safePage } = useMemo(
    () => paginate(sorted, page, PRODUCTS_PER_PAGE),
    [sorted, page],
  );

  const activeCount = useMemo(
    () => countActiveFilters(filters, options.priceRange, category),
    [filters, options.priceRange, category],
  );

  return {
    filters,
    sort,
    setSort,
    page: safePage,
    setPage,
    options,
    setFilter,
    toggleFilter,
    setPriceRange,
    clearFilters,
    activeCount,
    totalCount: products.length,
    resultCount: sorted.length,
    pageItems,
    totalPages,
  };
}