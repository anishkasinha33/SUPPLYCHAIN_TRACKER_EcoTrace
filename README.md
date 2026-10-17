# EcoTrace: Sustainable Supply Chain Tracker

A frontend for small businesses to trace materials, suppliers and transport for each product, and to share a public product passport with customers.

Stack: React, React Router, Bootstrap 5 (grid, forms, modal markup), lucide-react icons. Vite is used only to run and build the app. There is no backend: data is local mock data plus localStorage.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
```

Demo sign-in: **demo@koraandkin.example / demo1234**, or the "Use demo account" button. Accounts created on the signup page are stored only in this browser (no passwords are stored; any password of 8+ characters works for them). This is **demo authentication, not secure**.

Public passport example: `/p/ECO-7K4M-2610`.

## Structure

```
src/
  components/   layout, routing, common, products, pipeline, charts, sustainability, passport, landing
  pages/        one file per route
  context/      AuthContext, ThemeContext, DataContext
  hooks/        useLocalStorage, useDocumentTitle
  services/     authService, productService, db, storage   <- the backend seam
  data/         seed data, one file per entity (SQL-shaped, ID references only)
  utils/        sustainability.js (eco score), carbon.js (emissions), graph.js (joins), format.js
  styles/       tokens.css (light/dark), base.css (Bootstrap overrides), components.css, pages.css
  fonts.js      the single place fonts are loaded
```

## Connecting a real backend later

Pages never read data directly. They use `DataContext`, which calls `services/`. Each service function is marked `BACKEND:` where a `fetch()` to a Node.js API would replace the local read or write:

- `authService` -> `/api/auth/*` (hashed passwords, HTTP-only cookies)
- `productService.getGraph/save/remove` -> `/api/products`, `/api/suppliers`, `/api/materials`, `/api/providers`
- `utils/graph.js` joins rows into the views the UI needs; with SQL this becomes views or endpoint responses.

Entities map to tables: User, Product, Material, Supplier, Provider, Certification, ProductMaterial, PipelineStage, TransportLeg. The eco score and carbon results are computed in `utils/` and can stay on the client or move to the server.

## Notes

- Emission factors are **mock** demonstration values. Every figure is labelled as an estimate.
- Eco score weights live in `utils/sustainability.js` (recycled 25, transport 25, supplier verification 20, fair labour 15, materials 15).
- Settings items marked "Coming soon" are placeholders.
- Product images are generated SVG patterns (no photography, no licences).
- The design tokens are documented in the EcoTrace design system artifact.
