import { ENDPOINTS } from "../api/endpoints";
import BaseService from "./BaseService";

/**
 * Order data access against the real backend.
 *
 * `create` POSTs the checkout payload; the server validates everything and
 * RECALCULATES totals from its catalogue, so the returned order is the
 * canonical record the confirmation screen renders (client-side prices in
 * the request are never trusted).
 *
 * `listOwn` / `changeStatus` power the My Orders page: history is scoped to
 * the signed-in customer by the server via the Bearer token, and status
 * changes are ownership-checked server-side.
 */
export default class OrderService extends BaseService {
  constructor() {
    super(ENDPOINTS.orders);
  }

  /** POST /orders → canonical server order. */
  async create(order) {
    const data = await this.http.post(ENDPOINTS.orders, order);
    return data.order;
  }

  /** GET /orders → the signed-in customer's own orders (newest first). */
  async listOwn() {
    const data = await this.http.get(ENDPOINTS.orders);
    return data.orders ?? [];
  }

  /** PATCH /orders/:id/status → updated order (cancel / admin transitions). */
  async changeStatus(orderId, status) {
    const data = await this.http.patch(`${ENDPOINTS.orders}/${orderId}/status`, {
      status,
    });
    return data.order;
  }
}

export const orderService = new OrderService();

