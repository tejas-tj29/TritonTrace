# AGENTS.md — TritonTrace Frontend Intelligence Rules

## 1. Monorepo & Directory Boundary

- WORKSPACE BOUNDARY: You are STRICTLY restricted to the `/frontend` directory.
- FORBIDDEN DIRECTORIES: Do NOT read, modify, create, or delete any files in `/backend`, `/ml`, `/data`, or `/docs`.
- CLI CONTEXT: Every terminal command (`npm install`, `npm run dev`, `vite build`) MUST be executed inside `/frontend`.

## 2. Language & Core Stack Constraints (CRITICAL)

- PURE JAVASCRIPT / JSX ONLY: ZERO TypeScript. Never create `.ts` or `.tsx` files. Never use type annotations, interfaces, or TS build tools.
- Framework: React 18+ (Functional Components & Hooks only, no class components).
- Bundler: Vite 5+ (SPA architecture).
- Styling: Tailwind CSS (PostCSS).
- Icons: `lucide-react` (do not import react-icons or any other icon library).
- State Management: Native React Context API (`AuthContext.jsx`, `IncidentContext.jsx`).

## 3. Geospatial & Mapping Engine Rules

- Basemap & Styling: Use `mapbox://styles/mapbox/dark-v11`.
- Coordinate Order: Strictly enforce GeoJSON standard `[Longitude, Latitude]`.
- Default AOI (Mediterranean Sea):
  - Center: `[14.5146, 35.8989]` (Longitude first!)
  - Default Zoom: `6.8`
- HARD RESILIENCE RULE (Leaflet Fallback):
  - If `VITE_MAPBOX_ACCESS_TOKEN` is missing, empty, or fails to initialize, the app MUST automatically and silently mount `FallbackLeaflet.jsx` (CartoDB Dark Matter tiles) without throwing console errors or crashing.
- Manual Drawing: Use `@mapbox/mapbox-gl-draw` for operator polygons.
- Particle Rendering: Use `@deck.gl/react` and `deck.gl` for particle swarms.
- Spatial Calculations: Use `@turf/turf` for all area (km²), centroid, and bounding box math.

## 4. UI/UX & Tactical Theme Guidelines

- Dark Cyber-Maritime Aesthetic:
  - Backgrounds: `bg-slate-950` (main body), `bg-slate-900` / `bg-slate-900/80` (panels, cards).
  - Borders: `border-slate-800` or `border-slate-700/60`.
  - Text: `text-slate-100` (primary titles), `text-slate-400` (subtext/labels).
  - Tactical Accents:
    - Oil Slicks: `text-cyan-400`, `border-cyan-400`, `bg-cyan-500/20`
    - Threats / Anomalies: `text-rose-500`, `bg-rose-500/20`, `border-rose-500`
    - Caution / Warnings: `text-amber-400`, `bg-amber-400/20`
    - Confirmed Safe / Origin: `text-emerald-400`, `bg-emerald-400/20`
- Mandatory Test Asset: Any CV, classifier, or ingestion preview MUST render `<img src="/oil_spill.jpg" alt="SAR Target Asset" />` verbatim.
- Non-Sole Color Signaling: Never use color alone for status. Always pair colors with icons and explicit badges (e.g., "🔻 SOG ANOMALY DETECTED").

## 5. Mock Data & Async Contract

- Pure Client-Side Mocking (v1): Do not attempt real backend fetch calls.
- Citizen Report Loop: Reports submitted in the `normal` portal must append to a shared in-memory/localStorage array so that they immediately populate in the `admin` triage queue.
- Pipeline Orchestration: In the Admin portal, the 4 sequential buttons (SAR Segmentation, Lagrangian Hindcast, DBSCAN Clusters, AIS Threat Correlation) must simulate processing with a brief `setTimeout` (800ms - 1200ms) to provide tactical feedback.
