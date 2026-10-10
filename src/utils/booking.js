import {
  BOOKING_FIELD_ORDER,
  BOOKING_GROUP_IDS,
  BOOKING_STATUS,
  BOOKING_STATUS_LABELS,
  BOOKING_TIME_SLOTS,
  BOOKING_TYPES,
  NOTES_MAX_LENGTH,
  SLOT_STATUS,
  bookingFieldId,
} from "../constants/booking";
import { formatDate } from "./formatDate";
import { isRequired, isValidEmail, isValidIndianPhone } from "./checkout";

/**
 * Pure booking business logic: local-time date helpers, whole-form
 * validation, focus targeting and construction of the booking request.
 * Name/email/Indian-phone rules are reused from `utils/checkout` so the two
 * flows can never disagree.
 */

/* --- Date helpers (local time, yyyy-mm-dd strings) ------------------------- */

/** Local-time ISO date (yyyy-mm-dd) — never UTC, so "today" matches the user. */
export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Today's date in ISO form — the minimum selectable booking date. */
export function getTodayISO() {
  return toISODate(new Date());
}

/** True when `dateISO` is strictly before `todayISO` (defaults to today). */
export function isDateInPast(dateISO, todayISO = getTodayISO()) {
  return Boolean(dateISO) && dateISO < todayISO;
}

/** Parse a yyyy-mm-dd string as a *local* Date (avoids the UTC off-by-one). */
export function parseISODate(dateISO) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateISO ?? ""));
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Friendly booking date with weekday, e.g. "Sat, Oct 10, 2026". */
export function formatBookingDate(dateISO) {
  const date = parseISODate(dateISO);
  return date ? formatDate(date, { weekday: "short" }) : "";
}

/* --- Slot helpers ----------------------------------------------------------- */

/** Only `available` slots may be selected; reserved/fully_booked are blocked. */
export function isSlotSelectable(status) {
  return status === SLOT_STATUS.AVAILABLE;
}

/* --- Whole-form validation -------------------------------------------------- */

/**
 * Validate every piece of a booking. Returns an errors object containing only
 * the offending fields (keyed by BOOKING_FIELD_ORDER), so the UI can render
 * messages inline and keep the values the customer already typed.
 */
export function validateBookingForm({
  values,
  hasProduct,
  hasVariant,
  bookingType,
  date,
  timeSlot,
  slotStatus,
  slotsLoading = false,
}) {
  const v = (name) => String(values?.[name] ?? "").trim();
  const errors = {};

  if (!hasProduct) errors.product = "Select a product to book.";

  if (hasProduct && !hasVariant) {
    errors.variant = "Select a colour and size for this product.";
  }

  if (!bookingType || !BOOKING_TYPES.some((type) => type.id === bookingType)) {
    errors.bookingType = "Please select a booking type.";
  }

  if (!isRequired(date)) {
    errors.date = "Choose a booking date.";
  } else if (isDateInPast(date)) {
    errors.date =
      "Bookings can't be made for a past date — choose today or a future date.";
  }

  if (!timeSlot) {
    errors.timeSlot = "Choose a time slot to continue.";
  } else if (slotsLoading) {
    errors.timeSlot = "Availability is still loading — try again in a moment.";
  } else if (!isSlotSelectable(slotStatus)) {
    errors.timeSlot = "That time slot is no longer available. Choose another time.";
  }

  if (!isRequired(v("firstName"))) errors.firstName = "First name is required.";
  if (!isRequired(v("lastName"))) errors.lastName = "Last name is required.";

  if (!isRequired(v("email"))) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(v("email"))) {
    errors.email = "Enter a valid email address, e.g. name@example.com.";
  }

  if (!isRequired(v("phone"))) {
    errors.phone = "Phone number is required.";
  } else if (!isValidIndianPhone(v("phone"))) {
    errors.phone =
      "Enter a valid 10-digit Indian mobile number, e.g. 9876543210 or +91 9876543210.";
  }

  if (String(values?.notes ?? "").length > NOTES_MAX_LENGTH) {
    errors.notes = `Additional notes must be ${NOTES_MAX_LENGTH} characters or fewer.`;
  }

  return errors;
}

/** True when a validation result contains at least one message. */
export function hasErrors(errors) {
  return Object.keys(errors ?? {}).length > 0;
}


/* --- Focus targeting -------------------------------------------------------- */

/** Element id to focus after a failed submission (first offending control). */
export function getFirstInvalidBookingTarget(errors) {
  for (const key of BOOKING_FIELD_ORDER) {
    if (!errors?.[key]) continue;
    return BOOKING_GROUP_IDS[key] ?? bookingFieldId(key);
  }
  return null;
}

/* --- Booking payload --------------------------------------------------------- */

/**
 * Build the minimal request consumed by BookingService. The server assigns
 * the reference, status, product snapshot, and creation timestamp.
 */
export function buildBookingPayload({
  values,
  product,
  variant,
  bookingType,
  date,
  timeSlot,
}) {
  const type = BOOKING_TYPES.find((option) => option.id === bookingType) ?? null;
  const slot = BOOKING_TIME_SLOTS.find((option) => option.id === timeSlot) ?? null;
  const v = (name) => String(values?.[name] ?? "").trim();

  return {
    customer: {
      firstName: v("firstName"),
      lastName: v("lastName"),
      email: v("email"),
      phone: v("phone"),
    },
    product: { id: product.id },
    variant: {
      color: variant.color,
      size: variant.size,
    },
    bookingType: type ? { id: type.id } : null,
    date,
    timeSlot: slot ? { id: slot.id } : null,
    notes: v("notes"),
  };
}

/** Display label for a booking status (tolerates "PENDING" / "pending"). */
export function getBookingStatusLabel(status) {
  const key = String(status ?? "").toLowerCase();
  return BOOKING_STATUS_LABELS[BOOKING_STATUS[key.toUpperCase()] ?? key] ?? "Pending";
}
