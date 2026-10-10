/**
 * Central registry of every route path used across the application.
 * Components, layouts and the router import from here so a path is
 * defined in exactly one place.
 */

export const ROUTES = {
  // Public / customer
  HOME: "/",
  CATEGORIES: "/categories",
  CATEGORY: "/categories/:slug",
  PRODUCTS: "/products",
  PRODUCT_DETAILS: "/products/:slug",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAILS: "/orders/:id",
  BOOKINGS: "/bookings",
  MY_BOOKINGS: "/my-bookings",
  WISHLIST: "/wishlist",
  REVIEWS: "/reviews",
  ACCOUNT: "/account",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Admin
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_VARIANTS: "/admin/variants",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_REPORTS: "/admin/reports",
};

export default ROUTES;
