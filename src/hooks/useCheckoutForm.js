import { useCallback, useMemo, useRef, useState } from "react";
import { products } from "../data/products";
import { DELIVERY_METHODS, PAYMENT_METHODS } from "../constants/cart";
import { INITIAL_CHECKOUT_VALUES } from "../constants/checkout";
import { useCart } from "../context/CartContext";
import { orderService } from "../services/OrderService";
import { resolveCartLines, getFreeShippingProgress, getShippingFee } from "../utils/cart";
import {
  buildOrderPayload,
  getCheckoutTotals,
  getFirstInvalidTarget,
  hasErrors,
  validateCartLines,
  validateCheckoutForm,
} from "../utils/checkout";

/**
 * Single source of truth for the checkout page.
 *
 * Cart data is read from CartContext (never duplicated); delivery + payment
 * selection, form values, validation errors and the submit lifecycle live
 * here. Submission runs three gates in order — form validation, cart/stock
 * validation, then OrderService.create — and only a fully valid run clears
 * the cart via the context's `clear()` action.
 */
export default function useCheckoutForm() {
  const { items, clear } = useCart();

  const [values, setValues] = useState(INITIAL_CHECKOUT_VALUES);
  const [errors, setErrors] = useState({});
  const [deliveryMethod, setDeliveryMethod] = useState(DELIVERY_METHODS[0].id);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ message: "", tone: "" });
  const [placedOrder, setPlacedOrder] = useState(null);
  const inFlightRef = useRef(false);

  /* Derived cart state — same resolution pipeline as the cart page. */
  const lines = useMemo(() => resolveCartLines(items, products), [items]);
  const totals = useMemo(
    () => getCheckoutTotals(lines, deliveryMethod),
    [lines, deliveryMethod],
  );
  const progress = useMemo(
    () => getFreeShippingProgress(totals.subtotal),
    [totals.subtotal],
  );

  const deliveryOptions = useMemo(
    () =>
      DELIVERY_METHODS.map((method) => {
        // Price comes from the shared calculator — never hard-coded in JSX.
        const charge = getShippingFee(totals.subtotal, method.id);
        return { ...method, charge, free: charge === 0 };
      }),
    [totals.subtotal],
  );

  const paymentOptions = useMemo(
    () =>
      PAYMENT_METHODS.map((method) => ({
        ...method,
        online: method.id === "card",
      })),
    [],
  );

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear the field's error as soon as the customer edits it (remove the
    // key entirely so `hasErrors` reflects only real messages).
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setDelivery = useCallback((id) => {
    setDeliveryMethod(id);
    setErrors((prev) => {
      if (!prev.deliveryMethod) return prev;
      const next = { ...prev };
      delete next.deliveryMethod;
      return next;
    });
  }, []);

  const setPayment = useCallback((id) => {
    setPaymentMethod(id);
    setErrors((prev) => {
      if (!prev.paymentMethod) return prev;
      const next = { ...prev };
      delete next.paymentMethod;
      return next;
    });
  }, []);

  /** Focus the first invalid control after a failed submission. */
  const focusInvalid = useCallback((nextErrors) => {
    const target = getFirstInvalidTarget(nextErrors);
    if (!target) return;
    const element = document.getElementById(target);
    if (element) element.focus();
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      // Hard guard against double-submits: ignore while a request is in flight
      // or after an order has already been created.
      if (inFlightRef.current || placedOrder) return;

      const nextErrors = validateCheckoutForm(values, deliveryMethod, paymentMethod);
      if (hasErrors(nextErrors)) {
        setErrors(nextErrors);
        setStatus({
          message: "Please fix the highlighted fields to continue.",
          tone: "error",
        });
        focusInvalid(nextErrors);
        return;
      }

      const cartCheck = validateCartLines(lines);
      if (!cartCheck.ok) {
        setStatus({ message: cartCheck.message, tone: "error" });
        return;
      }

      inFlightRef.current = true;
      setSubmitting(true);
      setErrors({});
      setStatus({ message: "", tone: "" });

      try {
        const payload = buildOrderPayload({
          values,
          deliveryMethod,
          paymentMethod,
          lines,
        });
        const order = await orderService.create(payload);

        // Clear through the context only — storage stays in CartContext's hands.
        clear();
        setPlacedOrder(order);
        setStatus({ message: "Order placed successfully.", tone: "success" });
      } catch (error) {
        // Server messages are already safe — never include credentials.
        setStatus({
          message:
            error.message ||
            "We couldn't place your order just now. Please try again.",
          tone: "error",
        });
      } finally {
        inFlightRef.current = false;
        setSubmitting(false);
      }
    },
    [values, deliveryMethod, paymentMethod, lines, clear, placedOrder, focusInvalid],
  );

  return {
    lines,
    totals,
    progress,
    values,
    errors,
    setValue,
    deliveryMethod,
    setDelivery,
    deliveryOptions,
    paymentMethod,
    setPayment,
    paymentOptions,
    submitting,
    statusMessage: status.message,
    statusTone: status.tone,
    placedOrder,
    handleSubmit,
  };
}
