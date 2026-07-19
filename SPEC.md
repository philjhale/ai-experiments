# Spec: Simple Job Board (MVP)

## Objective
A general-purpose job board web app. Employers can post job listings; visitors see all posted jobs in a list. This is an experimentation project for learning .NET Core + Blazor.

**Success looks like:** a visitor can open the site, see a list of all posted jobs (newest first), click "Post a Job," fill out a form, submit it, and immediately see it appear at the top of the list.

**Out of scope for MVP:** authentication, editing/deleting jobs, search/filtering, pagination, email notifications, styling polish.

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
    public JobType JobType { get; set; }
    public RemoteType Remote { get; set; }
    public DateTime PostedDate { get; set; } = DateTime.UtcNow;
}

public enum JobType { FullTime, PartTime, Contract }
public enum RemoteType { Remote, Onsite, Hybrid }
```
All fields required except `PostedDate`, which is set automatically on creation.

## Pages
- `/` — Job list. Displays all jobs, newest `PostedDate` first. Each entry shows Title, Company, Location, JobType, Remote, and a truncated/full Description.
- `/post` — Create job form. Fields for all Job properties except `Id` and `PostedDate`. On valid submit, saves via `JobService` and redirects to `/`.

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
- [ ] `dotnet run` starts the app and `/` loads with an empty job list on first run.
- [ ] `/post` form creates a job and redirects to `/`, where the new job appears at the top.
- [ ] Job list is ordered newest-first by `PostedDate`.
- [ ] `dotnet test` passes with unit tests covering `JobService.AddJobAsync` and `GetAllJobsAsync`.
- [ ] No auth required anywhere; no search/filter/edit/delete present.

## Open Questions
None — MVP scope confirmed: create + list only, no auth, no search/filter.
