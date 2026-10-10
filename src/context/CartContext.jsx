import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CART_STORAGE_KEY } from "../constants/cart";
import { getCartLineKey, getCartSubtotal, mergeCartItem } from "../utils/cart";
import { storage } from "../utils/storage";

const CartContext = createContext(null);

/** Upper bound for the quantity stepper when a line has no known stock. */
const MAX_LINE_QUANTITY = 99;

/**
 * Cart state for the storefront. Each line references a specific product
 * variant (id, colour, size) so stock stays per-variant, and the cart is
 * persisted to localStorage so it survives a refresh.
 *
 * All maths lives in `utils/cart`; this provider only owns the state.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => storage.get(CART_STORAGE_KEY, []));

  useEffect(() => {
    storage.set(CART_STORAGE_KEY, items);
  }, [items]);

  const addItem = useCallback((item) => {
    setItems((prev) => mergeCartItem(prev, item));
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => getCartLineKey(item) !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const next = Math.min(Math.max(1, Number(quantity) || 1), MAX_LINE_QUANTITY);

    setItems((prev) =>
      prev.map((item) =>
        getCartLineKey(item) === id ? { ...item, quantity: next } : item,
      ),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: getCartSubtotal(items),
      isEmpty: items.length === 0,
      maxLineQuantity: MAX_LINE_QUANTITY,
      addItem,
      removeItem,
      updateQuantity,
      clear,
    }),
    [items, addItem, removeItem, updateQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
