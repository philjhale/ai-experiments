# Change: Add job deletion (2026-07-21)

## What changed
Added the ability to delete a job posting from the list page (`/`). Each job entry gets a "Delete" button, gated by a confirmation prompt. Deletion is a hard delete (row removed from the `Jobs` table) — no soft-delete flag, no undo.

## Why
The original MVP scope explicitly excluded editing/deleting jobs. The user requested delete capability as a follow-up feature. Editing remains out of scope; only delete was added.

## Spec sections touched
- Objective: "Out of scope for MVP" updated to remove deleting jobs from the exclusion list.
- Pages: `/` now documents the Delete button and confirmation behavior.
- Success Criteria: added a criterion for delete-with-confirmation; the old blanket "no edit/delete" criterion updated to reflect delete now being in scope.
- New "Change: Add job deletion" section with full scope/acceptance/boundaries.
