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

## Stage gate pattern

After **every** stage below:
1. Update `tasks/feature-stage.md`, checking off the completed stage, and commit it with `git add -f tasks/feature-stage.md`.
2. Present a concise summary of what the stage produced.
3. Offer both continuation paths and let the human pick in the moment:
   - **Continue now**: use AskUserQuestion with options approve / revise / stop. On approve, proceed immediately to the next stage in this same turn.
   - **Continue later**: the human can also just end the session here. Say explicitly that re-running `/new-feature-with-agent-skills` from inside this worktree (no arguments needed) will resume from the next pending stage.
4. Never skip this gate, even in a single continuous run.

## Stages

### 1. Spec
Invoke `/agent-skills:spec` (spec-driven-development). Feed it the feature description (or, on resume, whatever context is needed to pick the conversation back up).

- Before assuming this is the first spec ever, search the whole repo for an existing `SPEC.md` — not just the root (e.g. `find . -iname SPEC.md`). If one already exists anywhere (root or a subproject), **amend it in place**: read it first, add or update only the sections relevant to this feature, and leave unrelated existing content untouched. Never regenerate the whole file from scratch, and never create a second, disconnected `SPEC.md` elsewhere. If an existing `SPEC.md` is found somewhere other than root (e.g. inside a subproject directory), confirm with the human which one this feature belongs to before writing.
- Every write to `SPEC.md` — including the very first one ever — gets a matching entry in `docs/changes/yyyy-mm-dd-<slug>.md` describing what changed and why.
- Get explicit human approval of the spec content itself (this is part of the skill's own flow) before checking off this stage.
- **Before moving to stage 3, commit `SPEC.md` and its `docs/changes/*.md` entry.** `/build auto`'s own clean-baseline check (`git status --porcelain`) does not whitelist `docs/changes/*`, so an uncommitted changelog file would make it stop and ask. Committing here also satisfies `/build auto`'s requirement that planning artifacts not bleed into the first task's commit.

### 2. Plan
Invoke `/agent-skills:plan`.

### 3. Build
Invoke `/agent-skills:build auto`.

### 4. Review
Invoke `/agent-skills:review`.

### 5. Ship
Invoke `/agent-skills:ship`.

- **Stop after the PR is created.** Do not merge it — that stays a manual step for the human.

## Blockers

Each invoked command enforces its own stop conditions (e.g. `/build auto` already stops on a failing test, an ambiguous spec, or a high-risk/irreversible change — see that command's own rules). This orchestrator adds one more on top: an unresolved Critical finding from `/review` or `/ship` is always a blocker. On any blocker, stop and ask rather than push through, and leave `tasks/feature-stage.md` reflecting the true state so a later resume picks up correctly.
