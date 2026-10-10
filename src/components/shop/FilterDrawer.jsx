import { useEffect } from "react";
import Icon from "../common/Icon";
import "./FilterDrawer.css";

/**
 * Mobile filter drawer: an off-canvas panel that wraps the same
 * <ProductFilters> used by the desktop sidebar.
 */
export default function FilterDrawer({ open, onClose, title = "Filters", children }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <div className="filter-drawer" hidden={!open}>
      <div
        className="filter-drawer__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="filter-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="filter-drawer__header">
          <h2 className="filter-drawer__title">{title}</h2>
          <button
            type="button"
            className="filter-drawer__close"
            aria-label="Close filters"
            onClick={onClose}
          >
            <Icon name="close" size={22} />
          </button>
        </header>

        <div className="filter-drawer__body">{children}</div>
      </div>
    </div>
  );
}