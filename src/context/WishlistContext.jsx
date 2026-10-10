import { createContext, useContext, useMemo, useState } from "react";

const WishlistContext = createContext(null);

/** Wishlist context scaffold. Stores product ids for now. */
export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      has: (id) => ids.includes(id),
      toggle: (id) =>
        setIds((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        ),
    }),
    [ids],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
