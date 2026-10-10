import { ENDPOINTS } from "../api/endpoints";
import BaseService from "./BaseService";

/**
 * Loads persisted slot availability for the booking date. The server is also
 * authoritative when the booking is submitted, so stale availability cannot
 * create a duplicate appointment.
 */
export default class AvailabilityService extends BaseService {
  constructor() {
    super(ENDPOINTS.bookings);
  }

  async getDayAvailability(date) {
    return this.http.get(
      `${this.resource}/availability?date=${encodeURIComponent(date)}`,
    );
  }
}

export const availabilityService = new AvailabilityService();