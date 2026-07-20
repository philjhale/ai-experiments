# Todo: GitHub Actions CI for job-board-net

- [x] Task 1: Create `.github/workflows/tests.yml` (trigger on PR opened/synchronize/reopened, path-scoped to `job-board-net/**`; checkout → setup-dotnet 10.0.x → restore → build → test, all with `working-directory: job-board-net`)
  - [x] Verify YAML validity
  - [x] Dry-run `dotnet restore && dotnet build --no-restore && dotnet test --no-build` locally from `job-board-net/`
