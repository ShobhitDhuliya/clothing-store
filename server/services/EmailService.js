import nodemailer from "nodemailer";
import { ORDER_STATUS_LABELS } from "../../src/constants/orderStatus.js";
import { BOOKING_STATUS_LABELS } from "../../src/constants/booking.js";
import { env, isSmtpConfigured } from "../config/env.js";

/**
 * Backend-only email layer (AuthService → EmailService → SMTP provider).
 *
 * Authentication, order, and booking notifications are sent to
 * OWNER_NOTIFICATION_EMAIL; order/booking confirmations and status updates
 * also go to the customer. Messages are built from safe transaction fields —
 * never passwords, hashes, JWTs, cookies, session tokens, or payment-card
 * details. Without complete SMTP configuration, a labelled dry-run preview
 * is logged instead of pretending anything was delivered.
 */

/** Escape user-controlled text before it enters the HTML email body. */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Redact configured SMTP credentials from any text before it is logged. */
function redact(text) {
  let out = String(text ?? "");
  if (env.email.password) out = out.split(env.email.password).join("[redacted]");
  if (env.email.user) out = out.split(env.email.user).join("[redacted]");
  return out;
}

/** Minimal user-agent parsing (OS + browser) — no extra dependency. */
export function describeUserAgent(userAgent) {
  const ua = String(userAgent ?? "");
  if (!ua) return { os: "Unknown", browser: "Unknown" };

  let os = "Unknown";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\//i.test(ua)) browser = "Opera";
  else if (/chrome\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua)) browser = "Safari";

  return { os, browser };
}

/** Simple escaped HTML shell with a label/value table. */
function toHtml(heading, intro, rows) {
  const body = rows
    .map(
      ([label, value]) => `      <tr>
        <td style="padding:6px 14px;color:#6b6375;font-size:13px;">${escapeHtml(label)}</td>
        <td style="padding:6px 14px;font-size:14px;color:#1f2430;">${escapeHtml(value ?? "—")}</td>
      </tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html>
  <body style="font-family:Georgia,serif;background:#f7f7f8;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5e4e7;border-radius:12px;padding:24px;">
      <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">${escapeHtml(heading)}</h2>
      <p style="margin:0 0 16px;font-size:14px;color:#6b6375;">${escapeHtml(intro)}</p>
      <table style="width:100%;border-collapse:collapse;">
${body}
      </table>
      <p style="margin:20px 0 0;font-size:12px;color:#6b6375;">
        Automated notification from Clothing Store. Passwords and tokens are never included.
      </p>
    </div>
  </body>
</html>`;
}


/* --- Transactional email helpers (orders & bookings) ----------------------- */

/** Same Intl formatting the storefront shows, so numbers always match. */
function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount) || 0);
}

function orderStatusLabel(status) {
  return ORDER_STATUS_LABELS[String(status ?? "").toLowerCase()] ?? "Pending";
}

function bookingStatusLabel(status) {
  return (
    BOOKING_STATUS_LABELS[String(status ?? "").toUpperCase()] ?? "Pending"
  );
}

/**
 * Label/value rows for an order — every figure is server-calculated and every
 * contact field is what the customer submitted. Whitelisted only: no cards,
 * no CVVs, no tokens, ever.
 */
function orderRows(order, statusLabel) {
  const c = order.customer;
  const rows = [
    ["Reference", order.orderId],
    [
      order.updatedAt ? "Status updated" : "Date & time",
      order.updatedAt || order.createdAt,
    ],
    ["Status", statusLabel],
    ["Customer", `${c.firstName} ${c.lastName}`.trim()],
    ["Email", c.email],
    ["Phone", c.phone || "not provided"],
  ];

  for (const item of order.items) {
    rows.push([
      `${item.quantity} × ${item.name}`,
      `${item.color} / ${item.size} — ${formatMoney(item.lineTotal)} (${formatMoney(item.unitPrice)} each)`,
    ]);
  }

  rows.push(["Subtotal", formatMoney(order.subtotal)]);
  if (order.savings > 0) rows.push(["Savings", `-${formatMoney(order.savings)}`]);
  rows.push(["Shipping", order.shipping > 0 ? formatMoney(order.shipping) : "Free"]);
  rows.push(["Total", formatMoney(order.total)]);

  const a = order.shippingAddress;
  rows.push([
    "Deliver to",
    [a.line1, a.line2, `${a.city} ${a.postalCode}`.trim(), a.state, a.country]
      .filter(Boolean)
      .join(", "),
  ]);
  rows.push([
    "Delivery",
    `${order.deliveryMethod.label} — ${order.deliveryMethod.description}`,
  ]);
  rows.push(["Payment", `${order.paymentMethod.label} — ${order.paymentStatus}`]);
  return rows;
}

/** Label/value rows for a booking (appointment details live in the record). */
function bookingRows(booking, statusLabel) {
  const c = booking.customer;
  return [
    ["Reference", booking.bookingId],
    [
      booking.updatedAt ? "Status updated" : "Date & time created",
      booking.updatedAt || booking.createdAt,
    ],
    ["Status", statusLabel],
    ["Booking type", booking.bookingType?.label ?? "—"],
    ["Product", booking.product?.name ?? "—"],
    ["Variant", `${booking.variant?.color ?? "—"} / ${booking.variant?.size ?? "—"}`],
    ["Appointment date", booking.date],
    ["Time slot", booking.timeSlot?.label ?? "—"],
    ["Customer", `${c.firstName} ${c.lastName}`.trim()],
    ["Email", c.email],
    ["Phone", c.phone || "not provided"],
  ];
}

/** Plain-text body from intro + rows (HTML reuses the shared table shell). */
function rowsToText(intro, rows) {
  const lines = [intro, ""];
  for (const [label, value] of rows) lines.push(`${label}: ${value}`);
  lines.push(
    "",
    "Automated message from Clothing Store. Passwords and tokens are never included.",
  );
  return lines.join("\n");
}

class EmailService {
  #transporter = null;

  /** Lazily build the SMTP transport so config problems surface on send. */
  #transport() {
    if (!this.#transporter) {
      this.#transporter = nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port,
        secure: env.email.port === 465,
        auth: env.email.user
          ? { user: env.email.user, pass: env.email.password }
          : undefined,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
      });
    }
    return this.#transporter;
  }

  async #send({ to, subject, text, html }) {
    if (!to) {
      console.error(
        "[EmailService] Notification skipped: no recipient is configured.",
      );
      return { delivered: false, skipped: true };
    }

    if (!isSmtpConfigured) {
      // Development behavior: no SMTP configured — labelled preview only.
      console.log("[EmailService] SMTP not configured — dry run, nothing was sent.");
      console.log(`[EmailService]   to:      ${to}`);
      console.log(`[EmailService]   subject: ${subject}`);
      for (const line of text.split("\n")) console.log(`[EmailService]   | ${line}`);
      return { delivered: false, dryRun: true };
    }

    try {
      await this.#transport().sendMail({
        from: env.email.from || env.email.user,
        to,
        subject,
        text,
        html,
      });
      console.log(`[EmailService] Sent "${subject}" to ${to}.`);
      return { delivered: true };
    } catch (error) {
      // Safe server-side error: credentials redacted, no SMTP transcript.
      console.error(
        `[EmailService] Failed to send "${subject}" to ${to}: ${redact(error.message)}`,
      );
      // Sanitized rethrow — domain services never see SMTP details.
      throw new Error("Email notification failed");
    }
  }

  /** Login alert. Safe account/security info only — never credentials. */
  sendLoginNotification({ account, at, userAgent, ip }) {
    const subject = "New Login Detected - Clothing Store";
    const ua = describeUserAgent(userAgent);

    const text = [
      "A login occurred on the Clothing Store.",
      "",
      `Account:            ${account}`,
      `Date & time:        ${at}`,
      `Browser:            ${ua.browser}`,
      `Operating system:   ${ua.os}`,
      `IP address:         ${ip || "not available"}`,
      "",
      "This is an automated security notification. Passwords and tokens are never included.",
    ].join("\n");

    const html = toHtml("New Login Detected", "A login occurred on the Clothing Store.", [
      ["Account", account],
      ["Date & time", at],
      ["Browser", ua.browser],
      ["Operating system", ua.os],
      ["IP address", ip || "not available"],
    ]);

    return this.#send({ to: env.email.owner, subject, text, html });
  }

  /** Registration notice — first/last name, email, optional phone, time. */
  sendRegistrationNotification({ firstName, lastName, email, phone, at }) {
    const subject = "New Customer Registration - Clothing Store";

    const text = [
      "A new customer registered on the Clothing Store.",
      "",
      `First name:   ${firstName}`,
      `Last name:    ${lastName}`,
      `Email:        ${email}`,
      `Phone:        ${phone || "not provided"}`,
      `Registered:   ${at}`,
      "",
      "This is an automated notification. The password is never included.",
    ].join("\n");

    const html = toHtml(
      "New Customer Registration",
      "A new customer registered on the Clothing Store.",
      [
        ["First name", firstName],
        ["Last name", lastName],
        ["Email", email],
        ["Phone", phone || "not provided"],
        ["Registered", at],
      ],
    );

    return this.#send({ to: env.email.owner, subject, text, html });
  }

  /* --- Orders --------------------------------------------------------------- */

  /** Owner alert for a newly placed order (server-calculated figures). */
  sendOrderPlacedOwner(order) {
    const subject = `New Order Received - ${order.orderId}`;
    const rows = orderRows(order, orderStatusLabel(order.status));
    const intro = "A new order has been placed on the Clothing Store.";
    return this.#send({
      to: env.email.owner,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("New Order Received", intro, rows),
    });
  }

  /** Customer confirmation for a placed order. */
  sendOrderConfirmationCustomer(order) {
    const subject = `Order Confirmation - ${order.orderId}`;
    const rows = orderRows(order, orderStatusLabel(order.status));
    const intro = `Hi ${order.customer.firstName}, thank you — we've received your order and it is pending confirmation.`;
    return this.#send({
      to: order.customer.email,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("Order Confirmation", intro, rows),
    });
  }

  /** Owner alert when an order's status changes (confirm/cancel/ship/…). */
  sendOrderStatusOwner(order) {
    const label = orderStatusLabel(order.status);
    const subject = `Order Status Change - ${order.orderId} (${label})`;
    const rows = orderRows(order, label);
    const intro = `Order ${order.orderId} is now: ${label}.`;
    return this.#send({
      to: env.email.owner,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("Order Status Change", intro, rows),
    });
  }

  /** Customer notification when their order's status changes. */
  sendOrderStatusCustomer(order) {
    const label = orderStatusLabel(order.status);
    const subject = `Order Status Update - ${order.orderId} (${label})`;
    const rows = orderRows(order, label);
    const intro = `Hi ${order.customer.firstName}, your order ${order.orderId} is now: ${label}.`;
    return this.#send({
      to: order.customer.email,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("Order Status Update", intro, rows),
    });
  }

  /* --- Bookings ------------------------------------------------------------- */

  /** Owner alert for a newly created booking / appointment. */
  sendBookingPlacedOwner(booking) {
    const subject = `New Booking Received - ${booking.bookingId}`;
    const rows = bookingRows(booking, bookingStatusLabel(booking.status));
    const intro = "A new booking has been made on the Clothing Store.";
    return this.#send({
      to: env.email.owner,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("New Booking Received", intro, rows),
    });
  }

  /** Customer confirmation for a booking / appointment. */
  sendBookingConfirmationCustomer(booking) {
    const subject = `Booking Confirmation - ${booking.bookingId}`;
    const rows = bookingRows(booking, bookingStatusLabel(booking.status));
    const intro = `Hi ${booking.customer.firstName}, we've received your booking request. Its current status is ${bookingStatusLabel(booking.status)}.`;
    return this.#send({
      to: booking.customer.email,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("Booking Confirmation", intro, rows),
    });
  }

  /** Owner alert when a booking's status changes (confirm/cancel). */
  sendBookingStatusOwner(booking) {
    const label = bookingStatusLabel(booking.status);
    const subject = `Booking Status Change - ${booking.bookingId} (${label})`;
    const rows = bookingRows(booking, label);
    const intro = `Booking ${booking.bookingId} is now: ${label}.`;
    return this.#send({
      to: env.email.owner,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("Booking Status Change", intro, rows),
    });
  }

  /** Customer notification when their booking's status changes. */
  sendBookingStatusCustomer(booking) {
    const label = bookingStatusLabel(booking.status);
    const subject = `Booking Status Update - ${booking.bookingId} (${label})`;
    const rows = bookingRows(booking, label);
    const intro = `Hi ${booking.customer.firstName}, your booking ${booking.bookingId} is now: ${label}.`;
    return this.#send({
      to: booking.customer.email,
      subject,
      text: rowsToText(intro, rows),
      html: toHtml("Booking Status Update", intro, rows),
    });
  }
}

export const emailService = new EmailService();
export default emailService;

/* --- Notification safety rails --------------------------------------------- */

/** Keys of notifications already attempted in this process. */
const notifiedKeys = new Set();

/**
 * Duplicate-notification guard: a key fires its sender at most once per
 * process (per event — e.g. `order:ATL-1:status:cancelled:customer`). If the
 * send fails the key is released so a legitimate retry isn't blocked forever.
 */
export function notifyOnce(key, send) {
  if (notifiedKeys.has(key)) {
    console.log(`[EmailService] Duplicate notification suppressed: ${key}`);
    return Promise.resolve({ skipped: true });
  }
  notifiedKeys.add(key);
  return Promise.resolve()
    .then(send)
    .catch((error) => {
      notifiedKeys.delete(key);
      throw error;
    });
}

/**
 * Fire-and-forget wrapper — an email failure must never fail the request.
 * EmailService already logs a safe, credential-redacted server-side error.
 */
export function fireAndForget(send) {
  try {
    Promise.resolve(send()).catch(() => {
      /* safe error already logged */
    });
  } catch {
    /* never let notification problems escape */
  }
}
