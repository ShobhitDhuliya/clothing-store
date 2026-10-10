import "./QuantitySelector.css";

/** Numeric stepper for choosing a quantity within [min, max]. */
export default function QuantitySelector({
  value = 1,
  min = 1,
  max = 1,
  onChange,
  label = "Quantity",
}) {
  const safeMax = Math.max(min, max);
  const canDecrease = value > min;
  const canIncrease = value < safeMax;

  return (
    <div className="quantity-selector">
      <span className="quantity-selector__label">{label}</span>

      <div className="quantity-selector__control">
        <button
          type="button"
          className="quantity-selector__btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={!canDecrease}
          aria-label="Decrease quantity"
        >
          &minus;
        </button>

        <output className="quantity-selector__value" aria-live="polite">
          {value}
        </output>

        <button
          type="button"
          className="quantity-selector__btn"
          onClick={() => onChange(Math.min(safeMax, value + 1))}
          disabled={!canIncrease}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}