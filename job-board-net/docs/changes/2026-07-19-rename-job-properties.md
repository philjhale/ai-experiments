# Rename `JobType` → `EmploymentType`, `Remote` → `LocationType` (2026-07-19)

## What changed
Renamed two `Job` model properties for clarity: `JobType` → `EmploymentType`, `Remote` → `LocationType`. Enum *type* names (`JobType`, `RemoteType`) and their member values are unchanged — only the property names, DB columns, and UI labels changed.

- `Job.cs`: property renames.
- New EF Core migration renaming the `JobType`/`Remote` columns (existing `InitialCreate` migration left as-is).
- `Home.razor` / `Post.razor`: UI labels updated to "Employment Type" / "Location Type".
- `JobServiceTests.cs` updated to new property names.

## Why
The original property names (`JobType`, `Remote`) collided confusingly with the enum type names (`JobType`, `RemoteType`) and didn't read well in the UI. Renaming the properties (not the enums) removes the ambiguity without a bigger data-model change.

## Scope
Not a behavior change — no new fields, no functional changes. Explicitly did not rename the `Job` entity itself, the enum values, or the `JobBoard` project/namespace.
