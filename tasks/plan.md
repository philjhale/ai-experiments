# Plan: job-board-react rewrite

Spec: `job-board-react/docs/SPEC.md`. Stack: React 18 + Vite + React Router (frontend), Node.js + Fastify (backend), Prisma + SQLite, Zod validation, Vitest + React Testing Library.

## Dependency graph
- Workspace scaffold → Prisma schema → backend routes → frontend API client → frontend pages → routing → manual verification.
- Each backend route task is a complete vertical slice (route + validation + test), not split into "routes layer" then "tests layer".
- Each frontend page task is a complete vertical slice (component + API wiring + test).

## Phase 1 — Scaffold
1. **Workspace scaffold**: Create `job-board-react/package.json` (npm workspaces: `frontend`, `backend`), `frontend/` Vite+React+TS skeleton, `backend/` Fastify+TS skeleton, root `.gitignore` entries for `node_modules/`, `dist/`, `jobboard.db`.
   - Verify: `npm install` succeeds from `job-board-react/`; `npm run dev --workspace frontend` serves a blank page; `npm run dev --workspace backend` starts and responds on a health route.
2. **Prisma schema + migration**: Add `backend/prisma/schema.prisma` with the `Job` model from the spec, `backend/src/db/client.ts` Prisma client singleton, run initial migration.
   - Verify: `npx prisma migrate dev --name init` creates `jobboard.db` with a `Job` table matching the spec's fields.

**Checkpoint:** scaffold runs, migration applied, before any business logic is written.

## Phase 2 — Backend API (vertical slices)
3. **GET /api/jobs**: Route returns all jobs ordered by `postedDate` desc.
   - Verify: Vitest test seeds 2+ jobs, asserts newest-first order in response.
4. **POST /api/jobs**: Route validates body via Zod (required fields, `applicationUrl` well-formed URL, enum checks on `employmentType`/`locationType`), creates job, returns it.
   - Verify: Vitest tests for valid create (201 + row in DB) and invalid payloads (400, e.g. bad URL, missing field, bad enum value).
5. **DELETE /api/jobs/:id**: Route deletes job by id.
   - Verify: Vitest test creates a job, deletes it, asserts it's gone from a subsequent list query; deleting a non-existent id returns a sane 404 (not a 500).

**Checkpoint:** full backend API covered by tests, `npm test --workspace backend` green, before touching the frontend.

## Phase 3 — Frontend (vertical slices)
6. **API client**: `frontend/src/api/client.ts` with `getJobs()`, `createJob(job)`, `deleteJob(id)`, typed against `frontend/src/types.ts` (mirrors backend Job shape/enums).
   - Verify: unit test with `fetch` mocked, asserting correct URLs/methods/bodies.
7. **JobList page**: Renders jobs from `getJobs()`, newest first, each showing all fields + "Apply" link + "Delete" (with `window.confirm`) calling `deleteJob`.
   - Verify: RTL test — renders list in order, clicking Delete without confirming leaves the item, confirming removes it from the DOM.
8. **PostJob page**: Form for all Job fields except id/postedDate, client-side validation mirroring the Zod schema, submits via `createJob`, redirects to `/` on success.
   - Verify: RTL test — invalid submit shows validation errors and does not call the API; valid submit calls `createJob` and redirects.
9. **Routing**: Wire `react-router-dom` with routes `/` → JobList, `/post` → PostJob, nav link between them.
   - Verify: RTL test navigating between routes via the nav link.

**Checkpoint:** `npm test --workspace frontend` green, before end-to-end manual pass.

## Phase 4 — Integration & verification
10. **Manual golden-path check**: Run both dev servers, open the app, post a job, confirm it appears at top of list, delete it, confirm it's removed. Confirm `jobboard.db` is gitignored and not committed.
    - Verify: matches every box in the spec's Success Criteria.

## Task list
See `tasks/todo.md` for the flat checklist derived from this plan.
