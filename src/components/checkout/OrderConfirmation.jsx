import Button from "../common/Button";
import Icon from "../common/Icon";
import { ROUTES } from "../../constants/routes";
import { formatCurrency } from "../../utils/currency";
import { getOrderStatusLabel } from "../../utils/checkout";
import "./OrderConfirmation.css";

/**
 * Order confirmation shown after a successful frontend order creation.
 * Purely presentational: the order object comes from OrderService, the cart
 * has already been cleared through CartContext by the time this renders.
 */
export default function OrderConfirmation({ order }) {
  const { customer, shippingAddress, deliveryMethod, paymentMethod } = order;

  const address = [
    shippingAddress.line1,
    shippingAddress.line2,
    `${shippingAddress.city} ${shippingAddress.postalCode}`.trim(),
    shippingAddress.state,
    shippingAddress.country,
  ].filter(Boolean);

  return (
    <section
      className="order-confirmation"
      aria-labelledby="order-confirmation-title"
      tabIndex={-1}
    >
      <span className="order-confirmation__badge">
        <Icon name="check" size={34} />
      </span>

      <h1 id="order-confirmation-title" className="order-confirmation__title">
        Order placed successfully
      </h1>

      <p className="order-confirmation__lead">
        Thank you, {customer.firstName}! Your order has been received and is
        pending confirmation. A copy has been recorded against{" "}
        <strong>{customer.email}</strong>.
      </p>

      <div className="order-confirmation__card">
        <div className="order-confirmation__hero">
          <div>
            <p className="order-confirmation__label">Order number</p>
            <p className="order-confirmation__number">{order.orderId}</p>
          </div>
          <div className="order-confirmation__hero-right">
            <p className="order-confirmation__label">Order total</p>
            <p className="order-confirmation__amount">
              {formatCurrency(order.total)}
            </p>
            <span className="order-confirmation__status">
              <Icon name="truck" size={14} />
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <dl className="order-confirmation__details">
          <div className="order-confirmation__detail">
            <dt>Contact</dt>
            <dd>
              {[customer.firstName, customer.lastName].filter(Boolean).join(" ")}
            </dd>
            <dd className="order-confirmation__detail-meta">{customer.email}</dd>
            <dd className="order-confirmation__detail-meta">{customer.phone}</dd>
          </div>

          <div className="order-confirmation__detail">
            <dt>Shipping address</dt>
            {address.map((line) => (
              <dd key={line}>{line}</dd>
            ))}
          </div>

          <div className="order-confirmation__detail">
            <dt>Delivery method</dt>
            <dd>{deliveryMethod?.label ?? "—"}</dd>
            <dd className="order-confirmation__detail-meta">
              {deliveryMethod?.description}
            </dd>
            <dd className="order-confirmation__detail-meta">
              {order.shipping > 0 ? formatCurrency(order.shipping) : "Free"}
            </dd>
          </div>

          <div className="order-confirmation__detail">
            <dt>Payment method</dt>
            <dd>{paymentMethod?.label ?? "—"}</dd>
            <dd className="order-confirmation__detail-meta">
              {getOrderStatusLabel(order.status)}
            </dd>
          </div>
        </dl>

        <p className="order-confirmation__note">
          <Icon name="shield" size={14} />
          This order was created on the frontend only — nothing was charged and
          no server was contacted.
        </p>
      </div>

      <div className="order-confirmation__actions">
        <Button to={ROUTES.PRODUCTS} size="lg">
          Continue Shopping
        </Button>
      </div>
    </section>
  );
}
