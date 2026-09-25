# TritonTrace — Product Requirements Document (Frontend)

## Marine Oil Spill Forensic Intelligence & Vessel Attribution Platform

**Version:** 2.0  
**Owner:** Aashish  
**Target build agents:** Antigravity, Claude Code, Cursor  
**Implementation target:** React + Vite SPA, JavaScript/JSX only  
**Primary goal:** Build a realistic maritime forensic operations console that feels like professional geospatial-intelligence software rather than a generic SaaS dashboard.

---

\n\n# 0. ANTIGRAVITY STAGED BUILD PROTOCOL — NON-NEGOTIABLE\n\nThis PRD is intentionally designed to be implemented **part by part**. Do NOT build the entire application in one pass.\n\nThe developer must implement **exactly one phase at a time**, run the application, verify the phase acceptance criteria, and then STOP. The user will inspect the result and may request visual or functional changes before the next phase begins.\n\n## 0.1 Execution rule\n\nAt the start of each build request, identify the requested phase explicitly.\n\n**Hard rule:** Implement only the requested phase. Do not proactively build future portals, future components, future routes, future services, or future mock data except for the minimum scaffolding required to keep the current phase runnable.\n\nDo NOT: \n- generate the full component tree up front\n- create placeholder pages for every future portal\n- add unfinished routes merely because they appear later in this PRD\n- implement future functionality behind hidden buttons\n- refactor stable earlier work without a concrete reason\n- replace working user-approved UI with a new design during a later phase unless explicitly requested\n\nYou MAY create minimal architectural interfaces/stubs when absolutely necessary, but they must not be presented as finished product functionality.\n\n## 0.2 Required phase loop\n\nFor every phase, follow this exact loop:\n\n```text\nREAD CURRENT CODE\n      ↓\nIDENTIFY CURRENT PHASE\n      ↓\nIMPLEMENT ONLY CURRENT PHASE\n      ↓\nRUN APPLICATION\n      ↓\nTEST PHASE ACCEPTANCE CRITERIA\n      ↓\nFIX CURRENT-PHASE ISSUES\n      ↓\nSHOW/REPORT WHAT CHANGED\n      ↓\nSTOP\n```\n\nDo not continue into the next phase automatically.\n\n## 0.3 Preserve approved work\n\nOnce the user has approved a phase, treat its visual language and interaction behavior as a baseline. Future phases should extend the system rather than redesign earlier screens without instruction.\n\n## 0.4 End-of-phase response\n\nAfter completing a phase, provide only a concise build report containing:\n\n1. What was implemented.\n2. Files added/changed.\n3. How to run it.\n4. What to inspect visually.\n5. Known limitations for this phase.\n\nThen stop and wait for the user's feedback.\n\n## 0.5 No "coming next" implementation\n\nIt is acceptable to mention what the next phase will eventually contain, but do not implement it.\n\n## 0.6 Phase sequence\n\nThe recommended build order is:\n\n### Phase 0 — Project Foundation & Design System\n\nGoal: establish a clean Vite + React JSX project and the TritonTrace visual language.\n\nBuild:\n- Vite/React setup\n- Tailwind setup\n- global CSS\n- typography system\n- color tokens\n- spacing/radius/shadow tokens\n- lucide-react setup\n- reusable primitives\n- TopHUD shell\n- button/input/badge/metric/telemetry primitives\n- app background and page shell\n\nDo NOT build:\n- landing page content\n- authentication flow\n- Normal User portal\n- Admin portal\n- Commercial portal\n- ML pipeline\n- PDFs\n\nAcceptance:\n- app boots cleanly\n- no TypeScript\n- visual system is visible in a small style/demo screen\n- no generic SaaS/card-heavy appearance\n\n### Phase 1 — Public Landing Experience\n\nGoal: build the public-facing TritonTrace entry experience.\n\nBuild:\n- navigation\n- hero\n- map-based hero visualization\n- live stats\n- 3-stage workflow\n- data/source strip\n- footer\n- Launch Portal CTA\n\nThe page must look product-specific and operational, not like a generic startup template.\n\nAcceptance:\n- landing page is fully navigable\n- hero map is visually convincing\n- responsive at 1440px and 1280px\n- CTA opens the gateway entry point only\n\n### Phase 2 — Blurred Entry Gateway + Authentication\n\nGoal: build the transition from public landing into the authenticated workspace.\n\nBuild:\n- fullscreen map background\n- blur/darken treatment\n- 2-step AuthModal\n- role selection\n- credential form\n- AuthContext\n- mock login\n- logout\n- RoleGuard\n\nFor this phase, authenticated users may enter a simple role-specific placeholder workspace. Do not build the actual portals yet.\n\nAcceptance:\n- role persists from step 1 to step 2\n- login transitions cleanly\n- logout returns to public/blurred state\n- refresh falls back to unauthenticated state\n\n### Phase 3 — Map Engine + Shared Operational Shell\n\nGoal: establish the geospatial foundation before building portal-specific features.\n\nBuild:\n- MapEngine abstraction\n- Mapbox engine\n- Leaflet fallback\n- map controls\n- map legend\n- layer controls\n- shared telemetry overlays\n- MapCanvas\n- basic mock slick/AIS/marker layers\n\nDo NOT yet build the complete forensic pipeline.\n\nAcceptance:\n- Mapbox works\n- invalid/missing token falls back to Leaflet\n- no console-breaking errors\n- common map API works for both engines\n- map is the dominant visual surface\n\n### Phase 4 — Normal User Portal\n\nGoal: complete the citizen/field-observer workflow.\n\nBuild:\n- Historical Incidents Archive\n- Report Incident form\n- map-click coordinates\n- manual polygon drawing\n- Turf area/perimeter calculations\n- simulated impact envelope\n- spill classifier\n- ReportStore/localStorage mock persistence\n\nAcceptance:\n- report submission creates a report\n- report appears in shared mock queue\n- historical incident click updates map\n- polygon measurements update live\n- classifier uses the mandatory SAR asset\n\n### Phase 5 — Admin Forensic Workspace\n\nGoal: build the actual intelligence-analysis command center.\n\nBuild:\n- triage queue\n- incident loading\n- orchestration panel\n- large map workspace\n- forensic media tray\n- pipeline state machine\n- SAR result state\n- hindcast result state\n- DBSCAN result state\n- AIS correlation state\n\nPipeline order:\n\n```text\nIDLE\n ↓\nSAR_RUNNING\n ↓\nSAR_COMPLETE\n ↓\nHINDCAST_RUNNING\n ↓\nHINDCAST_COMPLETE\n ↓\nDBSCAN_RUNNING\n ↓\nDBSCAN_COMPLETE\n ↓\nAIS_RUNNING\n ↓\nFORENSIC_COMPLETE\n```\n\nAcceptance:\n- Normal User reports are visible to Admin\n- each pipeline stage produces visible state changes\n- map layers appear/disappear based on pipeline state\n- prior stages remain inspectable\n\n### Phase 6 — Hindcast, Particle Timeline & AIS Analysis Depth\n\nGoal: make the Admin analysis visually and mathematically coherent.\n\nBuild:\n- deterministic 1000-particle simulation\n- 12-hour backward hindcast\n- 15-minute resolution\n- 48 movement intervals\n- 49 timeline states\n- playback controls\n- speed controls\n- DBSCAN cluster visualization\n- origin uncertainty radius\n- AIS threat/correlation matrix\n- vessel selection/inspection\n- evidence provenance panels\n\nUse:\n\n```text\nΔt = 900 seconds\nX_previous = X_current − V_drift × Δt\n```\n\nConvert speed/direction into vector components before combining current and wind.\n\nAcceptance:\n- timeline and particles remain synchronized\n- same mock data produces deterministic results\n- all key evidence has a visible source/method/timestamp\n\n### Phase 7 — Commercial Portal\n\nGoal: build the shipowner and P&I analysis workspace.\n\nBuild:\n- mode switcher\n- Shipowner trajectory-consistency analysis\n- P&I exposure calculation\n- live arithmetic roll-up\n- evidence tray\n- analytical, non-conclusive terminology\n\nDo NOT redesign the shared map shell. Reuse the common operational components.\n\nAcceptance:\n- mode switch works\n- values update live\n- results clearly distinguish analytical correlation from legal determination\n\n### Phase 8 — PDF Dossier + Evidence Documents\n\nGoal: produce structured forensic/claims documents.\n\nBuild:\n- DossierDocument.jsx\n- incident summary\n- SAR section\n- hindcast section\n- AIS section\n- impact assessment\n- provenance/methodology\n- limitations/disclaimer\n- jsPDF export\n\nDo not rely on screenshotting the entire WebGL dashboard as the primary document layout.\n\nAcceptance:\n- generated PDFs are readable and structured\n- values match the current incident state\n- exports work without crashing the application\n\n### Phase 9 — Demo Mode & Presentation Workflow\n\nGoal: make the entire product demo-ready for a live presentation.\n\nBuild:\n- Demo Mode toggle\n- Run Full Forensic Analysis\n- realistic progress states\n- automatic SAR → Hindcast → DBSCAN → AIS → Impact → Evidence sequence\n- reset demo\n- presentation-friendly toasts and transitions\n\nAcceptance:\n- complete workflow can be demonstrated without backend services\n- no manual data editing is required\n\n### Phase 10 — Final Polish, Accessibility, Performance & QA\n\nGoal: harden the complete frontend.\n\nBuild/verify:\n- loading/error/empty states\n- keyboard accessibility\n- responsive behavior down to 1024px\n- visual consistency\n- no dead buttons\n- no TypeScript files\n- build success\n- npm audit verification\n- deck.gl performance fallback\n- final visual cleanup\n\nAcceptance:\n- application feels like one coherent product\n- no accidental generic UI patterns\n- no major console errors\n- all previously approved flows still work\n\n## 0.7 How the user should drive Antigravity\n\nUse one prompt per phase. Example:\n\n```text\nImplement Phase 1 from the TritonTrace PRD only.\nDo not implement Phase 2 or any later phase.\nMake the current phase fully runnable and polished.\nAfter implementation, run it, verify the acceptance criteria, report what changed, and STOP.\n```\n\nThe user can then inspect the running application and request changes such as:\n\n```text\nChange the hero layout.\nMake the map 20% larger.\nReduce the glow.\nReplace the cards with a denser telemetry strip.\nKeep everything else unchanged.\n```\n\nOnly after the current phase is approved should the user issue the next phase prompt.\n\n# 1. Product Overview

## 1.1 Problem Statement

Marine oil spills cause severe ecological damage, but incidents can remain difficult to attribute because:

- Vessels may disable or manipulate AIS transponders.
- Optical satellite imagery can be limited by cloud cover and daylight.
- Ocean currents and wind can rapidly displace a slick from its possible discharge point.

## 1.2 Solution

TritonTrace is a three-stage forensic pipeline exposed through a role-based web application:

| Stage | What it does |
| --- | --- |
| **1. SAR Detection & Segmentation** | Uses Sentinel-1 dual-polarization VV/VH radar imagery and a mocked semantic-segmentation workflow to extract slick geometry, area and perimeter. |
| **2. Lagrangian Hindcasting** | Runs a backward 12-hour demonstration simulation using mocked ocean-current and wind vectors plus a configurable 3% wind-leeway factor. |
| **3. AIS Anomaly Correlation** | Cross-references the reconstructed origin window against mocked AIS telemetry and produces an analytical vessel-correlation assessment. |

### Important v1 framing

The frontend is a **demonstration system with mocked/simulated services**. Analytical outputs must be clearly labeled as simulated, analytical, estimated, or demonstration results where appropriate. The interface must not visually imply that mocked results are legally conclusive proof of culpability, innocence, or financial liability.

## 1.3 Users & Roles

| Role | Who | Primary need |
| --- | --- | --- |
| **Public / Unauthenticated** | General public, press, researchers | Understand the platform, methodology and coverage; enter the portal. |
| **Normal User** | Field observers, local responders, citizens | Submit observations, inspect historical incidents and perform lightweight classification/mapping. |
| **Lead Investigator** | Coast Guard, maritime police, Port State Control | Triage incidents, run the forensic pipeline, inspect evidence and generate a structured dossier. |
| **Commercial Operator** | Shipowners, fleet managers, P&I clubs, insurers | Review trajectory consistency and assess commercial/claims exposure using demonstration data. |

## 1.4 Non-Goals (v1)

- No live backend ML inference.
- No production authentication or authorization service.
- No mobile-native app.
- No multi-region AOI switching; Mediterranean Sea is the fixed v1 AOI.
- No claim that mock analytical scores constitute legal proof.
- No production-grade ocean forecast or operational safety guidance.

---

# 2. Product Principles

These principles apply to every page and component.

### 2.1 Map-first

**The map is the workspace, not a card.**

Whenever a portal includes geospatial analysis, the map must occupy the majority of the available workspace. Panels should frame the map rather than compete visually with it.

### 2.2 Intelligence-console aesthetic

TritonTrace should feel like:

> **Satellite ground station × maritime command center × forensic investigation console**

It must not look like:

- a generic SaaS admin dashboard
- a finance dashboard
- a portfolio template
- a cyberpunk game HUD
- a collection of oversized cards

### 2.3 Evidence before decoration

Use screen space to communicate real incident data, provenance, telemetry and analytical state. Decorative effects are secondary.

### 2.4 Consistency

The same telemetry values, incident IDs, timestamps, labels and statuses must come from the same data model across the application.

### 2.5 Every interaction has meaning

There must be no decorative dead buttons, fake tabs, static sliders pretending to be interactive, or navigation links that do nothing.

---

## 3.1 Overall visual direction

The interface must be a clean, flat, high-contrast scientific white theme.

Use:

- plain white (`bg-white`) for all panels, sidebars, and cards
- very light gray (`bg-slate-50`) for the app background/canvas
- crisp 1px borders (`border-slate-200`)
- dark, highly legible text (`text-slate-900` and `text-slate-600`)
- flat design (no gradients, no glassmorphism, no heavy blurs)
- subtle, tight shadows (`shadow-sm` or `shadow-md` only for floating modals)

Avoid entirely:

- dark mode backgrounds for the UI shell (keep the Mapbox map dark, but the UI must be white)
- gradients of any kind
- glassmorphism or translucent blurred panels
- glowing buttons

## 3.2 Color semantics

Base palette:

| Token | Meaning |
| --- | --- |
| `bg-slate-50` | Global background canvas |
| `bg-white` | Primary operational panels, sidebars, modals |
| `border-slate-200` | Borders and dividers |
| `text-slate-900` | Primary headings and values |
| `text-slate-600` | Secondary text and labels |

Semantic accents (Flat, solid colors):

| Accent | Meaning |
| --- | --- |
| `cyan-600` | Primary brand color, CTA buttons, active states |
| `emerald-600` | Normal/resolved/safe |
| `amber-500` | Warning, pending |
| `rose-600` | Anomaly, threat, high-risk state |

**Rule:** accent colors represent semantic state. Do not use every accent color simultaneously merely to make the UI look colorful.

## 3.3 Typography

Use a clean sans-serif family for general UI.

Use monospace typography for:

- MMSI
- incident IDs
- coordinates
- timestamps
- SOG/COG
- wind/current values
- model/service identifiers
- percentages used as telemetry readouts

Headings should be medium/semi-bold and restrained. Do not use oversized marketing typography inside operational panels.

## 3.4 Icons

Use `lucide-react` consistently.

Do not use emoji as primary UI icons.

Preferred icon semantics include:

- `Satellite`
- `Waves`
- `Wind`
- `Ship`
- `Crosshair`
- `MapPinned`
- `AlertTriangle`
- `Shield`
- `FileText`
- `Activity`
- `Radar`
- `Database`
- `Clock3`
- `Layers`
- `Play`
- `Pause`
- `RotateCcw`
- `Maximize2`

---

# 4. Tech Stack

## 4.1 Hard constraint: JavaScript / JSX only

- No `.ts` files.
- No `.tsx` files.
- No TypeScript type annotations.
- No TypeScript compiler/tooling.
- No generated TypeScript code.

A CI/lint/build check must fail if `.ts` or `.tsx` files appear under `src/`.

## 4.2 Required stack

| Layer | Library | Purpose |
| --- | --- | --- |
| Runtime/Core | React 18+ | SPA, functional components + hooks |
| Bundler | Vite 5+ | Development server and production build |
| Styling | Tailwind CSS + PostCSS | Design system and responsive UI |
| Icons | lucide-react | Unified iconography |
| Primary map | react-map-gl + mapbox-gl | Primary geospatial engine |
| Particle simulation | deck.gl / @deck.gl/react | GPU-rendered particle visualization |
| Manual drawing | Mapbox Draw | Polygon drawing on Mapbox |
| Fallback map | leaflet + react-leaflet | Mapbox fallback |
| Geometry | @turf/turf | Area, perimeter, centroid, bounding-box operations |
| Scientific plots | plotly.js-dist-min + react-plotly.js | Particle/cluster plots |
| Charts | chart.js + react-chartjs-2 | SOG and telemetry charts |
| State | React Context API | AuthContext, IncidentContext, ReportStore or equivalent |
| HTTP | axios | REST client abstraction |
| Optional realtime | socket.io-client | Future-compatible interface; mocked in v1 unless needed |
| PDF | jspdf + jspdf-autotable | Structured evidence dossier generation |
| Screenshot/visual asset support | html2canvas | Use only where appropriate; do not depend on WebGL screenshotting for the entire dossier |

## 4.3 Dependency safety

Before final implementation:

```bash
npm show react version
npm show mapbox-gl version
npm show @deck.gl/react version
npm audit
```

Use current stable versions available at implementation time.

Use caret ranges for top-level dependencies unless a dependency requires otherwise.

Delivery gate:

- app builds successfully
- no high/critical npm audit findings
- no TypeScript files under `src/`

---

# 5. Repository Structure

```text
tritontrace-frontend/
├── public/
│   ├── oil_spill.jpg
│   ├── favicon.ico
│   └── assets/
│       ├── cerulean_hero.jpg
│       ├── segmentation_flow.mp4
│       └── drift_playback.mp4
│
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── AuthModal.jsx
│   │   │   └── RoleGuard.jsx
│   │   ├── landing/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LiveStatsBar.jsx
│   │   │   ├── WorkflowHero.jsx
│   │   │   └── LandingMapPreview.jsx
│   │   ├── map/
│   │   │   ├── MapCanvas.jsx
│   │   │   ├── MapEngine.jsx
│   │   │   ├── MapboxEngine.jsx
│   │   │   ├── LeafletEngine.jsx
│   │   │   ├── DeckGLLayers.jsx
│   │   │   ├── DrawControls.jsx
│   │   │   ├── LayerControl.jsx
│   │   │   └── MapLegend.jsx
│   │   ├── normal/
│   │   │   ├── NormalUserPortal.jsx
│   │   │   ├── NormalUserLeft.jsx
│   │   │   ├── HistoricalFeed.jsx
│   │   │   ├── IncidentReportForm.jsx
│   │   │   ├── ManualMappingPanel.jsx
│   │   │   └── SpillClassifier.jsx
│   │   ├── admin/
│   │   │   ├── AdminPortal.jsx
│   │   │   ├── AdminTriageQueue.jsx
│   │   │   ├── OrchestrationPanel.jsx
│   │   │   ├── PipelineStep.jsx
│   │   │   ├── PipelineProgress.jsx
│   │   │   ├── ForensicMediaTray.jsx
│   │   │   ├── VideoProgression.jsx
│   │   │   ├── ParticleScrubber.jsx
│   │   │   ├── AISThreatMatrix.jsx
│   │   │   └── ImpactVulnerabilityMatrix.jsx
│   │   ├── commercial/
│   │   │   ├── CommercialPortal.jsx
│   │   │   ├── CommercialHeader.jsx
│   │   │   ├── AlibiGenerator.jsx
│   │   │   ├── PILiabilityAudit.jsx
│   │   │   └── EvidenceTray.jsx
│   │   ├── evidence/
│   │   │   ├── EvidenceItem.jsx
│   │   │   ├── SourceBadge.jsx
│   │   │   ├── ProvenancePanel.jsx
│   │   │   └── AnalyticalDisclaimer.jsx
│   │   └── common/
│   │       ├── TopHUD.jsx
│   │       ├── MetricReadout.jsx
│   │       ├── TelemetryRow.jsx
│   │       ├── ConfidenceIndicator.jsx
│   │       ├── StatusBadge.jsx
│   │       ├── ToastHost.jsx
│   │       ├── CommandPalette.jsx
│   │       ├── DossierDocument.jsx
│   │       └── ErrorState.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── IncidentContext.jsx
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── incidentService.js
│   │   ├── forensicService.js
│   │   ├── aisService.js
│   │   └── reportService.js
│   │
│   ├── lib/
│   │   ├── client.js
│   │   ├── geoMath.js
│   │   ├── physics.js
│   │   └── pdf.js
│   │
│   ├── store/
│   │   └── reportStore.js
│   │
│   ├── utils/
│   │   ├── mockData.js
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env.example
├── .cursorignore
├── .gitignore
├── tailwind.config.js
├── vite.config.js
└── package.json
```

### Architecture rule

Presentation components must consume services/context/store APIs rather than directly mutating mock data.

This is required so mock services can later become real REST/WebSocket integrations without rewriting the UI architecture.

---

# 6. Environment Configuration

All client-safe environment variables use the `VITE_` prefix.

```env
# API
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

# Map
VITE_MAPBOX_ACCESS_TOKEN=

# Fixed AOI (Eastern Mediterranean / Target Region)
VITE_DEFAULT_AOI_NAME=Eastern Mediterranean AOI
VITE_DEFAULT_LAT=31.350
VITE_DEFAULT_LON=31.685
VITE_DEFAULT_ZOOM=5.5
VITE_AOI_BOUNDS_SW_LON=18.37
VITE_AOI_BOUNDS_SW_LAT=25.0
VITE_AOI_BOUNDS_NE_LON=45.0
VITE_AOI_BOUNDS_NE_LAT=37.7

## 6.1 Map fallback

If the Mapbox token is missing, malformed, inaccessible, or the Mapbox map fails to initialize, TritonTrace must automatically mount the Leaflet engine.

No console-breaking error may prevent the rest of the application from rendering.

## 6.2 Environment parsing

All numeric env values must be explicitly parsed with `Number(...)` or equivalent before entering calculation functions.

Acceptance checks:

- valid Mapbox token → Mapbox engine
- missing token → Leaflet engine
- invalid token/network failure → Leaflet engine
- no unhandled map initialization promise rejection
- numeric values are numbers, not strings

---

# 7. Global Application Shell

## 7.1 Global layout

### Primary desktop viewport

`1440 × 900`

### Secondary desktop viewport

`1280 × 800`

### Minimum supported viewport

`1024 × 768`

## 7.2 TopHUD

Height: approximately 56–64px.

Contents:

- TritonTrace wordmark
- active incident identifier
- AOI label
- system/map engine status
- UTC clock
- active role badge
- notifications
- Demo Mode indicator when enabled
- Logout

Do not make the header visually dominant.

## 7.3 Common command palette

`Ctrl + K` opens a command palette.

Example actions:

- Search incident
- Open triage queue
- Toggle AIS layers
- Toggle particle layers
- Run full analysis
- Reset map
- Enter Demo Mode
- Open documentation

Commands must be functional.

---

# 8. Authentication & RBAC

## 8.1 Blurred Entry Gateway

Unauthenticated state:

- fullscreen Mapbox/Leaflet background
- slightly darkened
- `backdrop-blur` only for the gateway state
- map visible but not interactive
- centered authentication panel

Clicking **Launch TritonTrace** opens the gateway.

## 8.2 Role selection

Three domains:

1. Normal User — Field Observer & Local Response
2. Lead Investigator — Maritime Police / Coast Guard / Port State Control
3. Commercial Operator — Shipowner / Fleet / P&I

Use Lucide icons, not emoji.

## 8.3 Credential step

Fields:

- email
- password
- agency / IMO identifier

Validation is mocked client-side in v1.

Selected role must remain visible as a summary chip.

## 8.4 Session behavior

On successful mock login:

- close modal
- remove blur
- enable map interaction
- mount matching portal
- set `AuthContext`

On logout:

- clear `AuthContext`
- clear active incident context
- clear transient report state
- remove portal-specific map layers
- return to public/blurred state

Refresh while authenticated must gracefully return to the public state because v1 has in-memory session only.

---

# 9. Public Landing Page

## 9.1 Goal

The landing page should feel like the public-facing front door to a scientific maritime intelligence platform, not a generic startup site.

## 9.2 Hero composition

Two-column desktop layout.

### Left side

Eyebrow:

`MARITIME FORENSIC INTELLIGENCE`

Headline:

`TRACKING MARINE OIL POLLUTION FROM ORBIT`

Subcopy:

A concise explanation of the SAR + ocean-drift + AIS analytical pipeline.

Primary CTA:

`ENTER OPERATIONS CONSOLE`

Secondary link:

`VIEW METHODOLOGY`

### Right side

Live map preview of the Mediterranean AOI.

Show:

- dark basemap
- subtle geographic grid
- sample slick polygon
- vessel tracks
- origin projection
- restrained particle animation

The map preview must feel like an actual monitoring product.

## 9.3 Live stats

Four compact telemetry readouts:

- area segmented
- hindcast horizon
- analytical classification confidence
- vessels correlated

All values come from `mockData.js` or a shared mock metric source.

## 9.4 Workflow

Three connected stages:

`SAR DETECTION → LAGRANGIAN HINDCAST → AIS CORRELATION`

Each includes:

- icon
- stage number
- one-line purpose
- source badge if applicable

## 9.5 Data source strip

Display source families such as:

- Sentinel-1 SAR
- Marine Cadastre AIS
- CMEMS / HYCOM-style ocean-current input

Use attribution language suitable for a demonstration frontend.

---

# 10. Portal 1 — Normal User

## 10.1 Layout

```text
TopHUD
┌───────────────────────────────────────────────────────────┐
│                                                           │
│ NormalUserLeft                       MAP WORKSPACE         │
│                                                           │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Approximate sidebar width: 300–340px.

Map consumes remaining space.

## 10.2 Explicitly hidden from this role

Never show:

- backward hindcast controls
- AIS correlation table
- legal forensic dossier tools
- advanced investigator pipeline controls

If these are visible in Normal User mode, that is a bug.

## 10.3 Historical Incidents

Source: `mockHistoricalIncidents`.

Each row:

- incident ID
- area
- date/time
- status
- source

Filters:

- date range
- region
- status

Clicking an incident:

- loads incident context
- centers the map
- renders slick polygon
- updates the TopHUD active incident

## 10.4 Report Incident

Fields:

- timestamp, defaulting to current UTC
- latitude
- longitude
- map-click coordinate selector
- severity: Minor / Moderate / Major
- Visual Notes

Submit:

`SUBMIT INCIDENT ALERT`

On submit:

- validate
- create a report ID
- store report using `reportStore` / `reportService`
- show toast
- make the report immediately visible in Admin triage

Example report ID:

`RPT-20260922-XXXX`

## 10.5 Manual Mapping

Drawing mode:

- polygon
- vertex count
- live area
- live perimeter
- clear drawing
- reset drawing

Use Turf.js for geometry.

Drawing must work with both Mapbox and Leaflet engines.

## 10.6 Forward Propagation Alert

Button:

`TRIGGER IMPACT ENVELOPE`

Display a simplified demonstration hazard envelope.

Show:

- target zone
- estimated arrival time
- impact probability
- wind/current assumptions

Label explicitly:

`SIMULATED IMPACT ENVELOPE`

Do not present it as an operational forecast.

## 10.7 Spill Classifier

Every classifier/ingestion preview must render:

```html
<img src="/oil_spill.jpg" alt="SAR Target Asset" />
```

Show:

- polarization: VV/VH
- surface wind velocity
- surface wind direction
- backscatter suppression
- slick area
- analytical confidence
- analytical classification label

Example label:

`PETROLEUM-LIKE SLICK — CLASS 1`

Use wording that makes clear it is an analytical demonstration result.

---

# 11. Portal 2 — Admin / Lead Investigator

## 11.1 Command-center layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ TOP HUD                                                              │
├──────────────┬───────────────────────────────────────┬───────────────┤
│              │                                       │               │
│ TRIAGE       │                                       │ FORENSIC      │
│ QUEUE        │               MAP WORKSPACE           │ PIPELINE      │
│              │                                       │               │
│              │                                       │               │
├──────────────┴───────────────────────────────────────┴───────────────┤
│ FORENSIC TIMELINE / MEDIA / EVIDENCE                                │
└──────────────────────────────────────────────────────────────────────┘
```

Approximate sizing at 1440px:

- left queue: 280–320px
- right pipeline: 330–380px
- bottom tray expanded: 220–280px
- map: all remaining space

## 11.2 Admin Triage Queue

Queue combines:

- satellite-detected incidents
- citizen reports

Each row:

- incident ID
- status
- timestamp
- lat/lon
- area
- confidence
- source

Statuses:

- ACTIVE
- REVIEW
- CLOSED

Clicking a row loads the full incident context.

## 11.3 Pipeline orchestration

The four operations are one stateful workflow, not four independent buttons.

Pipeline state machine:

```text
IDLE
  ↓
SAR_RUNNING
  ↓
SAR_COMPLETE
  ↓
HINDCAST_RUNNING
  ↓
HINDCAST_COMPLETE
  ↓
DBSCAN_RUNNING
  ↓
DBSCAN_COMPLETE
  ↓
AIS_RUNNING
  ↓
FORENSIC_COMPLETE
```

Each state must expose:

- active service
- status
- progress
- elapsed time
- parameters
- generated outputs
- completion indicator
- failure state when applicable

Buttons:

1. `RUN SAR SEGMENTATION`
2. `RUN LAGRANGIAN HINDCAST`
3. `CALCULATE DBSCAN CLUSTERS`
4. `CORRELATE AIS`
5. `RUN FULL ANALYSIS`

Sequential mode:

A downstream operation should normally remain disabled until the required upstream result exists.

Demo mode:

`RUN FULL ANALYSIS` executes the complete deterministic mocked pipeline with realistic progress delays.

## 11.4 SAR stage

Display:

- model: U-Net / demonstration segmentation
- VV/VH polarization
- processing percentage
- slick area (km²)
- perimeter (km)
- geometric elongation ratio (Length:Width)
- estimated slick age (hours, based on dispersion grading)
- extracted geometry status

## 11.5 Lagrangian stage

Display:

- horizon: -12h
- temporal resolution: 15 min
- particles: 1000
- wind
- current
- leeway factor
- current simulation timestamp

## 11.6 DBSCAN stage

Display:

- number of particles
- clusters found
- primary cluster size
- centroid
- uncertainty radius

## 11.7 AIS stage

Display:

- search radius
- candidates found
- spatial matching status
- SOG anomaly analysis
- correlation assessment

## 11.8 Impact Vulnerability Matrix

Show:

- MPA risk
- coastline impact estimate
- fisheries zone impact
- uncertainty/context

Use compact rows and clear semantic badges.

---

# 12. Admin Map Workspace

## 12.1 Layers

Available layers:

- SAR slick
- hindcast particles
- origin centroid
- uncertainty radius
- AIS historical tracks
- selected vessel track
- simulated impact envelope
- MPA zones
- fisheries zones

Default visibility:

```text
SAR slick             ON
Hindcast particles    ON
Origin cluster        ON
AIS tracks            ON
Selected vessel       ON when selected
Impact envelope       OFF
MPA zones             OFF
Fisheries zones       OFF
```

## 12.2 Layer control

Add a floating `Layers` control.

Example:

```text
MAP LAYERS

☑ SAR SLICK
☑ HINDCAST PARTICLES
☑ ORIGIN CLUSTER
☑ AIS TRACKS
☐ IMPACT ENVELOPE
☐ MPA ZONES
☐ FISHERIES ZONES
```

## 12.3 Map legend

Use a compact legend:

- slick boundary
- particle cloud
- origin centroid
- AIS track
- selected/high-correlation track
- uncertainty radius
- impact envelope

Do not rely on color alone; pair visual encodings with labels/icons.

---

# 13. Forensic Media Tray

Bottom tray expands after pipeline output exists.

## 13.1 VideoProgression

Three-step view:

1. raw SAR backscatter
2. binary segmentation mask
3. extracted slick polygon

Telemetry:

- sigma0
- mask resolution
- area
- perimeter

## 13.2 ParticleScrubber

Timeline:

```text
-12h ───────────────────────────────────── NOW
```

Settings:

- temporal resolution: 15 min
- 48 intervals
- 49 timeline states including initial and final state

Controls:

- play
- pause
- reset
- 0.5×
- 1×
- 2×
- 4×

Show:

- current simulation timestamp
- elapsed simulation time
- particle count
- centroid
- uncertainty radius

Use subtle animation.

## 13.3 Plotly DBSCAN visualization

Show:

- particle cloud
- cluster assignment
- primary cluster
- centroid
- coordinate axes/labels

## 13.4 AIS matrix

Columns:
| Rank | MMSI | Vessel | Type | Flag | Distance | SOG Transit | SOG Origin | SOG Delta | AIS Gap | Assessment |

Assessment vocabulary:

- HIGH CORRELATION
- MODERATE CORRELATION
- LOW CORRELATION
- INSUFFICIENT DATA

Anomaly Badges to display:

- `SOG ANOMALY DETECTED` (If speed drops heavily)
- `DARK SHIPPING GAP` (If AIS telemetry was lost near the origin window)
Do not equate correlation score with proof of culpability.

---

# 14. Evidence Provenance System

Every major analytical result must expose its source, acquisition time and method.

## 14.1 Reusable components

Create:

- `SourceBadge`
- `EvidenceItem`
- `ProvenancePanel`
- `AnalyticalDisclaimer`
- `TelemetryRow`
- `ConfidenceIndicator`

## 14.2 Example SAR provenance

```text
SOURCE
Sentinel-1 SAR

ACQUIRED
22 Sep 2026 · 06:30 UTC

METHOD
U-Net demonstration segmentation

RESULT
14.6 km² extracted slick

STATUS
ANALYTICAL RESULT
```

## 14.3 Example AIS provenance

```text
SOURCE
Historical AIS telemetry

MMSI
419999999

WINDOW
00:30–01:30 UTC

MATCH DISTANCE
0.8 km

SOG DELTA
12.6 kn

ASSESSMENT
HIGH CORRELATION
```

## 14.4 Example metocean provenance

```text
CURRENT SOURCE
CMEMS / HYCOM-style input

WIND
6.2 m/s · 315°

LEEWAY
3%

HORIZON
12h

ORIGIN UNCERTAINTY
±1.8 km
```

---

# 15. Analytical Language Rules

Because this is a forensic-style interface, the frontend must distinguish correlation from proof.

Prefer:

- `HIGH CORRELATION`
- `TRAJECTORY CONSISTENCY`
- `SPATIAL MATCH`
- `ANALYTICAL CONFIDENCE`
- `ESTIMATED ORIGIN`
- `SIMULATED IMPACT ENVELOPE`
- `DEMONSTRATION RESULT`
- `INSUFFICIENT DATA`

Avoid presenting mock outputs as:

- legally proven culpability
- legally proven innocence
- guaranteed prediction
- binding insurance/claims conclusion

Commercial mode may still contain clear demonstration verdict fields, but the UI must identify them as model/demo assessments rather than legal determinations.

---

# 16. Portal 3 — Commercial Operator

## 16.1 Overall layout

TopHUD + mode switcher + left input panel + center map + right analytics + bottom evidence tray.

Mode switcher:

`SHIPOWNER / FLEET` ⇄ `P&I / INSURER`

## 16.2 Shipowner / Fleet Alibi Mode

Inputs:

- target vessel MMSI
- claimed incident ID
- passage time window
- navigational log attachment

Action:

`RUN TRAJECTORY CONSISTENCY ANALYSIS`

Map:

- reconstructed origin swarm
- selected vessel transit track
- reconstructed discharge/origin zone
- spatial separation

Analytics:

- spatial clearance
- SOG deceleration delta
- course deviation
- correlation confidence
- trajectory consistency assessment

Use terminology such as:

`TRAJECTORY CONSISTENCY: HIGH`

rather than implying a legal exoneration.

### Evidence tray

Include:

- recorded SOG profile
- origin-window time discrepancy
- nearest origin distance
- analytical assessment

Button:

`GENERATE TRAJECTORY CONSISTENCY CERTIFICATE`

The exported document must clearly state that it is a demonstration/analytical certificate generated from supplied/mock data.

## 16.3 P&I Club / Insurer Liability Mode

Inputs:

- insured vessel name
- policy / entry number
- incident ID
- underwriting layer

Action:

`CALCULATE FINANCIAL EXPOSURE`

Right panel:

- analytical attribution/correlation score
- environmental/cleanup cost assumptions
- potential regulatory cost assumptions
- coastal impact zone
- uncertainty note

Bottom:

Claims Reserve Calculator:

- base cleanup cost
- environmental damage estimate
- deductible
- projected net club reserve

Values update live.

Button:

`EXPORT P&I LIABILITY ASSESSMENT`

Export must clearly identify assumptions and demonstration status.

---

# 17. Geospatial & Physics Model

Implement pure functions in `src/lib/physics.js` and `src/lib/geoMath.js`.

## 17.1 Surface drift velocity

```text
V_drift = V_current + α × V_wind
```

Where:

- `V_current` = current vector in m/s
- `V_wind` = 10m wind vector
- `α` = `VITE_LEEWAY_FACTOR`, default `0.03`

## 17.2 Speed/direction to vector conversion

Mock data provides speed + direction.

Convert polar representation to vector components before combining current and wind.

Use one documented convention consistently throughout the application.

Example structure:

```js
const directionRad = directionDeg * Math.PI / 180;
const u = speed * Math.sin(directionRad);
const v = speed * Math.cos(directionRad);
```

Keep the convention documented so map arrows, calculations and hindcast behavior remain consistent.

## 17.3 Backward Lagrangian hindcast

Use:

```text
Δt = 900 seconds
X_previous = X_current − V_drift × Δt
```

Parameters:

- horizon = 12 hours
- time step = 15 minutes
- intervals = 48
- timeline states = 49
- particles = 1000

The simulation is deterministic for the same mock inputs.

## 17.4 Radar backscatter demonstration

```text
σ⁰_dB = 10 × log10(⟨I⟩) − K_cal
```

The v1 mock dataset may use demonstration values such as:

- wind = 6.2 m/s
- radar backscatter = -22.4 dB
- slick area = 14.6 km²

The interface should describe these as mock/demonstration measurements.

## 17.5 Unit testing

Pure formula functions must have basic tests using the mock worked-example values.

Tests should verify:

- speed/direction conversion
- vector addition
- one hindcast step
- 12-hour step count
- Turf area/centroid helpers
- financial roll-up arithmetic

---

## 17.6 Vessel Attribution Scoring Matrix (Mock Algorithm)

The vessel threat score (0.0 to 1.0) must be a composite weighted calculation:

- Proximity Score (40% weight): Inverse of distance to origin centroid.
- Kinematic Anomaly (40% weight): Magnitude of SOG (Speed Over Ground) drop during the discharge window compared to transit SOG.
- Telemetry Integrity (20% weight): Penalty applied if there is an AIS signal gap (Dark Shipping) within 10km of the origin.

The frontend should be capable of computing this live based on the vessel array provided in mockData, allowing the Commercial Portal to recalculate exoneration scores dynamically if inputs change.

# 18. Mock Data Model

Implement and export at minimum:

```js
export const mockIncident = {
  incident_id: "Med-Spill-017",
  aoi_name: "Mediterranean Sea AOI",
  source_type: "satellite_detected",
  status: "under_investigation",
  coordinates: { lat: 32.5, lon: 33.1 },
  slick_area_sqkm: 14.6,
  perimeter_km: 28.4,
  geometry_elongation_ratio: "1:8.2", // Indicates linear vessel discharge
  estimated_age_hours: 10.5,
  detection_timestamp: "2026-09-22T06:30:00Z",
  target_asset: "oil_spill",
  metocean: {
    wind_speed_ms: 6.2,
    wind_direction_deg: 315,
    current_speed_ms: 0.24,
    current_direction_deg: 120,
    radar_backscatter_db: -22.4
  },
  hindcast_origin: {
    centroid: { lat: 35.7410, lon: 14.3280 },
    release_window: "2026-09-22T00:30:00Z to 2026-09-22T01:30:00Z",
    uncertainty_radius_km: 1.8
  },
  impact_risk: { mpa_pelagos: "HIGH", coastline_landfall_hrs: 18.5, fisheries: "LOW" }
};

export const mockAISVessels = [
  {
    mmsi: "419999999",
    vessel_name: "Pacific Horizon",
    vessel_type: "Crude Oil Tanker",
    flag: "Panama",
    distance_to_origin_km: 0.8,
    sog_transit_knots: 13.8,
    sog_at_origin_knots: 1.2,
    cog_degrees: 45.0,
    sog_anomaly_flag: true,
    ais_gap_detected: true, // Dark shipping behavior
    threat_score: 0.942,
    verdict: "HIGH_CORRELATION"
  },
  {
    mmsi: "419000104",
    vessel_name: "MV Pacific Star",
    vessel_type: "Container Ship",
    flag: "Liberia",
    distance_to_origin_km: 14.2,
    sog_transit_knots: 14.1,
    sog_at_origin_knots: 14.1,
    cog_degrees: 52.0,
    sog_anomaly_flag: false,
    ais_gap_detected: false,
    threat_score: 0.310,
    verdict: "LOW_CORRELATION"
  }
];
```

Additional data should include:

- pipeline progress data
- particle arrays
- DBSCAN clusters
- vessel tracks
- impact zones
- provenance metadata
- report queue entries
- commercial financial assumptions

---

# 19. Mock Service Architecture

Create service functions such as:

```js
// authService.js
login()
logout()

// incidentService.js
getIncident()
getHistoricalIncidents()
getTriageQueue()

// forensicService.js
runSARSegmentation()
runHindcast()
runDBSCAN()
runFullAnalysis()

// aisService.js
getVesselCandidates()
correlateAIS()

// reportService.js
createReport()
getReports()
updateReport()
```

Services must return promises so the UI can display realistic loading states.

Mock delays should be deterministic enough for repeatable demonstrations while still feeling like processing is occurring.

Do not hardcode operation results directly inside button components.

---

# 20. Report Store

Normal User report submissions must be available to Admin within the same session.

Abstract storage behind:

```js
createReport()
getReports()
updateReport()
clearReports()
```

v1 implementation may use:

- React Context
- in-memory store
- localStorage

Recommended behavior:

- current session uses in-memory state
- localStorage provides persistence across portal navigation/refresh where useful
- backend integration later replaces the implementation without changing consumers

---

# 21. Common Components

Build and reuse these components instead of creating visually different versions for every page.

## 21.1 MetricReadout

```text
SLICK AREA
14.6 km²
```

## 21.2 TelemetryRow

```text
WIND        6.2 m/s
DIRECTION   315°
```

## 21.3 StatusBadge

Examples:

- ACTIVE
- REVIEW
- COMPLETE
- WARNING
- HIGH CORRELATION
- LOW CORRELATION
- INSUFFICIENT DATA

## 21.4 ConfidenceIndicator

Must communicate confidence without implying that confidence equals legal certainty.

## 21.5 SourceBadge

Example:

`SOURCE · SENTINEL-1`

## 21.6 AnalyticalDisclaimer

Use subtle but visible language where appropriate:

`Demonstration analytical output — not a legal determination.`

---

# 22. Loading, Empty, Error and Disabled States

Every important workflow requires complete state handling.

## 22.1 Map loading

```text
GEO ENGINE
INITIALIZING...
```

## 22.2 Map failure

```text
MAPBOX ENGINE UNAVAILABLE
Switching to Leaflet fallback...
```

## 22.3 Pipeline loading

Show active service + progress + elapsed time.

## 22.4 Pipeline error

Example:

```text
HINDCAST SERVICE ERROR

Demonstration fallback dataset loaded.
[RETRY]
```

## 22.5 Empty AIS state

```text
NO AIS MATCHES

No vessel candidates found within the current search window.
```

## 22.6 Empty triage queue

```text
NO ACTIVE INCIDENTS

Awaiting satellite detection or field report.
```

## 22.7 Disabled controls

A downstream pipeline control must visually communicate why it is disabled.

Example tooltip:

`Run SAR Segmentation before Lagrangian Hindcast.`

---

# 23. Map Interaction Requirements

Map controls:

- zoom in/out
- reset viewport
- fullscreen
- layer toggle
- legend
- selected feature inspection
- incident fly-to
- vessel selection
- slick selection
- particle playback integration

Clicking a vessel should open an inspection panel with:

- vessel name
- MMSI
- type
- flag
- SOG
- COG
- distance to origin
- correlation assessment

Clicking the slick should show:

- incident ID
- area
- perimeter
- acquisition time
- analytical confidence
- source

---

# 24. Accessibility

All interactive controls must be:

- keyboard reachable
- focus visible
- labeled
- usable without relying only on color

Threat/anomaly states must combine:

- color
- icon
- text

Example:

`[warning icon] SOG ANOMALY DETECTED`

Do not use red/green as the sole semantic signal.

---

# 25. Motion & Animation

Use restrained motion.

Typical duration:

`150–250ms`

Allowed:

- panel transitions
- hover/focus transitions
- pipeline progress
- particle movement
- timeline animation
- map selection transitions

Avoid:

- bouncing cards
- giant entrance animations
- excessive spring effects
- continuous decorative motion
- unnecessary particle/glow effects

Particle animation must prioritize readability and performance.

---

# 26. Performance

Target:

- approximately 60fps for 1000 particles on a mid-range laptop GPU
- responsive UI during pipeline simulation
- no unnecessary re-rendering of the entire map

If performance drops:

- reduce particle rendering resolution/count
- simplify animation
- preserve interaction

Do not silently ship an unusably laggy default.

---

# 27. PDF / Evidence Dossier Architecture

Do not rely on a screenshot of the entire WebGL dashboard as the primary PDF-generation strategy.

Create a dedicated `DossierDocument.jsx`.

Suggested sections:

1. Case header
2. Incident summary
3. Satellite/SAR analysis
4. Slick geometry
5. Metocean conditions
6. Hindcast methodology
7. Origin reconstruction
8. DBSCAN clustering
9. AIS correlation
10. Impact vulnerability assessment
11. Evidence provenance
12. Analytical limitations
13. Demonstration disclaimer

Use `jspdf` and `jspdf-autotable` for document structure and tables.

Where screenshots are included, treat them as supporting visuals rather than the entire report architecture.

PDF exports should include:

- incident ID
- UTC timestamps
- source information
- data assumptions
- methodology
- clearly labeled analytical/demo status

---

# 28. Demo Mode

Demo Mode is a first-class feature for presentations and testing.

## 28.1 Activation

TopHUD toggle:

`DEMO MODE`

## 28.2 Full demonstration

Button:

`RUN FULL FORENSIC ANALYSIS`

Sequence:

```text
INGEST INCIDENT
      ↓
SAR SEGMENTATION
      ↓
LAGRANGIAN HINDCAST
      ↓
DBSCAN ORIGIN CLUSTER
      ↓
AIS CORRELATION
      ↓
IMPACT ASSESSMENT
      ↓
EVIDENCE READY
```

The interface updates progressively.

## 28.3 Demo behavior

Show:

- progress
- elapsed time
- completed steps
- map changes after each step
- bottom tray activation
- updated telemetry
- final evidence summary

The result must be deterministic for presentations.

---

## 28.4 SIH Evaluator Quick-View

Include a discreet "Evaluator Overview" toggle in the TopHUD next to Demo Mode. When active, it bypasses the sequential pipeline delays and immediately populates the map with the final state (SAR overlay + Hindcast drift line + Origin + Culprit AIS track). This guarantees that a judge with only 30 seconds to review the link sees the complete solution instantly without waiting for the animation timeline.

# 29. QA / Acceptance Checklist

## 29.1 General

- [ ] Public landing page renders correctly.
- [ ] Design does not resemble a generic SaaS dashboard.
- [ ] Map is the dominant workspace in operational portals.
- [ ] Lucide icons are used instead of emoji UI icons.
- [ ] No dead buttons or placeholder interactions remain.

## 29.2 Auth

- [ ] Blurred gateway works.
- [ ] Role selection persists into credential step.
- [ ] Correct portal mounts after login.
- [ ] Logout resets all role/incident state.
- [ ] Refresh returns gracefully to public state.

## 29.3 Normal User

- [ ] Historical incidents load.
- [ ] Fly-to works.
- [ ] Citizen report form works.
- [ ] Report appears in Admin triage.
- [ ] Polygon drawing works on Mapbox.
- [ ] Polygon drawing works on Leaflet fallback.
- [ ] Turf area/perimeter values update live.
- [ ] Simulated impact envelope works.
- [ ] Classifier renders `/oil_spill.jpg` verbatim.

## 29.4 Admin

- [ ] Triage queue combines citizen + automated incidents.
- [ ] Incident selection loads complete incident context.
- [ ] SAR state machine works.
- [ ] Hindcast state machine works.
- [ ] DBSCAN state works.
- [ ] AIS correlation state works.
- [ ] Full analysis demo works.
- [ ] Layers toggle correctly.
- [ ] Legend is present.
- [ ] Particle timeline has 49 states for 12h at 15-min resolution.
- [ ] Plotly cluster visualization works.
- [ ] AIS matrix works.
- [ ] Provenance is visible.
- [ ] Dossier PDF exports.

## 29.5 Commercial

- [ ] Mode switch works.
- [ ] Vessel inputs work.
- [ ] Trajectory consistency calculation works.
- [ ] P&I financial roll-up updates live.
- [ ] Exports work.
- [ ] Demo/analytical framing remains clear.

## 29.6 Resilience

- [ ] Mapbox works with valid token.
- [ ] Missing token automatically switches to Leaflet.
- [ ] Invalid token switches to Leaflet.
- [ ] Map failure does not crash the application.
- [ ] Pipeline errors show usable fallback state.

## 29.7 Accessibility

- [ ] All controls keyboard reachable.
- [ ] Focus states visible.
- [ ] Color is never the only state signal.

## 29.8 Build gates

- [ ] Production build succeeds.
- [ ] `npm audit` has zero high/critical findings.
- [ ] No `.ts` or `.tsx` files under `src/`.
- [ ] No unhandled console-breaking runtime errors.

---

# 30. Open Questions for Backend Integration (v2)

The frontend must be architected so these can be added without a major UI rewrite.

## 30.1 Authentication

- JWT/session persistence
- refresh token strategy
- real RBAC enforcement

## 30.2 Forensic services

Define endpoint contracts later for:

- SAR segmentation
- Lagrangian hindcast
- DBSCAN clustering
- AIS correlation

Determine whether each uses:

- REST request/response
- polling
- WebSocket push

## 30.3 Data persistence

Replace the local/mock report store with backend persistence.

## 30.4 External datasets

Define backend contracts for:

- Sentinel-1 ingestion
- AIS telemetry
- CMEMS/HYCOM currents
- atmospheric wind data

---

# 31. Master Antigravity Build Directive

Build the complete TritonTrace frontend according to this PRD.

### Non-negotiable constraints

- React + Vite
- JavaScript/JSX only
- no TypeScript
- Tailwind CSS
- lucide-react
- map-first command-center design
- Mapbox primary + Leaflet fallback
- deck.gl particle visualization
- Turf geometry utilities
- Plotly/Chart.js where specified
- structured PDF generation
- deterministic mock services
- responsive desktop layout

### Most important visual instruction

The finished product must feel like professional maritime intelligence software.

Do not generate a generic dark dashboard with a collection of cards.

The map is the core workspace.

Panels are compact operational instruments around the map.

Use information density, provenance, telemetry and state to create realism instead of decorative gradients or excessive glass effects.

### Most important architecture instruction

Keep these concerns separate:

```text
UI Components
      ↓
Context / Store
      ↓
Mock Services
      ↓
Mock Data
```

Map pages use:

```text
MapCanvas
      ↓
MapEngine abstraction
   ↙         ↘
Mapbox      Leaflet
```

Do not allow page components to become direct collections of map-provider-specific logic.

### Most important scientific instruction

Use the stated formulas consistently.

Convert speed/direction into vectors before vector arithmetic.

Use:

- 12-hour hindcast
- 15-minute time step
- 48 intervals
- 49 timeline states
- 1000 particles
- 3% demonstration leeway factor

### Most important UX instruction

Every important feature must have:

- idle
- loading
- success
- empty
- error
- disabled

states where appropriate.

### Most important forensic instruction

Differentiate:

- observation
- analytical classification
- correlation
- estimated origin
- uncertainty
- simulated impact
- legal determination

TritonTrace v1 is a demonstration frontend and must not present mock analysis as conclusive legal proof.

### Most important demo instruction

Provide a polished Demo Mode where the complete forensic workflow can be executed from one button and visibly progresses through:

```text
SAR
↓
HINDCAST
↓
DBSCAN
↓
AIS
↓
IMPACT
↓
EVIDENCE
```

### Final quality bar

Do not stop when the routes/components render.

Perform a visual and interaction pass and remove:

- unnecessary cards
- repetitive containers
- oversized headings
- excessive glow
- fake buttons
- placeholder copy
- emoji icons
- redundant information
- broken/empty states
- visual overflow

The completed application should look coherent enough that all three portals feel like modules of one real TritonTrace product.

---

# 32. Final Delivery Definition

The build is complete only when:

1. The public landing page looks polished and product-specific.
2. Authentication transitions correctly into all three portals.
3. All portals share one visual language.
4. The map is the primary operational surface.
5. Mapbox/Leaflet fallback is reliable.
6. Normal User reporting demonstrably reaches Admin triage.
7. Admin pipeline behaves as a real state machine.
8. Hindcast animation and timeline are coherent.
9. AIS correlation is presented as analytical evidence, not legal certainty.
10. Provenance is visible.
11. Commercial tools work with live mock calculations.
12. PDF outputs are structured evidence documents.
13. Demo Mode can showcase the product end-to-end.
14. Loading/error/empty states are implemented.
15. The application is responsive at the required desktop breakpoints.
16. No TypeScript exists in the source tree.
17. Build succeeds.
18. No high/critical npm audit vulnerabilities remain at delivery time.

**End of PRD.**
\n\n# 33. ANTIGRAVITY EXECUTION COMMAND\n\nWhen this PRD is supplied to Antigravity, the user will specify a phase.\n\nExample:\n\n> Build Phase 3 only.\n\nAntigravity must treat that phase as the complete scope of the current task.\n\n### Required behavior\n\n1. Inspect the existing repository before making changes.\n2. Preserve approved earlier phases.\n3. Implement only the requested phase.\n4. Do not create future-phase UI just because the PRD describes it.\n5. Make the requested phase runnable end-to-end within the current mock/frontend scope.\n6. Test the acceptance criteria.\n7. Fix issues found during testing.\n8. Report files changed and important implementation decisions.\n9. Stop.\n\n### Change-control rule\n\nIf the user asks for revisions to the current phase, modify only the requested parts. Do not advance the project to a later phase while making revisions.\n\n### Quality rule\n\nA phase is not complete merely because the route renders. The current phase must be visually polished, interactive, coherent with the TritonTrace design system, and free of obvious placeholders or dead controls.\n\n### Final instruction\n\n**Never implement the entire TritonTrace PRD in a single pass. Build phase-by-phase and wait for user review after every phase.**\n
