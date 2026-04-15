# HUL Dashboard Project Context for Claude

Generated from the current repository state on 2026-04-15.

Project path: `C:\Users\Admin\Desktop\RPDS\Hul\HUL-DASHBOARD`

This document is intended to hand the project to another senior engineer or coding agent with enough context to continue development without rereading the whole repo first.

## 1. Project Overview

### What this project does

This repository contains a dashboard-style web application for monitoring an industrial production process at Hindustan Unilever, Sonepat Unit, Haryana.

The app currently presents four main areas:

- `Dashboard`: current batch summary, wastage KPI cards, and trend charts.
- `Process`: a tabbed process-monitoring page with detailed SVG-based visualizations for:
  - Complete Process
  - Solid Dispensing / Solid Handling
  - Mashing Section
  - Extraction Section
- `Data Analytics`: trend charts and a batch performance table.
- `BIP Calculator`: a client-side calculator for process-specific BIP values.

### Business purpose

The business goal appears to be:

- monitor batch/process performance in near real time,
- compare actual output against standard or target output,
- quantify wastage,
- expose bottlenecks across solid handling, mashing, and extraction,
- give plant operators/engineers a unified view of process health.

The domain vocabulary strongly suggests a batch manufacturing / food-process workflow involving malt, wort, weak wort, extraction, and waste tracking.

Important note: the exact business meaning of `BIP` is not explicitly defined anywhere in the repo. The UI treats it as a key operational calculation tied to output and wastage, but the acronym itself should be confirmed with the business team before extending the logic.

### Key features already present

- Multi-page React app with routing.
- Shared layout with left navigation and top status header.
- Styled KPI cards, tables, charts, and process diagrams.
- Detailed SVG process diagrams with pseudo-live animation.
- Client-side BIP calculation workflow with editable inputs.
- Prototype FastAPI backend script exposing mocked process endpoints.

### High-level maturity assessment

This is currently closer to a polished frontend prototype / technical proof of concept than a production-ready full-stack system.

The UI is substantial, but the live data layer, persistence layer, backend structure, testing, and deployment standards are still missing or incomplete.

## 2. Tech Stack

### Frontend

- React 18
- TypeScript
- Vite 4
- React Router DOM 6
- Tailwind CSS 3
- Chart.js 4
- `react-chartjs-2`

Frontend state management is entirely local:

- `useState`
- `useEffect`
- `useMemo`

There is no Redux, Zustand, React Query, SWR, or any other shared data/store layer.

### Backend

There is no integrated backend application inside the frontend structure.

There is one standalone Python file:

- `fastapi_process_endpoint.py`

It defines:

- a FastAPI app,
- a router,
- four mocked `GET` endpoints under `/api/process/...`,
- permissive CORS for localhost frontend origins.

This backend script is not currently wired into the React app.

### Database

No database layer exists in the current repo.

No evidence of:

- PostgreSQL
- MySQL
- SQLite
- MongoDB
- Prisma
- SQLAlchemy
- Sequelize
- Supabase
- Firebase

### ML models

No machine learning model, training pipeline, feature store, or inference service is present.

The only "prediction" currently in the app is mocked or formula-driven UI data.

### External APIs / services

Current external dependencies are minimal:

- Google Fonts CDN in `index.html`
- optional future API base URL via `VITE_API_BASE_URL`

No real plant API, PLC integration, OPC-UA client, ERP integration, or analytics API is actually implemented in this repo.

### Tooling / build

- `npm run dev` -> Vite dev server
- `npm run build` -> TypeScript compile + Vite production build
- `npm run lint` -> configured in `package.json`, but currently broken because no repo-level ESLint config exists

## 3. Folder Structure

Below is the meaningful project tree. Vendor/build internals are intentionally collapsed for readability, but all authored application files are listed.

```text
HUL-DASHBOARD/
|- .git/                         # Git metadata
|- .vscode/
|  `- settings.json             # Editor/Tailwind helper settings
|- dist/                        # Generated production build output (currently committed/tracked)
|  |- assets/                   # Hashed JS/CSS bundles
|  |- images/                   # Copied public image assets
|  `- index.html                # Built entry HTML
|- node_modules/                # Frontend dependencies
|- public/
|  `- images/
|     |- coil.png
|     |- cylinder Tank.png
|     |- cylinder.png
|     |- extraction.png
|     |- logo.png
|     |- main.png
|     |- mashing.png
|     `- solid_handling.png
|- src/
|  |- components/
|  |  |- flowcharts/
|  |  |  |- CompleteProcess.tsx
|  |  |  |- ExtractionSection.tsx
|  |  |  |- MashingSection.tsx
|  |  |  `- SolidHandling.tsx
|  |  |- Card.tsx
|  |  |- DataTable.tsx
|  |  |- KPICard.tsx
|  |  |- Sidebar.tsx
|  |  |- StatusBadge.tsx
|  |  `- Topbar.tsx
|  |- constants/
|  |  |- mockData.ts
|  |  `- nav.ts
|  |- hooks/
|  |  |- useBipCalculator.ts
|  |  `- useLiveProcessData.ts
|  |- layouts/
|  |  `- MainLayout.tsx
|  |- pages/
|  |  |- BIPCalculator.tsx
|  |  |- Dashboard.tsx
|  |  |- Machines.tsx
|  |  `- Reports.tsx
|  |- App.tsx
|  |- index.css
|  |- main.tsx
|  `- vite-env.d.ts
|- venv/                        # Broken/non-portable Python virtualenv from another machine
|  `- pyvenv.cfg
|- fastapi_process_endpoint.py  # Standalone mocked FastAPI backend prototype
|- index.html                   # Frontend HTML entry
|- package-lock.json
|- package.json
|- postcss.config.js
|- tailwind.config.js
|- test-write.txt               # Stray file; not part of app logic
|- tsconfig.json
|- tsconfig.node.json
`- vite.config.ts
```

### What each major folder is for

- `.vscode/`
  - local editor support only
  - no runtime relevance

- `public/images/`
  - static image assets
  - `coil.png`, `cylinder.png`, and `logo.png` are actively used
  - `main.png`, `mashing.png`, `solid_handling.png`, `extraction.png`, and `cylinder Tank.png` appear to be legacy or currently unused

- `src/components/`
  - reusable UI primitives and domain-specific process visualizations

- `src/components/flowcharts/`
  - most domain-heavy frontend code
  - each file renders an SVG process diagram and simulates live data with timers

- `src/constants/`
  - centralized static navigation labels and mock chart/table/KPI data

- `src/hooks/`
  - formula logic and future API polling/websocket hooks

- `src/pages/`
  - route-level screens

- `dist/`
  - built output from `npm run build`
  - currently generated artifacts are present in the repo and produce git noise after every build

- `venv/`
  - Python environment copied from a different machine/path
  - currently not portable or usable in this workspace

## 4. Important Files Explanation

### Application bootstrap / routing

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/main.tsx` | React entry point | Mounts `<App />` into `#root` and loads global CSS |
| `src/App.tsx` | Route map | Wraps routes in `BrowserRouter` and `MainLayout` |
| `src/layouts/MainLayout.tsx` | Global shell | Sidebar + Topbar + main content area |

### Shared UI components

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/components/Sidebar.tsx` | Left navigation | Uses `NAV_ITEMS`; highlights active route |
| `src/components/Topbar.tsx` | Header/status bar | Shows plant name, product label, live badge, local time |
| `src/components/StatusBadge.tsx` | Status chip | Shared badge styling for `Live`, `Good`, `Warn`, etc. |
| `src/components/KPICard.tsx` | KPI summary card | Used on dashboard and reports |
| `src/components/Card.tsx` | Generic card wrapper | Shared card layout |
| `src/components/DataTable.tsx` | Generic table renderer | Used by reports page |

### Page-level screens

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/pages/Dashboard.tsx` | Executive/summary view | Uses static mock data and pseudo-live time updates |
| `src/pages/Machines.tsx` | Process monitoring page | Tab wrapper for the four SVG process views |
| `src/pages/Reports.tsx` | Analytics/reporting | Uses mock chart data and mock batch table |
| `src/pages/BIPCalculator.tsx` | Editable BIP calculator | Entirely client-side calculation flow |

### Domain logic / hooks

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/hooks/useBipCalculator.ts` | BIP formula engine | Calculates level/time/quantity based BIP values |
| `src/hooks/useLiveProcessData.ts` | Intended live data integration hook | Supports polling and WebSocket patterns, but is not used anywhere yet |

### Constants / fixtures

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/constants/nav.ts` | Navigation labels and fixed product/batch values | Contains route paths and hard-coded product/batch display values |
| `src/constants/mockData.ts` | Dashboard/report fixtures | Central source for current mock KPI, chart, and batch table data |

### Process flowchart components

| File | Responsibility | Notes |
| --- | --- | --- |
| `src/components/flowcharts/SolidHandling.tsx` | Solid handling / dispensing visualization | Uses local mock state plus `setInterval` + `Math.random` |
| `src/components/flowcharts/MashingSection.tsx` | Mashing process visualization | Uses local mock state plus `setInterval` + `Math.random` |
| `src/components/flowcharts/ExtractionSection.tsx` | Extraction process visualization | Uses local mock state plus `setInterval` + `Math.random` |
| `src/components/flowcharts/CompleteProcess.tsx` | End-to-end process overview | Aggregates process blocks into a single SVG |

### Backend prototype

| File | Responsibility | Notes |
| --- | --- | --- |
| `fastapi_process_endpoint.py` | Mock FastAPI process API | Intended to back the React process views, but currently standalone and only mock-based |

### Config / build files

| File | Responsibility | Notes |
| --- | --- | --- |
| `package.json` | Frontend dependency and script manifest | No backend dependency manifest exists |
| `vite.config.ts` | Vite config | Minimal, no dev proxy configured |
| `tailwind.config.js` | Tailwind theme | Defines custom colors/fonts/shadows |
| `postcss.config.js` | PostCSS plugins | Tailwind + autoprefixer |
| `tsconfig.json` | TypeScript app config | `strict: true` |
| `index.html` | HTML shell | Still references missing `/vite.svg` favicon |
| `.vscode/settings.json` | Editor support | Tailwind-friendly editor rules |

## 5. Data Flow

There are two separate data-flow stories in this repo:

- the current implemented flow,
- the intended future API-backed flow.

### Current implemented data flow

#### Dashboard and reports

1. Route renders `Dashboard.tsx` or `Reports.tsx`.
2. Page imports static data from `src/constants/mockData.ts`.
3. Charts and KPI cards render from those in-memory constants.
4. `Dashboard.tsx` updates only the current time every second.
5. No server call is made.

#### Process tabs

1. Route renders `Machines.tsx`.
2. User chooses a tab.
3. Each tab component initializes a local `mockData` object.
4. Each flowchart component starts a `setInterval` loop.
5. The loop mutates local React state using `Math.random()`.
6. SVG text, indicators, and labels rerender from local state.
7. No backend, no persistence, and no shared store is involved.

#### BIP Calculator

1. Route renders `BIPCalculator.tsx`.
2. The page seeds editable inputs from hard-coded default values.
3. User edits values in local state.
4. Clicking `Calculate` calls `calculateBipValues(...)` from `useBipCalculator.ts`.
5. The hook returns row-level BIP results.
6. The page derives `BoM Output`, `STD Output`, `Total BIP`, `Wastage`, and `Wastage %` in the browser.
7. No API call or database write occurs.

### Intended future API-backed flow

The intended design seems to be:

1. Frontend calls FastAPI endpoints under `/api/process/...`.
2. `useLiveProcessData.ts` polls those endpoints using `fetch`.
3. Optional WebSocket path is available for higher-frequency updates.
4. Components render live server data with fallback mock data.
5. Backend eventually reads actual sensor/process values and computes outputs.

However, this intended flow is not wired into the UI yet.

### Current backend API surface

`fastapi_process_endpoint.py` exposes:

| Endpoint | Purpose | Intended frontend consumer | Current reality |
| --- | --- | --- | --- |
| `GET /api/process/solid-handling` | Solid handling metrics | `SolidHandling.tsx` | Not connected |
| `GET /api/process/mashing` | Mashing metrics | `MashingSection.tsx` | Not connected |
| `GET /api/process/extraction` | Extraction metrics | `ExtractionSection.tsx` | Not connected |
| `GET /api/process/complete` | Full-process summary | `CompleteProcess.tsx` | Not connected |

### API contract mismatch details

This is one of the biggest blockers for integration.

#### Solid handling mismatch

- Frontend expects `mixing_bip`.
- FastAPI response does not provide `mixing_bip`.

#### Mashing mismatch

Frontend expects several BIP-specific fields:

- `mixing_tank1_bip`
- `mixing_tank2_bip`
- `post_hex3_bip`
- `post_hex6_bip`

FastAPI response does not provide any of those.

#### Extraction mismatch

This is the largest shape mismatch.

Frontend expects:

- `columns[]`
- `buffer`
- `wash_boxes[]`

FastAPI currently returns:

- `units[]`
- aggregate output fields

The frontend extraction component cannot consume the backend response without a mapping layer or a backend contract rewrite.

#### Complete process mismatch

The backend includes values such as:

- `mashing_efficiency`
- `wort_extraction`

But the frontend `CompleteProcess.tsx` interface does not use them, and the process summary cards shown on the `main` tab are hard-coded in `Machines.tsx` instead of being driven by live data.

## 6. Current Status

### What is already completed

- Basic application shell and routing are complete.
- Visual identity/theme is already established.
- Four page routes are implemented and navigable.
- Reports/dashboard charts render correctly from mock data.
- Process section has substantial SVG work already done.
- BIP calculator UI and client-side formula engine exist.
- A mocked FastAPI backend prototype exists.
- Production frontend build works.

### What is still missing

#### Frontend integration

- No component currently uses `useLiveProcessData`.
- No component currently uses `useWebSocketProcessData`.
- No environment file exists for `VITE_API_BASE_URL`.
- No state layer for shared process data exists.

#### Backend

- No real backend project structure.
- No backend package manifest (`requirements.txt` or `pyproject.toml`).
- No real process calculation service layer.
- No real persistence layer.
- No API authentication.
- No validation/mapping layer for frontend contract alignment.

#### Data / persistence

- No database schema.
- No batch history storage.
- No user/session model.
- No audit trail.

#### Quality / delivery

- No README.
- No test suite.
- No ESLint config.
- No CI pipeline.
- No deployment config.

### Verification snapshot

Verified during this analysis:

- `npm run build` succeeds.
- `npm run lint` fails because ESLint cannot find a project configuration file.
- The Python virtualenv is broken on this machine because `venv\pyvenv.cfg` points at `C:\Python312\python.exe` and an old workspace path from another machine.

## 7. Known Issues / Gaps

### Architecture / integration gaps

- Frontend and backend are effectively disconnected.
- The backend exists only as a standalone mock script, not as an integrated service.
- There is no API/data access layer inside the frontend beyond an unused hook.
- The repository has no persistence layer at all.

### Contract and domain logic issues

- Frontend process component data models do not match backend response models.
- BIP values are not modeled consistently across the app.
- `useBipCalculator.ts` clamps each per-row BIP result to the range `0..1`, while process screens display BIP-like values in the `200+` range.
- `STD Output`, `Actual Output`, and `Wastage` formulas should be revalidated with the business team before being treated as canonical.

### UI/product completeness issues

- Dashboard input fields like `Mashing Hour` and `Present BIP` are not connected to any downstream calculation.
- Reports page filters are static UI only; they do not filter anything.
- Main process summary cards in `Machines.tsx` are hard-coded and not connected to the `CompleteProcess` component data.
- Process views simulate live updates using `Math.random`, which can be mistaken for real telemetry during demos if not called out.

### Code quality / correctness issues

- `BIPCalculator.tsx` renders the `mashingHour` input twice.
- `BIPCalculator.tsx` has a visible typo: `Mahing Hour`.
- Product list includes `horlecs`, which is likely a typo or shorthand that should be confirmed.
- The repo contains several encoding/mojibake artifacts in comments, labels, and icon strings.
- Navigation icon strings in `src/constants/nav.ts` are corrupted.
- `DataTable.tsx` imports `StatusBadge` but does not use it.
- `Sidebar.tsx` imports `PRODUCT` but does not use it.

### Styling / build issues

- Tailwind classes like `border-l-3` and `border-t-3` are used, but default Tailwind does not generate those classes unless explicitly configured. The intended 3px borders may not actually render.
- `index.html` references `/vite.svg`, but the file is not present in the repo, so the favicon is broken.
- `dist/` is committed/tracked, which creates noisy git diffs after every build.

### Backend / environment issues

- No Python dependency manifest exists.
- The FastAPI file docstring mentions `fastapi_process_endpoints.py` while the actual filename is `fastapi_process_endpoint.py`.
- The checked-in `venv/` is not portable and should not be trusted.
- No `.env` file or example environment file exists.

### Missing engineering standards

- No automated tests.
- No linting configuration.
- No CI.
- No documentation for setup/run/deploy.
- No API contract documentation or schema docs.

## 8. Instructions for Next Developer (Claude)

### What should be built next

The next developer should treat this as a frontend prototype that now needs a real data and backend integration phase.

### Priority tasks

#### Priority 1: lock down the domain model and API contracts

Before writing much code, define a real contract for each process tab:

- Solid Handling
- Mashing
- Extraction
- Complete Process
- BIP Calculator inputs/outputs

For each contract, agree on:

- field names,
- units,
- target values,
- whether values are instantaneous, batch-level, or calculated,
- exact meaning of `BIP`,
- which values are raw inputs vs derived outputs.

This should be done first because the current frontend/backend mismatch is too large for safe incremental wiring.

#### Priority 2: build a real backend structure

Refactor `fastapi_process_endpoint.py` into a proper backend package, for example:

```text
backend/
|- app/
|  |- main.py
|  |- api/
|  |  `- process.py
|  |- schemas/
|  |- services/
|  `- config.py
|- requirements.txt or pyproject.toml
`- .env.example
```

Goals:

- one place for response schemas,
- one place for process calculations,
- one place for data-source integration,
- one place for environment config.

#### Priority 3: wire the frontend to live data

Use `useLiveProcessData.ts` or replace it with a better API layer.

Recommended approach:

- create typed frontend interfaces in a dedicated `src/types/` folder,
- create API clients in `src/services/`,
- keep mock fallback data only for offline/dev mode,
- move interval-based `Math.random` simulation behind a feature flag or remove it entirely.

#### Priority 4: normalize the BIP calculation logic

The BIP calculator needs a domain review.

Specifically:

- confirm whether per-row BIP values should really be clamped to `0..1`,
- align calculator outputs with the BIP values shown in the process diagrams,
- verify `BoM Output`, `STD Output`, and `Actual Output` formulas,
- remove duplicate inputs and typos,
- add validation and unit labels that reflect real business meaning.

#### Priority 5: add persistence and reporting data model

If this system is meant to do real batch analytics, add a database-backed model for:

- batches,
- products,
- process snapshots,
- calculated outputs,
- wastage metrics,
- report filters/date ranges.

This is especially important because the `Reports` screen is currently static.

#### Priority 6: clean up repo hygiene

- remove committed `venv/`
- stop tracking generated `dist/` unless there is a deliberate deployment reason
- add `README.md`
- add `.env.example`
- add ESLint config
- add tests
- fix favicon reference
- fix broken icon/encoding strings

### Suggested implementation order

1. Document and freeze backend/frontend response contracts.
2. Build proper FastAPI app structure and dependency manifest.
3. Add frontend API service layer and env config.
4. Wire one process tab end-to-end first, preferably `SolidHandling`.
5. Expand to `Mashing`, `Extraction`, and `Complete Process`.
6. Refactor `Reports` to use stored or fetched data.
7. Refactor `BIP Calculator` after business logic confirmation.
8. Add tests and cleanup.

### Strong recommendation for the first end-to-end slice

Start with `SolidHandling` because it is the simplest integration target:

- backend contract is closer to the UI than the other tabs,
- it has fewer structural mismatches than extraction,
- it will prove the fetch/render pattern for the rest of the app.

### Questions that should be answered by product/business before major work

- What exactly does `BIP` stand for in this system?
- Which displayed values are batch totals vs live telemetry?
- Which process values come from sensors and which are calculated?
- Should operator-entered values on the dashboard be persisted?
- Are reports historical, per shift, per day, or per batch?
- What are the authoritative source systems for live plant data?

### Bottom line

The frontend foundation is real and usable, but the repo is still missing the production-grade data layer. The highest-value next step is not more UI polish. It is contract alignment plus one real end-to-end backend integration slice.
