# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PlateX** — a full-stack plate tracking system with a public search interface and an authenticated admin panel for CRUD management of vehicle plates.

## Development Setup

The project has two independently run servers:

**Backend** (Express API on port 3001):
```
cd backend
npm run dev      # development with nodemon
npm start        # production
```

**Frontend** (React CRA dev server on port 3000):
```
cd frontend
npm start        # development
npm run build    # production build
npm test         # run tests (React Testing Library / Jest)
```

Backend requires a `.env` file at `backend/.env` with `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `PORT=3001`. The database tables (`plates`, `admins`) are auto-created on startup if they don't exist — the initial admin account is seeded from the `.env` credentials.

## Architecture

### Backend (`backend/src/`)
- `index.js` — Express 5 app entry: mounts CORS, JSON middleware, `/api/auth` and `/api/plates` routers, calls `initializeDatabase()`, then listens.
- `db.js` — MySQL2 promise pool; exports `pool` for queries and `initializeDatabase()` which creates tables and seeds the admin on first run.
- `routes/auth.js` — `POST /api/auth/login` (returns JWT), `GET /api/auth/verify` (validates JWT).
- `routes/plates.js` — `GET /api/plates/search` (public, by plate or MV file number); remaining CRUD routes are protected by JWT middleware inline on the router.

### Frontend (`frontend/src/`)
- **Pages**: `Search.jsx` (public `/`), `AdminLogin.jsx` (`/admin/login`), `AdminDashboard.jsx` (`/admin`), `AdminPlates.jsx` (`/admin/plates`).
- **Services**: `services/api.js` — Axios instance pointed at `http://localhost:3001/api`; automatically attaches the JWT from `localStorage` via a request interceptor.
- **Theme**: Dark/light mode managed by a React context; toggled via `Sidebar` component.
- **Styling**: React Bootstrap for layout/components + Tailwind CSS (core plugins disabled so they don't conflict with Bootstrap).

### Data Model
`plates` table: `id` (UUID PK), `mv_file_number` (unique), `plate_number`, `owner_name`, `vehicle_make`, `vehicle_model`, `vehicle_color`, `status` (`In Process` | `At Dealer` | `At LTO` | `Available`), `created_at`, `updated_at`.

### Auth Flow
Login posts credentials → backend returns a signed JWT → frontend stores it in `localStorage` → Axios interceptor attaches it as `Authorization: Bearer <token>` on every subsequent request → protected plate routes verify and reject if invalid/missing.
