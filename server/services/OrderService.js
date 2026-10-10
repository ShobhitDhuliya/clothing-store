import { randomBytes } from "node:crypto";
import { ORDER_STATUS } from "../../src/constants/orderStatus.js";
import { findProduct, isValidVariant } from "../catalog/products.js";
import { orderStore } from "../store/JsonListStore.js";
import { inventoryService } from "./InventoryService.js";
import { fireAndForget, emailService, notifyOnce } from "./EmailService.js";
import { HttpError } from "./HttpError.js";

/* Pricing rules — mirrors src/constants/cart.js (single business rule set). */
const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING_FEE = 5.99;
const EXPRESS_SHIPPING_FEE = 12.99;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PIN_PATTERN = /^[1-9]\d{5}$/;
const VALID_STATUSES = new Set(Object.values(ORDER_STATUS));
const CANCELLABLE_STATUSES = new Set([
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
]);

const DELIVERY_OPTIONS = {
  standard: {
    id: "standard",
    label: "Standard delivery",
    description: "3–5 business days",
  },
  express: { id: "express", label: "Express delivery", description: "1–2 business days" },
};

const PAYMENT_OPTIONS = {
  card: { id: "card", label: "Credit / debit card" },
  cod: { id: "cod", label: "Cash on delivery" },
};

/** Human-friendly temporary order reference, e.g. ATL-8F3K-2716. */
function generateOrderId() {
  const random = randomBytes(3).toString("hex").slice(0, 4).toUpperCase();
  const suffix = String(Date.now() % 10000).padStart(4, "0");
  return `ATL-${random}-${suffix}`;
}

/**
 * Order domain service: server-side validation, SERVER-side price
 * calculation from the shared catalogue, persistence, and post-success
 * notifications (owner + customer, deduplicated). Client-sent prices are
 * never trusted — every figure below is recomputed here.
 */
class OrderService {
  async create(payload) {
    return inventoryService.runExclusive(() => this.#create(payload));
  }

  async #create(payload) {
    const customer = this.#validateCustomer(payload);
    const address = this.#validateAddress(payload);
    const items = this.#validateItems(payload?.items);
    const deliveryId = payload?.deliveryMethod?.id;
    const paymentId = payload?.paymentMethod?.id;

    if (!DELIVERY_OPTIONS[deliveryId]) {
      throw new HttpError(400, "Please select a delivery method.");
    }
    if (!PAYMENT_OPTIONS[paymentId]) {
      throw new HttpError(400, "Please select a payment method.");
    }

    /* --- Server-calculated totals (client totals are ignored) --- */
    let subtotal = 0;
    let savings = 0;
    let itemCount = 0;

    for (const item of items) {
      subtotal += item.lineTotal;
      savings += item.lineSavings;
      itemCount += item.quantity;
    }

    let shipping = 0;
    if (deliveryId === "express") {
      shipping = EXPRESS_SHIPPING_FEE;
    } else if (subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD) {
      shipping = STANDARD_SHIPPING_FEE;
    }

    const order = {
      orderId: generateOrderId(),
      customer,
      shippingAddress: address,
      deliveryMethod: DELIVERY_OPTIONS[deliveryId],
      paymentMethod: PAYMENT_OPTIONS[paymentId],
      paymentStatus:
        paymentId === "cod"
          ? "Pay on delivery"
          : "Payment pending — demo gateway not connected",
      items,
      subtotal: Number(subtotal.toFixed(2)),
      savings: Number(savings.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number((subtotal + shipping).toFixed(2)),
      itemCount,
      status: ORDER_STATUS.PENDING,
      createdAt: new Date().toISOString(),
    };

    await orderStore.save(order);

    // Emails only after a successful save; fire-and-forget + dedup keys so a
    // repeated call can never double-notify.
    fireAndForget(() =>
      notifyOnce(`order:${order.orderId}:created:owner`, () =>
        emailService.sendOrderPlacedOwner(order),
      ),
    );
    fireAndForget(() =>
      notifyOnce(`order:${order.orderId}:created:customer`, () =>
        emailService.sendOrderConfirmationCustomer(order),
      ),
    );

    return order;
  }

  listFor(email) {
    const mine = String(email ?? "").toLowerCase();
    return orderStore
      .list()
      .filter((order) => order.customer?.email?.toLowerCase() === mine)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async changeStatus(orderId, nextStatus, requester) {
    return inventoryService.runExclusive(() =>
      this.#changeStatus(orderId, nextStatus, requester),
    );
  }

  async #changeStatus(orderId, nextStatus, requester) {
    const order = orderStore.findById(orderId);
    if (!order) throw new HttpError(404, "Order not found.");

    const isAdmin = requester?.role === "admin";
    const isOwner =
      order.customer?.email?.toLowerCase() ===
      String(requester?.email ?? "").toLowerCase();
    if (!isAdmin && !isOwner) {
      throw new HttpError(403, "You can only manage your own orders.");
    }

    const next = String(nextStatus ?? "").toLowerCase();
    if (!VALID_STATUSES.has(next)) {
      throw new HttpError(400, "Unknown order status.");
    }
    if (!isAdmin && next !== ORDER_STATUS.CANCELLED) {
      throw new HttpError(403, "Only administrators can update order status.");
    }
    if (order.status === next) {
      throw new HttpError(409, "This order already has that status.");
    }
    if (!isAdmin && !CANCELLABLE_STATUSES.has(order.status)) {
      throw new HttpError(409, "Delivered or cancelled orders can't be cancelled.");
    }

    const updated = {
      ...order,
      status: next,
      updatedAt: new Date().toISOString(),
    };
    await orderStore.save(updated);

    fireAndForget(() =>
      notifyOnce(`order:${updated.orderId}:status:${next}:owner`, () =>
        emailService.sendOrderStatusOwner(updated),
      ),
    );
    fireAndForget(() =>
      notifyOnce(`order:${updated.orderId}:status:${next}:customer`, () =>
        emailService.sendOrderStatusCustomer(updated),
      ),
    );

    return updated;
  }

  /* --- Validation helpers (safe messages, never echo raw input) --- */

  #validateCustomer(payload) {
    const c = payload?.customer ?? {};
    const firstName = String(c.firstName ?? "").trim();
    const lastName = String(c.lastName ?? "").trim();
    const email = String(c.email ?? "").trim().toLowerCase();
    const phone = String(c.phone ?? "").trim();

    if (!firstName || !lastName) {
      throw new HttpError(400, "Customer name is required.");
    }
    if (!EMAIL_PATTERN.test(email)) {
      throw new HttpError(400, "A valid email address is required.");
    }
    if (phone && !/^\+?[\d\s()-]{8,18}$/.test(phone)) {
      throw new HttpError(400, "Phone number looks invalid.");
    }
    return { firstName, lastName, email, phone };
  }

  #validateAddress(payload) {
    const a = payload?.shippingAddress ?? {};
    const line1 = String(a.line1 ?? "").trim();
    const line2 = String(a.line2 ?? "").trim();
    const city = String(a.city ?? "").trim();
    const state = String(a.state ?? "").trim();
    const postalCode = String(a.postalCode ?? "").trim();
    const country = String(a.country ?? "").trim();

    if (!line1 || !city || !state || !country) {
      throw new HttpError(400, "Shipping address is incomplete.");
    }
    if (!PIN_PATTERN.test(postalCode)) {
      throw new HttpError(
        400,
        "Enter a valid 6-digit Indian PIN code, e.g. 400001.",
      );
    }
    return { line1, line2, city, state, postalCode, country };
  }

  #validateItems(rawItems) {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new HttpError(400, "Your cart has no orderable items.");
    }

    const requestedByVariant = new Map();

    return rawItems.map((line) => {
      const product = findProduct(line?.productId);
      if (!product) {
        throw new HttpError(400, "An item in your cart is no longer available.");
      }
      if (!isValidVariant(product, line.color, line.size)) {
        throw new HttpError(
          400,
          `${product.name} is not available in that colour and size.`,
        );
      }

      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw new HttpError(400, `Invalid quantity for ${product.name}.`);
      }
      const variantKey = `${product.id}-${line.color}-${line.size}`;
      const available = inventoryService.getAvailableStock(
        product.id,
        line.color,
        line.size,
      );
      const alreadyRequested = requestedByVariant.get(variantKey) ?? 0;
      if (available === null || available <= 0) {
        throw new HttpError(
          400,
          `${product.name} is out of stock in that colour and size.`,
        );
      }
      if (quantity + alreadyRequested > available) {
        throw new HttpError(
          400,
          `Only ${Math.max(0, available - alreadyRequested)} of ${product.name} in that colour and size available.`,
        );
      }
      requestedByVariant.set(variantKey, alreadyRequested + quantity);

      // Prices come from the catalogue — never from the request body.
      const unitPrice = product.price;
      const originalPrice =
        product.originalPrice && product.originalPrice > product.price
          ? product.originalPrice
          : null;

      return {
        productId: product.id,
        variantKey,
        name: product.name,
        color: line.color,
        size: line.size,
        unitPrice,
        quantity,
        lineTotal: Number((unitPrice * quantity).toFixed(2)),
        lineSavings: originalPrice
          ? Number(((originalPrice - unitPrice) * quantity).toFixed(2))
          : 0,
      };
    });
  }
}

export const orderService = new OrderService();
export default orderService;
