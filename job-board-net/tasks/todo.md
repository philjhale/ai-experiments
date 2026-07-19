# Task List: Job Board MVP

### Phase 0: Scaffold
- [x] Task 1: Initialize repo and solution structure

### Checkpoint 0
- [x] `dotnet build` succeeds; `dotnet run --project src/JobBoard` serves the default template page

### Phase 1: Data Layer
- [x] Task 2: Job model, enums, and DbContext
- [x] Task 3: JobService + unit tests

### Checkpoint 1
- [x] `dotnet test` passes with green `JobService` coverage

### Phase 2: UI
- [x] Task 4: Job list page (`/`)
- [x] Task 5: Post job form (`/post`)

### Checkpoint 2 (Final)
- [x] `dotnet test` passes
- [x] `dotnet run` → `/` loads with empty list on fresh db; `/post` creates a job and redirects to `/`; new job appears at top, newest-first ordering holds
- [x] No auth, search, filter, edit, or delete present anywhere
- [x] `jobboard.db` not committed; repo has an initial commit checkpointed after scaffold

See `tasks/plan.md` for full detail per task. MVP complete as of 2026-07-19; deviated from SPEC.md by targeting .NET 10 instead of .NET 8 (only SDK available on the dev machine).
