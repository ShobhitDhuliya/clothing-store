import { ALL_CATEGORY } from "../../constants/shop";
import "./CategoryNav.css";

/**
 * Horizontal category switcher. `active` holds a category slug (or "all") and
 * changes are reported through `onChange`.
 */
export default function CategoryNav({
  categories = [],
  active = ALL_CATEGORY,
  onChange,
}) {
  const items = [{ slug: ALL_CATEGORY, name: "All" }, ...categories];

  return (
    <nav className="category-nav" aria-label="Product categories">
      <ul className="category-nav__list">
        {items.map((item) => {
          const isActive = active === item.slug;

          return (
            <li key={item.slug}>
              <button
                type="button"
                className={
                  isActive
                    ? "category-nav__item category-nav__item--active"
                    : "category-nav__item"
                }
                aria-pressed={isActive}
                onClick={() => onChange?.(item.slug)}
              >
                {item.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}