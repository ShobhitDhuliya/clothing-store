import { Link } from "react-router-dom";
import "./Breadcrumb.css";

/**
 * Accessible breadcrumb trail. Pass an ordered list of `{ label, to }` items —
 * the final item should omit `to` and renders as the current page.
 */
export default function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null;

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="breadcrumb__item">
              {item.to && !isLast ? (
                <Link to={item.to} className="breadcrumb__link">
                  {item.label}
                </Link>
              ) : (
                <span className="breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span className="breadcrumb__separator" aria-hidden="true">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}