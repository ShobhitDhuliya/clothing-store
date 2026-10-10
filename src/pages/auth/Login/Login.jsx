import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../../components/common/Button";
import FormField from "../../../components/common/FormField";
import Icon from "../../../components/common/Icon";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";
import { isRequired, isValidEmail } from "../../../utils/checkout";
import "../auth-form.css";

/**
 * `/login` — customer sign-in. Credentials go through AuthContext →
 * AuthService → backend `POST /auth/login`; the password is never stored,
 * logged, or kept in state after the request. The server answers with a
 * safe message on failure (no technical details).
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // PrivateRoute remembers where the visitor was headed.
  const from = location.state?.from ?? ROUTES.HOME;

  const [values, setValues] = useState({ email: "", password: "" });
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

  const focusInvalid = (nextErrors) => {
    const target = nextErrors.email
      ? "login-email"
      : nextErrors.password
        ? "login-password"
        : null;
    if (target) document.getElementById(target)?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!isRequired(values.email)) {
      nextErrors.email = "Email address is required.";
    } else if (!isValidEmail(values.email)) {
      nextErrors.email = "Enter a valid email address, e.g. name@example.com.";
    }
    if (!isRequired(values.password)) nextErrors.password = "Password is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus({ message: "Please fix the highlighted fields to continue.", tone: "error" });
      focusInvalid(nextErrors);
      return;
    }

    setSubmitting(true);
    setStatus({ message: "", tone: "" });

    try {
      await login({ email: values.email, password: values.password });
      navigate(from, { replace: true });
    } catch (error) {
      // Server messages are already safe — credentials or internals never
      // come back to the browser.
      setStatus({
        message: error.message || "Sign in failed. Please try again.",
        tone: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <header className="auth-form__header">
        <h1 className="auth-form__title">Sign in</h1>
        <p className="auth-form__subtitle">
          Access your orders, wishlist and bookings.
        </p>
      </header>

      <form className="auth-form__form" onSubmit={handleSubmit} noValidate>
        <div className="auth-form__fields">
          <FormField
            id="login-email"
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
            id="login-password"
            label="Password"
            type="password"
            value={values.password}
            onChange={(v) => setValue("password", v)}
            error={errors.password}
            required
            autoComplete="current-password"
            placeholder="Your password"
            disabled={submitting}
          />
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
              Signing in…
            </>
          ) : (
            <>
              <Icon name="lock" size={18} />
              Sign In
            </>
          )}
        </Button>
      </form>

      <p className="auth-form__alt">
        New here? <Link to={ROUTES.REGISTER}>Create an account</Link>
      </p>
      <p className="auth-form__back">
        <Link to={ROUTES.PRODUCTS}>Continue shopping</Link>
      </p>
    </div>
  );
}

