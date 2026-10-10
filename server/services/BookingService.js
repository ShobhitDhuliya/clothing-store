import { randomBytes } from "node:crypto";
import {
  BOOKING_TIME_SLOTS,
  BOOKING_TYPES,
} from "../../src/constants/booking.js";
import { findProduct, isValidVariant } from "../catalog/products.js";
import { bookingStore } from "../store/JsonListStore.js";
import { availabilityService } from "./AvailabilityService.js";
import { inventoryService } from "./InventoryService.js";
import { fireAndForget, emailService, notifyOnce } from "./EmailService.js";
import { HttpError } from "./HttpError.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{7,17}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NOTES_MAX_LENGTH = 300;

/* Canonical statuses (lowercase, same convention as orders). */
const VALID_STATUSES = new Set(["pending", "confirmed", "cancelled"]);
const CANCELLABLE_STATUSES = new Set(["pending", "confirmed"]);

/** Local-time yyyy-mm-dd — "past" is judged in the server's day, not UTC. */
function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Human-friendly temporary booking reference, e.g. BKG-8F3K-2716. */
function generateBookingId() {
  const random = randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  const suffix = String(Date.now() % 10000).padStart(4, "0");
  return `BKG-${random}-${suffix}`;
}

/**
 * Booking domain service: server-side validation (product, variant, type,
 * date, slot availability), persistence, and post-success notifications
 * (owner + customer, deduplicated). Emails fire only after a successful save.
 */
class BookingService {
  async create(payload) {
    return inventoryService.runExclusive(() => this.#create(payload));
  }

  async #create(payload) {
    const customer = this.#validateCustomer(payload?.customer);
    const product = findProduct(payload?.product?.id);
    if (!product) throw new HttpError(400, "The selected product is unavailable.");
    if (!isValidVariant(product, payload?.variant?.color, payload?.variant?.size)) {
      throw new HttpError(
        400,
        "Select a valid colour and size for this product.",
      );
    }

    const type = BOOKING_TYPES.find((t) => t.id === payload?.bookingType?.id);
    if (!type) throw new HttpError(400, "Please select a booking type.");

    const availableStock = inventoryService.getAvailableStock(
      product.id,
      payload.variant.color,
      payload.variant.size,
    );
    if (availableStock === null || availableStock <= 0) {
      throw new HttpError(
        409,
        "The selected colour and size is no longer available.",
      );
    }

    const date = String(payload?.date ?? "");
    if (!DATE_PATTERN.test(date)) {
      throw new HttpError(400, "Choose a booking date.");
    }
    if (date < todayISO()) {
      throw new HttpError(
        400,
        "Bookings can't be made for a past date — choose today or a future date.",
      );
    }

    const slotId = String(payload?.timeSlot?.id ?? "");
    const slot = BOOKING_TIME_SLOTS.find((s) => s.id === slotId);
    if (!slot) throw new HttpError(400, "Choose a time slot to continue.");

    const slotStatus = await availabilityService.getSlotStatus(date, slotId);
    if (slotStatus !== "available") {
      throw new HttpError(
        409,
        "That time slot is no longer available. Choose another time.",
      );
    }

    const notes = String(payload?.notes ?? "").trim();
    if (notes.length > NOTES_MAX_LENGTH) {
      throw new HttpError(
        400,
        `Additional notes must be ${NOTES_MAX_LENGTH} characters or fewer.`,
      );
    }

    const booking = {
      bookingId: generateBookingId(),
      customer,
      // Product snapshot taken from the catalogue, not the request body.
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        image: product.image ?? null,
        accentHue: product.accentHue ?? 30,
      },
      variant: {
        color: payload.variant.color,
        size: payload.variant.size,
        price: product.price,
      },
      bookingType: {
        id: type.id,
        label: type.label,
        description: type.description,
      },
      date,
      timeSlot: { id: slot.id, label: slot.label },
      notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await bookingStore.save(booking);

    fireAndForget(() =>
      notifyOnce(`booking:${booking.bookingId}:created:owner`, () =>
        emailService.sendBookingPlacedOwner(booking),
      ),
    );
    fireAndForget(() =>
      notifyOnce(`booking:${booking.bookingId}:created:customer`, () =>
        emailService.sendBookingConfirmationCustomer(booking),
      ),
    );

    return booking;
  }

  listFor(email) {
    const mine = String(email ?? "").toLowerCase();
    return bookingStore
      .list()
      .filter((booking) => booking.customer?.email?.toLowerCase() === mine)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async changeStatus(bookingId, nextStatus, requester) {
    return inventoryService.runExclusive(() =>
      this.#changeStatus(bookingId, nextStatus, requester),
    );
  }

  async #changeStatus(bookingId, nextStatus, requester) {
    const booking = bookingStore.findById(bookingId);
    if (!booking) throw new HttpError(404, "Booking not found.");

    const isAdmin = requester?.role === "admin";
    const isOwner =
      booking.customer?.email?.toLowerCase() ===
      String(requester?.email ?? "").toLowerCase();
    if (!isAdmin && !isOwner) {
      throw new HttpError(403, "You can only manage your own bookings.");
    }

    const next = String(nextStatus ?? "").toLowerCase();
    if (!VALID_STATUSES.has(next)) {
      throw new HttpError(400, "Unknown booking status.");
    }
    if (!isAdmin && next !== "cancelled") {
      throw new HttpError(403, "Only administrators can update booking status.");
    }
    if (booking.status === next) {
      throw new HttpError(409, "This booking already has that status.");
    }
    if (!isAdmin && !CANCELLABLE_STATUSES.has(booking.status)) {
      throw new HttpError(409, "Cancelled bookings can't be cancelled again.");
    }

    const updated = {
      ...booking,
      status: next,
      updatedAt: new Date().toISOString(),
    };
    await bookingStore.save(updated);

    fireAndForget(() =>
      notifyOnce(`booking:${updated.bookingId}:status:${next}:owner`, () =>
        emailService.sendBookingStatusOwner(updated),
      ),
    );
    fireAndForget(() =>
      notifyOnce(`booking:${updated.bookingId}:status:${next}:customer`, () =>
        emailService.sendBookingStatusCustomer(updated),
      ),
    );

    return updated;
  }

  #validateCustomer(c) {
    const firstName = String(c?.firstName ?? "").trim();
    const lastName = String(c?.lastName ?? "").trim();
    const email = String(c?.email ?? "").trim().toLowerCase();
    const phone = String(c?.phone ?? "").trim();

    if (!firstName || !lastName) {
      throw new HttpError(400, "Customer name is required.");
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new HttpError(400, "A valid email address is required.");
    }
    if (!PHONE_PATTERN.test(phone)) {
      throw new HttpError(
        400,
        "Enter a valid 10-digit Indian mobile number, e.g. 9876543210.",
      );
    }
    return { firstName, lastName, email, phone };
  }
}

export const bookingService = new BookingService();
export default bookingService;
