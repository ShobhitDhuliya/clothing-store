import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";
import { WishlistProvider } from "./WishlistContext";
import { UIProvider } from "./UIContext";

/**
 * Single composition point for every global context provider.
 * Keeps main.jsx clean and makes provider order explicit.
 */
export default function AppProviders({ children }) {
  return (
    <UIProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </UIProvider>
  );
}
