# GitHub Actions CI — run tests on PR (2026-07-20)

## What changed
Added a spec section describing a new GitHub Actions workflow (`.github/workflows/tests.yml`) that runs the C# test suite on pull requests.

- `SPEC.md`: added a "Change: GitHub Actions CI — run tests on PR" section documenting trigger, runner, steps, scope, and acceptance criteria.

## Why
PR authors and reviewers currently have no automated signal that a change breaks the test suite — tests only run if someone remembers to run `dotnet test` locally. CI on PR open (and subsequent pushes) closes that gap.

## Scope
Spec-only change in this commit; the workflow file itself is implemented in the build stage. Additive — no changes to existing app code, no deployment or coverage reporting, scoped to `job-board-net/`.
