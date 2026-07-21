# Task List: Delete a Job Post

- [x] Task 1: Add `JobService.DeleteJobAsync(int id)`
  - Acceptance: removes an existing job; no-ops (no throw) on a non-existent id
  - Verify: `dotnet test --filter JobServiceTests`; `dotnet build`
  - Files: src/JobBoard/Services/JobService.cs, tests/JobBoard.Tests/Services/JobServiceTests.cs

- [x] Checkpoint: Service layer — `dotnet test` and `dotnet build` pass

- [x] Task 2: Add Delete link + confirmation + list removal to `Home.razor`
  - Acceptance: de-emphasized Delete link per card (Apply stays the prominent button); confirm() gates deletion; confirmed delete removes from DB + list; cancelled delete leaves job untouched
  - Verify: `dotnet build`; manual check via `dotnet run --project src/JobBoard`
  - Files: src/JobBoard/Components/Pages/Home.razor

- [x] Checkpoint: Complete — build, test, and manual delete/cancel flow all verified
