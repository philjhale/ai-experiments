# Task List: Job Board MVP

### Phase 0: Scaffold
- [ ] Task 1: Initialize repo and solution structure

### Checkpoint 0
- [ ] `dotnet build` succeeds; `dotnet run --project src/JobBoard` serves the default template page

### Phase 1: Data Layer
- [ ] Task 2: Job model, enums, and DbContext
- [ ] Task 3: JobService + unit tests

### Checkpoint 1
- [ ] `dotnet test` passes with green `JobService` coverage

### Phase 2: UI
- [ ] Task 4: Job list page (`/`)
- [ ] Task 5: Post job form (`/post`)

### Checkpoint 2 (Final)
- [ ] `dotnet test` passes
- [ ] `dotnet run` → `/` loads with empty list on fresh db; `/post` creates a job and redirects to `/`; new job appears at top, newest-first ordering holds
- [ ] No auth, search, filter, edit, or delete present anywhere
- [ ] `jobboard.db` not committed; repo has an initial commit checkpointed after scaffold

See `tasks/plan.md` for full detail per task.
