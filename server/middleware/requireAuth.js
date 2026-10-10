import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Verifies the `Authorization: Bearer <jwt>` header and attaches
 * `{ id, email, role }` to `req.user`. Invalid or missing tokens never
 * proceed — authentication protections stay exactly as strict as before.
 */
export default function requireAuth(req, res, next) {
  const header = req.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    return next();
  } catch {
    return res
      .status(401)
      .json({ message: "Your session has expired. Please sign in again." });
  }
}
