---
name: tech-stack
description: Enforce technology choices for new applications; a TypeScript web app, Ruby on Rails API, and PostgreSQL. Use when the user asks to bootstrap, scaffold, or one-shot generate a marketplace/full-stack app.
---

# Full Stack Application Tech Stack

## Non-Negotiable Constraints

You must enforce all of the following:

1. Web app uses TypeScript only (`.ts`/`.tsx`; no `.js`/`.jsx` source files).
2. API is implemented in Ruby on Rails.
3. Database is PostgreSQL running locally.
4. No Docker or container runtime for any service.

If the user asks for conflicting tech, pause and confirm before continuing.

## Expected Layout

Unless the user gives a compatible alternative, create:

- `web/` TypeScript frontend app
- `api/` Ruby on Rails API service
- `README.md` root-level setup and run guide

## Required Workflow

Apply this workflow for building new applications:

### 1) Preflight

- Verify the current directory is empty (except README.md, .git/ and .gitignore).
- If not empty, ask for explicit confirmation before writing.

### 2) Create Web App (TypeScript)

- Scaffold `web/` with TypeScript (React + Vite TypeScript template by default).
- Ensure `tsconfig.json` exists.
- Ensure app source files are TypeScript (`.ts`, `.tsx`).
- Provide package scripts for development and build (and test/lint when available).

### 3) Create API (Ruby on Rails)

- Scaffold `api/` with Rails API mode.
- Ensure Gem dependencies and Ruby version files are present.
- Add a health endpoint.
- Add minimal marketplace resource skeletons (for example: listings, users, orders).
- Read DB config from environment variables.
- Use Rails migrations for schema management.

### 4) Configure Local PostgreSQL (No Docker)

- Assume the user is on MacOS
- Prefer Homebrew PostgreSQL install and service management.
- If the user explicitly requests Postgres.app, that is acceptable.
- Configure:
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `DATABASE_URL` for the API
- Ensure API database wiring points to local PostgreSQL.

### 5) Add .cursor/skills for any new technologies introduced

- Keep skills really concise
- Capture best practises of the language
- One skill per technology or language

### 6) Wire Local Run

- Provide root-level commands to:
  - start local PostgreSQL service
  - run API
  - run web app
- Include a basic smoke-test path:
  - API health endpoint returns success
  - web app successfully calls an API endpoint

## Hard Prohibitions

- Do not use Docker, Docker Compose, podman, or containerized local databases.
- Do not generate frontend JavaScript source files.
- Do not generate a non-Rails backend.
- Do not wire a non-PostgreSQL database.
- Do not finish without runnable commands.

## Validation Checklist (Must Pass Before Completion)

- [ ] No Docker or compose files are created
- [ ] `web/tsconfig.json` exists
- [ ] `web/src` uses `.ts` or `.tsx` and no `.js` or `.jsx`
- [ ] `api/` has Rails API app structure and Gem dependencies
- [ ] API uses `DATABASE_URL` for PostgreSQL
- [ ] README includes macOS local Postgres setup, run, and smoke-test instructions

## Final Response Format

Return:

1. High-level directory tree created
2. Exact local startup commands (macOS, no Docker)
3. Assumptions made
4. Next optional improvements (auth, payments, CI/CD, deployment)
