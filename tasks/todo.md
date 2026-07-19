# Todo: Add `ApplicationUrl` property to Job

- [ ] Task 1: Add `ApplicationUrl` to `Job.cs`, generate EF migration, update `JobServiceTests.cs`
  - [ ] `dotnet build` succeeds
  - [ ] `dotnet test` passes
- [ ] Task 2: Add `ApplicationUrl` field to `Post.razor` (`JobInput`, `[Required]`/`[Url]`, form field, submit mapping)
  - [ ] Manual check: empty value rejected
  - [ ] Manual check: malformed URL rejected
  - [ ] Manual check: valid URL submits and redirects
- [ ] Task 3: Add "Apply" link to `Home.razor`
  - [ ] Manual check: Apply link visible and points at correct URL
- [ ] Full walkthrough: post a job end-to-end, confirm Apply link on `/`
