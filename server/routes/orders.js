import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { orderService } from "../services/OrderService.js";

const router = Router();

/**
 * POST /api/orders — guest checkout allowed (the storefront checkout is
 * public). The server validates everything and RECALCULATES all totals from
 * the catalogue; the response is the canonical order.
 */
router.post("/", async (req, res, next) => {
  try {
    const order = await orderService.create(req.body ?? {});
    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders — the signed-in customer's own order history only
 * (scoped by JWT email; other customers' orders are never returned).
 */
router.get("/", requireAuth, (req, res, next) => {
  try {
    res.json({ orders: orderService.listFor(req.user.email) });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/orders/:id/status — ownership-checked status transitions
 * (customers may cancel their own orders; other transitions are admin-only).
 * A duplicate transition answers 409, which also prevents double emails.
 */
router.patch("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const order = await orderService.changeStatus(
      req.params.id,
      req.body?.status,
      req.user,
    );
    res.json({ message: "Order status updated.", order });
  } catch (error) {
    next(error);
  }
});

export default router;
