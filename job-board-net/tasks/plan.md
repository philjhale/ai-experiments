# Implementation Plan: Rename JobType→EmploymentType, Remote→LocationType

## Overview
Rename two `Job` model properties (`JobType`→`EmploymentType`, `Remote`→`LocationType`) across the model, EF Core migration, UI, and tests. Enum type/value names are unchanged. Pure rename — no new behavior. Full scope confirmed in `SPEC.md` "Change" section.

## Architecture Decisions
- Add a **new** EF Core migration to rename the `JobType`/`Remote` columns rather than editing `InitialCreate` in place — preserves migration history and is safe even though there's no seed data.
- Enum *type* names (`JobType`, `RemoteType`) and member values stay as-is — only the `Job` class property names change. Confirmed with user to avoid unnecessary churn.

## Dependency Graph
```
Job.cs (property rename)
    │
    ├── EF Core migration (depends on model change to diff correctly)
    │
    ├── Home.razor / Post.razor (reference job.JobType / job.Remote)
    │
    └── JobServiceTests.cs (constructs Job with JobType = / Remote =)
```
Model change is the foundation — everything else references it and won't compile until it's done. Migration, UI, and tests can technically be done in any order after the model change, but UI first (visible surface) then tests (verification) is the natural sequence.

## Task List

### Phase 1: Foundation
- [ ] Task 1: Rename properties on `Job` model

### Phase 2: Schema
- [ ] Task 2: Add EF Core migration for column rename

### Phase 3: UI
- [ ] Task 3: Update `Home.razor` and `Post.razor`

### Checkpoint: Foundation + Schema + UI
- [ ] `dotnet build` succeeds (tests will still fail to compile until Task 4)
- [ ] Migration file generated correctly (rename, not drop/add)

### Phase 4: Tests
- [ ] Task 4: Update `JobServiceTests.cs`

### Checkpoint: Complete
- [ ] `dotnet build` succeeds
- [ ] `dotnet test` passes
- [ ] Manual check: `/post` form shows "Employment Type" and "Location Type" labels; `/` list shows renamed badges correctly
- [ ] No remaining references to `job.JobType`/`job.Remote` outside enum type usage

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| EF Core generates drop+add instead of rename for the migration | Low (no real data yet, but bad practice) | Inspect generated migration; if it drops/adds instead of renaming, hand-edit to use `RenameColumn` |
| Missing a reference (e.g. in `JobInput` in Post.razor) causes silent stale label | Low | `dotnet build` will catch compile errors; grep confirms only 4 files affected |

## Open Questions
None — scope and approach confirmed in SPEC.md.
