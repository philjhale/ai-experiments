# Plan: GitHub Actions CI for job-board-net

Spec: `job-board-net/SPEC.md` → "Change: GitHub Actions CI — run tests on PR (2026-07-20)"

## Dependency graph

Single-file, single-path change — no internal dependency graph. One task:

```
Create .github/workflows/tests.yml → verify it lints/triggers correctly
```

No app code, no existing files are touched. `.github/workflows/` sits at the repo root (`ai-experiments`), not inside `job-board-net/`, since that's where GitHub looks for workflows — the `paths:` filter scopes it to `job-board-net/**` instead.

## Task 1: Add `.github/workflows/tests.yml`

**Vertical slice:** the complete, working CI check — trigger, checkout, .NET setup, restore/build/test — in one file, one commit.

**Implementation:**
- `on.pull_request`: `types: [opened, synchronize, reopened]`, `paths: ['job-board-net/**', '.github/workflows/tests.yml']`
- `jobs.test`: `runs-on: ubuntu-latest`
- Steps:
  1. `actions/checkout@v4`
  2. `actions/setup-dotnet@v4` with `dotnet-version: '10.0.x'`
  3. `dotnet restore` (`working-directory: job-board-net`)
  4. `dotnet build --no-restore` (`working-directory: job-board-net`)
  5. `dotnet test --no-build` (`working-directory: job-board-net`)

**Acceptance criteria (from spec):**
- [ ] `.github/workflows/tests.yml` exists, valid YAML
- [ ] Triggers on `pull_request` (opened/synchronize/reopened) for `job-board-net/**` changes
- [ ] Runs restore → build → test against `JobBoard.slnx`
- [ ] Check fails on test failure, passes when tests pass

**Verification steps:**
1. YAML validity: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/tests.yml'))"` (or equivalent).
2. Local dry-run of the same commands the workflow runs, from `job-board-net/`: `dotnet restore && dotnet build --no-restore && dotnet test --no-build` — confirms the commands themselves are correct independent of GitHub's runner.
3. Push the branch and open the PR (ship stage) — confirms the workflow actually triggers and reports a status check on the real PR.

## Checkpoint

Single task — the checkpoint is the review stage after this task's commit. No intermediate phases to gate.
