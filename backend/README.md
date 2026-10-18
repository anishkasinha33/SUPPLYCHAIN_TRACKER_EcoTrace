# EcoTrace backend

REST API + MongoDB storage for the EcoTrace frontend. Node.js, Express 5, Mongoose 8. It lives in its own
`backend/` folder; the React app in `src/` talks to it through `src/services/`.

## What it does

- Real accounts (email or phone + password), hashed passwords, server-side sessions in an HTTP-only cookie.
- Stores each account's products (materials, stages, transport legs) in MongoDB.
- Serves the shared catalogs (suppliers, materials, providers, certifications), seeded from `src/data/`.
- Every new account gets **its own copy of the 8 sample products**. They can be edited and deleted.
- Public, login-free endpoints for the product passport and the landing-page sample.
- The eco score and carbon figures are still calculated in the frontend (`src/utils/`), exactly as before.

## 1. Requirements

- Node.js 20.19 or newer (you have 24.x, fine).
- MongoDB: install **MongoDB Community Server** (the installer can include **Compass**, the viewer), or use a free MongoDB Atlas cluster.

## 2. First-time setup (Windows PowerShell / macOS / Linux)

```bash
cd backend
npm install
copy .env.example .env        # macOS/Linux: cp .env.example .env
npm run seed                  # loads catalogs, sample products, and the demo account
npm run dev                   # API on http://localhost:4000
```

In a **second terminal**, from the project root, start the frontend as usual:

```bash
npm run dev                   # http://localhost:5173
```

Vite forwards `/api` to `http://localhost:4000` (see `vite.config.js`), so there is nothing else to configure.
Open Compass and connect to `mongodb://127.0.0.1:27017` to see the `ecotrace` database.

Demo login (created by `npm run seed` outside production): `demo@koraandkin.example` / `demo1234`.

## 3. Environment variables (`backend/.env`, never commit it)

| Variable | Meaning |
|---|---|
| `NODE_ENV` | `development` or `production`. Production turns on `Secure` cookies (needs HTTPS). |
| `PORT` | API port (default 4000). If you change it, change the proxy in `vite.config.js` too. |
| `MONGODB_URI` | Connection string (local or Atlas). |
| `MONGODB_URI_TEST` | Used only by `npm test`. The database name **must end in `_test`**. |
| `CORS_ORIGINS` | Allowed browser origins, comma separated (default `http://localhost:5173`). |
| `SESSION_TTL_DAYS` | Login lifetime (default 7). |
| `TRUST_PROXY` | Set to `1` only behind a reverse proxy. |

There are no secrets in frontend code. `VITE_API_BASE_URL` (optional, frontend) points the app at an API on another address.

## 4. Tests

```bash
cd backend
npm test
```

`rows.test.js` needs no database. The other files need MongoDB running and `MONGODB_URI_TEST` set; they wipe that
`*_test` database. The code refuses to run tests against any other database name.

## 5. API

Responses are `{ "data": ... }` or `{ "error": { "message": "...", "fields": { ... } } }`.

| Method & path | Who | Purpose |
|---|---|---|
| `POST /api/auth/signup` | public, rate-limited | Create account, copy sample products, start session |
| `POST /api/auth/login` | public, rate-limited | Log in with email or phone |
| `POST /api/auth/logout` | anyone | End the session (deleted on the server) |
| `GET /api/auth/me` | anyone | `{ user }` or `{ user: null }` |
| `PATCH /api/auth/profile` | signed in | Change name, email, phone, business name, industry, location only |
| `GET /api/graph` | signed in | The account's products + catalogs, as raw rows |
| `POST /api/products` | signed in | Create a product (`{ product, materialLines, stages, legs }`) |
| `PUT /api/products/:id` | owner | Edit a product |
| `DELETE /api/products/:id` | owner | Delete a product |
| `POST /api/products/reset-demo` | signed in | Replace your products with fresh sample copies |
| `GET /api/public/passports/:traceId` | public | Passport data for one product (no email, phone, ratings or internal status) |
| `GET /api/public/sample` | public | Sample products for the landing page |
| `GET /api/health` | public | Server and database status |

Someone else's product returns `404`, not `403`, so ids cannot be probed.

## 6. Collections

- `users`: name, email (unique), phone, `phoneKey` (last 10 digits, unique), business fields, `passwordHash` (bcrypt, never returned).
- `sessions`: SHA-256 hash of the session token, user, expiry (MongoDB deletes expired ones).
- `products`: one document per product with embedded `materialLines`, `stages`, `legs`. `ownerId` points to the user; sample templates have `ownerId: null, isSample: true`. Unique: `traceId`, and `(ownerId, batchNumber)`.
- `suppliers`, `materials`, `providers`, `certifications`: shared read-only catalogs.

## 7. Security in place

Password hashing (bcrypt), opaque server-side sessions (logout really ends them), HTTP-only + SameSite=Lax cookies,
login/sign-up rate limits, identical error for wrong password and unknown account, strict request validation (zod,
unknown fields dropped, so no mass assignment; operator objects like `{"$ne":null}` rejected), 100 KB body limit,
Helmet headers, CORS limited to your frontend origin plus an Origin check on state-changing requests, no private
data in public endpoints, no stack traces or request bodies in responses or logs.

## 8. Known limitations

- Only the pure-logic tests (`rows.test.js`) have been executed by the author's tooling; the database-backed API tests were written but need to be run on a machine with MongoDB.
- No OTP, email verification, or password reset yet.
- Rate limiting is in memory (per server process).
- Cookies use SameSite=Lax, so the frontend and API must share a site (same domain or localhost). Different sites would need a change.
- Products added in the browser before this backend existed (old `localStorage`) are not migrated.
- Suppliers' SDG check results are stored in MongoDB, but the frontend still computes them from `src/data/sdgChecklist.js`.
- "Reset demo data" is not atomic on a standalone MongoDB (no transactions); it builds the new copies first so a failure deletes nothing.
- `npm run seed` reads `../src/data` from the frontend, so it needs the repo layout as is.

## 9. Troubleshooting

- **"MONGODB_URI is not set"**: create `backend/.env` from `.env.example`.
- **"Could not connect" / timeout after 5 s**: MongoDB is not running (start the MongoDB service) or the URI is wrong.
- **Login says it cannot reach the server**: start the API (`npm run dev` in `backend/`).
- **403 "origin not allowed"**: add your frontend's address to `CORS_ORIGINS`.
- **429**: too many login attempts; wait 15 minutes.
