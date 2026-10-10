import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import FormField from "../../../components/common/FormField";
import Icon from "../../../components/common/Icon";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";
import { isRequired, isValidEmail, isValidIndianPhone } from "../../../utils/checkout";
import "../auth-form.css";

/**
 * `/register` — new customer sign-up. Data goes through AuthContext →
 * AuthService → backend `POST /auth/register`, where the password is hashed
 * with bcrypt before storage. The plaintext password never reaches
 * localStorage, logs, notification emails or the API response.
 */
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? ROUTES.HOME;

  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ message: "", tone: "" });
  const [submitting, setSubmitting] = useState(false);

  const setValue = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    const v = (name) => String(values[name] ?? "").trim();

    if (!isRequired(v("firstName"))) nextErrors.firstName = "First name is required.";
    if (!isRequired(v("lastName"))) nextErrors.lastName = "Last name is required.";

    if (!isRequired(v("email"))) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(v("email"))) {
      nextErrors.email = "Enter a valid email address, e.g. name@example.com.";
    }

    // Phone is optional, but must be a valid Indian number when provided.
    if (isRequired(v("phone")) && !isValidIndianPhone(v("phone"))) {
      nextErrors.phone =
        "Enter a valid 10-digit Indian mobile number, e.g. 9876543210 or +91 9876543210.";
    }

    if (!isRequired(v("password"))) {
      nextErrors.password = "Password is required.";
    } else if (v("password").length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    return nextErrors;
  };

  const focusInvalid = (nextErrors) => {
    const order = [
      ["firstName", "register-firstName"],
      ["lastName", "register-lastName"],
      ["email", "register-email"],
      ["phone", "register-phone"],
      ["password", "register-password"],
    ];
    const hit = order.find(([key]) => nextErrors[key]);
    if (hit) document.getElementById(hit[1])?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ message: "Please fix the highlighted fields to continue.", tone: "error" });
      focusInvalid(nextErrors);
      return;
    }

    setSubmitting(true);
    setStatus({ message: "", tone: "" });

    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
      });
      // Drop the password from component state immediately after the request.
      setValues((prev) => ({ ...prev, password: "" }));
      navigate(from, { replace: true });
    } catch (error) {
      setStatus({
        message: error.message || "Registration failed. Please try again.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="auth-form">
      <header className="auth-form__header">
        <h1 className="auth-form__title">Create Account</h1>
        <p className="auth-form__subtitle">
          Join the store to track orders, bookings and more.
        </p>
      </header>

      <form className="auth-form__form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields auth-form__fields--grid">
          <FormField
            id="register-firstName"
            label="First name"
            value={values.firstName}
            onChange={(v) => setValue("firstName", v)}
            error={errors.firstName}
            required
            autoComplete="given-name"
            placeholder="Aarav"
            disabled={submitting}
          />
          <FormField
            id="register-lastName"
            label="Last name"
            value={values.lastName}
            onChange={(v) => setValue("lastName", v)}
            error={errors.lastName}
            required
            autoComplete="family-name"
            placeholder="Sharma"
            disabled={submitting}
          />
        </div>

        <div className="auth-form__fields">
          <FormField
            id="register-email"
            label="Email address"
            type="email"
            value={values.email}
            onChange={(v) => setValue("email", v)}
            error={errors.email}
            required
            autoComplete="email"
            placeholder="aarav@example.com"
            disabled={submitting}
          />

          <FormField
            id="register-phone"
            label="Phone (optional)"
            type="tel"
            value={values.phone}
            onChange={(v) => setValue("phone", v)}
            error={errors.phone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="+91 98765 43210"
            disabled={submitting}
          />

          <FormField
            id="register-password"
            label="Password"
            type="password"
            value={values.password}
            onChange={(v) => setValue("password", v)}
            error={errors.password}
            required
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            disabled={submitting}
          />
          <p className="auth-form__hint">
            Use at least 8 characters. Your password is hashed securely and
            never shared or emailed.
          </p>
        </div>

        <p
          className={
            status.tone === "error"
              ? "auth-form__status auth-form__status--error"
              : "auth-form__status"
          }
          role="alert"
          aria-live="polite"
        >
          {status.message}
        </p>

        <Button type="submit" size="lg" fullWidth disabled={submitting}>
          {submitting ? (
            <>
              <Icon name="refresh" size={18} className="auth-form__spinner" />
              Creating account…
            </>
          ) : (
            <>
              <Icon name="user" size={18} />
              Create Account
            </>
          )}
        </Button>
      </form>

      <p className="auth-form__alt">
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </p>
      <p className="auth-form__back">
        <Link to={ROUTES.PRODUCTS}>Continue shopping</Link>
      </p>
    </div>
  );
}

