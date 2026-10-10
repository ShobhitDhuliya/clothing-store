import { useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import { ROUTES } from "../../../constants/routes";
import useFetch from "../../../hooks/useFetch";
import { bookingService } from "../../../services/BookingService";
import { formatBookingDate, getBookingStatusLabel } from "../../../utils/booking";
import formatDate from "../../../utils/formatDate";
import "./MyBookings.css";

const CANCELLABLE = new Set(["pending", "confirmed"]);

export default function MyBookings() {
  const { data, loading, error, refetch } = useFetch(
    () => bookingService.listOwn(),
    [],
  );
  const bookings = data ?? [];
  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState({ message: "", tone: "" });

  const handleCancel = async (bookingId) => {
    if (busyId) return;
    setBusyId(bookingId);
    setStatus({ message: "", tone: "" });
    try {
      await bookingService.changeStatus(bookingId, "cancelled");
      setStatus({
        message: `Booking ${bookingId} has been cancelled.`,
        tone: "success",
      });
      await refetch();
    } catch (err) {
      setStatus({
        message: err.message || "Couldn't cancel the booking. Please try again.",
        tone: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container my-bookings">
      <Breadcrumb
        items={[
          { label: "Home", to: ROUTES.HOME },
          { label: "My Bookings" },
        ]}
      />

      <header className="my-bookings__header">
        <h1 className="my-bookings__title">My Bookings</h1>
        <p className="my-bookings__subtitle">
          Review your product reservations and fitting appointments.
        </p>
      </header>

      <p
        className={
          status.tone === "error"
            ? "my-bookings__status my-bookings__status--error"
            : "my-bookings__status"
        }
        role="status"
        aria-live="polite"
      >
        {status.message}
      </p>

      {loading && (
        <p className="my-bookings__loading" role="status">
          Loading your bookings…
        </p>
      )}

      {!loading && error && (
        <div className="my-bookings__empty">
          <span className="my-bookings__empty-icon">
            <Icon name="close" size={28} />
          </span>
          <h2 className="my-bookings__empty-title">
            Couldn&apos;t load your bookings
          </h2>
          <p className="my-bookings__empty-text">{error.message}</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="my-bookings__empty">
          <span className="my-bookings__empty-icon">
            <Icon name="calendar" size={28} />
          </span>
          <h2 className="my-bookings__empty-title">No bookings yet</h2>
          <p className="my-bookings__empty-text">
            Your product reservations and fitting appointments will appear here.
          </p>
          <Button to={ROUTES.BOOKINGS} size="lg">
            Book an Appointment
          </Button>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <ul className="my-bookings__list">
          {bookings.map((booking) => {
            const currentStatus = String(booking.status ?? "").toLowerCase();
            return (
              <li key={booking.bookingId} className="my-booking-card">
                <header className="my-booking-card__head">
                  <div>
                    <p className="my-booking-card__label">Booking reference</p>
                    <p className="my-booking-card__id">{booking.bookingId}</p>
                  </div>
                  <div className="my-booking-card__head-right">
                    <span
                      className={`my-booking-card__badge my-booking-card__badge--${currentStatus}`}
                    >
                      {getBookingStatusLabel(currentStatus)}
                    </span>
                    <time
                      className="my-booking-card__created"
                      dateTime={booking.createdAt}
                    >
                      {formatDate(booking.createdAt)}
                    </time>
                  </div>
                </header>

                <div className="my-booking-card__body">
                  {booking.product?.slug ? (
                    <Link
                      className="my-booking-card__product"
                      to={`${ROUTES.PRODUCTS}/${booking.product.slug}`}
                    >
                      {booking.product.name}
                    </Link>
                  ) : (
                    <h2 className="my-booking-card__product">
                      {booking.product?.name ?? "Product"}
                    </h2>
                  )}
                  <dl className="my-booking-card__details">
                    <div>
                      <dt>Type</dt>
                      <dd>{booking.bookingType?.label ?? "—"}</dd>
                    </div>
                    <div>
                      <dt>Variant</dt>
                      <dd>
                        {booking.variant?.color ?? "—"} /{" "}
                        {booking.variant?.size ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Appointment</dt>
                      <dd>
                        {formatBookingDate(booking.date)} ·{" "}
                        {booking.timeSlot?.label ?? "—"}
                      </dd>
                    </div>
                    {booking.notes && (
                      <div>
                        <dt>Notes</dt>
                        <dd>{booking.notes}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {CANCELLABLE.has(currentStatus) && (
                  <div className="my-booking-card__actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === booking.bookingId}
                      onClick={() => handleCancel(booking.bookingId)}
                    >
                      {busyId === booking.bookingId
                        ? "Cancelling…"
                        : "Cancel booking"}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
