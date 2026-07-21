# Todo: job-board-react rewrite

## Phase 1 — Scaffold
- [ ] 1. Workspace scaffold (npm workspaces, Vite+React+TS frontend, Fastify+TS backend, .gitignore)
- [ ] 2. Prisma schema + initial migration (Job model)

## Phase 2 — Backend API
- [ ] 3. GET /api/jobs (+ test)
- [ ] 4. POST /api/jobs with Zod validation (+ tests: valid + invalid)
- [ ] 5. DELETE /api/jobs/:id (+ tests: success + not-found)

## Phase 3 — Frontend
- [ ] 6. API client (src/api/client.ts, src/types.ts) (+ test)
- [ ] 7. JobList page (+ test: order, delete confirm flow)
- [ ] 8. PostJob page (+ test: validation, submit + redirect)
- [ ] 9. Routing (react-router-dom, nav link) (+ test)

## Phase 4 — Integration
- [ ] 10. Manual golden-path verification against spec Success Criteria
