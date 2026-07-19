# Job Board

A minimal job board web app: employers post job listings, visitors see all posted jobs in a list, newest first. Built as an experimentation project for learning .NET + Blazor.

This is an MVP — no authentication, editing/deleting jobs, search/filtering, pagination, or styling polish. See [SPEC.md](SPEC.md) for the full spec and scope.

## Tech Stack

- .NET 10
- ASP.NET Core Blazor Server (interactive server-side rendering, no separate API/WASM client)
- Entity Framework Core 10 (Code-First)
- SQLite (file-based, `jobboard.db`, gitignored)
- xUnit for unit tests

## Prerequisites

- .NET 10 SDK

## Running It

Apply migrations to create the local database (first run only, or after pulling new migrations):

```
dotnet ef database update --project src/JobBoard
```

Start the app:

```
dotnet run --project src/JobBoard
```

Open http://localhost:5100 — `/` shows the job list, `/post` lets you create a job.

For hot reload during development:

```
dotnet watch --project src/JobBoard
```

## Running Tests

```
dotnet test
```

## Project Structure

```
src/JobBoard/                  → Main Blazor Server app
src/JobBoard/Components/Pages/ → Razor pages (Home.razor = job list, Post.razor = create form)
src/JobBoard/Data/             → EF Core DbContext
src/JobBoard/Models/           → Job entity + enums (JobType, RemoteType)
src/JobBoard/Services/         → JobService (data access abstraction over DbContext)
tests/JobBoard.Tests/          → xUnit unit tests (mirrors src structure)
```
