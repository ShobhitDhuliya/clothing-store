/** Central list of REST paths, relative to the HTTP client's base URL. */
export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    me: "/auth/me",
  },
  products: "/products",
  categories: "/categories",
  variants: "/variants",
  inventory: "/inventory",
  cart: "/cart",
  orders: "/orders",
  bookings: "/bookings",
  wishlist: "/wishlist",
  reviews: "/reviews",
  coupons: "/coupons",
  customers: "/customers",
  reports: "/reports",
};

export default ENDPOINTS;
