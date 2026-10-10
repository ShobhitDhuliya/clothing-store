import Icon from "../common/Icon";
import "./Pagination.css";

/** Simple, accessible pagination with Previous/Next and a page indicator. */
export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn pagination__btn--prev"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        <Icon name="arrowRight" size={16} />
        Previous
      </button>

      <ul className="pagination__pages">
        {pages.map((number) => (
          <li key={number}>
            <button
              type="button"
              className={
                number === page
                  ? "pagination__page pagination__page--active"
                  : "pagination__page"
              }
              aria-current={number === page ? "page" : undefined}
              aria-label={`Go to page ${number}`}
              onClick={() => onChange(number)}
            >
              {number}
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
        <Icon name="arrowRight" size={16} />
      </button>

      <p className="pagination__status">
        Page {page} of {totalPages}
      </p>
    </nav>
  );
}