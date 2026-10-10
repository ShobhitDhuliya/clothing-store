import { ENDPOINTS } from "../api/endpoints";
import BaseService from "./BaseService";

/**
 * Booking data access against the real backend.
 *
 * `create` POSTS the booking payload; the server re-validates product,
 * variant, type, date (no past dates) and slot availability, then returns
 * the canonical booking the confirmation screen renders.
 *
 * `listOwn` / `changeStatus` power My Bookings — history is scoped by JWT
 * and status changes are ownership-checked.
 */
export default class BookingService extends BaseService {
  constructor() {
    super(ENDPOINTS.bookings);
  }

  /** POST /bookings → canonical server booking. */
  async create(booking) {
    const data = await this.http.post(ENDPOINTS.bookings, booking);
    return data.booking;
  }

  /** GET /bookings → the signed-in customer's own bookings (newest first). */
  async listOwn() {
    const data = await this.http.get(ENDPOINTS.bookings);
    return data.bookings ?? [];
  }

  /** PATCH /bookings/:id/status → updated booking (cancel / admin). */
  async changeStatus(bookingId, status) {
    const data = await this.http.patch(
      `${ENDPOINTS.bookings}/${bookingId}/status`,
      { status },
    );
    return data.booking;
  }
}

export const bookingService = new BookingService();
