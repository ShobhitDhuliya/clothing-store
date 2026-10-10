import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { availabilityService } from "../services/AvailabilityService.js";
import { bookingService } from "../services/BookingService.js";

const router = Router();

/** GET /api/bookings/availability?date=YYYY-MM-DD */
router.get("/availability", async (req, res, next) => {
  try {
    const availability = await availabilityService.getDayAvailability(
      String(req.query.date ?? ""),
    );
    res.json(availability);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/bookings — the booking page is public, so creation works
 * without a session; the server still validates product, variant, type,
 * date (no past dates) and slot availability before saving.
 */
router.post("/", async (req, res, next) => {
  try {
    const booking = await bookingService.create(req.body ?? {});
    res.status(201).json({ message: "Booking confirmed.", booking });
  } catch (error) {
    next(error);
  }
});

/** GET /api/bookings — signed-in customer's own bookings only. */
router.get("/", requireAuth, (req, res, next) => {
  try {
    res.json({ bookings: bookingService.listFor(req.user.email) });
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/bookings/:id/status — ownership-checked, duplicate-safe. */
router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const booking = await bookingService.changeStatus(
      req.params.id,
      req.body?.status,
      req.user,
    );
    res.json({ message: "Booking status updated.", booking });
  } catch (error) {
    next(error);
  }
});

export default router;
