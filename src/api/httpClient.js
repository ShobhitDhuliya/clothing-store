const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : "https://clothing-store-api-lzqd.onrender.com/api";

function normalizeApiBaseUrl(baseUrl) {
  const withoutTrailingSlashes = baseUrl.trim().replace(/\/+$/, "");
  const withoutRepeatedApiSuffix = withoutTrailingSlashes.replace(
    /(?:\/api)+$/i,
    "",
  );
  return `${withoutRepeatedApiSuffix}/api`;
}

const BASE_URL = normalizeApiBaseUrl(
  configuredBaseUrl || DEFAULT_API_BASE_URL,
);

/**
 * Thin wrapper around fetch — the single place where auth headers, JSON
 * parsing and error normalisation happen. Swap the mock/real backend here
 * without touching any component or service.
 */
class HttpClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  get token() {
    return localStorage.getItem("atelier_token");
  }

  async request(path, { method = "GET", body, headers = {}, ...rest } = {}) {
    const endpoint = `/${path.replace(/^\/+/, "").replace(/^(?:api\/)+/i, "")}`;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      const message = payload?.message ?? `Request failed (${response.status})`;
      throw new Error(message);
    }

    return payload;
  }

  get(path) {
    return this.request(path);
  }

  post(path, body) {
    return this.request(path, { method: "POST", body });
  }

  put(path, body) {
    return this.request(path, { method: "PUT", body });
  }

  patch(path, body) {
    return this.request(path, { method: "PATCH", body });
  }

  delete(path) {
    return this.request(path, { method: "DELETE" });
  }
}

export const httpClient = new HttpClient();
export default httpClient;
