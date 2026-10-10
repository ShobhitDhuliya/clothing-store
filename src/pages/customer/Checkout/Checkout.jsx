import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import CheckoutSection from "../../../components/checkout/CheckoutSection";
import ContactInformation from "../../../components/checkout/ContactInformation";
import ShippingAddress from "../../../components/checkout/ShippingAddress";
import DeliveryOptions from "../../../components/checkout/DeliveryOptions";
import PaymentOptions from "../../../components/checkout/PaymentOptions";
import OrderReview from "../../../components/checkout/OrderReview";
import OrderSummary from "../../../components/checkout/OrderSummary";
import OrderConfirmation from "../../../components/checkout/OrderConfirmation";
import { ROUTES } from "../../../constants/routes";
import useCheckoutForm from "../../../hooks/useCheckoutForm";
import "./Checkout.css";

/**
 * `/checkout` — the checkout experience.
 *
 * All state lives in `useCheckoutForm`, cart truth stays in CartContext, and
 * every number on screen is derived from `resolveCartLines` + totals helpers.
 * The page renders three mutually exclusive views: order confirmation (after
 * a successful creation), the empty-cart state, or the full checkout form.
 */
export default function Checkout() {
  const {
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
    statusMessage,
    statusTone,
    placedOrder,
    handleSubmit,
  } = useCheckoutForm();

  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "Cart", to: ROUTES.CART },
    { label: "Checkout" },
  ];

  /* 1 — order confirmation replaces the whole flow once an order exists. */
  if (placedOrder) {
    return (
      <div className="container checkout">
        <Breadcrumb items={breadcrumb} />
        <OrderConfirmation order={placedOrder} />
      </div>
    );
  }

  /* 2 — empty cart: no form, no delivery/payment, no Place Order, no redirect. */
  if (lines.length === 0) {
    return (
      <div className="container checkout">
        <Breadcrumb items={breadcrumb} />
        <CheckoutEmptyState />
      </div>
    );
  }

  const delivery = deliveryOptions.find((m) => m.id === deliveryMethod) ?? null;
  const payment = paymentOptions.find((m) => m.id === paymentMethod) ?? null;

  /* 3 — full checkout. */
  return (
    <div className="container checkout">
      <Breadcrumb items={breadcrumb} />

      <header className="checkout__header">
        <h1 className="checkout__title">Checkout</h1>
        <p className="checkout__subtitle">
          Complete your details below — everything updates live in your order
          summary.
        </p>
      </header>

      <form className="checkout__layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout__form">
          <CheckoutSection
            step={1}
            title="Contact information"
            description="We'll send order updates to these details."
          >
            <ContactInformation
              values={values}
              errors={errors}
              onChange={setValue}
              disabled={submitting}
            />
          </CheckoutSection>

          <CheckoutSection
            step={2}
            title="Shipping address"
            description="Where your order should be delivered."
          >
            <ShippingAddress
              values={values}
              errors={errors}
              onChange={setValue}
              disabled={submitting}
            />
          </CheckoutSection>

          <CheckoutSection
            step={3}
            title="Delivery method"
            description="Charges update your total instantly."
          >
            <DeliveryOptions
              options={deliveryOptions}
              value={deliveryMethod}
              onChange={setDelivery}
              disabled={submitting}
            />
            <p
              className="checkout__option-error"
              role="alert"
              aria-live="polite"
            >
              {errors.deliveryMethod}
            </p>
          </CheckoutSection>

          <CheckoutSection
            step={4}
            title="Payment method"
            description="Choose how you'd like to pay."
          >
            <PaymentOptions
              options={paymentOptions}
              value={paymentMethod}
              onChange={setPayment}
              disabled={submitting}
            />
            <p
              className="checkout__option-error"
              role="alert"
              aria-live="polite"
            >
              {errors.paymentMethod}
            </p>
          </CheckoutSection>

          <CheckoutSection
            step={5}
            title="Order review"
            description="Check everything over, then place your order."
          >
            <OrderReview
              values={values}
              delivery={delivery}
              payment={payment}
              totals={totals}
              submitting={submitting}
              statusMessage={statusMessage}
              statusTone={statusTone}
            />
          </CheckoutSection>
        </div>

        <aside className="checkout__aside" aria-label="Order summary">
          <OrderSummary
            lines={lines}
            totals={totals}
            /* Free-shipping progress only makes sense for standard delivery —
               express is always charged, so showing "free" would contradict. */
            progress={deliveryMethod === "express" ? null : progress}
          />
        </aside>
      </form>
    </div>
  );
}

/** Empty-cart state — stays on `/checkout`, no redirect, no order controls. */
function CheckoutEmptyState() {
  return (
    <div className="checkout__empty">
      <span className="checkout__empty-icon">
        <Icon name="cart" size={32} />
      </span>

      <h1 className="checkout__empty-title">Your cart is empty</h1>

      <p className="checkout__empty-text">
        Add some products to your cart before proceeding to checkout.
      </p>

      <div className="checkout__empty-actions">
        <Button to={ROUTES.PRODUCTS} size="lg">
          Continue Shopping
        </Button>
        <Button to={ROUTES.CART} variant="ghost" size="lg">
          Back to Cart
        </Button>
      </div>
    </div>
  );
}
