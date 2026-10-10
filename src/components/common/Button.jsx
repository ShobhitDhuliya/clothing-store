import { Link } from "react-router-dom";
import "./Button.css";

/**
 * Reusable button that renders as a <button>, a router <Link>, or an <a>
 * depending on the props supplied.
 */
export default function Button({
  children,
  to,
  href,
  variant = "primary",
  size = "md",
  fullWidth = false,
  type = "button",
  className = "",
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}