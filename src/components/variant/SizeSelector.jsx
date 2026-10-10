import { getVariant } from "../../utils/productDetails";
import "./SizeSelector.css";

/**
 * Size picker. Availability is resolved against the currently selected colour,
 * so switching colour immediately reflects which sizes can be bought.
 */
export default function SizeSelector({
  sizes = [],
  selected,
  onChange,
  variants = [],
  color,
}) {
  if (sizes.length === 0) return null;

  return (
    <fieldset className="size-selector">
      <legend className="size-selector__legend">
        Size: <span className="size-selector__value">{selected}</span>
      </legend>

      <ul className="size-selector__list">
        {sizes.map((size) => {
          const variant = getVariant(variants, color, size);
          const available = Boolean(variant && variant.stock > 0);
          const isSelected = size === selected;
          const classes = [
            "size-selector__option",
            isSelected ? "size-selector__option--active" : "",
            available ? "" : "size-selector__option--unavailable",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={size}>
              <button
                type="button"
                className={classes}
                onClick={() => onChange(size)}
                aria-pressed={isSelected}
                title={available ? size : `${size} — out of stock`}
              >
                {size}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}