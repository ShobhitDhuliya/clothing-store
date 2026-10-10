import Icon from "../common/Icon";
import { formatCurrency } from "../../utils/currency";
import { deliveryOptionId } from "../../constants/checkout";
import "./CheckoutOptions.css";

/**
 * Step 3 — delivery method radio group. Options and pricing arrive from
 * `DELIVERY_METHODS` + the shared shipping calculator (never hard-coded
 * here), so the summary total updates the instant a choice changes.
 */
export default function DeliveryOptions({ options, value, onChange, disabled }) {
  return (
    <fieldset className="checkout-options" disabled={disabled}>
      <legend className="visually-hidden">Delivery method</legend>

      <div className="checkout-options__list">
        {options.map((option) => {
          const id = deliveryOptionId(option.id);
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
                name="deliveryMethod"
                className="checkout-option__input"
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
              />

              <span className="checkout-option__body">
                <span className="checkout-option__row">
                  <span className="checkout-option__label">{option.label}</span>
                  <span
                    className={
                      option.free
                        ? "checkout-option__price checkout-option__price--free"
                        : "checkout-option__price"
                    }
                  >
                    {option.free ? "Free" : formatCurrency(option.charge)}
                  </span>
                </span>

                <span className="checkout-option__desc">
                  <Icon name="truck" size={14} />
                  {option.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
