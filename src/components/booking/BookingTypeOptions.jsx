import Icon from "../common/Icon";
import { BOOKING_GROUP_IDS, BOOKING_TYPES, bookingFieldId } from "../../constants/booking";
import "./BookingTypeOptions.css";

/**
 * Step 3 — booking type radio cards. Options come from `BOOKING_TYPES`, so a
 * new appointment kind is a constants edit, not a component change.
 */
export default function BookingTypeOptions({ value, onChange, disabled, error }) {
  const errorId = error ? `${bookingFieldId("bookingType")}-error` : undefined;

  return (
    <fieldset
      className="booking-types"
      id={BOOKING_GROUP_IDS.bookingType}
      tabIndex={-1}
      disabled={disabled}
      aria-invalid={error ? "true" : undefined}
      aria-describedby={errorId}
    >
      <legend className="visually-hidden">Booking type</legend>

      <div className="booking-types__list">
        {BOOKING_TYPES.map((type) => {
          const id = bookingFieldId(`type-${type.id}`);
          const selected = value === type.id;

          return (
            <label
              key={type.id}
              htmlFor={id}
              className={
                selected ? "booking-type booking-type--selected" : "booking-type"
              }
            >
              <input
                type="radio"
                id={id}
                name="bookingType"
                className="booking-type__input"
                value={type.id}
                checked={selected}
                onChange={() => onChange(type.id)}
              />

              <span className="booking-type__body">
                <span className="booking-type__label">{type.label}</span>
                <span className="booking-type__desc">
                  <Icon name={type.icon} size={14} />
                  {type.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="booking-types__error">
          {error}
        </p>
      )}
    </fieldset>
  );
}
