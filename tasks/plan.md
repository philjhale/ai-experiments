# Implementation Plan: Job Board MVP (.NET 8 Blazor Server)

## Context
SPEC.md defines a minimal job board (Blazor Server + EF Core + SQLite) with a fully closed scope: post a job, list jobs newest-first. The project directory is currently empty except `SPEC.md` — no git repo, no `src/`, no `.gitignore`, no scaffold. This plan takes the spec from zero to a working, tested MVP. Since there's no existing code or repo, this is foundation-first (scaffold → data → service → UI) rather than parallelizable vertical slices — each phase is a hard dependency of the next.

## Architecture Decisions
- Follow SPEC.md exactly: project structure, `Job` model/enums, `JobService` abstraction, EF Core + SQLite, xUnit + EF in-memory provider for tests.
- Git repo initialized at the start so work is checkpointed incrementally (not currently a repo).
- `jobboard.db` and standard .NET build artifacts (`bin/`, `obj/`) gitignored from the first commit.

## Task List

### Phase 0: Scaffold
- [ ] **Task 1: Initialize repo and solution structure**
  - Acceptance: `git init`; `.gitignore` covers `bin/`, `obj/`, `*.db`, `.vs/`; `dotnet new blazorserver -o src/JobBoard` (or `blazor` template per current SDK) scaffolds the app; `dotnet new xunit -o tests/JobBoard.Tests`; solution file ties both projects together; `dotnet build` succeeds.
  - Verification: `dotnet build` exits 0 from repo root.
  - Dependencies: None.
  - Files: `.gitignore`, `JobBoard.sln`, `src/JobBoard/*`, `tests/JobBoard.Tests/*`.
  - Scope: M.

### Checkpoint 0
- [ ] `dotnet build` succeeds; `dotnet run --project src/JobBoard` serves the default template page.

### Phase 1: Data Layer
- [ ] **Task 2: Job model, enums, and DbContext**
  - Acceptance: `Models/Job.cs` and enums (`JobType`, `RemoteType`) match SPEC exactly; `Data/JobBoardContext.cs` defines `DbSet<Job> Jobs`; SQLite connection string points at `jobboard.db`; nullable reference types enabled in `.csproj`; initial EF migration created and applied (`dotnet ef migrations add InitialCreate`, `dotnet ef database update`).
  - Verification: `dotnet ef database update` succeeds and creates `jobboard.db` with a `Jobs` table matching the model.
  - Dependencies: Task 1.
  - Files: `src/JobBoard/Models/Job.cs`, `src/JobBoard/Data/JobBoardContext.cs`, `src/JobBoard/Migrations/*`, `src/JobBoard/JobBoard.csproj`, `src/JobBoard/Program.cs` (DbContext registration).
  - Scope: S.

- [ ] **Task 3: JobService + unit tests**
  - Acceptance: `Services/JobService.cs` implements `AddJobAsync` and `GetAllJobsAsync` (ordered by `PostedDate` descending) per the SPEC example; `tests/JobBoard.Tests/Services/JobServiceTests.cs` covers both methods using EF Core's in-memory provider (add persists, list returns newest-first).
  - Verification: `dotnet test` passes.
  - Dependencies: Task 2.
  - Files: `src/JobBoard/Services/JobService.cs`, `tests/JobBoard.Tests/Services/JobServiceTests.cs`.
  - Scope: S.

### Checkpoint 1
- [ ] `dotnet test` passes with green `JobService` coverage.

### Phase 2: UI
- [ ] **Task 4: Job list page (`/`)**
  - Acceptance: `Components/Pages/Home.razor` injects `JobService`, displays all jobs newest-first, showing Title, Company, Location, JobType, Remote, and Description (truncated with expand or full — pick one, matches SPEC "truncated/full"); empty state renders cleanly with zero jobs.
  - Verification: `dotnet run`, load `/`, confirm empty list renders without error on fresh `jobboard.db`.
  - Dependencies: Task 3.
  - Files: `src/JobBoard/Components/Pages/Home.razor`.
  - Scope: S.

- [ ] **Task 5: Post job form (`/post`)**
  - Acceptance: `Components/Pages/Post.razor` has a form for all `Job` fields except `Id`/`PostedDate`, using `EditForm` + `DataAnnotationsValidator` for required-field validation; valid submit calls `JobService.AddJobAsync` and redirects to `/`.
  - Verification: `dotnet run`, submit a job via `/post`, confirm redirect to `/` and the new job appears at the top of the list.
  - Dependencies: Task 4.
  - Files: `src/JobBoard/Components/Pages/Post.razor`.
  - Scope: S.

### Checkpoint 2 (Final)
- [ ] `dotnet test` passes.
- [ ] `dotnet run` → `/` loads with empty list on fresh db; `/post` creates a job and redirects to `/`; new job appears at top, newest-first ordering holds.
- [ ] No auth, search, filter, edit, or delete present anywhere.
- [ ] `jobboard.db` not committed; repo has an initial commit checkpointed after scaffold.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| `dotnet new blazorserver` template name varies by installed SDK version (.NET 8 uses unified `blazor` template with server-render flags) | Low | Confirm exact template invocation during Task 1 by checking `dotnet new list` output; adjust flags to get Blazor Server (interactive server render, no WASM) per SPEC. | 
| EF Core in-memory provider behaves subtly differently from SQLite (e.g., no real transactions) | Low | Acceptable per SPEC's own testing strategy — explicitly scoped this way. |

## Open Questions
None — SPEC.md has no open questions and this plan follows it directly.

## Next Steps After Approval
Save this plan to `tasks/plan.md` and the checklist to `tasks/todo.md` (per the planning-and-task-breakdown skill convention used by `/build`), then hand off to the `agent-skills:build` or `agent-skills:test` (TDD) skill to execute Phase 0 onward.
