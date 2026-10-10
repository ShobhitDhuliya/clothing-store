import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";
import AuthLayout from "../layouts/AuthLayout";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import PagePlaceholder from "../components/common/PagePlaceholder";

/* Customer pages */
import Home from "../pages/customer/Home/Home";
import Categories from "../pages/customer/Categories/Categories";
import ProductList from "../pages/customer/ProductList/ProductList";
import ProductDetails from "../pages/customer/ProductDetails/ProductDetails";
import Cart from "../pages/customer/Cart/Cart";
import Checkout from "../pages/customer/Checkout/Checkout";
import Orders from "../pages/customer/Orders/Orders";
import Bookings from "../pages/customer/Bookings/Bookings";
import MyBookings from "../pages/customer/MyBookings/MyBookings";
import Wishlist from "../pages/customer/Wishlist/Wishlist";
import Reviews from "../pages/customer/Reviews/Reviews";
import Account from "../pages/customer/Account/Account";

/* Auth pages */
import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";

/* Admin pages */
import Dashboard from "../pages/admin/Dashboard/Dashboard";
import AdminProducts from "../pages/admin/Products/Products";
import AdminCategories from "../pages/admin/Categories/Categories";
import AdminVariants from "../pages/admin/Variants/Variants";
import AdminInventory from "../pages/admin/Inventory/Inventory";
import AdminOrders from "../pages/admin/Orders/Orders";
import AdminBookings from "../pages/admin/Bookings/Bookings";
import AdminCustomers from "../pages/admin/Customers/Customers";
import AdminCoupons from "../pages/admin/Coupons/Coupons";
import AdminReviews from "../pages/admin/Reviews/Reviews";
import AdminReports from "../pages/admin/Reports/Reports";

/**
 * Application route table. Layouts wrap groups of routes so shared chrome
 * (header/footer or sidebar) renders once per section.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public customer area */}
      <Route element={<CustomerLayout />}>
        <Route index element={<Home />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:slug" element={<ProductList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/:slug" element={<ProductDetails />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />

        {/* Authenticated customer area */}
        <Route element={<PrivateRoute />}>
          <Route path="orders" element={<Orders />} />
          <Route path="my-bookings" element={<MyBookings />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="account" element={<Account />} />
        </Route>
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Admin */}
      <Route path="admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="variants" element={<AdminVariants />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<PagePlaceholder title="404" description="Page not found" />}
      />
    </Routes>
  );
}
