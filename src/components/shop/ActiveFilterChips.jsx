import Icon from "../common/Icon";
import { ALL_CATEGORY, AVAILABILITY_OPTIONS } from "../../constants/shop";
import { formatCurrency } from "../../utils/currency";
import "./ActiveFilterChips.css";

/**
 * Removable chips summarising the currently applied filters. Derives its list
 * from the same filter state the sidebar edits, so every chip can undo itself.
 */
export default function ActiveFilterChips({
  categories = [],
  options,
  filters,
  category = ALL_CATEGORY,
  onCategoryChange,
  onFilterChange,
  onToggleFilter,
  onPriceChange,
  onClear,
}) {
  const chips = [];

  if (category !== ALL_CATEGORY) {
    const name = categories.find((item) => item.slug === category)?.name ?? category;
    chips.push({
      key: "category",
      label: name,
      remove: () => onCategoryChange?.(ALL_CATEGORY),
    });
  }

  filters.sizes.forEach((size) => {
    chips.push({
      key: `size-${size}`,
      label: `Size: ${size}`,
      remove: () => onToggleFilter("sizes", size),
    });
  });

  filters.colors.forEach((color) => {
    chips.push({
      key: `color-${color}`,
      label: color,
      remove: () => onToggleFilter("colors", color),
    });
  });

  if (
    filters.minPrice !== options.priceRange.min ||
    filters.maxPrice !== options.priceRange.max
  ) {
    chips.push({
      key: "price",
      label: `${formatCurrency(filters.minPrice)} – ${formatCurrency(filters.maxPrice)}`,
      remove: () => onPriceChange(options.priceRange.min, options.priceRange.max),
    });
  }

  if (filters.minRating) {
    chips.push({
      key: "rating",
      label: `${filters.minRating}★ & up`,
      remove: () => onFilterChange("minRating", 0),
    });
  }

  if (filters.availability !== "all") {
    const label =
      AVAILABILITY_OPTIONS.find((option) => option.value === filters.availability)
        ?.label ?? filters.availability;
    chips.push({
      key: "availability",
      label,
      remove: () => onFilterChange("availability", "all"),
    });
  }

  if (filters.search.trim()) {
    chips.push({
      key: "search",
      label: `“${filters.search.trim()}”`,
      remove: () => onFilterChange("search", ""),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="active-filters">
      <ul className="active-filters__list">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              className="active-filters__chip"
              onClick={chip.remove}
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <Icon name="close" size={14} />
            </button>
          </li>
        ))}
      </ul>

      <button type="button" className="active-filters__clear" onClick={onClear}>
        Clear all
      </button>
    </div>
  );
}