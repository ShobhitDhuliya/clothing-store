import { isColorAvailable } from "../../utils/productDetails";
import "./ColorSelector.css";

/**
 * Colour picker. Colours that have no stock in any size are shown struck
 * through so the shopper can see what exists without being able to buy it.
 */
export default function ColorSelector({
  colors = [],
  selected,
  onChange,
  variants = [],
}) {
  if (colors.length === 0) return null;

  return (
    <fieldset className="color-selector">
      <legend className="color-selector__legend">
        Colour: <span className="color-selector__value">{selected}</span>
      </legend>

      <ul className="color-selector__list">
        {colors.map((color) => {
          const available =
            variants.length === 0 || isColorAvailable(variants, color);
          const isSelected = color === selected;
          const classes = [
            "color-selector__option",
            isSelected ? "color-selector__option--active" : "",
            available ? "" : "color-selector__option--unavailable",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={color}>
              <button
                type="button"
                className={classes}
                onClick={() => onChange(color)}
                aria-pressed={isSelected}
                title={available ? color : `${color} — out of stock`}
              >
                {color}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}