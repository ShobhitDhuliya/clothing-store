import Icon from "../common/Icon";
import { formatCurrency } from "../../utils/currency";
import "./CartSummary.css";

/**
 * Order summary panel used by the cart (and later checkout): free-shipping
 * progress, item count, subtotal, savings, the shipping estimate and the
 * final estimated total. Action buttons are injected as children.
 *
 * Every number arrives pre-computed from `utils/cart` so this stays purely
 * presentational.
 */
export default function CartSummary({
  totals,
  progress,
  subtotalLabel = "Items",
  shippingLabel = "Shipping estimate",
  totalLabel = "Estimated total",
  note = "Shipping is an estimate. Taxes and the final total are confirmed at checkout.",
  children,
}) {
  const { itemCount, subtotal, savings, shipping, total } = totals;
  const isFree = shipping === 0;

  return (
    <aside className="cart-summary" aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className="cart-summary__title">
        Order Summary
      </h2>

      {progress && (
        <div
          className={
            progress.unlocked
              ? "cart-summary__shipping cart-summary__shipping--free"
              : "cart-summary__shipping"
          }
        >
          <p className="cart-summary__shipping-text">
            <Icon name="truck" size={16} />
            {progress.unlocked
              ? "You've unlocked free shipping!"
              : `Spend ${formatCurrency(progress.remaining)} more for free shipping`}
          </p>

          <div
            className="cart-summary__progress"
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progress toward free shipping"
          >
            <span
              className="cart-summary__progress-bar"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <p className="cart-summary__shipping-meta">
            {formatCurrency(subtotal)} of {formatCurrency(progress.threshold)}
          </p>
        </div>
      )}

      <dl className="cart-summary__rows">
        <div className="cart-summary__row">
          <dt>
            {subtotalLabel} <span className="cart-summary__count">({itemCount})</span>
          </dt>
          <dd>{formatCurrency(subtotal)}</dd>
        </div>

        {savings > 0 && (
          <div className="cart-summary__row cart-summary__row--savings">
            <dt>You save</dt>
            <dd>{formatCurrency(savings)}</dd>
          </div>
        )}

        <div className="cart-summary__row">
          <dt>{shippingLabel}</dt>
          <dd className={isFree ? "cart-summary__free" : undefined}>
            {isFree ? "Free" : formatCurrency(shipping)}
          </dd>
        </div>

        <div className="cart-summary__row cart-summary__row--total">
          <dt>{totalLabel}</dt>
          <dd>{formatCurrency(total)}</dd>
        </div>
      </dl>

      {note && <p className="cart-summary__note">{note}</p>}

      <div className="cart-summary__actions">{children}</div>
    </aside>
  );
}