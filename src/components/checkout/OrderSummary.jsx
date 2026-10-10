import CartSummary from "../cart/CartSummary";
import Icon from "../common/Icon";
import { formatCurrency } from "../../utils/currency";
import "./OrderSummary.css";

/**
 * Sticky checkout summary: a read-only list of every cart line (image, name,
 * variant, quantity, unit price, line total) followed by the reused
 * CartSummary panel. All numbers are passed in pre-computed from
 * `getCheckoutTotals` — this component never does its own maths and holds no
 * cart state of its own.
 */
export default function OrderSummary({ lines, totals, progress, children }) {
  return (
    <div className="order-summary">
      <section className="order-summary__items" aria-labelledby="order-items-title">
        <h2 id="order-items-title" className="order-summary__title">
          Your order{" "}
          <span className="order-summary__count">
            ({totals.itemCount} {totals.itemCount === 1 ? "item" : "items"})
          </span>
        </h2>

        <ul className="order-summary__list">
          {lines.map((line) => (
            <li key={line.key} className="order-summary__line">
              <div className="order-summary__media">
                {line.image ? (
                  <img
                    className="order-summary__image"
                    src={line.image}
                    alt={line.name}
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div
                    className="order-summary__placeholder"
                    style={{ "--hue": line.accentHue }}
                    aria-hidden="true"
                  >
                    <span>{(line.category || line.name).charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="order-summary__info">
                <p className="order-summary__name">{line.name}</p>
                <p className="order-summary__variant">
                  <span>{line.color}</span>
                  <span aria-hidden="true">·</span>
                  <span>Size {line.size}</span>
                </p>
                <p className="order-summary__unit">
                  {formatCurrency(line.price)} × {line.effectiveQuantity}
                </p>
              </div>

              <p className="order-summary__line-total">
                {formatCurrency(line.lineTotal)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <CartSummary
        totals={totals}
        progress={progress}
        subtotalLabel="Subtotal"
        shippingLabel="Shipping"
        totalLabel="Total"
        note="Final charges are confirmed when your order is placed."
      >
        {children}
      </CartSummary>

      <p className="order-summary__secure">
        <Icon name="shield" size={14} />
        Secure, encrypted checkout
      </p>
    </div>
  );
}
