import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { emailService } from "./EmailService.js";
import { userStore } from "../store/UserStore.js";

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{7,17}$/;

/** Status-carrying error so the route layer can answer without leaks. */
export class AuthError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Only safe profile fields leave the server — never passwordHash. */
function toPublicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };
}

/**
 * Auth business flow: validation → bcrypt → JWT → owner notification.
 *
 * Email sending is fire-and-forget: `#notify` guarantees a failed
 * notification can never reject an otherwise successful login/registration —
 * EmailService already logs a safe, credential-redacted server-side error.
 */
class AuthService {
  async register({ firstName, lastName, email, phone, password }) {
    const fn = String(firstName ?? "").trim();
    const ln = String(lastName ?? "").trim();
    const em = String(email ?? "").trim().toLowerCase();
    const ph = String(phone ?? "").trim();
    const pw = String(password ?? "");

    const messages = [];
    if (!fn) messages.push("First name is required.");
    if (!ln) messages.push("Last name is required.");
    if (!em || !EMAIL_PATTERN.test(em)) messages.push("A valid email address is required.");
    if (ph && !PHONE_PATTERN.test(ph)) messages.push("Phone number looks invalid.");
    if (pw.length < MIN_PASSWORD_LENGTH) {
      messages.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    }
    if (pw.length > MAX_PASSWORD_LENGTH) {
      messages.push(`Password must be at most ${MAX_PASSWORD_LENGTH} characters.`);
    }
    if (messages.length > 0) throw new AuthError(400, messages.join(" "));

    if (userStore.findByEmail(em)) {
      throw new AuthError(409, "An account with this email already exists.");
    }

    // The plaintext password exists only as the bcrypt input — never stored.
    const passwordHash = await bcrypt.hash(pw, SALT_ROUNDS);
    let user;
    try {
      user = await userStore.create({
        firstName: fn,
        lastName: ln,
        email: em,
        phone: ph,
        passwordHash,
      });
    } catch (error) {
      if (error.code === "EMAIL_EXISTS") {
        throw new AuthError(409, "An account with this email already exists.");
      }
      throw error;
    }

    this.#notify(() =>
      emailService.sendRegistrationNotification({
        firstName: fn,
        lastName: ln,
        email: em,
        phone: ph,
        at: new Date().toISOString(),
      }),
    );

    return { token: this.#issueToken(user), user: toPublicUser(user) };
  }

  async login({ email, password }, meta = {}) {
    const em = String(email ?? "").trim().toLowerCase();
    const pw = String(password ?? "");
    if (!em || !pw) throw new AuthError(400, "Email and password are required.");

    const user = userStore.findByEmail(em);
    // Identical message for unknown account vs wrong password: no user
    // enumeration through error differences.
    const matches = user ? await bcrypt.compare(pw, user.passwordHash) : false;
    if (!user || !matches) throw new AuthError(401, "Invalid email or password.");

    const token = this.#issueToken(user);

    this.#notify(() =>
      emailService.sendLoginNotification({
        account: user.email,
        at: new Date().toISOString(),
        userAgent: meta.userAgent,
        ip: meta.ip || "",
      }),
    );

    return { token, user: toPublicUser(user) };
  }

  #issueToken(user) {
    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn },
    );
  }

  /** Fire-and-forget wrapper — notifications must never fail the request. */
  #notify(send) {
    try {
      Promise.resolve(send()).catch(() => {
        /* safe error already logged by EmailService */
      });
    } catch {
      /* never let notification problems escape */
    }
  }
}

export const authService = new AuthService();
export default authService;
