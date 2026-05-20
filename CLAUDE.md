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
npm test         # run all tests (React Testing Library / Jest)
npm test -- --testPathPattern=<file>   # run a single test file
npm test -- --testNamePattern=<name>   # run tests matching a name
```

Backend requires `backend/.env`. Required variables: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `PORT=3001`. Optional: `DB_PORT` (defaults to 3306). Tables (`plates`, `admins`) are auto-created on startup and the initial admin account is seeded from `.env` credentials if the `admins` table is empty.

Frontend reads `REACT_APP_API_URL` (optional); falls back to `http://localhost:3001/api`.

The DB layer also runs **schema migrations on every startup** — it inspects existing columns and adds any missing ones. If it detects the old UUID-based plate ID scheme, it clears the plates table and rebuilds with INT AUTO_INCREMENT.

**Production deployment**: Built frontend files (`frontend/build/`) are committed to the repo and served by XAMPP Apache. The Express backend runs as a separate process alongside it. This is why the build folder is not in `.gitignore`.

## Architecture

### Backend (`backend/src/`)
- `index.js` — Express 5 entry: CORS, JSON middleware, global error handler, mounts `/api/auth`, `/api/plates`, `/api/users`, health check at `GET /api/health`.
- `db.js` — MySQL2 promise pool (limit 10); exports `pool` and `initDB()` which creates tables, runs migrations, and seeds the first admin.
- `routes/auth.js` — `POST /api/auth/login` (returns 8-hour JWT containing `id`, `username`, `role`, `site_code`, `dealer_name`), `GET /api/auth/verify`.
- `routes/plates.js` — `GET /api/plates/search` is public (search by `?mv=` or `?plate=`, space/dash-insensitive). All other routes require JWT. Role filtering is applied server-side: LTO sees only their `site_code`, dealers see only their assigned records.
- `routes/users.js` — Administrator-only CRUD for admin accounts. New users are created with default password `"password"`. `PUT /:id` re-hashes a new password only when `password` is present in the request body. `DELETE /:id` blocks self-deletion (returns 400 if `req.params.id === req.admin.id`).

### `authMiddleware` is duplicated

`authMiddleware` (JWT verification) and `requireRole`/`adminOnly` are defined separately in both `routes/plates.js` and `routes/users.js` — they are not shared. If you change token verification logic, update both files.

### Route ordering constraint

In `routes/plates.js`, `GET /dealers` **must stay above `GET /:id`** because both are single-segment paths and Express matches in declaration order. `GET /stats/summary` has two path segments so it is not caught by `/:id` regardless of position — its placement after `/:id` in the file is intentional and safe.

### `GET /api/plates` query parameters

Beyond `q` (full-text search), `page`, and `limit`, the list endpoint supports two additional filters:
- `?duplicates=mv|plate|both` — returns only records that share a normalized MV file number or plate number with another record (useful for deduplication workflows in the admin UI).
- `?mv_exact=<value>` — filters to an exact normalized MV file number match (dashes stripped, uppercased).

### Public search behavior

`GET /api/plates/search` returns only the **first matching record** (`rows[0]`), even though `mv_file_number` is non-unique. Searching by plate number is effectively unique (application-level uniqueness enforced on write).

### Role-Based Access Control

| Action | administrator | lto | dealer |
|---|---|---|---|
| View plates | all | own site_code only | assigned to them only |
| Create/edit plates | yes | own site_code only | no |
| Delete plates | yes | no | no |
| Claim plates (`PATCH /claim`) | yes | no | own assigned only |
| Manage users | yes | no | no |

JWT payload carries `role`, `site_code`, and `dealer_name`; these are stored in localStorage under keys `platex_role`, `platex_site_code`, `platex_dealer_name`. The client uses these for UI rendering; the server re-enforces them independently on every request.

`PATCH /:id/claim` expects `{ is_claimed: true|false }` in the body. The server writes `1` or `0` to the DB and returns the updated record.

### Data normalization on write

On `POST /` and `PUT /:id`, `mv_file_number` is stored as `TRIM().toUpperCase()` and `plate_number` as `TRIM().toUpperCase()` (or `null` if blank). Searches and uniqueness checks normalize both fields the same way, so mixed-case input is safe.

### Frontend (`frontend/src/`)
- **Pages**: `Search.jsx` (`/`), `AdminLogin.jsx` (`/admin/login`), `AdminDashboard.jsx` (`/admin`), `AdminPlates.jsx` (`/admin/plates`), `AdminUsers.jsx` (`/admin/users` — administrator only).
- **Auth**: `ProtectedRoute` component reads `platex_token` from localStorage. On successful login, the token and user fields are written to localStorage under `platex_token`, `platex_user`, `platex_role`, `platex_site_code`, `platex_dealer_name`.
- **API client**: `services/api.js` — Axios instance; request interceptor attaches the JWT from `localStorage.platex_token`. Exports `plateService` (public search), `adminService` (plates CRUD + stats), and `userService` (user CRUD).
- **Notifications**: `react-toastify` — `ToastContainer` is mounted in `App.js` (bottom-right, 3s autoclose, respects dark mode).
- **Theme**: `ThemeContext` (exported from `App.js`) carries `{ theme, setDark, collapsed, setCollapsed }`. `theme` is a flat object of CSS values (e.g. `bg`, `bgCard`, `border`, `textPrimary`, `plateText`). `collapsed` is the sidebar fold state, shared across all admin pages. Toggled from `Sidebar` and `AdminLogin`.
- **Styling**: Bootstrap 5 + React Bootstrap for layout/components; Tailwind CSS with `corePlugins.preflight: false` (prevents Tailwind reset from conflicting with Bootstrap). Google Fonts: Rajdhani (headings), DM Sans (body), JetBrains Mono (MV numbers/code). Tailwind config is at `frontend/tailwind.config.js`.

### Icon pattern

`react-icons` is installed but **not used**. All icons across `AdminPlates.jsx`, `Sidebar.jsx`, etc. are inline SVG components defined at the top of each file. Follow this pattern when adding new icons — do not import from `react-icons`.

### `status: 'Available'` is intentionally excluded from the form

The `STATUSES` constant in `AdminPlates.jsx` only includes `['In Process', 'At Dealer', 'At LTO']`. The `'Available'` value exists in the DB ENUM and in `STATUS_COLORS`, but is deliberately omitted from create/edit dropdowns — it is treated as a terminal state not settable via the form.

### Data Model

**`plates`** (INT AUTO_INCREMENT PK): `id`, `mv_file_number`, `site_code`, `site_name`, `plate_number`, `owner_name`, `vehicle_type`, `brand`, `model`, `color`, `status` (ENUM: `In Process` | `At LTO` | `At Dealer` | `Available`), `claim_location`, `remarks`, `is_claimed` (TINYINT), `assigned_dealer_id`, `created_at`, `updated_at`.

`mv_file_number` is **not unique** — the constraint was intentionally dropped to allow multiple plates per MV file. `plate_number` has an application-level uniqueness check (space-normalized, case-insensitive). `assigned_dealer_id` is VARCHAR(36) holding the UUID that references `admins.id`.

**`admins`** (VARCHAR UUID PK): `id`, `username` (UNIQUE), `password` (bcrypt, 10 rounds), `role` (ENUM: `administrator` | `lto` | `dealer`), `site_code`, `dealer_name`, `first_name`, `middle_name`, `last_name`, `created_at`.

### Auth Flow
Login → backend returns signed JWT → frontend stores in localStorage → Axios interceptor attaches as `Authorization: Bearer <token>` → protected routes verify and reject if missing/invalid.
