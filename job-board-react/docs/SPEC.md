# Spec: Simple Job Board (React rewrite)

## Objective
A React-based rewrite of the job board app currently implemented in `job-board-net/` (.NET 10 + Blazor Server). Same product, new stack: employers can post job listings; visitors see all posted jobs in a list. This is an experimentation project for learning a React + Node.js stack, living as a separate sibling subproject in this monorepo — `job-board-net/` is untouched and keeps running independently.

**Success looks like:** a visitor can open the site, see a list of all posted jobs (newest first), click "Post a Job," fill out a form, submit it, and immediately see it appear at the top of the list. Feature parity with the current MVP, including job deletion.

**Out of scope for MVP:** authentication, editing jobs, search/filtering, pagination, email notifications, styling polish. (Deleting jobs is in scope, matching the current app.)

## Tech Stack
- React 18 + Vite (frontend build tool and dev server)
- React Router (client-side routing between job list and post-job pages)
- Node.js + Fastify (backend API server)
- Prisma ORM (Code-First schema + migrations, closest React-ecosystem analogue to the EF Core workflow used in `job-board-net/`)
- SQLite (file-based, `jobboard.db`, gitignored) — matches the original project's DB choice
- Zod (request validation on the Fastify API, mirroring the original's model validation)
- Vitest + React Testing Library (frontend unit/component tests)
- Vitest (backend unit tests)
- npm workspaces (`frontend/`, `backend/`) at the `job-board-react/` root

**Assumption flagged for review:** Prisma was chosen as the ORM (not asked about explicitly) because its Code-First migration workflow is the most direct analogue to EF Core. If a lighter query builder (e.g. Drizzle, better-sqlite3 directly) is preferred, say so before the plan stage.

## Commands
```
Install:              npm install (from job-board-react/ root, installs both workspaces)
Run backend (dev):    npm run dev --workspace backend
Run frontend (dev):   npm run dev --workspace frontend
Build:                npm run build --workspaces
Test:                 npm test --workspaces
Add migration:        npm run --workspace backend prisma migrate dev --name <name>
Apply migrations:     npm run --workspace backend prisma migrate deploy
```

## Project Structure
```
job-board-react/
  docs/SPEC.md                      → This spec
  docs/changes/                     → Change history, one file per change
  package.json                      → npm workspaces root
  frontend/
    src/pages/JobList.tsx           → Job list page (route "/")
    src/pages/PostJob.tsx           → Create job form page (route "/post")
    src/components/                 → Shared UI components (e.g. JobCard)
    src/api/client.ts                → Fetch wrapper for calling the backend API
    src/types.ts                     → Job type + enums shared shape (mirrors backend)
  backend/
    src/routes/jobs.ts               → Fastify routes: GET/POST /api/jobs, DELETE /api/jobs/:id
    src/db/client.ts                 → Prisma client instance
    prisma/schema.prisma             → Job model + migrations
    src/validation/job.ts            → Zod schemas for job create/validation
    tests/                           → Vitest backend tests (mirrors src structure)
```

## Data Model
```prisma
model Job {
  id             Int      @id @default(autoincrement())
  title          String
  company        String
  location       String
  description    String
  employmentType String   // "FullTime" | "PartTime" | "Contract"
  locationType   String   // "Remote" | "Onsite" | "Hybrid"
  applicationUrl String
  postedDate     DateTime @default(now())
}
```
SQLite has no native enum type, so `employmentType`/`locationType` are stored as strings and constrained at the application boundary via Zod enums (`z.enum(["FullTime", "PartTime", "Contract"])`, `z.enum(["Remote", "Onsite", "Hybrid"])`), mirroring the shape of the original C# enums (`JobType`, `RemoteType`). All fields required except `postedDate`, which is set automatically on creation.

## API
- `GET /api/jobs` — Returns all jobs, newest `postedDate` first.
- `POST /api/jobs` — Body: all Job fields except `id`/`postedDate`. Validates `applicationUrl` as well-formed URL via Zod. Returns the created job.
- `DELETE /api/jobs/:id` — Deletes the job with the given id.

## Pages
- `/` — Job list. Fetches from `GET /api/jobs`. Each entry shows Title, Company, Location, EmploymentType, LocationType, a truncated/full Description, an "Apply" button pointing at `applicationUrl`, and a de-emphasized "Delete" link/button that confirms (native `window.confirm`) before calling `DELETE /api/jobs/:id` — "Apply" stays the visually dominant action.
- `/post` — Create job form. Fields for all Job properties except `id`/`postedDate`. Labels read "Employment Type", "Location Type", and "Application URL". Client-side validation mirrors the Zod schema; on valid submit, calls `POST /api/jobs` and redirects to `/`.

## Code Style
- TypeScript throughout (frontend and backend), strict mode enabled.
- camelCase for variables/functions, PascalCase for React components and types.
- Frontend: functional components + hooks only, no class components.
- Backend: routes stay thin — validation via Zod schemas, data access via Prisma client, no raw SQL.
- API calls from React components go through `src/api/client.ts`, not raw `fetch` calls scattered through components — keeps the API boundary swappable and mockable in tests.

## Testing Strategy
- Frontend: Vitest + React Testing Library. Component tests for `JobList` (rendering, ordering, delete confirmation flow) and `PostJob` (form validation, submit behavior). API calls mocked at the `src/api/client.ts` boundary.
- Backend: Vitest with a test SQLite database (or Prisma's in-memory-equivalent via a scoped test DB file), covering route handlers for list/create/delete and Zod validation edge cases.
- Coverage expectation: matches original project's bar — core CRUD paths covered, no exhaustive UI/E2E suite required for MVP.

## Boundaries
- **Always do:** run `npm test --workspaces` before considering a change complete; keep API calls behind `src/api/client.ts` on the frontend and behind Fastify routes + Prisma on the backend; follow the project structure above.
- **Ask first:** adding new dependencies beyond React/Vite/Fastify/Prisma/Zod/Vitest; adding new pages/routes beyond `/` and `/post`; introducing authentication; changing the chosen ORM (Prisma) or backend framework (Fastify).
- **Never do:** commit the `jobboard.db` file or any secrets; modify anything under `job-board-net/` as part of this rewrite; add features from the "out of scope" list without discussing first.

## Success Criteria
- [ ] `npm run dev --workspace backend` and `npm run dev --workspace frontend` start the app; `/` loads with an empty job list on first run.
- [ ] `/post` form creates a job and redirects to `/`, where the new job appears at the top.
- [ ] Job list is ordered newest-first by `postedDate`.
- [ ] `npm test --workspaces` passes with tests covering job list, job creation, and job deletion (frontend and backend).
- [ ] No auth required anywhere; no search/filter/edit present.
- [ ] A job can be deleted from `/` after a confirmation prompt, and is immediately removed from the list.

## Open Questions
- Confirm Prisma as the ORM choice (see assumption flagged above) before the plan stage proceeds to scaffold migrations.

## Change History
Full rationale and scope for each change to this spec is recorded in `docs/changes/`, one file per change, newest first:
- `docs/changes/2026-07-21-react-rewrite-initial-spec.md` — initial spec for the React/Fastify/Prisma rewrite
