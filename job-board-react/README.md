# Job Board (React rewrite)

A React + Node.js rewrite of the job board app in `job-board-net/` (.NET + Blazor Server). Employers can post job listings; visitors see all posted jobs in a list, newest first, and can delete listings. See `docs/SPEC.md` for the full spec.

## Stack

- Frontend: React 18 + Vite + React Router, tested with Vitest + React Testing Library
- Backend: Node.js + Fastify + Prisma (SQLite) + Zod validation, tested with Vitest
- npm workspaces (`frontend/`, `backend/`) at this root

## Getting started

```bash
npm install                            # installs both workspaces

# copy the backend env template and apply the migration
cp backend/.env.example backend/.env
npm run --workspace backend prisma migrate deploy

npm run dev --workspace backend        # http://localhost:3001
npm run dev --workspace frontend       # http://localhost:5173
```

The frontend dev server proxies `/api` requests to the backend (see `frontend/vite.config.ts`), so no CORS setup is needed in development.

## Commands

```
Install:              npm install
Run backend (dev):    npm run dev --workspace backend
Run frontend (dev):   npm run dev --workspace frontend
Build:                npm run build --workspaces
Test:                 npm test --workspaces
Add migration:        npm run --workspace backend prisma migrate dev --name <name>
Apply migrations:     npm run --workspace backend prisma migrate deploy
```

## Project structure

```
job-board-react/
  docs/SPEC.md                      Spec (source of truth for scope/design)
  docs/changes/                     Change history, one file per change
  frontend/
    src/pages/JobList.tsx           Job list page ("/")
    src/pages/PostJob.tsx           Create job form page ("/post")
    src/api/client.ts               Fetch wrapper for the backend API
    src/types.ts                    Job type + enums, mirrors the backend shape
  backend/
    src/routes/jobs.ts              Fastify routes: GET/POST /api/jobs, DELETE /api/jobs/:id
    src/validation/job.ts           Zod schemas for job create + id param
    src/db/client.ts                Prisma client instance
    prisma/schema.prisma             Job model + migrations
    tests/                          Vitest backend tests
```

## Notes

- `jobboard.db` (dev) and `test.db` (backend tests) are gitignored SQLite files; backend tests run against `test.db` via `.env.test` so they never touch your dev data.
- Out of scope for this MVP: authentication, editing jobs, search/filtering, pagination, email notifications.
