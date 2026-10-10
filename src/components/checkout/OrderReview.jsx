import Button from "../common/Button";
import Icon from "../common/Icon";
import { formatCurrency } from "../../utils/currency";
import "./OrderReview.css";

/**
 * Final step: a read-only recap of what was entered plus the Place Order
 * submit. The status line is an aria-live region so validation errors,
 * cart/stock problems and the submitting state are announced to assistive
 * tech. The button lives inside the page <form>, so its type is "submit".
 */
export default function OrderReview({
  values,
  delivery,
  payment,
  totals,
  submitting,
  statusMessage,
  statusTone,
}) {
  const address = [
    values.address1,
    values.address2,
    `${values.city} ${values.postalCode}`.trim(),
    values.state,
    values.country,
  ].filter(Boolean);

  return (
    <div className="order-review">
      <dl className="order-review__grid">
        <div className="order-review__group">
          <dt className="order-review__legend">Contact</dt>
          <dd className="order-review__value">
            {[values.firstName, values.lastName].filter(Boolean).join(" ") || "—"}
          </dd>
          <dd className="order-review__meta">{values.email || "—"}</dd>
          <dd className="order-review__meta">{values.phone || "—"}</dd>
        </div>

        <div className="order-review__group">
          <dt className="order-review__legend">Ship to</dt>
          <dd className="order-review__value">
            {address.length > 0 ? address[0] : "—"}
          </dd>
          {address.slice(1).map((line) => (
            <dd key={line} className="order-review__meta">
              {line}
            </dd>
          ))}
        </div>

        <div className="order-review__group">
          <dt className="order-review__legend">Delivery</dt>
          <dd className="order-review__value">
            {delivery ? delivery.label : "Not selected"}
          </dd>
          <dd className="order-review__meta">
            {delivery ? delivery.description : "Choose a delivery method above"}
          </dd>
          <dd className="order-review__meta">
            {delivery
              ? totals.shipping > 0
                ? formatCurrency(totals.shipping)
                : "Free"
              : "—"}
          </dd>
        </div>

        <div className="order-review__group">
          <dt className="order-review__legend">Payment</dt>
          <dd className="order-review__value">
            {payment ? payment.label : "Not selected"}
          </dd>
          <dd className="order-review__meta">
            {payment ? payment.description : "Choose a payment method above"}
          </dd>
        </div>
      </dl>

      <div className="order-review__totals">
        <div className="order-review__total-row">
          <span>Order total</span>
          <strong>{formatCurrency(totals.total)}</strong>
        </div>
        <p className="order-review__hint">
          By placing this order you agree to our terms of sale.
        </p>
      </div>

      <p
        className={
          statusTone === "error"
            ? "order-review__status order-review__status--error"
            : "order-review__status"
        }
        role="status"
        aria-live="polite"
      >
        {statusMessage}
      </p>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={submitting}
        className="order-review__submit"
      >
        {submitting ? (
          <>
            <Icon name="refresh" size={18} className="order-review__spinner" />
            Placing order…
          </>
        ) : (
          <>
            <Icon name="lock" size={18} />
            Place Order
          </>
        )}
      </Button>

      <p className="order-review__secure">
        <Icon name="shield" size={14} />
        Your details are encrypted and never shared.
      </p>
    </div>
  );
}
