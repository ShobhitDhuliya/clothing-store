import { findProduct, findVariant } from "../catalog/products.js";
import { bookingStore, orderStore } from "../store/JsonListStore.js";

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Shared inventory view for checkout and product-reservation bookings.
 * Pending and fulfilled orders consume stock; cancelled records release it.
 */
class InventoryService {
  #mutationQueue = Promise.resolve();

  runExclusive(operation) {
    const result = this.#mutationQueue.then(operation, operation);
    this.#mutationQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  getAvailableStock(productId, color, size) {
    const variant = findVariant(findProduct(productId), color, size);

    if (!variant) return null;

    const ordersReserved = orderStore
      .list()
      .filter((order) => order.status !== "cancelled")
      .reduce(
        (total, order) =>
          total +
          (order.items ?? []).reduce(
            (count, item) =>
              item.productId === Number(productId) &&
              item.color === color &&
              item.size === size
                ? count + Number(item.quantity || 0)
                : count,
            0,
          ),
        0,
      );

    const bookingsReserved = bookingStore
      .list()
      .filter(
        (booking) =>
          booking.status !== "cancelled" &&
          booking.bookingType?.id === "reservation" &&
          booking.date >= todayISO() &&
          booking.product?.id === Number(productId) &&
          booking.variant?.color === color &&
          booking.variant?.size === size,
      ).length;

    return Math.max(0, variant.stock - ordersReserved - bookingsReserved);
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;
