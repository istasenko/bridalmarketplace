# Auth & User Roles — Implementation Plan

**Overall Progress:** `0%`

## TLDR

Add Supabase Auth with two user roles—**browser** (buyer) and **seller**—to protect listing creation and enable role-specific flows. Sellers can upload listings and add shop details; browsers get name, email, and optional profile fields. Shop pages are out of scope for now.

---

## Critical Decisions

- **Auth provider: Supabase Auth** — Already using Supabase for DB + storage; keeps stack unified and supports email/password and magic link.
- **Profiles table with role** — `profiles` table links to `auth.users`; `role` column (`browser` | `seller`) plus role-specific fields. Single auth flow, role chosen at signup.
- **API protection** — `POST /api/listings` requires authenticated seller; read endpoints (GET) remain public.
- **Browser profile fields** — name, email (from auth), zip (for distance filtering), and optional wedding_date + style_preferences (for future personalization).

---

## Browser User Fields (Recommended)

| Field | Required | Purpose |
|-------|----------|---------|
| name | ✓ | Display, contact seller context |
| email | ✓ | From auth; contact, identity |
| zip | Recommended | "Show listings within X miles" — already used in filters |
| wedding_date | Optional | Urgency, reminders, future targeted content |
| style_ids | Optional | Preferences for personalized browsing (future) |

---

## Tasks

- [ ] 🟥 **Step 1: Database — Profiles & Shops**
  - [ ] 🟥 Create migration: `profiles` table (user_id FK to auth.users, role, name, email, zip, wedding_date, style_ids, created_at)
  - [ ] 🟥 Create migration: `shops` table (seller_id FK to profiles, shop_name, shop_description, location/zip, created_at)
  - [ ] 🟥 Add RLS policies on profiles and shops (users read/write own row)
  - [ ] 🟥 Add migration: `listings.seller_id` FK to profiles (nullable for backwards compat; new listings require it)

- [ ] 🟥 **Step 2: Auth Setup**
  - [ ] 🟥 Enable Supabase Auth in project (email/password + magic link)
  - [ ] 🟥 Create server Supabase client that uses cookies for session (e.g. `@supabase/ssr` or custom cookie handling)
  - [ ] 🟥 Add `getSession()` helper to verify auth in API routes
  - [ ] 🟥 Create `auth/callback` route for OAuth/magic-link redirects

- [ ] 🟥 **Step 3: Auth UI — Sign Up / Log In**
  - [ ] 🟥 Sign-up page with role selection (browser vs seller)
  - [ ] 🟥 Log-in page (shared)
  - [ ] 🟥 Browser signup form: name, email, password, zip; optional wedding_date, style_ids
  - [ ] 🟥 Seller signup form: name, email, password; redirect to complete shop setup
  - [ ] 🟥 Create profile/shop row on first signup (via DB trigger or API)
  - [ ] 🟥 Logout; show user state in Header (logged-in vs logged-out)

- [ ] 🟥 **Step 4: Protect Listing Creation**
  - [ ] 🟥 Update `POST /api/listings` to require authenticated seller
  - [ ] 🟥 Resolve seller info from session + profiles/shops (no manual seller fields in body)
  - [ ] 🟥 Update CreateListingForm to require login before showing form; redirect to /login
  - [ ] 🟥 Protect ImageUpload: ensure only authenticated sellers can upload (storage RLS or API check)

- [ ] 🟥 **Step 5: Seller Shop Setup**
  - [ ] 🟥 Seller onboarding page: shop_name, shop_description, location/zip
  - [ ] 🟥 API to upsert shop for authenticated seller
  - [ ] 🟥 Block listing creation until shop is set up
  - [ ] 🟥 Wire shop data into listing creation (seller display info from shop + profile)

- [ ] 🟥 **Step 6: RLS & Cleanup**
  - [ ] 🟥 Replace "Allow anonymous insert" on listings with policy: INSERT only when authenticated + role=seller
  - [ ] 🟥 Storage: restrict listing-photos upload to authenticated sellers
  - [ ] 🟥 Remove legacy seller fields from listings schema over time (or keep for migration period)

---

## Out of Scope (Not in This Plan)

- Shop pages (future)
- Auth for read endpoints (browsing stays public)
- OAuth (Google/Apple) — can add later
- Password reset flow (Supabase provides; add link in UI)
