import { useEffect, useRef } from "react";
import Button from "../common/Button";
import Icon from "../common/Icon";
import { ROUTES } from "../../constants/routes";
import { formatBookingDate, getBookingStatusLabel } from "../../utils/booking";
import { formatCurrency } from "../../utils/currency";
import "./BookingConfirmation.css";

/**
 * Confirmation shown after a successful frontend booking creation. Purely
 * presentational: the booking object comes from BookingService.create. Focus
 * moves here so keyboard and screen-reader users land on the result.
 */
export default function BookingConfirmation({ booking }) {
  const rootRef = useRef(null);

  useEffect(() => {
    rootRef.current?.focus();
  }, []);

  const { customer, product, variant, bookingType, date, timeSlot, notes, status } =
    booking;

  return (
    <section
      ref={rootRef}
      className="booking-confirmation"
      aria-labelledby="booking-confirmation-title"
      tabIndex={-1}
    >
      <span className="booking-confirmation__badge">
        <Icon name="check" size={34} />
      </span>

      <h1 id="booking-confirmation-title" className="booking-confirmation__title">
        Booking confirmed
      </h1>

      <p className="booking-confirmation__lead">
        Thank you, {customer.firstName}! Your reservation is recorded against{" "}
        <strong>{customer.email}</strong>. Bring your booking ID when you visit
        the store.
      </p>

      <div className="booking-confirmation__card">
        <div className="booking-confirmation__hero">
          <div>
            <p className="booking-confirmation__label">Booking ID</p>
            <p className="booking-confirmation__number">{booking.bookingId}</p>
          </div>

          <div className="booking-confirmation__hero-right">
            <p className="booking-confirmation__label">Product</p>
            <p className="booking-confirmation__product">{product.name}</p>
            <p className="booking-confirmation__price">
              {formatCurrency(product.price)}
            </p>
          </div>
        </div>

        <dl className="booking-confirmation__details">
          <div className="booking-confirmation__detail">
            <dt>Colour</dt>
            <dd>{variant.color}</dd>
            {variant.sku && (
              <dd className="booking-confirmation__detail-meta">
                SKU {variant.sku}
              </dd>
            )}
          </div>

          <div className="booking-confirmation__detail">
            <dt>Size</dt>
            <dd>{variant.size}</dd>
          </div>

          <div className="booking-confirmation__detail">
            <dt>Booking type</dt>
            <dd>{bookingType?.label ?? "—"}</dd>
            <dd className="booking-confirmation__detail-meta">
              {bookingType?.description}
            </dd>
          </div>

          <div className="booking-confirmation__detail">
            <dt>Date</dt>
            <dd>{formatBookingDate(date)}</dd>
            <dd className="booking-confirmation__detail-meta">{date}</dd>
          </div>

          <div className="booking-confirmation__detail">
            <dt>Time</dt>
            <dd>{timeSlot?.label ?? "—"}</dd>
          </div>

          <div className="booking-confirmation__detail">
            <dt>Customer</dt>
            <dd>
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ")}
            </dd>
            <dd className="booking-confirmation__detail-meta">
              {customer.email}
            </dd>
            <dd className="booking-confirmation__detail-meta">
              {customer.phone}
            </dd>
          </div>

          <div className="booking-confirmation__detail">
            <dt>Status</dt>
            <dd>
              <span className="booking-confirmation__status">
                {getBookingStatusLabel(status)}
              </span>
            </dd>
          </div>

          {notes && (
            <div className="booking-confirmation__detail">
              <dt>Notes</dt>
              <dd>{notes}</dd>
            </div>
          )}
        </dl>

        <p className="booking-confirmation__note">
          <Icon name="shield" size={14} />
          This booking was created on the frontend only — no server was
          contacted and nothing was charged.
        </p>
      </div>

      <div className="booking-confirmation__actions">
        <Button to={ROUTES.PRODUCTS} size="lg">
          Continue Shopping
        </Button>
        <Button to={ROUTES.HOME} variant="ghost" size="lg">
          Back to Home
        </Button>
      </div>
    </section>
  );
}
