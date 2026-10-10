import FormField from "../common/FormField";
import { fieldId } from "../../constants/checkout";
import "./CheckoutFields.css";

/**
 * Step 1 — contact details. Pure presentation: values/errors flow in from
 * useCheckoutForm and every change goes back through `onChange(name, value)`.
 * Field ids come from the shared `fieldId` helper so the hook can focus the
 * first invalid control after a failed submit.
 */
export default function ContactInformation({ values, errors, onChange, disabled }) {
  return (
    <div className="checkout-grid">
      <FormField
        id={fieldId("firstName")}
        label="First name"
        value={values.firstName}
        onChange={(v) => onChange("firstName", v)}
        error={errors.firstName}
        required
        autoComplete="given-name"
        placeholder="Aarav"
        disabled={disabled}
      />

      <FormField
        id={fieldId("lastName")}
        label="Last name"
        value={values.lastName}
        onChange={(v) => onChange("lastName", v)}
        error={errors.lastName}
        required
        autoComplete="family-name"
        placeholder="Sharma"
        disabled={disabled}
      />

      <FormField
        id={fieldId("email")}
        label="Email address"
        type="email"
        value={values.email}
        onChange={(v) => onChange("email", v)}
        error={errors.email}
        required
        autoComplete="email"
        placeholder="aarav@example.com"
        disabled={disabled}
      />

      <FormField
        id={fieldId("phone")}
        label="Phone number"
        type="tel"
        value={values.phone}
        onChange={(v) => onChange("phone", v)}
        error={errors.phone}
        required
        autoComplete="tel"
        inputMode="tel"
        placeholder="+91 98765 43210"
        disabled={disabled}
      />
    </div>
  );
}
