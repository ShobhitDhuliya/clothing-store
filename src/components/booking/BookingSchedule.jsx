import FormField from "../common/FormField";
import { BOOKING_GROUP_IDS, SLOT_STATUS_LABELS, bookingFieldId } from "../../constants/booking";
import "./BookingSchedule.css";

/**
 * Step 4 — booking date + time slots. The date input is `type="date"` with a
 * dynamic `min` (today) so past dates can't be picked natively, and
 * `validateBookingForm` still rejects them as a second gate. Slots arrive as
 * { id, label, status }; anything other than `available` renders as a disabled
 * button — using the persisted availability returned by the API.
 */
export default function BookingSchedule({
  date,
  minDate,
  onDateChange,
  slotOptions,
  selectedSlot,
  onSelectSlot,
  loading,
  availabilityError,
  disabled,
  dateError,
  slotError,
}) {
  const slotErrorId = slotError ? `${bookingFieldId("timeSlot")}-error` : undefined;

  return (
    <div className="booking-schedule">
      <FormField
        id={bookingFieldId("date")}
        label="Booking date"
        type="date"
        value={date}
        onChange={onDateChange}
        min={minDate}
        required
        disabled={disabled}
        error={dateError}
      />

      <fieldset
        className="booking-schedule__slots"
        id={BOOKING_GROUP_IDS.timeSlot}
        tabIndex={-1}
        disabled={disabled}
        aria-invalid={slotError ? "true" : undefined}
        aria-describedby={slotErrorId}
      >
        <legend className="booking-schedule__legend">Time slot</legend>

        {(loading || !date) && (
          <p className="booking-schedule__hint" role="status">
            {loading
              ? "Checking availability for the selected date…"
              : "Choose a date to see which time slots are available."}
          </p>
        )}

        {availabilityError && (
          <p className="booking-schedule__error" role="alert">
            {availabilityError}
          </p>
        )}

        <ul className="booking-schedule__grid">
          {slotOptions.map((slot) => {
            const available = slot.status === "available";
            const isSelected = selectedSlot === slot.id;
            const statusLabel = SLOT_STATUS_LABELS[slot.status];
            const classes = [
              "booking-schedule__slot",
              isSelected ? "booking-schedule__slot--active" : "",
              available ? "" : "booking-schedule__slot--unavailable",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={slot.id}>
                <button
                  type="button"
                  id={`booking-slot-${slot.id}`}
                  className={classes}
                  aria-pressed={isSelected}
                  disabled={disabled || loading || !date || !available}
                  title={statusLabel ? `${slot.label} — ${statusLabel}` : slot.label}
                  onClick={() => onSelectSlot(slot.id)}
                >
                  <span className="booking-schedule__slot-time">{slot.label}</span>
                  {statusLabel && (
                    <span className="booking-schedule__slot-status">
                      {statusLabel}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {slotError && (
          <p id={slotErrorId} className="booking-schedule__error">
            {slotError}
          </p>
        )}
      </fieldset>
    </div>
  );
}
