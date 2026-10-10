import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authService } from "../services/AuthService";
import { storage } from "../utils/storage";

const AuthContext = createContext(null);

// Same key httpClient reads for the `Authorization: Bearer` header. Stored as
// a raw string (not JSON) so the header value stays a clean JWT.
const TOKEN_KEY = "atelier_token";
const USER_KEY = "atelier_user";

function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore write failures (private mode/quota) */
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Whitelist of user fields kept client-side. The server never returns a
 * password, but we belt-and-braces strip anything unexpected before a user
 * object touches state or localStorage.
 */
function pickSafeUser(raw) {
  if (!raw || typeof raw !== "object") return null;
  const { id, firstName, lastName, email, phone, role } = raw;
  return {
    id,
    firstName,
    lastName,
    email,
    phone: phone ?? "",
    role: role ?? "customer",
  };
}

/**
 * Authentication context, backed by the backend AuthService.
 *
 * `login` / `register` call the API, then persist only a JWT (raw, for the
 * HTTP client) and a sanitized profile — never a password. On refresh the
 * user hydrates from storage while the token rides along for API requests.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => pickSafeUser(storage.get(USER_KEY)));

  const persistSession = useCallback((session) => {
    const safeUser = pickSafeUser(session?.user);
    if (session?.token) saveToken(session.token);
    storage.set(USER_KEY, safeUser);
    setUser(safeUser);
    return safeUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const session = await authService.login(credentials);
    return persistSession(session);
  }, [persistSession]);

  const register = useCallback(async (payload) => {
    const session = await authService.register(payload);
    return persistSession(session);
  }, [persistSession]);

  const logout = useCallback(() => {
    clearToken();
    storage.remove(USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
    }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

