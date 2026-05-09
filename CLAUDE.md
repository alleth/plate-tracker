# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PlateX** — a full-stack plate tracking system with a public search interface and an authenticated admin panel for CRUD management of vehicle plates. Three distinct roles (administrator, lto, dealer) each have different data visibility and action permissions.

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

Backend requires `backend/.env`. Required variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `PORT=3001`. Tables (`plates`, `admins`) are auto-created on startup and the initial admin account is seeded from `.env` credentials if the `admins` table is empty.

The DB layer also runs **schema migrations on every startup** — it inspects existing columns and adds any missing ones. If it detects the old UUID-based plate ID scheme, it clears the plates table and rebuilds with INT AUTO_INCREMENT.

## Architecture

### Backend (`backend/src/`)
- `index.js` — Express 5 entry: CORS, JSON middleware, global error handler, mounts `/api/auth`, `/api/plates`, `/api/users`, health check at `GET /api/health`.
- `db.js` — MySQL2 promise pool (limit 10); exports `pool` and `initDB()` which creates tables, runs migrations, and seeds the first admin.
- `routes/auth.js` — `POST /api/auth/login` (returns 8-hour JWT containing `id`, `username`, `role`, `site_code`, `dealer_name`), `GET /api/auth/verify`.
- `routes/plates.js` — `GET /api/plates/search` is public (search by `?mv=` or `?plate=`, space/dash-insensitive). All other routes require JWT. Role filtering is applied server-side: LTO sees only their `site_code`, dealers see only their assigned records.
- `routes/users.js` — Administrator-only CRUD for admin accounts. New users are created with default password `"password"`.

### Role-Based Access Control

| Action | administrator | lto | dealer |
|---|---|---|---|
| View plates | all | own site_code only | assigned to them only |
| Create/edit plates | yes | own site_code only | no |
| Delete plates | yes | no | no |
| Claim plates (`PATCH /claim`) | yes | no | own assigned only |
| Manage users | yes | no | no |

JWT payload carries `role`, `site_code`, and `dealer_name`; these are stored in localStorage under keys `platex_role`, `platex_site_code`, `platex_dealer_name`. The client uses these for UI rendering; the server re-enforces them independently on every request.

### Frontend (`frontend/src/`)
- **Pages**: `Search.jsx` (`/`), `AdminLogin.jsx` (`/admin/login`), `AdminDashboard.jsx` (`/admin`), `AdminPlates.jsx` (`/admin/plates`), `AdminUsers.jsx` (`/admin/users` — administrator only).
- **Auth**: `ProtectedRoute` component reads `platex_token` from localStorage. On successful login, the token and user fields are written to localStorage under `platex_token`, `platex_user`, `platex_role`, `platex_site_code`, `platex_dealer_name`.
- **API client**: `services/api.js` — Axios instance pointing at `http://localhost:3001/api`; request interceptor attaches the JWT from `localStorage.platex_token`.
- **Theme**: Dark/light mode via React `ThemeContext`; entire theme palette passed as an object (colors, backgrounds, borders) to components. Toggled from `Sidebar` and `AdminLogin`.
- **Styling**: Bootstrap 5 + React Bootstrap for layout/components; Tailwind CSS with `corePlugins.preflight: false` (prevents Tailwind reset from conflicting with Bootstrap). Google Fonts: Rajdhani (headings), DM Sans (body), JetBrains Mono (MV numbers/code).

### Data Model

**`plates`** (INT AUTO_INCREMENT PK): `id`, `mv_file_number`, `site_code`, `site_name`, `plate_number`, `owner_name`, `vehicle_type`, `brand`, `model`, `color`, `status` (ENUM: `In Process` | `At LTO` | `At Dealer` | `Available`), `claim_location`, `remarks`, `is_claimed` (TINYINT), `assigned_dealer_id`, `created_at`, `updated_at`.

**`admins`** (VARCHAR UUID PK): `id`, `username` (UNIQUE), `password` (bcrypt, 10 rounds), `role` (ENUM: `administrator` | `lto` | `dealer`), `site_code`, `dealer_name`, `first_name`, `middle_name`, `last_name`, `created_at`.

### Auth Flow
Login → backend returns signed JWT → frontend stores in localStorage → Axios interceptor attaches as `Authorization: Bearer <token>` → protected routes verify and reject if missing/invalid.
