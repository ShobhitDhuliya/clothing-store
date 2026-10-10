import Button from "../common/Button";
import Icon from "../common/Icon";
import { BOOKING_TYPES } from "../../constants/booking";
import { formatBookingDate } from "../../utils/booking";
import { formatCurrency } from "../../utils/currency";
import "./BookingSummary.css";

/**
 * Sticky booking summary + the Confirm Booking submit. Read-only: every value
 * is derived from `useBookingForm`, and the status line is an aria-live region
 * so validation errors, the loading state and success are announced to
 * assistive tech. Lives inside the page <form>, so its button type is submit.
 */
export default function BookingSummary({
  product,
  variant,
  bookingType,
  date,
  timeSlot,
  values,
  submitting,
  statusMessage,
  statusTone,
}) {
  const type = BOOKING_TYPES.find((option) => option.id === bookingType) ?? null;
  const customerName = [values.firstName, values.lastName]
    .filter(Boolean)
    .join(" ");
  const notes = String(values.notes ?? "").trim();

  const rows = [
    { label: "Colour", value: variant?.color ?? null },
    { label: "Size", value: variant?.size ?? null },
    {
      label: "Booking type",
      value: type?.label ?? null,
      meta: type?.description ?? null,
    },
    { label: "Date", value: date ? formatBookingDate(date) : null },
    { label: "Time", value: timeSlot?.label ?? null },
    { label: "Customer", value: customerName || null },
    {
      label: "Contact",
      value: values.email || null,
      meta: values.phone || null,
    },
    { label: "Notes", value: notes || null },
  ];

  return (
    <div className="booking-summary">
      <h2 className="booking-summary__title">Booking summary</h2>

      <div className="booking-summary__product">
        {product ? (
          <>
            <span className="booking-summary__media">
              {product.image ? (
                <img
                  className="booking-summary__image"
                  src={product.image}
                  alt=""
                />
              ) : (
                <span
                  className="booking-summary__placeholder"
                  style={{ "--hue": product.accentHue ?? 30 }}
                  aria-hidden="true"
                >
                  <span className="booking-summary__monogram">
                    {(product.category || product.name).charAt(0)}
                  </span>
                </span>
              )}
            </span>

            <span className="booking-summary__product-info">
              <span className="booking-summary__product-category">
                {product.category}
              </span>
              <span className="booking-summary__product-name">
                {product.name}
              </span>
              <span className="booking-summary__product-price">
                {formatCurrency(product.price)}
              </span>
            </span>
          </>
        ) : (
          <p className="booking-summary__placeholder-text">
            Select a product to build your booking.
          </p>
        )}
      </div>

      <dl className="booking-summary__list">
        {rows.map((row) => (
          <div className="booking-summary__row" key={row.label}>
            <dt className="booking-summary__label">{row.label}</dt>
            <dd className="booking-summary__value">
              {row.value ?? "Not selected"}
              {row.value && row.meta && (
                <span className="booking-summary__meta">{row.meta}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p
        className={
          statusTone === "error"
            ? "booking-summary__status booking-summary__status--error"
            : "booking-summary__status"
        }
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>

      <Button type="submit" size="lg" fullWidth disabled={submitting}>
        {submitting ? (
          <>
            <Icon name="refresh" size={18} className="booking-summary__spinner" />
            Booking…
          </>
        ) : (
          <>
            <Icon name="check" size={18} />
            Confirm Booking
          </>
        )}
      </Button>

      <p className="booking-summary__note">
        <Icon name="shield" size={14} />
        No payment is taken — reservations are free and nothing is charged
        online.
      </p>
    </div>
  );
}
