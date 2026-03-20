# Deployment: Vercel + Railway + Supabase

## Overview

- **Vercel**: Next.js app (web + API)
- **Railway**: Background job worker
- **Supabase**: Database, auth, storage

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run all migrations in `supabase/migrations/` (in order)
3. Get from Project Settings → API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (secret)

## 2. Vercel

1. [vercel.com](https://vercel.com) → Add New Project → Import `github.com/istasenko/bridalmarketplace`
2. Set Root Directory to `bridal-marketplace` if the repo is the academy monorepo; otherwise leave blank
3. Add environment variables (Production + Preview):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy
5. Add your Vercel URL to Supabase → Auth → URL Configuration → Redirect URLs

## 3. Railway (Worker)

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Select the bridalmarketplace repo
3. **Root Directory**: Set to `worker` (or `bridal-marketplace/worker` if repo root is academy)
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy – Railway will run `npm install` and `npm start`

The worker polls the `jobs` table every 5 seconds and processes pending jobs.

## 4. Run the jobs migration

Before the worker can run, ensure the `jobs` table exists. Run the migration:

- `supabase/migrations/20250318000000_create_jobs_table.sql`

Apply via Supabase Dashboard → SQL Editor, or `supabase db push` if using the CLI.

## Job types

| Type | Payload | Purpose |
|------|---------|---------|
| `process_listing_images` | `listing_id`, `image_urls` | Resize images, generate thumbnails |
| `send_notification` | varies | Email, push notification |
| `cleanup_drafts` | - | Delete old drafts, expire temp uploads |

Add new handlers in `worker/index.js` under the `switch (type)` block.
