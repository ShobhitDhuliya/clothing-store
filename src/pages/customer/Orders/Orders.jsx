import { useState } from "react";
import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import { ORDER_STATUS } from "../../../constants/orderStatus";
import { ROUTES } from "../../../constants/routes";
import useFetch from "../../../hooks/useFetch";
import { orderService } from "../../../services/OrderService";
import { getOrderStatusLabel } from "../../../utils/checkout";
import { formatCurrency } from "../../../utils/currency";
import formatDate from "../../../utils/formatDate";
import "./Orders.css";

const CANCELLABLE = new Set([ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED]);

/**
 * `/orders` — My Orders history (private route). Data comes from the real
 * backend, scoped to the signed-in customer by the server. Customers can
 * cancel their own pending/confirmed orders; every transition is re-checked
 * server-side.
 */
export default function Orders() {
  const { data, loading, error, refetch } = useFetch(
    () => orderService.listOwn(),
    [],
  );
  const orders = data ?? [];

  const [busyId, setBusyId] = useState(null);
  const [status, setStatus] = useState({ message: "", tone: "" });

  const handleCancel = async (orderId) => {
    if (busyId) return; // double-click guard
    setBusyId(orderId);
    setStatus({ message: "", tone: "" });
    try {
      await orderService.changeStatus(orderId, ORDER_STATUS.CANCELLED);
      setStatus({
        message: `Order ${orderId} has been cancelled.`,
        tone: "success",
      });
      await refetch();
    } catch (err) {
      setStatus({
        message: err.message || "Couldn't cancel the order. Please try again.",
        tone: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "My Orders" },
  ];

  return (
    <div className="container orders">
      <Breadcrumb items={breadcrumb} />

      <header className="orders__header">
        <h1 className="orders__title">My Orders</h1>
        <p className="orders__subtitle">
          Track deliveries, view details and cancel orders that haven&apos;t
          shipped yet.
        </p>
      </header>

      <p
        className={
          status.tone === "error"
            ? "orders__status orders__status--error"
            : "orders__status"
        }
        role="status"
        aria-live="polite"
      >
        {status.message}
      </p>

      {loading && <p className="orders__loading">Loading your orders…</p>}

      {!loading && error && (
        <div className="orders__empty">
          <span className="orders__empty-icon">
            <Icon name="close" size={28} />
          </span>
          <h2 className="orders__empty-title">Couldn&apos;t load your orders</h2>
          <p className="orders__empty-text">{error.message}</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="orders__empty">
          <span className="orders__empty-icon">
            <Icon name="banknote" size={30} />
          </span>
          <h2 className="orders__empty-title">No orders yet</h2>
          <p className="orders__empty-text">
            When you place an order it will appear here with live status
            tracking.
          </p>
          <div className="orders__empty-actions">
            <Button to={ROUTES.PRODUCTS} size="lg">
              Continue Shopping
            </Button>
            <Button to={ROUTES.HOME} variant="ghost" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <ul className="orders__list">
          {orders.map((order) => (
            <li key={order.orderId} className="order-card">
              <header className="order-card__head">
                <div>
                  <p className="order-card__label">Order number</p>
                  <p className="order-card__id">{order.orderId}</p>
                </div>
                <div className="order-card__head-right">
                  <span
                    className={`order-card__badge order-card__badge--${order.status}`}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <p className="order-card__date">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </header>

              <ul className="order-card__items">
                {order.items?.map((item) => (
                  <li key={item.variantKey} className="order-card__item">
                    <span className="order-card__item-name">{item.name}</span>
                    <span className="order-card__item-variant">
                      {item.color} / {item.size}
                    </span>
                    <span className="order-card__item-qty">
                      Qty {item.quantity}
                    </span>
                    <span className="order-card__item-total">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="order-card__totals">
                <span>
                  Subtotal {formatCurrency(order.subtotal)} · Shipping{" "}
                  {order.shipping > 0 ? formatCurrency(order.shipping) : "Free"}
                </span>
                <strong>Total {formatCurrency(order.total)}</strong>
              </div>

              <dl className="order-card__meta">
                <div className="order-card__meta-group">
                  <dt>Deliver to</dt>
                  <dd>
                    {[
                      order.shippingAddress?.line1,
                      order.shippingAddress?.line2,
                      `${order.shippingAddress?.city ?? ""} ${order.shippingAddress?.postalCode ?? ""}`.trim(),
                      order.shippingAddress?.state,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>

                <div className="order-card__meta-group">
                  <dt>Delivery</dt>
                  <dd>{order.deliveryMethod?.label ?? "—"}</dd>
                  <dd className="order-card__meta-muted">
                    {order.deliveryMethod?.description}
                  </dd>
                </div>

                <div className="order-card__meta-group">
                  <dt>Payment</dt>
                  <dd>{order.paymentMethod?.label ?? "—"}</dd>
                  <dd className="order-card__meta-muted">
                    {order.paymentStatus}
                  </dd>
                </div>
              </dl>

              {CANCELLABLE.has(order.status) && (
                <div className="order-card__actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busyId === order.orderId}
                    onClick={() => handleCancel(order.orderId)}
                  >
                    {busyId === order.orderId
                      ? "Cancelling…"
                      : "Cancel order"}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

