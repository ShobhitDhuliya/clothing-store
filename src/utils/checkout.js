import { DELIVERY_METHODS, PAYMENT_METHODS } from "../constants/cart";
import { FIELD_ORDER, paymentOptionId, deliveryOptionId } from "../constants/checkout";
import { ORDER_STATUS, ORDER_STATUS_LABELS } from "../constants/orderStatus";
import { getCartTotals, getShippingFee } from "./cart";

/**
 * Pure checkout business logic: field validation, cart validation, totals for
 * the selected delivery method, and construction of the (temporary, frontend
 * only) order payload. No React, no network — so it can be unit tested and,
 * later, reused verbatim by a real OrderService.
 */

/* --- Field validators ---------------------------------------------------- */

export function isRequired(value) {
  return String(value ?? "").trim().length > 0;
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? "").trim());
}

/**
 * Reasonable Indian phone: 10 digits starting 6–9, optionally prefixed with
 * +91 / 0091 / 91 / 0. Spaces, hyphens and parentheses are tolerated.
 */
export function isValidIndianPhone(value) {
  const trimmed = String(value ?? "").trim();
  if (!/^\+?[\d\s()-]+$/.test(trimmed)) return false;

  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 14 && digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);

  return /^[6-9]\d{9}$/.test(digits);
}

/** Indian PIN code: exactly 6 digits, first digit 1–9. */
export function isValidIndianPin(value) {
  return /^[1-9]\d{5}$/.test(String(value ?? "").trim());
}

/* --- Whole-form validation ---------------------------------------------- */

/**
 * Validate every checkout field. Returns an errors object containing only the
 * offending fields, so the UI can render messages inline and keep the values
 * the customer already typed.
 */
export function validateCheckoutForm(values, deliveryMethod, paymentMethod) {
  const v = (name) => String(values?.[name] ?? "").trim();
  const errors = {};

  if (!isRequired(v("firstName"))) errors.firstName = "First name is required.";
  if (!isRequired(v("lastName"))) errors.lastName = "Last name is required.";

  if (!isRequired(v("email"))) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(v("email"))) {
    errors.email = "Enter a valid email address, e.g. name@example.com.";
  }

  if (!isRequired(v("phone"))) {
    errors.phone = "Phone number is required.";
  } else if (!isValidIndianPhone(v("phone"))) {
    errors.phone =
      "Enter a valid 10-digit Indian mobile number, e.g. 9876543210 or +91 9876543210.";
  }

  if (!isRequired(v("address1"))) errors.address1 = "Address line 1 is required.";
  if (!isRequired(v("city"))) errors.city = "City is required.";
  if (!isRequired(v("state"))) errors.state = "State is required.";

  if (!isRequired(v("postalCode"))) {
    errors.postalCode = "Postal code is required.";
  } else if (!isValidIndianPin(v("postalCode"))) {
    errors.postalCode = "Enter a valid 6-digit Indian PIN code, e.g. 400001.";
  }

  if (!isRequired(v("country"))) errors.country = "Country is required.";

  if (!deliveryMethod || !DELIVERY_METHODS.some((m) => m.id === deliveryMethod)) {
    errors.deliveryMethod = "Please select a delivery method.";
  }

  if (!paymentMethod || !PAYMENT_METHODS.some((m) => m.id === paymentMethod)) {
    errors.paymentMethod = "Please select a payment method.";
  }

  return errors;
}

/** True when `errors` holds at least one message. */
export function hasErrors(errors) {
  return Boolean(errors) && Object.keys(errors).length > 0;
}

/** The first invalid control to focus after a failed submit, or null. */
export function getFirstInvalidTarget(errors) {
  if (!hasErrors(errors)) return null;

  const field = FIELD_ORDER.find((name) => errors[name]);
  if (field) return `checkout-${field}`;
  if (errors.deliveryMethod) return deliveryOptionId(DELIVERY_METHODS[0].id);
  if (errors.paymentMethod) return paymentOptionId(PAYMENT_METHODS[0].id);
  return null;
}

/* --- Cart validation ------------------------------------------------------ */

/**
 * Ensure the resolved cart lines are actually orderable before an order is
 * created: at least one line, every line in stock, and no line requesting more
 * units than inventory holds. Returns `{ ok, message }` with a customer-facing
 * message (never a raw error) when something is wrong.
 */
export function validateCartLines(lines) {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, message: "Your cart is empty." };
  }

  const outOfStock = lines.filter((line) => !line.isAvailable);
  if (outOfStock.length > 0) {
    return {
      ok: false,
      message: `${outOfStock[0].name} is out of stock. Remove it to continue.`,
    };
  }

  const overQuantity = lines.find(
    (line) => line.stock !== null && line.effectiveQuantity > line.stock,
  );
  if (overQuantity) {
    return {
      ok: false,
      message: `Only ${overQuantity.stock} left of ${overQuantity.name}. Adjust the quantity to continue.`,
    };
  }

  if (lines.every((line) => !(line.effectiveQuantity > 0))) {
    return { ok: false, message: "Your cart has no orderable items." };
  }

  return { ok: true, message: "" };
}

/* --- Totals --------------------------------------------------------------- */

/**
 * Totals for the checkout page: same maths as the cart, but shipping comes
 * from the *selected* delivery method so the final total updates instantly
 * when the customer switches between standard and express.
 */
export function getCheckoutTotals(lines, deliveryMethod = "standard") {
  const base = getCartTotals(lines);
  const shipping = getShippingFee(base.subtotal, deliveryMethod);

  return {
    itemCount: base.itemCount,
    subtotal: base.subtotal,
    savings: base.savings,
    shipping,
    total: base.subtotal + shipping,
  };
}

/* --- Order payload --------------------------------------------------------- */

/**
 * Build the minimal request accepted by OrderService. The server creates the
 * reference and recalculates all prices, stock, shipping, totals, status, and
 * timestamps from trusted data.
 */
export function buildOrderPayload({ values, deliveryMethod, paymentMethod, lines }) {
  const delivery = DELIVERY_METHODS.find((m) => m.id === deliveryMethod) ?? null;
  const payment = PAYMENT_METHODS.find((m) => m.id === paymentMethod) ?? null;
  const v = (name) => String(values?.[name] ?? "").trim();

  return {
    customer: {
      firstName: v("firstName"),
      lastName: v("lastName"),
      email: v("email"),
      phone: v("phone"),
    },
    shippingAddress: {
      line1: v("address1"),
      line2: v("address2"),
      city: v("city"),
      state: v("state"),
      postalCode: v("postalCode"),
      country: v("country"),
    },
    deliveryMethod: delivery
      ? { id: delivery.id }
      : null,
    paymentMethod: payment
      ? { id: payment.id }
      : null,
    items: lines
      .filter((line) => line.effectiveQuantity > 0)
      .map((line) => ({
        productId: line.productId,
        color: line.color,
        size: line.size,
        quantity: line.effectiveQuantity,
      })),
  };
}

/** Display label for an order status (tolerates "PENDING" / "pending"). */
export function getOrderStatusLabel(status) {
  const key = String(status ?? "").toLowerCase();
  return ORDER_STATUS_LABELS[ORDER_STATUS[key.toUpperCase()] ?? key] ?? "Pending";
}
