import { createContext, useContext, useMemo, useState } from "react";

const UIContext = createContext(null);

/** Global UI context scaffold: lightweight toast queue. */
export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const value = useMemo(
    () => ({
      toasts,
      notify: (message) =>
        setToasts((prev) => [...prev, { id: Date.now(), message }]),
      dismiss: (id) =>
        setToasts((prev) => prev.filter((toast) => toast.id !== id)),
    }),
    [toasts],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within a UIProvider");
  return ctx;
}
