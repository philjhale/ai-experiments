# Todo: Rename JobType→EmploymentType, Remote→LocationType

## Task 1: Rename properties on `Job` model ✅ done

**Description:** Rename `Job.JobType` → `Job.EmploymentType` and `Job.Remote` → `Job.LocationType`. Enum type names (`JobType`, `RemoteType`) and enum member values are unchanged — only the two property declarations change.

**Acceptance criteria:**
- [ ] `Job.cs` line 10: `public JobType EmploymentType { get; set; }`
- [ ] `Job.cs` line 11: `public RemoteType LocationType { get; set; }`
- [ ] Enum definitions (`JobType`, `RemoteType`) untouched

**Verification:**
- [ ] `dotnet build` will fail here (expected — downstream references not yet updated); confirm the only errors are in `Home.razor`, `Post.razor`, `JobServiceTests.cs`

**Dependencies:** None

**Files likely touched:**
- `src/JobBoard/Models/Job.cs`

**Estimated scope:** XS (1 file)

---

## Task 2: Add EF Core migration for column rename ✅ done

**Description:** Generate a new migration that renames the `JobType` and `Remote` columns in the `Jobs` table to `EmploymentType` and `LocationType`. Do not edit `InitialCreate` in place.

**Acceptance criteria:**
- [ ] `dotnet ef migrations add RenameJobTypeAndRemote --project src/JobBoard` generates a new migration file
- [ ] Migration uses `RenameColumn` operations (not drop+add) for both columns
- [ ] `JobBoardContextModelSnapshot.cs` reflects the new column names

**Verification:**
- [ ] Inspect generated migration file to confirm `RenameColumn` calls, not `DropColumn`/`AddColumn`
- [ ] `dotnet ef database update --project src/JobBoard` applies cleanly against a fresh/local `jobboard.db`

**Dependencies:** Task 1

**Files likely touched:**
- `src/JobBoard/Migrations/<timestamp>_RenameJobTypeAndRemote.cs`
- `src/JobBoard/Migrations/<timestamp>_RenameJobTypeAndRemote.Designer.cs`
- `src/JobBoard/Migrations/JobBoardContextModelSnapshot.cs`

**Estimated scope:** S (3 generated files, no hand-authored logic beyond inspection)

---

## Task 3: Update `Home.razor` and `Post.razor` ✅ done

**Description:** Update all UI references from `job.JobType`/`job.Remote` to `job.EmploymentType`/`job.LocationType`, update form labels to "Employment Type" and "Location Type", and rename the `JobInput` helper properties in `Post.razor`.

**Acceptance criteria:**
- [ ] `Home.razor`: badges display `@job.EmploymentType` and `@job.LocationType`
- [ ] `Post.razor`: `<InputSelect @bind-Value="job.EmploymentType">` and `@bind-Value="job.LocationType"`, with labels reading "Employment Type" / "Location Type"
- [ ] `Post.razor`: `JobInput.EmploymentType` / `JobInput.LocationType` properties, and the object-construction lines (`EmploymentType = job.EmploymentType`, `LocationType = job.LocationType`)

**Verification:**
- [ ] `dotnet build` succeeds
- [ ] Manual check: run app, confirm `/post` shows correct labels and `/` shows correct badge values after posting a job

**Dependencies:** Task 1

**Files likely touched:**
- `src/JobBoard/Components/Pages/Home.razor`
- `src/JobBoard/Components/Pages/Post.razor`

**Estimated scope:** S (2 files)

---

## Task 4: Update `JobServiceTests.cs` ✅ done

**Description:** Update test object construction to use the new property names.

**Acceptance criteria:**
- [ ] All `JobType = JobType.X` → `EmploymentType = JobType.X`
- [ ] All `Remote = RemoteType.X` → `LocationType = RemoteType.X`

**Verification:**
- [ ] `dotnet test` passes

**Dependencies:** Task 1

**Files likely touched:**
- `tests/JobBoard.Tests/Services/JobServiceTests.cs`

**Estimated scope:** XS (1 file)

---

## Checkpoint: Complete
- [x] `dotnet build` succeeds with no warnings introduced
- [x] `dotnet test` passes (2/2)
- [x] Manual check: ran the app, fetched `/post` — confirms labels read "Employment Type" / "Location Type" with no leftover "Job Type" text
- [x] `grep -rn "job.JobType\|job.Remote" src tests` returns no results (excluding enum type usage like `JobType.FullTime`)
- [ ] Review with human before merge
