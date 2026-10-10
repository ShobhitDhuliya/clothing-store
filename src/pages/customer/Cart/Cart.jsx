import { useMemo, useState } from "react";
import CartItem from "../../../components/cart/CartItem";
import CartSummary from "../../../components/cart/CartSummary";
import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import { ROUTES } from "../../../constants/routes";
import { useCart } from "../../../context/CartContext";
import { products } from "../../../data/products";
import {
  getCartTotals,
  getFreeShippingProgress,
  resolveCartLines,
} from "../../../utils/cart";
import "./Cart.css";

/**
 * `/cart` — the customer cart.
 *
 * This page holds no cart state of its own: lines come from `CartContext`,
 * are enriched with live catalogue/stock data via `resolveCartLines`, and
 * every number on screen is derived by `getCartTotals`. Handlers only forward
 * actions back to the context and announce them for assistive tech.
 */
export default function Cart() {
  const { items, updateQuantity, removeItem, clear } = useCart();
  const [feedback, setFeedback] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const lines = useMemo(() => resolveCartLines(items, products), [items]);
  const totals = useMemo(() => getCartTotals(lines), [lines]);
  const progress = getFreeShippingProgress(totals.subtotal);

  const handleQuantityChange = (key, next) => {
    updateQuantity(key, next);
    setFeedback(`Quantity updated to ${next}.`);
  };

  const handleRemove = (key, name) => {
    removeItem(key);
    setFeedback(`${name} was removed from your cart.`);
    setConfirmClear(false);
  };

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }

    clear();
    setConfirmClear(false);
    setFeedback("Your cart has been cleared.");
  };

  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Cart" },
  ];

  /* Empty state — no checkout controls are rendered without items. */
  if (items.length === 0) {
    return (
      <div className="container cart">
        <Breadcrumb items={breadcrumb} />
        <CartFeedback message={feedback} />

        <div className="cart__empty">
          <span className="cart__empty-icon">
            <Icon name="cart" size={32} />
          </span>

          <h1 className="cart__empty-title">Your cart is empty</h1>

          <p className="cart__empty-text">
            Nothing here yet. Browse the shop and add something you love — it
            will show up right away.
          </p>

          <div className="cart__empty-actions">
            <Button to={ROUTES.PRODUCTS} size="lg">
              Continue Shopping
            </Button>
            <Button to={ROUTES.HOME} variant="ghost" size="lg">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container cart">
      <Breadcrumb items={breadcrumb} />
      <CartFeedback message={feedback} />

      <header className="cart__header">
        <div>
          <h1 className="cart__title">Shopping Cart</h1>
          <p className="cart__count">
            {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <button
          type="button"
          className={
            confirmClear ? "cart__clear cart__clear--confirm" : "cart__clear"
          }
          onClick={handleClear}
        >
          <Icon name="trash" size={16} />
          {confirmClear ? "Confirm clear" : "Clear cart"}
        </button>
      </header>

      {confirmClear && (
        <p className="cart__confirm" role="status">
          Remove all {totals.itemCount} items from your cart?{" "}
          <button
            type="button"
            className="cart__confirm-cancel"
            onClick={() => setConfirmClear(false)}
          >
            Cancel
          </button>
        </p>
      )}

      <div className="cart__layout">
        <section className="cart__items" aria-label="Cart items">
          <ul className="cart__list">
            {lines.map((line) => (
              <CartItem
                key={line.key}
                line={line}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemove}
              />
            ))}
          </ul>

          <div className="cart__footer-actions">
            <Button to={ROUTES.PRODUCTS} variant="ghost">
              Continue Shopping
            </Button>
          </div>
        </section>

        <div className="cart__aside">
          <CartSummary totals={totals} progress={progress}>
            <Button to={ROUTES.CHECKOUT} size="lg" fullWidth>
              Proceed to Checkout
            </Button>

            <p className="cart-summary__secure">
              <Icon name="shield" size={14} />
              Secure, encrypted checkout
            </p>
          </CartSummary>
        </div>
      </div>
    </div>
  );
}

/** Polite live region so remove/update/clear actions are announced. */
function CartFeedback({ message }) {
  return (
    <p className="cart__feedback" role="status" aria-live="polite">
      {message}
    </p>
  );
}
