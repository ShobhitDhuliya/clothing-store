import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import "./layout.css";

const adminNav = [
  { label: "Dashboard", to: ROUTES.ADMIN_DASHBOARD },
  { label: "Products", to: ROUTES.ADMIN_PRODUCTS },
  { label: "Categories", to: ROUTES.ADMIN_CATEGORIES },
  { label: "Variants", to: ROUTES.ADMIN_VARIANTS },
  { label: "Inventory", to: ROUTES.ADMIN_INVENTORY },
  { label: "Orders", to: ROUTES.ADMIN_ORDERS },
  { label: "Bookings", to: ROUTES.ADMIN_BOOKINGS },
  { label: "Customers", to: ROUTES.ADMIN_CUSTOMERS },
  { label: "Coupons", to: ROUTES.ADMIN_COUPONS },
  { label: "Reviews", to: ROUTES.ADMIN_REVIEWS },
  { label: "Reports", to: ROUTES.ADMIN_REPORTS },
];

const linkClass = ({ isActive }) =>
  isActive ? "sidebar__link sidebar__link--active" : "sidebar__link";

/** Persistent navigation for the admin area. */
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">ATELIER · Admin</div>
      <nav className="sidebar__nav" aria-label="Admin navigation">
        {adminNav.map((item) => (
          <NavLink key={item.to} to={item.to} className={linkClass}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
