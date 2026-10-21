# EcoTrace: Sustainable Supply Chain Tracker

A frontend for small businesses to trace materials, suppliers and transport for each product, and to share a public product passport with customers.

Stack: React, React Router, Bootstrap 5 (grid, forms, modal markup), lucide-react icons. Vite runs and builds the frontend. The backend in `server/` is Node.js + Express + Mongoose on MongoDB.

## Run it

Needs Node 22+ and MongoDB (local service, Docker, or an Atlas connection string).

```bash
npm install
cp .env.example .env   # set MONGODB_URI and a long random JWT_SECRET

npm run dev        # app + API on http://localhost:5173 (hot reload; seeds an empty database)
npm run seed       # optional: wipe and reload all seed data
npm start          # build, then serve dist/ + API from one Node process
```

One Express server does everything: `/api/*` is the API, and every other path is the React app (Vite runs inside Express in development, `dist/` is served in production).

Demo sign-in: **demo@koraandkin.example / demo1234**, or the "Use demo account" button. Passwords are bcrypt-hashed in MongoDB and the session is an HTTP-only cookie.

Public passport example: `/p/ECO-7K4M-2610`.

## Structure

```
src/
  components/   layout, routing, common, products, pipeline, charts, sustainability, passport, landing
  pages/        one file per route
  context/      AuthContext, ThemeContext, DataContext
  hooks/        useLocalStorage, useDocumentTitle
  services/     api (fetch wrapper), authService, productService, db, storage
  data/         seed data, one file per entity (SQL-shaped, ID references only)
  utils/        sustainability.js (eco score), carbon.js (emissions), graph.js (joins), format.js
  styles/       tokens.css (light/dark), base.css (Bootstrap overrides), components.css, pages.css
  fonts.js      the single place fonts are loaded
```

## Backend (server/)

```
server/
  index.js          connects to MongoDB, mounts the API and the frontend, listens on PORT
  dev.js            `npm run dev`: runs index.js and restarts it when server/ changes
  app.js            API middleware and routes
  models/           Mongoose models (string _ids match the ids used in src/data)
  routes/           auth.js, products.js, data.js
  seed.js           loads src/data into MongoDB (one source of truth for seed data)
```

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | | API and DB status |
| GET | `/api/data` | | All rows the dashboard joins in `src/utils/graph.js` |
| GET | `/api/suppliers`, `/materials`, `/providers`, `/certifications` | | Reference rows |
| GET | `/api/products`, `/api/products/:id` | | Products, or one product with its lines, stages and legs |
| PUT | `/api/products/:id` | yes | Create or replace `{ product, materialLines, stages, legs }` |
| DELETE | `/api/products/:id` | yes | Delete a product you created (sample products cannot be deleted) |
| POST | `/api/products/reset` | yes | Restore sample products and remove created ones |
| POST | `/api/auth/signup`, `/login`, `/logout` | | Session cookie |
| GET, PATCH | `/api/auth/me` | yes | Current profile |

Pages never read data directly: `DataContext` calls `services/`, which call the API through `services/api.js` with same-origin relative URLs. The eco score and carbon results are still computed on the client in `utils/`.

Deploying needs a host that runs Node (`npm run build && npm start`) plus a MongoDB connection string; a static-only host cannot serve the API.

## Notes

- Emission factors are **mock** demonstration values. Every figure is labelled as an estimate.
- Eco score weights live in `utils/sustainability.js` (recycled 25, transport 25, supplier verification 20, fair labour 15, materials 15).
- Settings items marked "Coming soon" are placeholders.
- Product images are generated SVG patterns (no photography, no licences).
- The design tokens are documented in the EcoTrace design system artifact.
