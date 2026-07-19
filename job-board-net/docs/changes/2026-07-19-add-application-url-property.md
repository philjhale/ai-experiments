# Add `ApplicationUrl` property to Job (2026-07-19)

## What changed
Added a new required `ApplicationUrl` field to the `Job` entity — the URL candidates use to apply for a job.

- `SPEC.md`: added `ApplicationUrl` to the `Job` data model, updated the `/` and `/post` page descriptions, and added a "Change: Add `ApplicationUrl` to Job" section documenting scope and acceptance criteria.

## Why
Job listings need a way to send candidates somewhere to apply. Without this field, the MVP has no path from "viewing a job" to "applying for it."

## Scope
Additive only — new property, new EF Core migration, new form field and list-page link. No renames, no changes to other `Job` properties, no new pages/routes, no auth.
