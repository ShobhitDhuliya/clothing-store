import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();

app.disable("x-powered-by");
// Dev-friendly CORS: the Vite dev server (5173/5174) calls this API
// cross-origin. Tighten `origin` before deploying to production.
app.use(cors());
// Bodies only — request bodies are never logged (they may carry passwords).
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);

// Central error handler: safe { message } for clients; detail only in server
// logs, and never request bodies (they may contain credentials).
app.use((error, _req, res, _next) => {
  const status = error.status ?? 500;
  if (status >= 500) console.error("[server]", error);
  res.status(status).json({
    message: status >= 500 ? "Something went wrong on the server." : error.message,
  });
});

app.listen(env.port, () => {
  console.log(`[server] API listening on http://localhost:${env.port}/api`);
});
