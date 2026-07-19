---
description: Create a new feature using agent-skills. 
---

# new-feature-with-agent-skills

Orchestrates the agent-skills plugin's stage commands into one pipeline for a single feature: `/spec` -> `/plan` -> `/build auto` -> `/review` -> `/ship` -> PR. A human checks in after each stage; the run can continue in the same session or be picked up later by re-invoking this command.

Arguments: `$ARGUMENTS`

## Resuming vs. starting new

1. Run `git status`. If the current directory is inside a feature worktree created by this command (i.e. `tasks/feature-stage.md` exists somewhere up the tree), this is a **resume**, regardless of whether arguments were passed:
   - Read `tasks/feature-stage.md` to find the last completed stage.
   - Announce which stage is next and continue from there (go to the matching step below).
2. Otherwise this is a **new feature** and arguments (the feature description) are required. If none were given, ask for one and stop.
   - Derive a kebab-case slug from the description (e.g. "add dark mode toggle" -> `add-dark-mode-toggle`). Reuse this slug for the branch name, worktree directory, and `docs/changes/` filenames.
   - Invoke the `git-workflow-and-versioning` skill to create the feature branch `feature/<slug>` and a worktree at `.claude/worktrees/<slug>` (matching this repo's existing worktree convention).
   - Inside the new worktree, create `tasks/feature-stage.md` with all five stages listed as pending:
     ```markdown
     # Feature stage tracker: <slug>

     - [ ] spec
     - [ ] plan
     - [ ] build
     - [ ] review
     - [ ] ship (+ PR)
     ```
   - All subsequent work for this feature happens inside that worktree.

## Stage gate pattern

After **every** stage below:
1. Update `tasks/feature-stage.md`, checking off the completed stage.
2. Present a concise summary of what the stage produced.
3. Offer both continuation paths and let the human pick in the moment:
   - **Continue now**: use AskUserQuestion with options approve / revise / stop. On approve, proceed immediately to the next stage in this same turn.
   - **Continue later**: the human can also just end the session here. Say explicitly that re-running `/new-feature-with-agent-skills` from inside this worktree (no arguments needed) will resume from the next pending stage.
4. Never skip this gate, even in a single continuous run.

## Stages

### 1. Spec
Invoke `/spec` (spec-driven-development). Feed it the feature description (or, on resume, whatever context is needed to pick the conversation back up).

- Target file is `docs/spec.md`, not the skill's default `SPEC.md`.
- If `docs/spec.md` already exists (from a prior feature run in this repo's history), **amend it in place**: read it first, add or update only the sections relevant to this feature, and leave unrelated existing content untouched. Never regenerate the whole file from scratch.
- Every write to `docs/spec.md` — including the very first one ever — gets a matching entry in `docs/changes/yyyy-mm-dd-<slug>.md` describing what changed and why.
- Get explicit human approval of the spec content itself (this is part of the skill's own flow) before checking off this stage.
- **Before moving to stage 3, commit `docs/spec.md` and its `docs/changes/*.md` entry.** `/build auto`'s own clean-baseline check (`git status --porcelain`) does not whitelist `docs/changes/*`, so an uncommitted changelog file would make it stop and ask. Committing here also satisfies `/build auto`'s requirement that planning artifacts not bleed into the first task's commit.
- **Note for stage 3:** `/build auto` looks only for a spec at `SPEC.md`, `docs/SPEC.md`, or `spec/*` (case-sensitive) — it will not recognize `docs/spec.md` on its own. When invoking `/build auto`, explicitly tell it that `docs/spec.md` (committed in this stage) satisfies its spec requirement, so it doesn't stop looking for one.

### 2. Plan
Invoke `/plan` (planning-and-task-breakdown) against the approved `docs/spec.md`. Produces `tasks/plan.md` and `tasks/todo.md` as usual.

### 3. Build
Invoke `/build auto`. Runs the full per-task TDD loop (write failing test, implement, verify, commit) across the whole plan after a single approval, per that command's own rules. Do not re-run `/test` separately afterward — the per-task loop plus the review/ship stages below already cover it.

### 4. Review
Invoke the `code-reviewer` subagent directly (not the full `/ship` fan-out — that would duplicate work done in stage 5) against the accumulated changes on this branch. Use the standard five-axis review template.

- Present **all** findings (Critical / Important / Suggestion) to the human as-is.
- Do not auto-fix anything. Let the human choose which findings to act on.
- Apply only the fixes the human selects, then re-commit.

### 5. Ship
Invoke `/ship` (shipping-and-launch's 3-persona fan-out: code-reviewer, security-auditor, test-engineer) for the pre-launch checklist and GO/NO-GO decision.

- Present all findings from the merged report to the human as-is — no auto-fixing.
- Apply only the fixes the human selects, then re-commit.
- Once the human is satisfied and the decision is GO, create the PR with `gh pr create`, using a summary that reflects the full feature (spec intent, plan, what was built, review/ship findings and resolutions).
- **Stop after the PR is created.** Do not merge it — that stays a manual step for the human.
- Check off the final stage in `tasks/feature-stage.md`.

## Blockers

If any stage hits something it can't resolve on its own — a test that won't pass, an ambiguous spec point, a high-risk/irreversible change (auth, payments, deletions, secrets), or a Critical finding the human hasn't yet decided on — stop and ask, following `debugging-and-error-recovery` or `doubt-driven-development` as appropriate. Leave `tasks/feature-stage.md` reflecting the true state so a later resume picks up correctly.
