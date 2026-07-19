# Todo: Add `ApplicationUrl` property to Job

- [x] Task 1: Add `ApplicationUrl` to `Job.cs`, generate EF migration, update `JobServiceTests.cs`
  - [x] `dotnet build` succeeds
  - [x] `dotnet test` passes
- [x] Task 2: Add `ApplicationUrl` field to `Post.razor` (`JobInput`, `[Required]`/`[Url]`, form field, submit mapping)
  - [x] Manual check: empty value rejected
  - [x] Manual check: malformed URL rejected
  - [x] Manual check: valid URL submits and redirects
- [x] Task 3: Add "Apply" link to `Home.razor`
  - [x] Manual check: Apply link visible and points at correct URL
- [x] Full walkthrough: post a job end-to-end, confirm Apply link on `/`
