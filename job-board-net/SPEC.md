# Spec: Simple Job Board (MVP)

## Objective
A general-purpose job board web app. Employers can post job listings; visitors see all posted jobs in a list. This is an experimentation project for learning .NET Core + Blazor.

**Success looks like:** a visitor can open the site, see a list of all posted jobs (newest first), click "Post a Job," fill out a form, submit it, and immediately see it appear at the top of the list.

**Out of scope for MVP:** authentication, editing jobs, search/filtering, pagination, email notifications, styling polish. (Deleting jobs is in scope — see "Change: Add job deletion" below.)

## Tech Stack
- .NET 10 (only SDK available on the dev machine at scaffold time; originally spec'd as .NET 8)
- ASP.NET Core Blazor Server (interactive server-side rendering, no separate API/WASM client)
- Entity Framework Core 10 (Code-First)
- SQLite (file-based, `jobboard.db`, gitignored)
- xUnit for unit tests
- Default Blazor Bootstrap template for styling (no custom design system)

## Commands
```
Run (dev):        dotnet run --project src/JobBoard
Watch (hot reload): dotnet watch --project src/JobBoard
Build:             dotnet build
Test:              dotnet test
Add migration:     dotnet ef migrations add <Name> --project src/JobBoard

Apply migrations:  dotnet ef database update --project src/JobBoard
```

## Project Structure
```
src/JobBoard/                  → Main Blazor Server app
src/JobBoard/Components/Pages/ → Razor pages (Home.razor = job list, Post.razor = create form)
src/JobBoard/Data/             → EF Core DbContext, entity configs
src/JobBoard/Models/           → Job entity + enums (JobType, RemoteType)
src/JobBoard/Services/         → JobService (data access abstraction over DbContext)
tests/JobBoard.Tests/          → xUnit unit tests (mirrors src structure)
```

## Data Model
```csharp
public class Job
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Company { get; set; } = "";
    public string Location { get; set; } = "";
    public string Description { get; set; } = "";
    public JobType EmploymentType { get; set; }
    public RemoteType LocationType { get; set; }
    public string ApplicationUrl { get; set; } = "";
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
}

public enum JobType { FullTime, PartTime, Contract }
public enum RemoteType { Remote, Onsite, Hybrid }
```
All fields required except `PostedDate`, which is set automatically on creation.

Note: the `Job.JobType` and `Job.Remote` properties were renamed to `EmploymentType` and `LocationType` for clarity. The enum *type* names (`JobType`, `RemoteType`) and their member values are unchanged — only the property names, DB columns, and UI labels changed. Requires a new EF Core migration (rename columns; do not edit `InitialCreate` in place).

## Pages
- `/` — Job list. Displays all jobs, newest `PostedDate` first. Each entry shows Title, Company, Location, EmploymentType, LocationType, a truncated/full Description, an "Apply" link pointing at `ApplicationUrl`, and a "Delete" button that confirms before removing the job.
- `/post` — Create job form. Fields for all Job properties except `Id` and `PostedDate`. Labels read "Employment Type", "Location Type", and "Application URL". `ApplicationUrl` is validated as a well-formed URL. On valid submit, saves via `JobService` and redirects to `/`.

## Code Style
- Standard C# conventions: PascalCase for public members/types, camelCase for locals/params, `_camelCase` for private fields.
- Nullable reference types enabled (`<Nullable>enable</Nullable>`).
- Data access goes through `JobService`, not directly from Razor components — components inject `JobService`, not `DbContext`, keeping persistence swappable and testable.

Example:
```csharp
public class JobService
{
    private readonly JobBoardContext _context;

    public JobService(JobBoardContext context) => _context = context;

    public async Task<List<Job>> GetAllJobsAsync() =>
        await _context.Jobs.OrderByDescending(j => j.PostedDate).ToListAsync();

    public async Task AddJobAsync(Job job)
    {
        _context.Jobs.Add(job);
        await _context.SaveChangesAsync();
    }
}
```

## Testing Strategy
- Framework: xUnit, with EF Core's in-memory provider for `JobService` tests (no SQLite file dependency in tests).
- Location: `tests/JobBoard.Tests/`, mirroring `src/JobBoard/` structure (e.g. `Services/JobServiceTests.cs`).
- Coverage expectation: `JobService` methods (add, list/ordering) covered by unit tests. No component/UI tests required for MVP — this is an experimentation project, not production-hardened.

## Boundaries
- **Always do:** run `dotnet test` before considering a change complete; keep data access behind `JobService`; follow the project structure above.
- **Ask first:** adding new NuGet dependencies beyond EF Core/SQLite/xUnit; adding new pages/routes beyond `/` and `/post`; introducing authentication.
- **Never do:** commit the `jobboard.db` file or any secrets; add features from the "out of scope" list without discussing first.

## Success Criteria
- [x] `dotnet run` starts the app and `/` loads with an empty job list on first run.
- [x] `/post` form creates a job and redirects to `/`, where the new job appears at the top.
- [x] Job list is ordered newest-first by `PostedDate`.
- [x] `dotnet test` passes with unit tests covering `JobService.AddJobAsync` and `GetAllJobsAsync`.
- [x] No auth required anywhere; no search/filter/edit present.
- [ ] A job can be deleted from `/` after a confirmation prompt, and is immediately removed from the list.

## Open Questions
None — MVP scope confirmed: create + list + delete only, no auth, no search/filter/edit.

---

## Change: Rename `JobType` → `EmploymentType`, `Remote` → `LocationType` (2026-07-19)

Renames two `Job` model properties for clarity. Not a behavior change — no new fields, no functional changes.

**Scope:**
- `Job.cs`: property `JobType` → `EmploymentType`, property `Remote` → `LocationType`. Enum type/value names (`JobType`, `RemoteType`, `FullTime`/`PartTime`/`Contract`, `Remote`/`Onsite`/`Hybrid`) unchanged.
- `JobBoardContext.cs` / `JobService.cs`: no references to old property names.
- New EF Core migration renames the `JobType`/`Remote` columns (existing `InitialCreate` migration left as-is).
- `Home.razor`: badge display uses `@job.EmploymentType` / `@job.LocationType`.
- `Post.razor`: form labels read "Employment Type" / "Location Type"; `@bind-Value` and `JobInput` property names updated.
- `JobServiceTests.cs` updated to new property names.

**Acceptance:**
- [ ] `dotnet build` succeeds.
- [ ] `dotnet test` passes.
- [ ] UI shows "Employment Type" and "Location Type" labels where "Job Type" and "Remote" appeared before.

**Boundaries:** ask first before renaming the `Job` entity itself, the enum values, or the `JobBoard` project/namespace — out of scope for this change.

---

## Change: Add `ApplicationUrl` to Job (2026-07-19)

Adds a new required `ApplicationUrl` field to `Job` — the URL candidates use to apply. Additive change: new field, new column, no renames.

**Scope:**
- `Job.cs`: new `public string ApplicationUrl { get; set; } = "";` property, required like the other string fields.
- `Post.razor`: `JobInput` gets a new `ApplicationUrl` property with `[Required]` and `[Url]` data annotations; new "Application URL" labeled `InputText` field; `HandleValidSubmit` mapping includes `ApplicationUrl = job.ApplicationUrl`.
- `Home.razor`: each job entry gets a clickable "Apply" link (`<a href="@job.ApplicationUrl">`) pointing at `ApplicationUrl`.
- New EF Core migration adds the `ApplicationUrl` column to the `Jobs` table (existing migrations left as-is, per established convention).
- `JobServiceTests.cs`: existing `Job` object literals updated to include `ApplicationUrl`.

**Acceptance:**
- [ ] `dotnet build` succeeds.
- [ ] `dotnet test` passes.
- [ ] `/post` form has an "Application URL" field, required, rejects malformed URLs.
- [ ] `/` shows a clickable "Apply" link for each job, pointing at its `ApplicationUrl`.
- [ ] New migration applies cleanly via `dotnet ef database update`.

**Boundaries:** no changes to other Job properties, no new pages/routes, no auth — out of scope for this change.

---

## Change: GitHub Actions CI — run tests on PR (2026-07-20)

Adds a GitHub Actions workflow that runs the C# test suite (`dotnet test`) automatically whenever a pull request is opened against the repo, giving PR authors/reviewers fast feedback before merge.

**Scope:**
- New file `.github/workflows/tests.yml`.
- Trigger: `pull_request` event, types `opened`, `synchronize`, `reopened` — re-running on new pushes to an open PR (not just the initial open) is standard practice and avoids stale green checks; flagged here since the request said "when a PR is opened."
- Runner: `ubuntu-latest`.
- Steps: checkout, `actions/setup-dotnet` pinned to .NET 10.x (matching the `TargetFramework` already in `src/JobBoard/JobBoard.csproj` / `tests/JobBoard.Tests/JobBoard.Tests.csproj`), `dotnet restore`, `dotnet build --no-restore`, `dotnet test --no-build`.
- Scoped to the `job-board-net/` subfolder (repo has other top-level projects); workflow `working-directory` / paths set accordingly, and `paths:` filter limited to `job-board-net/**` plus the workflow file itself so unrelated changes elsewhere in the repo don't trigger it.
- No branch filter (`branches:`) — runs for PRs targeting any base branch, matching "when a PR is opened" with no stated restriction.

**Acceptance:**
- [ ] `.github/workflows/tests.yml` exists and is valid YAML.
- [ ] Workflow triggers on `pull_request` (opened/synchronize/reopened) for changes under `job-board-net/`.
- [ ] Workflow runs `dotnet restore`, `dotnet build`, `dotnet test` against `JobBoard.slnx` (or the test project directly) and fails the check on test failure.
- [ ] A PR that breaks a test shows a failing check; a PR with passing tests shows a passing check.

**Boundaries:** no code coverage reporting, no matrix/multi-OS testing, no deployment steps — out of scope for this change. Ask first before adding status badges to `README.md` or branch-protection rule changes (those are repo-settings changes, not part of this workflow file).

---

## Change: Add job deletion (2026-07-21)

Adds the ability to delete a job posting from the list page. Hard delete (row removed from the `Jobs` table), triggered by a "Delete" button on each job entry on `/`, gated by a confirmation prompt to prevent accidental clicks. No new page — stays on `/`.

**Scope:**
- `JobService.cs`: new `Task DeleteJobAsync(int id)` method — finds the `Job` by id and removes it via `_context.Jobs.Remove(...)` + `SaveChangesAsync()`. No-op (or safely ignored) if the id no longer exists, to guard against double-clicks/race conditions.
- `Home.razor`: each job entry gets a "Delete" button. Clicking it shows a confirmation prompt (via `IJSRuntime` `confirm()`) before calling `JobService.DeleteJobAsync` and refreshing the in-memory job list so the row disappears without a full page reload.
- `JobServiceTests.cs`: new tests covering `DeleteJobAsync` — deletes an existing job (list no longer contains it, other jobs unaffected), and calling it with a non-existent id does not throw.
- No new EF Core migration required — deletion doesn't change the schema.

**Acceptance:**
- [ ] `dotnet build` succeeds.
- [ ] `dotnet test` passes, including new `DeleteJobAsync` tests.
- [ ] `/` shows a "Delete" button per job entry.
- [ ] Clicking "Delete" prompts for confirmation; confirming removes the job from the list and the database; cancelling leaves it untouched.
- [ ] Deleting a job does not affect other jobs' ordering or data.

**Boundaries:** hard delete only, no soft-delete/`IsDeleted` flag, no undo, no auth/permission check on who can delete, no new page/route — out of scope for this change.
