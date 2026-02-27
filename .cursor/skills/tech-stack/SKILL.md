---
name: tech-stack
description: Enforce technology choices for new applications; a TypeScript web app, Ruby on Rails API, and PostgreSQL. Use when the user asks to bootstrap, scaffold, or one-shot generate a marketplace/full-stack app.
---

# Full Stack Application Tech Stack

## Non-Negotiable Constraints

You must enforce all of the following:

1. Web app uses Next.js with TypeScript only (`.ts`/`.tsx`; no `.js`/`.jsx` source files).
2. API is implemented in Ruby on Rails.
3. Database is PostgreSQL running locally.
4. No Docker or container runtime for any service.

If the user asks for conflicting tech, pause and confirm before continuing.

## Expected Layout

Unless the user gives a compatible alternative, create:

- `web/` Next.js TypeScript frontend app
- `api/` Ruby on Rails API service
- `README.md` root-level setup and run guide

## Required Workflow

Apply this workflow for building new applications:

### 1) Preflight

- Verify the current directory is empty (except README.md, .git/ and .gitignore).
- If not empty, ask for explicit confirmation before writing.
- Verify Node tooling is available before web scaffolding:
  - check for `node` and `npm`
  - if missing, stop and instruct user to install Node.js with npm first
  - verify with `node -v`, `npm -v`, and `which npm`
- Verify Ruby tooling is available before Rails scaffolding:
  - check for `rvm` and `bundle`
  - if missing, stop and instruct user to install/use `rvm` first
  - ensure project Ruby version is installed and active via `rvm`
  - verify with `ruby -v`, `bundle -v`, and `which ruby`
- Verify PostgreSQL tooling is available before API/database wiring:
  - check for `brew`
  - if missing, stop and instruct user to install Homebrew first
  - verify with `brew -v` and `which brew`

### 2) Create Web App (Next.js + TypeScript)

- Scaffold `web/` with Next.js App Router + TypeScript using npm.
- Ensure `tsconfig.json` exists.
- Ensure app source files are TypeScript (`.ts`, `.tsx`) with Next.js conventions.
- Use npm for dependency installation and scripts.
- Provide package scripts for development and build (and test/lint when available).

### 3) Create API (Ruby on Rails)

- Scaffold `api/` with Rails API mode.
- Ensure Gem dependencies and Ruby version files are present.
- Follow the same Ruby/Bundler pattern as existing Rails repos:
  - use `rvm` for Ruby version management
  - include `Gemfile` and `.ruby-version`
  - run `bundle install` from the app directory
  - do not set `GEM_HOME`/`GEM_PATH` to workspace-local paths
  - do not create or commit a `.gem/` directory in the repository
- Add a health endpoint.
- Add minimal marketplace resource skeletons (for example: listings, users, orders).
- Read DB config from environment variables.
- Use Rails migrations for schema management.

### 4) Configure Local PostgreSQL (No Docker)

- Assume the user is on MacOS
- Use Homebrew PostgreSQL install and service management.
- Use `brew install postgresql@<major>` and `brew services start postgresql@<major>`.
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
- Do not create or commit `.gem/` in the project repository.
- Do not finish without runnable commands.

## Validation Checklist (Must Pass Before Completion)

- [ ] No Docker or compose files are created
- [ ] `brew` is installed and used for local PostgreSQL setup and service management
- [ ] `npm` is installed and used for web dependency management and scripts
- [ ] `rvm` is installed and used for Ruby version selection
- [ ] `web/tsconfig.json` exists
- [ ] `web/` is a Next.js TypeScript app and contains no `.js`/`.jsx` source files
- [ ] `api/` has Rails API app structure and Gem dependencies
- [ ] Ruby is pinned via `.ruby-version` and dependencies are installed via `bundle install`
- [ ] No `.gem/` or `vendor/` directory exists in repository
- [ ] API uses `DATABASE_URL` for PostgreSQL
- [ ] README includes macOS local Postgres setup, run, and smoke-test instructions

## Final Response Format

Return:

1. High-level directory tree created
2. Exact local startup commands (macOS, no Docker)
3. Assumptions made
4. Next optional improvements (auth, payments, CI/CD, deployment)
