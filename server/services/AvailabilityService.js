import {
  BOOKING_TIME_SLOTS,
  SLOT_STATUS,
} from "../../src/constants/booking.js";
import { bookingStore } from "../store/JsonListStore.js";
import { HttpError } from "./HttpError.js";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(date) {
  if (!DATE_PATTERN.test(date)) return false;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === date
  );
}

function currentLocalDateTime() {
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

/**
 * Backend slot availability. A deterministic schedule provides baseline
 * availability; persisted, non-cancelled bookings override it.
 */

/** Deterministic string hash — same inputs always yield the same "database". */
function hashString(value) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Mirrors the storefront mock: mostly open, some reserved, some full. */
function mockSlotStatus(date, slotId, index) {
  const roll = (hashString(`${date}::${slotId}`) + index * 7) % 100;
  if (roll < 55) return SLOT_STATUS.AVAILABLE;
  if (roll < 80) return SLOT_STATUS.RESERVED;
  return SLOT_STATUS.FULLY_BOOKED;
}

class AvailabilityService {
  async getDayAvailability(date) {
    const requestedDate = String(date ?? "");
    if (!isValidDate(requestedDate)) {
      throw new HttpError(400, "Choose a valid booking date.");
    }

    const current = currentLocalDateTime();
    const bookedSlots = new Set(
      bookingStore
        .list()
        .filter(
          (booking) =>
            booking.date === date && booking.status !== "cancelled",
        )
        .map((booking) => booking.timeSlot?.id),
    );

    const slots = BOOKING_TIME_SLOTS.map((slot, index) => ({
      time: slot.id,
      label: slot.label,
      status:
        bookedSlots.has(slot.id) ||
        (requestedDate === current.date && slot.id <= current.time)
        ? SLOT_STATUS.FULLY_BOOKED
        : mockSlotStatus(requestedDate, slot.id, index),
    }));

    // Keep at least one mock slot open unless real bookings occupy the day.
    if (!slots.some((slot) => slot.status === SLOT_STATUS.AVAILABLE)) {
      const rescueIndex = slots.findIndex(
        (slot) =>
          !bookedSlots.has(slot.time) &&
          (requestedDate !== current.date || slot.time > current.time),
      );
      if (rescueIndex >= 0) {
        slots[rescueIndex] = {
          ...slots[rescueIndex],
          status: SLOT_STATUS.AVAILABLE,
        };
      }
    }

    return { date: requestedDate, slots };
  }

  /** Convenience: status of one slot on one day (null when unknown). */
  async getSlotStatus(date, slotId) {
    const day = await this.getDayAvailability(date);
    return day.slots.find((slot) => slot.time === slotId)?.status ?? null;
  }
}

export const availabilityService = new AvailabilityService();
export default availabilityService;
