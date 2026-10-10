import { Link, Outlet } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import "./layouts.css";

/**
 * Centered shell for the login / register pages.
 */
export default function AuthLayout() {
  return (
    <div className="layout layout--auth">
      <div className="auth-card">
        <Link to={ROUTES.HOME} className="auth-card__brand">
          ATELIER
        </Link>
        <Outlet />
      </div>
    </div>
  );
}
