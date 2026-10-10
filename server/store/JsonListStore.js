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

/**
 * Generic file-backed list store keyed by a stable reference (orderId /
 * bookingId). Mirrors UserStore's repository shape so a MySQL swap later
 * only changes these four methods. Records contain no secrets — they are
 * safe to persist as JSON (gitignored runtime data).
 */
class JsonListStore {
  constructor(fileName, keyOf) {
    this.file = path.join(dataDir, fileName);
    this.keyOf = keyOf;
    this.items = new Map();
  }

  async load() {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      for (const record of JSON.parse(raw)) {
        this.items.set(this.keyOf(record), record);
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(
          `[Store] Could not read ${path.basename(this.file)}: ${error.message}`,
        );
      }
    }
  }

  findById(id) {
    return this.items.get(String(id ?? "")) ?? null;
  }

  list() {
    return [...this.items.values()];
  }

  async save(record) {
    this.items.set(this.keyOf(record), record);
    await this.#persist();
    return record;
  }

  async #persist() {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(this.list(), null, 2), "utf8");
  }
}

export const orderStore = new JsonListStore("orders.json", (r) => r.orderId);
export const bookingStore = new JsonListStore("bookings.json", (r) => r.bookingId);

// Top-level await is fine in ESM: routes never see a half-loaded store.
await Promise.all([orderStore.load(), bookingStore.load()]);
