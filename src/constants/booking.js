/**
 * Booking/reservation configuration: booking types, time slots, availability
 * statuses, form defaults and the stable DOM ids used for focus management
 * after a failed validation. Catalogue (product) data lives in `data/products`.
 */

/** Appointment kinds. Append an entry to support another booking type later. */
export const BOOKING_TYPES = [
  {
    id: "reservation",
    label: "Product Reservation",
    description: "Hold a product and collect it in store.",
    icon: "mapPin",
  },
  {
    id: "trial",
    label: "In-store Trial / Fitting",
    description: "Book a fitting room to try before you buy.",
    icon: "user",
  },
];

/** Bookable slots for a store day (24-hour ids, friendly 12-hour labels). */
export const BOOKING_TIME_SLOTS = [
  { id: "10:00", label: "10:00 AM" },
  { id: "11:00", label: "11:00 AM" },
  { id: "12:00", label: "12:00 PM" },
  { id: "13:00", label: "1:00 PM" },
  { id: "14:00", label: "2:00 PM" },
  { id: "15:00", label: "3:00 PM" },
  { id: "16:00", label: "4:00 PM" },
  { id: "17:00", label: "5:00 PM" },
  { id: "18:00", label: "6:00 PM" },
];

/** Slot states returned by the availability endpoint. */
export const SLOT_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  FULLY_BOOKED: "fully_booked",
};

/** Display labels for blocked slot states (shown on disabled slot buttons). */
export const SLOT_STATUS_LABELS = {
  [SLOT_STATUS.RESERVED]: "Reserved",
  [SLOT_STATUS.FULLY_BOOKED]: "Fully booked",
};

/** Booking lifecycle. Frontend creation always starts at PENDING. */
export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: "Pending",
  [BOOKING_STATUS.CONFIRMED]: "Confirmed",
  [BOOKING_STATUS.CANCELLED]: "Cancelled",
};

/** Upper bound for the optional notes field. */
export const NOTES_MAX_LENGTH = 300;

/** Starting point for the booking form. */
export const INITIAL_BOOKING_VALUES = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  notes: "",
};

/** Error keys in the order a screen-reader user should visit them. */
export const BOOKING_FIELD_ORDER = [
  "product",
  "variant",
  "bookingType",
  "date",
  "timeSlot",
  "firstName",
  "lastName",
  "email",
  "phone",
  "notes",
];

/** DOM id for a text field, shared by the input and the focus helper. */
export function bookingFieldId(name) {
  return `booking-${name}`;
}

/** Focus targets for error keys that live on a group (fieldset), not an input. */
export const BOOKING_GROUP_IDS = {
  product: "booking-product-group",
  variant: "booking-variant-group",
  bookingType: "booking-type-group",
  timeSlot: "booking-time-group",
};
