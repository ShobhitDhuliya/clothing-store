import Icon from "../common/Icon";
import { SORT_OPTIONS } from "../../constants/shop";
import "./ShopToolbar.css";

/**
 * Search, result count, sort control and the mobile "Filters" trigger.
 */
export default function ShopToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onOpenFilters,
  activeCount = 0,
  resultCount = 0,
  totalCount = 0,
}) {
  return (
    <div className="shop-toolbar">
      <div className="shop-toolbar__search">
        <label className="visually-hidden" htmlFor="shop-search">
          Search products
        </label>
        <Icon name="search" size={18} className="shop-toolbar__search-icon" />
        <input
          id="shop-search"
          type="search"
          className="shop-toolbar__input"
          placeholder="Search by name or category…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {search && (
          <button
            type="button"
            className="shop-toolbar__clear"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>

      <button
        type="button"
        className="shop-toolbar__filter"
        onClick={onOpenFilters}
      >
        <Icon name="filter" size={18} />
        Filters{activeCount > 0 ? ` (${activeCount})` : ""}
      </button>

      <p className="shop-toolbar__count" aria-live="polite">
        {resultCount} of {totalCount} products
      </p>

      <div className="shop-toolbar__sort">
        <label className="visually-hidden" htmlFor="shop-sort">
          Sort products
        </label>
        <select
          id="shop-sort"
          className="shop-toolbar__select"
          value={sort}
          onChange={(event) => onSortChange(event.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}