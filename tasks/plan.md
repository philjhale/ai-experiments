# Plan: Add `ApplicationUrl` property to Job

Source: `job-board-net/SPEC.md` → "Change: Add `ApplicationUrl` to Job (2026-07-19)".

## Dependency graph

```
Task 1: Job.cs model + EF migration + JobServiceTests update
   │  (ApplicationUrl must exist on the entity before it can be
   │   read/written by either page)
   ├──> Task 2: Post.razor create-form field (write path)
   └──> Task 3: Home.razor "Apply" link (read path)
```

Tasks 2 and 3 are independent of each other once Task 1 lands — both only depend on the entity having the property. They're kept as separate commits since they touch different files and are separately verifiable.

## Task 1 — Model, migration, tests

**Files:** `src/JobBoard/Models/Job.cs`, new file under `src/JobBoard/Migrations/`, `tests/JobBoard.Tests/Services/JobServiceTests.cs`

- Add `public string ApplicationUrl { get; set; } = "";` to `Job`, placed after `LocationType` (matches SPEC.md data model ordering).
- Run `dotnet ef migrations add AddApplicationUrlToJob --project src/JobBoard` to generate the migration (do not hand-edit `InitialCreate` or the rename migration).
- Update the two `Job` object literals in `JobServiceTests.cs` (`AddJobAsync_PersistsTheJob`, `GetAllJobsAsync_ReturnsJobsNewestFirst`) to include a realistic `ApplicationUrl` value.

**Acceptance criteria:**
- `dotnet build` succeeds.
- `dotnet test` passes.
- Migration file adds an `ApplicationUrl` column to `Jobs`; `JobBoardContextModelSnapshot.cs` reflects it.

**Verification:** `dotnet build && dotnet test` from `job-board-net/`.

## Task 2 — Post.razor create form

**Files:** `src/JobBoard/Components/Pages/Post.razor`

- Add `ApplicationUrl` to the `JobInput` class with `[Required]` and `[Url]` annotations.
- Add a labeled `InputText` field ("Application URL") mirroring the existing `Title`/`Company`/`Location` field markup.
- Add `ApplicationUrl = job.ApplicationUrl` to the `new Job { ... }` mapping in `HandleValidSubmit`.

**Acceptance criteria:**
- Form won't submit without a value in Application URL.
- Form won't submit if the value isn't a well-formed URL.
- Valid submission persists `ApplicationUrl` on the created `Job`.

**Verification:** `dotnet run --project src/JobBoard`, manually submit `/post` with (a) empty Application URL — rejected, (b) `not-a-url` — rejected, (c) `https://example.com/apply` — succeeds and redirects to `/`.

## Task 3 — Home.razor Apply link

**Files:** `src/JobBoard/Components/Pages/Home.razor`

- Add an `<a href="@job.ApplicationUrl">Apply</a>` element to each job entry's markup.

**Acceptance criteria:**
- Each job card on `/` shows a clickable "Apply" link pointing at that job's `ApplicationUrl`.

**Verification:** `dotnet run --project src/JobBoard`, load `/`, confirm the Apply link is present and points at the URL entered in Task 2's manual test.

## Checkpoint

After Task 1: run `dotnet build && dotnet test` before starting Task 2 — confirms the schema/model change is sound before building UI on top of it.

After Tasks 2 and 3: full manual walkthrough (post a job with an Application URL, confirm it appears and the Apply link works on `/`) before moving to review.
