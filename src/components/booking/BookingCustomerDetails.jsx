import FormField from "../common/FormField";
import { NOTES_MAX_LENGTH, bookingFieldId } from "../../constants/booking";
import "./BookingCustomerDetails.css";

/**
 * Step 5 — customer contact details plus optional notes. Name/email/phone
 * rules live in `utils/checkout` and are applied by `useBookingForm`; this
 * component only renders fields, the character counter and inline errors.
 */
export default function BookingCustomerDetails({ values, errors, onChange, disabled }) {
  const notesLength = String(values.notes ?? "").length;
  const notesRemaining = NOTES_MAX_LENGTH - notesLength;
  const notesErrorId = errors.notes ? `${bookingFieldId("notes")}-error` : undefined;
  const notesCounterId = `${bookingFieldId("notes")}-counter`;
  const notesDescribedBy = [notesCounterId, notesErrorId].filter(Boolean).join(" ");

  return (
    <div className="booking-customer">
      <div className="booking-customer__grid">
        <FormField
          id={bookingFieldId("firstName")}
          label="First name"
          value={values.firstName}
          onChange={(v) => onChange("firstName", v)}
          error={errors.firstName}
          required
          autoComplete="given-name"
          placeholder="Aarav"
          disabled={disabled}
        />

        <FormField
          id={bookingFieldId("lastName")}
          label="Last name"
          value={values.lastName}
          onChange={(v) => onChange("lastName", v)}
          error={errors.lastName}
          required
          autoComplete="family-name"
          placeholder="Sharma"
          disabled={disabled}
        />

        <FormField
          id={bookingFieldId("email")}
          label="Email address"
          type="email"
          value={values.email}
          onChange={(v) => onChange("email", v)}
          error={errors.email}
          required
          autoComplete="email"
          placeholder="aarav@example.com"
          disabled={disabled}
        />

        <FormField
          id={bookingFieldId("phone")}
          label="Phone number"
          type="tel"
          value={values.phone}
          onChange={(v) => onChange("phone", v)}
          error={errors.phone}
          required
          autoComplete="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          disabled={disabled}
        />
      </div>

      <div className="booking-customer__notes">
        <label
          className="booking-customer__notes-label"
          htmlFor={bookingFieldId("notes")}
        >
          Additional notes
          <span className="booking-customer__optional"> (optional)</span>
        </label>

        <textarea
          id={bookingFieldId("notes")}
          className={
            errors.notes
              ? "booking-customer__textarea booking-customer__textarea--invalid"
              : "booking-customer__textarea"
          }
          value={values.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          maxLength={NOTES_MAX_LENGTH}
          rows={4}
          disabled={disabled}
          placeholder="e.g. preferred fitting room, special request, pickup information"
          aria-invalid={errors.notes ? "true" : undefined}
          aria-describedby={notesDescribedBy}
        />

        <div className="booking-customer__notes-meta">
          <p id={notesCounterId} className="booking-customer__counter">
            {notesRemaining} of {NOTES_MAX_LENGTH} characters remaining
          </p>

          {errors.notes && (
            <p id={notesErrorId} className="booking-customer__notes-error">
              {errors.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
