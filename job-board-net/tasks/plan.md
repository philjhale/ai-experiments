# Implementation Plan: Delete a Job Post

## Overview
Add a "Delete" button to each job card on `/`, gated by a confirm() prompt, that hard-deletes the job via a new `JobService.DeleteJobAsync(int id)` method and removes it from the on-page list without a full reload.

## Architecture Decisions
- **Hard delete, no schema change.** `DeleteJobAsync` removes the row directly; `Job.Id` already exists as the primary key, so no migration is needed.
- **Confirmation via `IJSRuntime` `confirm()`.** Blazor Server has no built-in confirm dialog; a JS interop call to the browser's native `confirm()` is the minimal-dependency option consistent with "no styling polish" / no new NuGet packages.
- **Delete is a de-emphasized link, not a button.** "Apply" stays the prominent `btn` so it draws attention as the primary action; "Delete" renders as a plain/muted link (e.g. `text-danger` link styling, no `btn` class) so it doesn't visually compete with Apply and isn't a click target someone hits by accident while scanning the card.
- **List update via local state removal**, not a full `GetAllJobsAsync()` re-fetch, to keep the interaction snappy (Blazor Server round-trip already handles re-render).

## Task List

### Phase 1: Service layer
- [ ] Task 1: Add `JobService.DeleteJobAsync(int id)`

### Checkpoint: Service layer
- [ ] `dotnet test` passes with new `DeleteJobAsync` tests
- [ ] `dotnet build` succeeds

### Phase 2: UI
- [ ] Task 2: Add Delete button + confirmation + list removal to `Home.razor`

### Checkpoint: Complete
- [ ] `dotnet build` succeeds
- [ ] `dotnet test` passes
- [ ] Manual check: run app, delete a job, confirm it disappears from `/` and DB; cancel confirm leaves it present

## Task Details

### Task 1: Add `JobService.DeleteJobAsync(int id)`

**Description:** Add a method to `JobService` that removes a `Job` by id. Finding the job via `FindAsync` (not `Remove` on a detached stub) avoids attaching a phantom entity if the id doesn't exist; a missing id is a silent no-op (guards against double-click races, consistent with the spec's boundary of no error handling beyond what's needed).

**Acceptance criteria:**
- [ ] `DeleteJobAsync(int id)` removes the matching job from the database when it exists.
- [ ] Calling `DeleteJobAsync` with a non-existent id does not throw and leaves existing jobs untouched.

**Verification:**
- [ ] `dotnet test --filter JobServiceTests` passes, including two new tests: `DeleteJobAsync_RemovesTheJob` and `DeleteJobAsync_NonExistentId_DoesNothing`.
- [ ] `dotnet build` succeeds.

**Dependencies:** None

**Files likely touched:**
- `src/JobBoard/Services/JobService.cs`
- `tests/JobBoard.Tests/Services/JobServiceTests.cs`

**Estimated scope:** Small (2 files)

---

### Task 2: Add Delete link + confirmation + list removal to `Home.razor`

**Description:** Add a "Delete" link to each job card, styled as a plain/muted link (not a `btn`) so "Apply" remains the visually dominant action. On click, show a JS `confirm()` prompt (via injected `IJSRuntime`); if confirmed, call `JobService.DeleteJobAsync(job.Id)` and remove the job from the in-memory `jobs` list so the UI updates immediately.

**Acceptance criteria:**
- [ ] Each job card on `/` shows a "Delete" link alongside the "Apply" button; "Delete" is visually de-emphasized (link styling, not a `btn`) so "Apply" remains the prominent action.
- [ ] Clicking "Delete" triggers a confirmation prompt.
- [ ] Confirming removes the job from both the database and the visible list.
- [ ] Cancelling the prompt leaves the job untouched (no DB call, still visible).

**Verification:**
- [ ] `dotnet build` succeeds.
- [ ] Manual check: `dotnet run --project src/JobBoard`, post a job, delete it via the confirm-accept path, verify it's gone from `/` and (via a fresh page load) stays gone; post another job, delete it via the confirm-cancel path, verify it remains.

**Dependencies:** Task 1

**Files likely touched:**
- `src/JobBoard/Components/Pages/Home.razor`

**Estimated scope:** Small (1 file)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| `confirm()` via JS interop needs `IJSRuntime` injected into `Home.razor` (not currently injected) | Low | Add `@inject IJSRuntime JSRuntime`; standard Blazor Server pattern, no new package |
| Double-click on Delete before round-trip completes | Low | `DeleteJobAsync` no-ops on missing id (Task 1 acceptance criteria) |

## Open Questions
None.
