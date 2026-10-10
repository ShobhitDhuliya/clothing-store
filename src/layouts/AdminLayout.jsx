import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import "./layouts.css";

/**
 * Shell for the admin area: a persistent sidebar plus the routed admin page.
 */
export default function AdminLayout() {
  return (
    <div className="layout layout--admin">
      <Sidebar />
      <main className="layout__main layout__main--admin">
        <Outlet />
      </main>
    </div>
  );
}
