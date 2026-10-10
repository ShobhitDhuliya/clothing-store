import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const defaultDataDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "data",
);
const dataDir = process.env.STORE_DATA_DIR?.trim()
  ? path.resolve(process.env.STORE_DATA_DIR.trim())
  : defaultDataDir;
const usersFile = path.join(dataDir, "users.json");

/**
 * File-backed user store for the dev backend. Persists bcrypt HASHES only —
 * plaintext passwords never touch disk, logs, or an API response. The shape
 * is deliberately repository-like, so swapping in MySQL behind the same
 * `findByEmail` / `create` contract needs no AuthService changes.
 */
class UserStore {
  constructor() {
    /** Keyed by lowercased email. */
    this.users = new Map();
    this.writeQueue = Promise.resolve();
  }

  /** Load persisted users; a missing file simply means first run. */
  async load() {
    try {
      const raw = await fs.readFile(usersFile, "utf8");
      for (const record of JSON.parse(raw)) {
        this.users.set(record.email, record);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        // Safe log: file-level problems only, never user secrets.
        console.error(`[UserStore] Could not read users file: ${error.message}`);
      }
    }
  }

  findByEmail(email) {
    return this.users.get(String(email ?? "").trim().toLowerCase()) ?? null;
  }

  create({ firstName, lastName, email, phone, passwordHash, role = "customer" }) {
    const operation = async () => {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (this.users.has(normalizedEmail)) {
        const error = new Error("An account with this email already exists.");
        error.code = "EMAIL_EXISTS";
        throw error;
      }

      const record = {
        id: randomUUID(),
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        email: normalizedEmail,
        phone: String(phone ?? "").trim(),
        passwordHash, // bcrypt hash — the plaintext password is never stored
        role,
        createdAt: new Date().toISOString(),
      };

      this.users.set(record.email, record);
      try {
        await this.#persist();
      } catch (error) {
        this.users.delete(record.email);
        throw error;
      }
      return record;
    };

    const result = this.writeQueue.then(operation, operation);
    this.writeQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  async #persist() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(usersFile, JSON.stringify([...this.users.values()], null, 2), "utf8");
  }
}

export const userStore = new UserStore();
// Top-level await is fine in ESM: routes never see a half-loaded store.
await userStore.load();
