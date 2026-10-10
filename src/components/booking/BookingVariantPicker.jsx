import { useMemo } from "react";
import Icon from "../common/Icon";
import ColorSelector from "../variant/ColorSelector";
import SizeSelector from "../variant/SizeSelector";
import { BOOKING_GROUP_IDS, bookingFieldId } from "../../constants/booking";
import { sortSizes } from "../../utils/productDetails";
import "./BookingVariantPicker.css";

/**
 * Step 2 — colour/size selection. Reuses the exact selector components and
 * size-ordering helper from Product Details; selection state itself lives in
 * `useBookingForm` (via `useProductVariant`), so no variant logic is
 * duplicated here.
 */
export default function BookingVariantPicker({
  product,
  variants,
  color,
  size,
  onColorChange,
  onSizeChange,
  outOfStock,
  disabled,
  error,
}) {
  const colors = useMemo(
    () => product.colors ?? [...new Set(variants.map((variant) => variant.color))],
    [product, variants],
  );
  const sizes = useMemo(
    () => sortSizes(product.sizes ?? [...new Set(variants.map((variant) => variant.size))]),
    [product, variants],
  );

  const errorId = error ? `${bookingFieldId("variant")}-error` : undefined;

  return (
    <fieldset
      className="booking-variant"
      id={BOOKING_GROUP_IDS.variant}
      tabIndex={-1}
      disabled={disabled}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={errorId}
    >
      <legend className="visually-hidden">Colour and size</legend>

      <div className="booking-variant__selectors">
        <ColorSelector
          colors={colors}
          selected={color}
          onChange={onColorChange}
          variants={variants}
        />
        <SizeSelector
          sizes={sizes}
          selected={size}
          onChange={onSizeChange}
          variants={variants}
          color={color}
        />
      </div>

      {outOfStock && (
        <p className="booking-variant__notice" role="status">
          <Icon name="close" size={14} />
          This colour and size is out of stock — you can still book a fitting to
          try it in store.
        </p>
      )}

      {error && (
        <p id={errorId} className="booking-variant__error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
