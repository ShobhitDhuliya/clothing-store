import { Outlet } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "./layouts.css";

/**
 * Shell for every customer-facing page.
 * Renders the shared header/footer and the matched page inside <Outlet />.
 */
export default function CustomerLayout() {
  return (
    <div className="layout layout--customer">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
