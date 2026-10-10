import { BOOKING_GROUP_IDS, bookingFieldId } from "../../constants/booking";
import { formatCurrency } from "../../utils/currency";
import "./BookingProductPicker.css";

/**
 * Step 1 — pick the catalogue item to book. Radio tiles rather than ProductCard
 * because the card is a navigation component: its "View Product" link would
 * fight the selection gesture. The tile still surfaces everything a customer
 * compares — image, name, category, price, colours and sizes.
 */
export default function BookingProductPicker({
  products,
  value,
  onChange,
  disabled,
  error,
}) {
  const errorId = error ? `${bookingFieldId("product")}-error` : undefined;

  return (
    <fieldset
      className="booking-products"
      id={BOOKING_GROUP_IDS.product}
      tabIndex={-1}
      disabled={disabled}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={errorId}
    >
      <legend className="visually-hidden">Product to book</legend>

      <ul className="booking-products__grid">
        {products.map((product) => {
          const selected = product.id === value;
          const colors = product.colors ?? [];
          const sizes = product.sizes ?? [];

          return (
            <li key={product.id}>
              <label
                className={
                  selected
                    ? "booking-product booking-product--selected"
                    : "booking-product"
                }
              >
                <input
                  type="radio"
                  name="bookingProduct"
                  id={`booking-product-${product.id}`}
                  className="booking-product__input"
                  checked={selected}
                  onChange={() => onChange(product.id)}
                />

                <span className="booking-product__media">
                  {product.image ? (
                    <img
                      className="booking-product__image"
                      src={product.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <span
                      className="booking-product__placeholder"
                      style={{ "--hue": product.accentHue ?? 30 }}
                      aria-hidden="true"
                    >
                      <span className="booking-product__monogram">
                        {(product.category || product.name).charAt(0)}
                      </span>
                    </span>
                  )}
                </span>

                <span className="booking-product__body">
                  <span className="booking-product__category">
                    {product.category}
                  </span>
                  <span className="booking-product__name">{product.name}</span>
                  <span className="booking-product__price">
                    {formatCurrency(product.price)}
                  </span>

                  <span className="booking-product__option">
                    <span className="booking-product__option-label">Colours</span>
                    <span className="booking-product__option-value">
                      {colors.join(", ") || "—"}
                    </span>
                  </span>

                  <span className="booking-product__option">
                    <span className="booking-product__option-label">Sizes</span>
                    <span className="booking-product__sizes">
                      {sizes.map((sizeName) => (
                        <span key={sizeName} className="booking-product__size">
                          {sizeName}
                        </span>
                      ))}
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error && (
        <p id={errorId} className="booking-products__error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
