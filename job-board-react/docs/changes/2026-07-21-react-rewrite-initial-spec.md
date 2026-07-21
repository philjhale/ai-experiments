# React rewrite: initial spec

**Date:** 2026-07-21

## What changed
Created the initial spec for `job-board-react/`, a new sibling subproject rewriting the `job-board-net/` job board app (currently .NET 10 + Blazor Server + EF Core + SQLite) in React.

## Why
The user wants to explore the same job board product on a React-based stack, without touching or migrating the existing .NET implementation — both apps live side by side in this monorepo.

## Stack decisions
- **Frontend:** React 18 + Vite, React Router.
- **Backend:** Node.js + Fastify (chosen by the user over Express, Next.js API routes, or keeping ASP.NET Core as an API-only backend).
- **Database:** SQLite (chosen by the user, matching the original project).
- **ORM:** Prisma — not asked about explicitly; chosen as the closest analogue to the EF Core Code-First migration workflow used in `job-board-net/`. Flagged as an open question for confirmation before planning proceeds.
- **Validation:** Zod, mirroring the original's model validation (required fields, `applicationUrl` well-formed URL check).
- **Testing:** Vitest + React Testing Library on the frontend, Vitest on the backend (chosen by the user).

## Scope
Feature parity with the current MVP: job list (newest first), post-a-job form, delete-a-job with confirmation. No auth, search, filter, or edit — same boundaries as the original spec.
