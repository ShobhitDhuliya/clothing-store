import {
  ALL_CATEGORY,
  AVAILABILITY_OPTIONS,
  RATING_OPTIONS,
} from "../../constants/shop";
import { formatCurrency } from "../../utils/currency";
import "./ProductFilters.css";

/**
 * The filter panel. Rendered once in the desktop sidebar and again inside the
 * mobile drawer — `variant` keeps the radio groups' names unique per instance.
 */
export default function ProductFilters({
  categories = [],
  options,
  filters,
  category = ALL_CATEGORY,
  onCategoryChange,
  onFilterChange,
  onToggleFilter,
  onPriceChange,
  onClear,
  activeCount = 0,
  variant = "sidebar",
}) {
  const { priceRange, sizes, colors } = options;

  return (
    <div className={`product-filters product-filters--${variant}`}>
      <div className="product-filters__head">
        <h2 className="product-filters__title">Filters</h2>
        <button
          type="button"
          className="product-filters__clear"
          onClick={onClear}
          disabled={activeCount === 0}
        >
          Clear{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
      </div>

      <fieldset className="product-filters__group">
        <legend className="product-filters__legend">Category</legend>
        <ul className="product-filters__list">
          {[{ slug: ALL_CATEGORY, name: "All" }, ...categories].map((item) => (
            <li key={item.slug}>
              <label className="product-filters__radio">
                <input
                  type="radio"
                  name={`filter-category-${variant}`}
                  checked={category === item.slug}
                  onChange={() => onCategoryChange?.(item.slug)}
                />
                <span>{item.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="product-filters__group">
        <legend className="product-filters__legend">Size</legend>
        <ul className="product-filters__chips">
          {sizes.map((size) => {
            const checked = filters.sizes.includes(size);

            return (
              <li key={size}>
                <label
                  className={
                    checked
                      ? "product-filters__chip product-filters__chip--active"
                      : "product-filters__chip"
                  }
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleFilter("sizes", size)}
                  />
                  <span>{size}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <fieldset className="product-filters__group">
        <legend className="product-filters__legend">Color</legend>
        <ul className="product-filters__list">
          {colors.map((color) => (
            <li key={color}>
              <label className="product-filters__checkbox">
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color)}
                  onChange={() => onToggleFilter("colors", color)}
                />
                <span>{color}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="product-filters__group">
        <legend className="product-filters__legend">Price range</legend>
        <div className="product-filters__price">
          <div className="product-filters__price-values">
            <span>{formatCurrency(filters.minPrice)}</span>
            <span>{formatCurrency(filters.maxPrice)}</span>
          </div>
          <label className="visually-hidden" htmlFor={`filter-min-${variant}`}>
            Minimum price
          </label>
          <input
            id={`filter-min-${variant}`}
            className="product-filters__slider"
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step="1"
            value={filters.minPrice}
            onChange={(event) =>
              onPriceChange(
                Math.min(Number(event.target.value), filters.maxPrice),
                filters.maxPrice,
              )
            }
          />
          <label className="visually-hidden" htmlFor={`filter-max-${variant}`}>
            Maximum price
          </label>
          <input
            id={`filter-max-${variant}`}
            className="product-filters__slider"
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            step="1"
            value={filters.maxPrice}
            onChange={(event) =>
              onPriceChange(
                filters.minPrice,
                Math.max(Number(event.target.value), filters.minPrice),
              )
            }
          />
        </div>
      </fieldset>

      <fieldset className="product-filters__group">
        <legend className="product-filters__legend">Rating</legend>
        <ul className="product-filters__list">
          {RATING_OPTIONS.map((option) => (
            <li key={option.value}>
              <label className="product-filters__radio">
                <input
                  type="radio"
                  name={`filter-rating-${variant}`}
                  checked={filters.minRating === option.value}
                  onChange={() => onFilterChange("minRating", option.value)}
                />
                <span>{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset className="product-filters__group">
        <legend className="product-filters__legend">Availability</legend>
        <ul className="product-filters__list">
          {AVAILABILITY_OPTIONS.map((option) => (
            <li key={option.value}>
              <label className="product-filters__radio">
                <input
                  type="radio"
                  name={`filter-availability-${variant}`}
                  checked={filters.availability === option.value}
                  onChange={() => onFilterChange("availability", option.value)}
                />
                <span>{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
    </div>
  );
}