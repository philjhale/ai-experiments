# Todo: job-board-react rewrite

## Phase 1 — Scaffold
- [x] 1. Workspace scaffold (npm workspaces, Vite+React+TS frontend, Fastify+TS backend, .gitignore)
- [x] 2. Prisma schema + initial migration (Job model)

## Phase 2 — Backend API
- [x] 3. GET /api/jobs (+ test)
- [x] 4. POST /api/jobs with Zod validation (+ tests: valid + invalid)
- [x] 5. DELETE /api/jobs/:id (+ tests: success + not-found)

## Phase 3 — Frontend
- [x] 6. API client (src/api/client.ts, src/types.ts) (+ test)
- [x] 7. JobList page (+ test: order, delete confirm flow)
- [x] 8. PostJob page (+ test: validation, submit + redirect)
- [x] 9. Routing (react-router-dom, nav link) (+ test)

## Phase 4 — Integration
- [x] 10. Manual golden-path verification against spec Success Criteria
