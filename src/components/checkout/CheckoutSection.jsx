import "./CheckoutSection.css";

/**
 * Numbered card used for each checkout step (contact, address, delivery,
 * payment, review). Keeps heading semantics accessible via aria-labelledby.
 */
export default function CheckoutSection({ step, title, description, children }) {
  const headingId = `checkout-section-${step}`;

  return (
    <section className="checkout-section" aria-labelledby={headingId}>
      <header className="checkout-section__header">
        <span className="checkout-section__step" aria-hidden="true">
          {step}
        </span>
        <div>
          <h2 id={headingId} className="checkout-section__title">
            {title}
          </h2>
          {description && (
            <p className="checkout-section__desc">{description}</p>
          )}
        </div>
      </header>

      <div className="checkout-section__body">{children}</div>
    </section>
  );
}
