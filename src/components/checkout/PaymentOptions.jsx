import Icon from "../common/Icon";
import { paymentOptionId } from "../../constants/checkout";
import "./CheckoutOptions.css";

/**
 * Step 4 — payment method radio group. Options come from `PAYMENT_METHODS`.
 * "Online payment" is a frontend selection only: when a real gateway lands,
 * PaymentService will branch on the selected id — this component and the
 * order payload contract stay unchanged.
 */
export default function PaymentOptions({ options, value, onChange, disabled }) {
  return (
    <fieldset className="checkout-options" disabled={disabled}>
      <legend className="visually-hidden">Payment method</legend>

      <div className="checkout-options__list">
        {options.map((option) => {
          const id = paymentOptionId(option.id);
          const selected = value === option.id;

          return (
            <label
              key={option.id}
              htmlFor={id}
              className={
                selected
                  ? "checkout-option checkout-option--selected"
                  : "checkout-option"
              }
            >
              <input
                type="radio"
                id={id}
                name="paymentMethod"
                className="checkout-option__input"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
              />

              <span className="checkout-option__body">
                <span className="checkout-option__row">
                  <span className="checkout-option__label">
                    <Icon
                      name={option.online ? "creditCard" : "banknote"}
                      size={16}
                    />
                    {option.label}
                  </span>
                </span>

                <span className="checkout-option__desc">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>

      <p className="checkout-options__note">
        <Icon name="shield" size={14} />
        No payment is processed now — card details will be collected on the
        secure payment step when the payment gateway is connected.
      </p>
    </fieldset>
  );
}
