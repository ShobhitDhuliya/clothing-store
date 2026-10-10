import { Router } from "express";
import { authService } from "../services/AuthService.js";

const router = Router();

/**
 * POST /api/auth/login
 * Flow: validate credentials → verify bcrypt hash → sign JWT → send the
 * owner notification (fire-and-forget) → safe response. The response and the
 * email never contain the password, hash, or token-in-email.
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const result = await authService.login(
      { email, password },
      {
        // Safely available on the backend only.
        userAgent: req.get("user-agent"),
        ip: req.ip,
      },
    );
    res.json({ message: "Signed in successfully.", ...result });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/register
 * Flow: validate data → bcrypt hash → create user → notify owner → safe
 * response (token + public profile only).
 */
router.post("/register", async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body ?? {};
    const result = await authService.register({
      firstName,
      lastName,
      email,
      phone,
      password,
    });
    res.status(201).json({ message: "Account created successfully.", ...result });
  } catch (error) {
    next(error);
  }
});

export default router;
