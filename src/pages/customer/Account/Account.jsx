import { Link, useNavigate } from "react-router-dom";
import Breadcrumb from "../../../components/common/Breadcrumb";
import Button from "../../../components/common/Button";
import Icon from "../../../components/common/Icon";
import { ROUTES } from "../../../constants/routes";
import { useAuth } from "../../../context/AuthContext";
import "./Account.css";

/**
 * `/account` — signed-in profile summary with quick links and sign-out.
 * The user object comes from AuthContext (sanitized at login time; the
 * password never reaches the client).
 */
export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const firstName = user?.firstName ?? "";
  const lastName = user?.lastName ?? "";
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

  const quickLinks = [
    { to: ROUTES.ORDERS, label: "My Orders", icon: "truck", hint: "Track and manage orders" },
    { to: ROUTES.MY_BOOKINGS, label: "My Bookings", icon: "calendar", hint: "View or cancel appointments" },
    { to: ROUTES.BOOKINGS, label: "Book an Appointment", icon: "calendar", hint: "Reserve a product or fitting" },
    { to: ROUTES.WISHLIST, label: "Wishlist", icon: "heart", hint: "Items you saved for later" },
    { to: ROUTES.CART, label: "Cart", icon: "cart", hint: "Review items before checkout" },
  ];

  const breadcrumb = [
    { label: "Home", to: ROUTES.HOME },
    { label: "My Account" },
  ];

  return (
    <div className="container account">
      <Breadcrumb items={breadcrumb} />

      <header className="account__header">
        <h1 className="account__title">My Account</h1>
        <p className="account__subtitle">
          Your profile, shortcuts and session controls.
        </p>
      </header>

      <div className="account__grid">
        <section className="account-card" aria-labelledby="account-profile">
          <div className="account-card__avatar" aria-hidden="true">
            {initials}
          </div>
          <h2 id="account-profile" className="account-card__name">
            {[firstName, lastName].filter(Boolean).join(" ") || "Customer"}
          </h2>
          <dl className="account-card__details">
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{user?.phone || "Not provided"}</dd>
            </div>
            <div>
              <dt>Account type</dt>
              <dd className="account-card__role">{user?.role ?? "customer"}</dd>
            </div>
          </dl>

          <Button
            variant="ghost"
            fullWidth
            onClick={handleLogout}
            className="account-card__logout"
          >
            <Icon name="lock" size={16} />
            Sign out
          </Button>
        </section>

        <nav className="account-card account-card--links" aria-label="Account shortcuts">
          <h2 className="account-card__heading">Quick links</h2>
          <ul className="account-links">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="account-link">
                  <span className="account-link__icon" aria-hidden="true">
                    <Icon name={link.icon} size={18} />
                  </span>
                  <span className="account-link__body">
                    <span className="account-link__label">{link.label}</span>
                    <span className="account-link__hint">{link.hint}</span>
                  </span>
                  <Icon name="arrowRight" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
