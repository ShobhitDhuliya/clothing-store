# Atelier Clothing Store

A responsive React storefront with a Vite frontend and an Express API. The
customer flows include product search and filters, variant-aware cart and
checkout, account registration/sign-in, order history, and product
reservation/fitting bookings.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Install

From the project root:

```powershell
npm install
npm --prefix server install
```

The server reads configuration from the root `.env` file. If one does not
exist, copy `.env.example` to `.env` and configure the values. Do not replace
an existing `.env`. Vite only exposes values prefixed with `VITE_`; SMTP and
JWT settings are read by the backend only.

## Configure email

Set `OWNER_NOTIFICATION_EMAIL` and the Gmail SMTP settings in the root `.env`.
For Gmail, use `smtp.gmail.com`, port `587`, your Gmail address, and a Google
App Password. Never put SMTP credentials in frontend variables. When the SMTP
host/user/password are not all configured, notifications are explicitly
reported as dry runs and no email is sent.

## Run locally

Start the API and frontend in separate terminals from the project root:

```powershell
npm run server
```

```powershell
npm run dev
```

The frontend is served by Vite (normally `http://localhost:5173`) and the API
by Express (normally `http://localhost:5000/api`). Set
`VITE_API_BASE_URL` in `.env` if the API is hosted elsewhere. The API health
check is `GET /api/health`.

## Checks

```powershell
npm run lint
npm run build
npm test
```

## Data and current scope

The sample product catalogue is in `src/data/products.js` and is shared with
the backend for server-side price and variant-stock validation. Orders,
bookings, and user records are stored as JSON under `server/data` by default.
Set `STORE_DATA_DIR` to use another directory (for example, an isolated test
directory).

The product catalogue is still sample data, the baseline booking schedule
uses a deterministic development availability pattern, and card processing
is not connected. Admin management screens and customer/admin review screens
are still placeholders; this pass focuses on customer shopping, orders,
bookings, authentication, and transactional email notifications.
