import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const dataDir = await mkdtemp(path.join(os.tmpdir(), "atelier-workflows-"));
process.env.STORE_DATA_DIR = dataDir;
process.env.EMAIL_HOST = "";
process.env.EMAIL_USER = "";
process.env.EMAIL_PASSWORD = "";
process.env.JWT_SECRET = "workflow-test-secret";
process.env.OWNER_NOTIFICATION_EMAIL = "owner@example.test";

const [{ authService }, { orderService }, { bookingService }, { availabilityService }, { emailService }] =
  await Promise.all([
    import("../services/AuthService.js"),
    import("../services/OrderService.js"),
    import("../services/BookingService.js"),
    import("../services/AvailabilityService.js"),
    import("../services/EmailService.js"),
  ]);
const { products } = await import("../../src/data/products.js");
const { buildVariants } = await import("../../src/utils/productDetails.js");
const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const mailEvents = [];
emailService.sendRegistrationNotification = () => mailEvents.push("register");
emailService.sendLoginNotification = () => mailEvents.push("login");
emailService.sendOrderPlacedOwner = () => mailEvents.push("order-owner");
emailService.sendOrderConfirmationCustomer = () => mailEvents.push("order-customer");
emailService.sendOrderStatusOwner = () => mailEvents.push("order-status-owner");
emailService.sendOrderStatusCustomer = () => mailEvents.push("order-status-customer");
emailService.sendBookingPlacedOwner = () => mailEvents.push("booking-owner");
emailService.sendBookingConfirmationCustomer = () => mailEvents.push("booking-customer");
emailService.sendBookingStatusOwner = () => mailEvents.push("booking-status-owner");
emailService.sendBookingStatusCustomer = () => mailEvents.push("booking-status-customer");

after(async () => {
  await rm(dataDir, { recursive: true, force: true });
});

test("auth, variant inventory, and booking workflows validate and persist once", async () => {
  const email = `shopper-${randomUUID()}@example.test`;
  const password = "Safe-test-password-42";
  const profile = {
    firstName: "Asha",
    lastName: "Tester",
    email,
    phone: "9876543210",
    password,
  };

  const registrations = await Promise.allSettled([
    authService.register(profile),
    authService.register(profile),
  ]);
  assert.equal(
    registrations.filter((result) => result.status === "fulfilled").length,
    1,
  );
  const rejectedRegistration = registrations.find(
    (result) => result.status === "rejected",
  );
  assert.equal(rejectedRegistration.reason.status, 409);
  const session = registrations.find(
    (result) => result.status === "fulfilled",
  ).value;
  assert.equal(session.user.email, email);
  assert.equal("passwordHash" in session.user, false);
  assert.equal("password" in session.user, false);

  const loggedIn = await authService.login({ email, password });
  assert.equal(loggedIn.user.email, email);
  await assert.rejects(
    authService.login({ email, password: "incorrect-password" }),
    (error) => error.status === 401,
  );
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(mailEvents.filter((event) => event === "register").length, 1);
  assert.equal(mailEvents.filter((event) => event === "login").length, 1);

  const product = products.find((item) => item.id === 101);
  const variant = buildVariants(product).find((item) => item.stock > 0);
  const orderPayload = {
    customer: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      phone: profile.phone,
    },
    shippingAddress: {
      line1: "1 Test Street",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
    },
    deliveryMethod: { id: "standard" },
    paymentMethod: { id: "cod" },
    subtotal: 0,
    total: 0,
    items: [
      {
        productId: product.id,
        color: variant.color,
        size: variant.size,
        quantity: variant.stock,
        unitPrice: 0,
      },
    ],
  };

  const order = await orderService.create(orderPayload);
  assert.equal(order.subtotal, product.price * variant.stock);
  assert.equal(order.items[0].unitPrice, product.price);
  assert.equal(order.status, "pending");
  await assert.rejects(
    orderService.create({
      ...orderPayload,
      items: [{ ...orderPayload.items[0], quantity: 1 }],
    }),
    (error) => error.status === 400,
  );

  const requester = { role: "customer", email };
  await orderService.changeStatus(order.orderId, "cancelled", requester);
  await assert.rejects(
    orderService.changeStatus(order.orderId, "cancelled", requester),
    (error) => error.status === 409,
  );

  const date = "2050-06-15";
  const day = await availabilityService.getDayAvailability(date);
  const slot = day.slots.find((item) => item.status === "available");
  assert.ok(slot, "the development schedule should provide an open slot");
  const bookingPayload = {
    customer: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      phone: profile.phone,
    },
    product: { id: product.id },
    variant: { color: variant.color, size: variant.size },
    bookingType: { id: "reservation" },
    date,
    timeSlot: { id: slot.time },
    notes: "Workflow test",
  };

  const bookings = await Promise.allSettled([
    bookingService.create(bookingPayload),
    bookingService.create(bookingPayload),
  ]);
  assert.equal(
    bookings.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    bookings.find((result) => result.status === "rejected").reason.status,
    409,
  );
  const booking = bookings.find(
    (result) => result.status === "fulfilled",
  ).value;
  const occupiedDay = await availabilityService.getDayAvailability(date);
  assert.equal(
    occupiedDay.slots.find((item) => item.time === slot.time).status,
    "fully_booked",
  );

  await assert.rejects(
    bookingService.changeStatus(booking.bookingId, "cancelled", {
      role: "customer",
      email: "someone-else@example.test",
    }),
    (error) => error.status === 403,
  );
  await bookingService.changeStatus(booking.bookingId, "cancelled", requester);
  const reopenedDay = await availabilityService.getDayAvailability(date);
  assert.equal(
    reopenedDay.slots.find((item) => item.time === slot.time).status,
    "available",
  );
  await assert.rejects(
    availabilityService.getDayAvailability("2050-02-31"),
    (error) => error.status === 400,
  );
});

test("HTTP routes enforce auth, validate requests, and return canonical records", async () => {
  const apiDataDir = await mkdtemp(path.join(os.tmpdir(), "atelier-api-"));
  const portProbe = createServer();
  await new Promise((resolve) => portProbe.listen(0, "127.0.0.1", resolve));
  const port = portProbe.address().port;
  await new Promise((resolve, reject) =>
    portProbe.close((error) => (error ? reject(error) : resolve())),
  );

  const server = spawn(process.execPath, ["server/index.js"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      PORT: String(port),
      STORE_DATA_DIR: apiDataDir,
      JWT_SECRET: "api-workflow-test-secret",
      CORS_ORIGINS: "https://store.example.test",
      EMAIL_HOST: "",
      EMAIL_USER: "",
      EMAIL_PASSWORD: "",
      OWNER_NOTIFICATION_EMAIL: "owner@example.test",
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const request = async (url, { method = "GET", body, token } = {}) => {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return {
      status: response.status,
      body: await response.json(),
    };
  };

  try {
    let healthy = false;
    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (server.exitCode !== null) {
        throw new Error(`API test server exited with code ${server.exitCode}.`);
      }
      try {
        const response = await request("/health");
        if (response.status === 200) {
          healthy = true;
          break;
        }
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    assert.equal(healthy, true, "API server should become healthy");

    const allowedOriginResponse = await fetch(`${baseUrl}/health`, {
      headers: { Origin: "https://store.example.test" },
    });
    assert.equal(
      allowedOriginResponse.headers.get("access-control-allow-origin"),
      "https://store.example.test",
    );
    const deployedOriginResponse = await fetch(`${baseUrl}/health`, {
      headers: {
        Origin: "https://clothing-store-9ywmu0knm-shobhit-s-team.vercel.app",
      },
    });
    assert.equal(
      deployedOriginResponse.headers.get("access-control-allow-origin"),
      "https://clothing-store-9ywmu0knm-shobhit-s-team.vercel.app",
    );
    const localOriginResponse = await fetch(`${baseUrl}/health`, {
      headers: { Origin: "http://localhost:5173" },
    });
    assert.equal(
      localOriginResponse.headers.get("access-control-allow-origin"),
      "http://localhost:5173",
    );
    const blockedOriginResponse = await fetch(`${baseUrl}/health`, {
      headers: { Origin: "https://unexpected.example.test" },
    });
    assert.equal(
      blockedOriginResponse.headers.get("access-control-allow-origin"),
      null,
    );

    const email = `api-${randomUUID()}@example.test`;
    const profile = {
      firstName: "Asha",
      lastName: "API",
      email,
      phone: "9876543210",
      password: "Safe-api-password-42",
    };
    const registration = await request("/auth/register", {
      method: "POST",
      body: profile,
    });
    assert.equal(registration.status, 201);
    assert.equal(registration.body.user.email, email);
    assert.equal("passwordHash" in registration.body.user, false);
    assert.equal("password" in registration.body.user, false);
    assert.equal(
      (await request("/auth/register", { method: "POST", body: profile })).status,
      409,
    );

    const login = await request("/auth/login", {
      method: "POST",
      body: { email, password: profile.password },
    });
    assert.equal(login.status, 200);
    const token = login.body.token;
    assert.ok(token);
    assert.equal(
      (
        await request("/auth/login", {
          method: "POST",
          body: { email, password: "incorrect-password" },
        })
      ).status,
      401,
    );
    assert.equal((await request("/orders")).status, 401);
    assert.equal((await request("/bookings")).status, 401);

    const product = products.find((item) => item.id === 101);
    const variant = buildVariants(product).find((item) => item.stock > 0);
    const orderResponse = await request("/orders", {
      method: "POST",
      body: {
        customer: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email,
          phone: profile.phone,
        },
        shippingAddress: {
          line1: "1 API Street",
          city: "Mumbai",
          state: "Maharashtra",
          postalCode: "400001",
          country: "India",
        },
        deliveryMethod: { id: "standard" },
        paymentMethod: { id: "cod" },
        subtotal: 0,
        total: 0,
        items: [
          {
            productId: product.id,
            color: variant.color,
            size: variant.size,
            quantity: 1,
            unitPrice: 0,
          },
        ],
      },
    });
    assert.equal(orderResponse.status, 201);
    assert.equal(orderResponse.body.order.subtotal, product.price);
    assert.equal(
      (await request("/orders", { token })).body.orders.length,
      1,
    );
    assert.equal(
      (
        await request("/orders", {
          method: "POST",
          body: { items: [] },
        })
      ).status,
      400,
    );

    const date = "2050-09-30";
    const availability = await request(
      `/bookings/availability?date=${encodeURIComponent(date)}`,
    );
    assert.equal(availability.status, 200);
    const slot = availability.body.slots.find(
      (item) => item.status === "available",
    );
    assert.ok(slot);
    const bookingBody = {
      customer: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email,
        phone: profile.phone,
      },
      product: { id: product.id },
      variant: { color: variant.color, size: variant.size },
      bookingType: { id: "trial" },
      date,
      timeSlot: { id: slot.time },
      notes: "API workflow test",
    };
    const bookingResponse = await request("/bookings", {
      method: "POST",
      body: bookingBody,
    });
    assert.equal(bookingResponse.status, 201);
    assert.equal(
      (await request("/bookings", { token })).body.bookings.length,
      1,
    );
    assert.equal(
      (
        await request("/bookings", {
          method: "POST",
          body: bookingBody,
        })
      ).status,
      409,
    );
  } finally {
    if (server.exitCode === null) {
      server.kill();
      await once(server, "exit");
    }
    await rm(apiDataDir, { recursive: true, force: true });
  }
});
