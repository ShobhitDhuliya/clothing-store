import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = path.resolve(serverDir, "..");

// Canonical env file lives at the project root (shared with the Vite app);
// an optional `server/.env` can layer backend-only overrides on top. Values
// without the VITE_ prefix are never exposed to the React bundle.
dotenv.config({ path: path.join(rootDir, ".env") });
dotenv.config({ path: path.join(serverDir, ".env") });

const corsOrigins = [
  "https://clothing-store-9ywmu0knm-shobhit-s-team.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

function resolveCorsOrigins() {
  const configured = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origins = [...new Set([...corsOrigins, ...configured])];

  for (const origin of origins) {
    let parsed;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error("CORS_ORIGINS must contain valid HTTP(S) origins.");
    }
    if (!["http:", "https:"].includes(parsed.protocol) || parsed.origin !== origin) {
      throw new Error("CORS_ORIGINS must contain valid HTTP(S) origins without paths.");
    }
  }

  return origins;
}

/**
 * JWT signing secret. Never hardcoded: read from JWT_SECRET. Without one
 * (local dev), an ephemeral random secret keeps the server runnable —
 * sessions simply invalidate on restart.
 */
function resolveJwtSecret() {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be configured when NODE_ENV=production.");
  }
  console.warn(
    "[env] JWT_SECRET is not set — using an ephemeral development secret (sessions reset on restart).",
  );
  return crypto.randomBytes(32).toString("hex");
}

const port = Number(process.env.PORT ?? 5000);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

export const env = {
  port,
  corsOrigins: resolveCorsOrigins(),
  jwtSecret: resolveJwtSecret(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  email: {
    // SMTP configuration — backend only, never sent to the frontend.
    host: process.env.EMAIL_HOST?.trim() ?? "",
    port: Number(process.env.EMAIL_PORT ?? 587),
    user: process.env.EMAIL_USER?.trim() ?? "",
    password: process.env.EMAIL_PASSWORD ?? "",
    from: process.env.EMAIL_FROM?.trim() || process.env.EMAIL_USER?.trim() || "",
    // Owner notices are sent only to the explicitly configured inbox.
    owner: process.env.OWNER_NOTIFICATION_EMAIL?.trim() ?? "",
  },
};

/** True when real SMTP delivery is configured (otherwise: dev dry-run). */
export const isSmtpConfigured = Boolean(
  env.email.host && env.email.user && env.email.password,
);

export default env;
