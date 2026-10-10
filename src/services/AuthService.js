import { ENDPOINTS } from "../api/endpoints";
import { httpClient } from "../api/httpClient";

/**
 * Frontend authentication API — the only integration point between React and
 * the backend AuthService (`POST /api/auth/login`, `POST /api/auth/register`).
 *
 * SMTP/email configuration never appears here: notifications are sent
 * backend-side only. The server responses carry a token plus a sanitized
 * public profile; passwords are write-only inputs and are never stored,
 * logged, or echoed back.
 */
class AuthService {
  /** Resolves with `{ message, token, user }`; rejects with a safe message. */
  login({ email, password }) {
    return httpClient.post(ENDPOINTS.auth.login, { email, password });
  }

  /** Resolves with `{ message, token, user }`; rejects with a safe message. */
  register({ firstName, lastName, email, phone, password }) {
    return httpClient.post(ENDPOINTS.auth.register, {
      firstName,
      lastName,
      email,
      phone,
      password,
    });
  }
}

export const authService = new AuthService();
export default authService;
