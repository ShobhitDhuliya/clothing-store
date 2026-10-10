import FormField from "../common/FormField";
import { DEFAULT_COUNTRY, INDIAN_STATES, fieldId } from "../../constants/checkout";
import "./CheckoutFields.css";

/**
 * Step 2 — shipping address. Address line 2 is optional; everything else is
 * required and validated by the shared checkout validators. State uses a
 * select of Indian states (the store ships within India), while Country is a
 * pre-filled text field defaulting to India.
 */
export default function ShippingAddress({ values, errors, onChange, disabled }) {
  return (
    <div className="checkout-grid">
      <div className="checkout-grid__full">
        <FormField
          id={fieldId("address1")}
          label="Address line 1"
          value={values.address1}
          onChange={(v) => onChange("address1", v)}
          error={errors.address1}
          required
          autoComplete="address-line1"
          placeholder="Flat / house no., street"
          disabled={disabled}
        />
      </div>

      <div className="checkout-grid__full">
        <FormField
          id={fieldId("address2")}
          label="Address line 2"
          value={values.address2}
          onChange={(v) => onChange("address2", v)}
          error={errors.address2}
          autoComplete="address-line2"
          placeholder="Landmark, area (optional)"
          disabled={disabled}
        />
      </div>

      <FormField
        id={fieldId("city")}
        label="City"
        value={values.city}
        onChange={(v) => onChange("city", v)}
        error={errors.city}
        required
        autoComplete="address-level2"
        placeholder="Mumbai"
        disabled={disabled}
      />

      <div className="checkout-field">
        <label className="checkout-field__label" htmlFor={fieldId("state")}>
          State
          <span aria-hidden="true"> *</span>
        </label>
        <select
          id={fieldId("state")}
          className={
            errors.state
              ? "checkout-field__select checkout-field__select--invalid"
              : "checkout-field__select"
          }
          value={values.state}
          onChange={(event) => onChange("state", event.target.value)}
          disabled={disabled}
          aria-invalid={errors.state ? "true" : undefined}
          aria-describedby={errors.state ? `${fieldId("state")}-error` : undefined}
        >
          <option value="">Select a state</option>
          {INDIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
        {errors.state && (
          <p id={`${fieldId("state")}-error`} className="checkout-field__error">
            {errors.state}
          </p>
        )}
      </div>

      <FormField
        id={fieldId("postalCode")}
        label="Postal code"
        value={values.postalCode}
        onChange={(v) => onChange("postalCode", v)}
        error={errors.postalCode}
        required
        autoComplete="postal-code"
        inputMode="numeric"
        placeholder="400001"
        disabled={disabled}
      />

      <FormField
        id={fieldId("country")}
        label="Country"
        value={values.country || DEFAULT_COUNTRY}
        onChange={(v) => onChange("country", v)}
        error={errors.country}
        required
        autoComplete="country-name"
        disabled={disabled}
      />
    </div>
  );
}
