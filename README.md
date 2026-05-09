# Atrium

Self-hosted meeting-room booking and management for your office. Apple-HIG-flavoured UI, single Docker stack, MIT-licensed.

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind v4
- **Backend:** Node.js + Hono + raw `pg` (Postgres driver)
- **Database:** Postgres 16
- **Auth:** Cookie-based sessions, bcrypt password hashes

## Run with Docker Compose

```bash
git clone https://github.com/<your-fork>/bookameeting.git
cd bookameeting
cp .env.example .env       # edit credentials before deploying
docker compose up -d
```

Open <http://localhost:8080> and sign in with the seeded admin account
(`eve@frieswings.com` / `atrium` by default — change `SEED_USER_*` in `.env`).

The Postgres data lives in the `atrium-pgdata` Docker volume, so
`docker compose down` keeps your data; `docker compose down -v` wipes it.

## Develop locally

You'll need Node 22+ and a running Postgres. The easiest way is to start just
the database from compose and run the apps on the host:

```bash
docker compose up -d db
export DATABASE_URL=postgres://atrium:atrium@localhost:5432/atrium

# Backend (port 8080)
cd backend
npm install
npm run migrate           # apply schema + seed
npm run dev

# Frontend (port 5173, in another shell)
cd frontend
npm install
npm run dev
```

The frontend currently renders the design with mock data; wiring it to the
backend is the next milestone (see `frontend/src/data.ts` and the `/api/*`
routes below).

## API

All routes are JSON. Auth is a session cookie issued by `POST /api/auth/login`.

| Method | Path                      | Auth | Purpose                                |
| ------ | ------------------------- | ---- | -------------------------------------- |
| GET    | `/api/health`             | no   | Liveness check                         |
| POST   | `/api/auth/login`         | no   | `{ email, password }` → session cookie |
| POST   | `/api/auth/logout`        | no   | Clear session                          |
| GET    | `/api/auth/me`            | yes  | Current user                           |
| GET    | `/api/auth/session`       | no   | Current user or `null`                 |
| GET    | `/api/rooms`              | no   | List active rooms                      |
| GET    | `/api/rooms/:id`          | no   | Single room                            |
| POST   | `/api/rooms`              | yes  | Create room                            |
| PATCH  | `/api/rooms/:id`          | yes  | Update room                            |
| DELETE | `/api/rooms/:id`          | yes  | Soft-delete (`active = false`)         |
| GET    | `/api/bookings`           | yes  | List (filters: `from`, `to`, `room_id`, `mine`) |
| POST   | `/api/bookings`           | yes  | Create — rejects overlapping slots     |
| GET    | `/api/bookings/:id`       | yes  | Single booking                         |
| DELETE | `/api/bookings/:id`       | yes  | Cancel (organizer only)                |

## Project layout

```
.
├── frontend/           # React + Vite app
├── backend/            # Hono API + migrations
│   ├── src/
│   └── migrations/
├── Dockerfile          # multi-stage: frontend → backend → runtime
├── docker-compose.yml  # app + postgres
└── .env.example
```

## License

MIT.
