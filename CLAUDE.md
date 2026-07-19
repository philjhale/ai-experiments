# Git/GitHub workflow rules

Follow these for every piece of new work in this repo:

1. **Sync first**: before starting new work, pull/rebase the local `main` branch against the remote so work starts from latest `main`.
2. **Always branch**: never commit directly on `main`/`master`. Create a feature branch for each piece of work (e.g. `git checkout -b <name>`).
3. **PR to merge**: land work via a pull request, not a direct push to `main`. Use `gh pr create` to open it.
4. **Use GitHub CLI**: when `gh` is installed, use it for GitHub operations (PRs, issues, checks) instead of manual web steps.
