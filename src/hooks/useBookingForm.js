import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BOOKING_TIME_SLOTS, INITIAL_BOOKING_VALUES } from "../constants/booking";
import { products } from "../data/products";
import { availabilityService } from "../services/AvailabilityService";
import { bookingService } from "../services/BookingService";
import useProductVariant, { pickDefaultVariant } from "./useProductVariant";
import { buildVariants } from "../utils/productDetails";
import {
  buildBookingPayload,
  getFirstInvalidBookingTarget,
  getTodayISO,
  hasErrors,
  validateBookingForm,
} from "../utils/booking";

/** Remove error keys without touching the rest (keeps `hasErrors` honest). */
function withoutErrors(errors, keys) {
  if (!keys.some((key) => errors[key])) return errors;
  const next = { ...errors };
  keys.forEach((key) => delete next[key]);
  return next;
}

/**
 * Single source of truth for the booking page. Catalogue truth stays in
 * `data/products`; variant selection reuses `useProductVariant` + the Product
 * Details utils (reset through the product-selection event); availability
 * comes from AvailabilityService behind an abstraction a backend can take
 * over unchanged. Submission gates: validation → in-flight guard → create.
 */
export default function useBookingForm() {
  const [values, setValues] = useState(INITIAL_BOOKING_VALUES);
  const [errors, setErrors] = useState({});
  const [productId, setProductId] = useState(null);
  const [bookingType, setBookingTypeState] = useState(null);
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: "", tone: "" });
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  // Dynamic minimum booking date, captured once when the page mounts.
  const [minDate] = useState(() => getTodayISO());
  const inFlightRef = useRef(false);
  const availabilityRequestRef = useRef(0);

  /* --- Catalogue + variant selection (shared with Product Details) --------- */
  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId],
  );
  const variants = useMemo(() => buildVariants(selectedProduct), [selectedProduct]);
  const { color, size, setColor, setSize, selectedVariant, isAvailable } =
    useProductVariant(variants);

  /**
   * Availability lookup. Loading is turned on in `selectDate` (an event
   * handler) so this effect never sets state synchronously — every setState
   * below happens after the `await`, and stale responses are dropped.
   */
  useEffect(() => {
    if (!date) return undefined;

    let cancelled = false;
    const requestId = availabilityRequestRef.current + 1;
    availabilityRequestRef.current = requestId;

    (async () => {
      try {
        const result = await availabilityService.getDayAvailability(date);
        if (!cancelled && availabilityRequestRef.current === requestId) {
          setAvailability(result);
          setAvailabilityError("");
        }
      } catch (error) {
        if (!cancelled && availabilityRequestRef.current === requestId) {
          setAvailability(null);
          setAvailabilityError(
            error.message || "Couldn't load available time slots. Please try again.",
          );
        }
      } finally {
        if (!cancelled && availabilityRequestRef.current === requestId) {
          setAvailabilityLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [date]);

  /** Statuses for the current date only (stale payloads are ignored). */
  const slotStatusMap = useMemo(() => {
    if (!availability || availability.date !== date) return null;
    return availability.slots.reduce((map, slot) => {
      map[slot.time] = slot.status;
      return map;
    }, {});
  }, [availability, date]);

  /** Slot buttons consume this: the fixed schedule + per-date statuses. */
  const slotOptions = useMemo(
    () =>
      BOOKING_TIME_SLOTS.map((slot) => ({
        ...slot,
        status: slotStatusMap?.[slot.id] ?? null,
      })),
    [slotStatusMap],
  );

  const selectedSlot = useMemo(
    () => BOOKING_TIME_SLOTS.find((slot) => slot.id === timeSlot) ?? null,
    [timeSlot],
  );

  /* --- Selection actions ---------------------------------------------------- */
  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => withoutErrors(prev, [name]));
  }, []);

  const selectProduct = useCallback(
    (id) => {
      const product = products.find((item) => item.id === id) ?? null;
      // Reset to the new product's sensible default — the same rule
      // `useProductVariant` mounts with, so no duplicate selection logic.
      const defaultVariant = pickDefaultVariant(buildVariants(product));

      setProductId(product?.id ?? null);
      setColor(defaultVariant?.color ?? "");
      setSize(defaultVariant?.size ?? "");
      setErrors((prev) => withoutErrors(prev, ["product", "variant"]));
    },
    [setColor, setSize],
  );

  const setColorSelection = useCallback(
    (nextColor) => {
      setColor(nextColor);
      setErrors((prev) => withoutErrors(prev, ["variant"]));
    },
    [setColor],
  );

  const setSizeSelection = useCallback(
    (nextSize) => {
      setSize(nextSize);
      setErrors((prev) => withoutErrors(prev, ["variant"]));
    },
    [setSize],
  );

  const setBookingType = useCallback((id) => {
    setBookingTypeState(id);
    setErrors((prev) => withoutErrors(prev, ["bookingType"]));
  }, []);

  const selectDate = useCallback((nextDate) => {
    setDate(nextDate);
    setTimeSlot(null);
    setAvailability(null);
    setAvailabilityError("");
    setAvailabilityLoading(Boolean(nextDate));
    setErrors((prev) => withoutErrors(prev, ["date", "timeSlot"]));
  }, []);

  const selectTimeSlot = useCallback((slotId) => {
    setTimeSlot(slotId);
    setErrors((prev) => withoutErrors(prev, ["timeSlot"]));
  }, []);


  /** Focus the first invalid control after a failed submission. */
  const focusInvalid = useCallback((nextErrors) => {
    const target = getFirstInvalidBookingTarget(nextErrors);
    if (!target) return;
    const element = document.getElementById(target);
    if (element) element.focus();
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      // Hard guard against double-submissions: ignore while a request is in
      // flight or after a booking has already been created.
      if (inFlightRef.current || confirmedBooking) return;

      const nextErrors = validateBookingForm({
        values,
        hasProduct: Boolean(selectedProduct),
        hasVariant: Boolean(selectedVariant),
        bookingType,
        date,
        timeSlot,
        slotStatus: timeSlot ? (slotStatusMap?.[timeSlot] ?? null) : null,
        slotsLoading: Boolean(date) && availabilityLoading,
      });

      if (hasErrors(nextErrors)) {
        setErrors(nextErrors);
        setStatus({
          message: "Please fix the highlighted fields to continue.",
          tone: "error",
        });
        focusInvalid(nextErrors);
        return;
      }

      inFlightRef.current = true;
      setSubmitting(true);
      setErrors({});
      setStatus({ message: "", tone: "" });

      try {
        const payload = buildBookingPayload({
          values,
          product: selectedProduct,
          variant: selectedVariant,
          bookingType,
          date,
          timeSlot,
        });
        const booking = await bookingService.create(payload);

        setConfirmedBooking(booking);
        setStatus({ message: "Booking confirmed.", tone: "success" });
      } catch (error) {
        // Server messages are already safe — never include credentials.
        setStatus({
          message:
            error.message ||
            "We couldn't confirm your booking just now. Please try again.",
          tone: "error",
        });
      } finally {
        inFlightRef.current = false;
        setSubmitting(false);
      }
    },
    [
      values,
      selectedProduct,
      selectedVariant,
      bookingType,
      date,
      timeSlot,
      slotStatusMap,
      availabilityLoading,
      confirmedBooking,
      focusInvalid,
    ],
  );

  return {
    values,
    errors,
    setValue,
    productId,
    selectProduct,
    selectedProduct,
    variants,
    color,
    size,
    setColor: setColorSelection,
    setSize: setSizeSelection,
    selectedVariant,
    isAvailable,
    bookingType,
    setBookingType,
    date,
    minDate,
    selectDate,
    timeSlot,
    selectTimeSlot,
    selectedSlot,
    slotOptions,
    availabilityLoading,
    availabilityError,
    submitting,
    statusMessage: status.message,
    statusTone: status.tone,
    confirmedBooking,
    handleSubmit,
  };
}
