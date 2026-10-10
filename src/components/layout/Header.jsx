import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import Icon from "../common/Icon";
import "./layout.css";

const primaryNav = [
  { label: "Home", to: ROUTES.HOME },
  { label: "Shop", to: ROUTES.PRODUCTS },
  { label: "Categories", to: ROUTES.CATEGORIES },
  { label: "Bookings", to: ROUTES.BOOKINGS },
];

const desktopLinkClass = ({ isActive }) =>
  isActive ? "header__link header__link--active" : "header__link";

const mobileLinkClass = ({ isActive }) =>
  isActive
    ? "header__mobile-link header__mobile-link--active"
    : "header__mobile-link";

/**
 * Sticky customer navbar: brand, primary navigation, account actions with
 * live cart/wishlist counts, and a hamburger menu for small screens.
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();

  const accountTo = isAuthenticated ? ROUTES.ACCOUNT : ROUTES.LOGIN;
  const accountLabel = isAuthenticated ? "Account" : "Login";
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === "Escape") closeMenu();
      }}
    >
      <div className="container header__inner">
        <Link to={ROUTES.HOME} className="header__brand" onClick={closeMenu}>
          ATELIER
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={desktopLinkClass}
              end={item.to === ROUTES.HOME}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          <Link
            to={ROUTES.WISHLIST}
            className="header__action"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <Icon name="heart" size={20} />
            <span className="header__action-label">Wishlist</span>
            {wishlistCount > 0 && (
              <span className="header__badge">{wishlistCount}</span>
            )}
          </Link>

          <Link
            to={ROUTES.CART}
            className="header__action"
            aria-label={`Cart, ${itemCount} items`}
          >
            <Icon name="cart" size={20} />
            <span className="header__action-label">Cart</span>
            {itemCount > 0 && <span className="header__badge">{itemCount}</span>}
          </Link>

          <Link to={accountTo} className="header__action">
            <Icon name="user" size={20} />
            <span className="header__action-label">{accountLabel}</span>
          </Link>
        </div>

        <button
          type="button"
          className="header__toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={24} />
        </button>
      </div>

      <div id="mobile-menu" className="header__mobile" hidden={!menuOpen}>
        <nav
          className="container header__mobile-nav"
          aria-label="Mobile navigation"
        >
          {primaryNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={mobileLinkClass}
              end={item.to === ROUTES.HOME}
              onClick={closeMenu}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="header__mobile-actions">
            <Link
              to={ROUTES.WISHLIST}
              className="header__mobile-action"
              onClick={closeMenu}
            >
              <Icon name="heart" size={18} />
              Wishlist
              <span className="header__mobile-count">{wishlistCount}</span>
            </Link>

            <Link
              to={ROUTES.CART}
              className="header__mobile-action"
              onClick={closeMenu}
            >
              <Icon name="cart" size={18} />
              Cart
              <span className="header__mobile-count">{itemCount}</span>
            </Link>

            <Link
              to={accountTo}
              className="header__mobile-action"
              onClick={closeMenu}
            >
              <Icon name="user" size={18} />
              {accountLabel}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
