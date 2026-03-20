# Event Tracking Implementation Plan

## Overview

Implement first-party event tracking to capture user behavior on core pages and store events in a Supabase table. This keeps analytics in your own data warehouse and avoids third-party dependencies.

---

## 1. Core Pages & Events to Track

| Page | Event Type | When to Fire | Key Properties |
|------|------------|--------------|----------------|
| **/** (Home) | `page_view` | On mount | `path`, `referrer` |
| **/** (Home) | `filter_applied` | User changes category/style/zip/maxMiles | `filter_type`, `filter_value` |
| **/** (Home) | `listing_clicked` | User clicks a listing card | `listing_id`, `listing_title`, `category_id` |
| **/listings/[id]** | `page_view` | On mount | `path`, `listing_id`, `referrer` |
| **/listings/[id]** | `contact_seller_clicked` | User clicks "Contact seller" | `listing_id`, `seller_id` |
| **/sell** | `page_view` | On mount | `path`, `sell_gate_status` (login/setup_shop/ready) |
| **/sell/setup** | `page_view` | On mount | `path` |
| **/sell/setup** | `shop_setup_completed` | Shop created successfully | `shop_id` |
| **/sell** | `listing_created` | Listing submitted successfully | `listing_id`, `category_id`, `listing_kind` |
| **/login** | `page_view` | On mount | `path`, `next` (redirect param) |
| **/login** | `login_attempted` | User submits login form | `success` (boolean) |
| **/signup** | `page_view` | On mount | `path` |
| **/signup** | `signup_role_selected` | User selects browser/seller | `role` |
| **/signup** | `signup_completed` | User completes signup | `role`, `success` |

---

## 2. Database Schema

### Migration: `analytics_events` table

```sql
-- analytics_events: stores user behavior events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_path ON analytics_events(path);

-- RLS: allow inserts from anyone (anon + authenticated); no reads for regular users
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (we validate server-side)
CREATE POLICY "Allow insert analytics events" ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Only service role can read (for dashboards/reports)
-- No SELECT policy for anon/authenticated = no reads
```

**Design decisions:**
- `user_id` nullable: anonymous users have no ID; authenticated users get their ID from the session
- `session_id`: optional client-generated UUID to group events from the same session (stored in `sessionStorage`)
- `properties`: flexible JSONB for event-specific data (listing_id, filter_type, etc.)

---

## 3. Architecture

```
┌─────────────────┐     POST /api/events      ┌──────────────────┐     INSERT      ┌──────────────────┐
│  Client (React) │ ───────────────────────► │  API Route       │ ─────────────► │ analytics_events │
│  track(event)   │     { event_type, ... }   │  (validate, add   │                │  (Supabase)      │
└─────────────────┘                          │   user_id)        │                └──────────────────┘
                                             └──────────────────┘
```

### Flow

1. **Client** calls `track({ event_type, properties })` from any component
2. **API route** receives the event, optionally resolves `user_id` from auth cookies, validates event type, and inserts into Supabase
3. **Fire-and-forget**: client does not await; tracking should not block UI

---

## 4. Implementation Steps

### Step 1: Database migration

Create `supabase/migrations/YYYYMMDD_create_analytics_events.sql` with the schema above.

### Step 2: API route

Create `app/api/events/route.ts`:

- Accept `POST` with body: `{ event_type: string, path: string, properties?: object, session_id?: string }`
- Validate `event_type` against an allowlist (prevent injection of arbitrary events)
- Get `user_id` from `getCurrentUser()` if authenticated
- Insert into `analytics_events` using `createClient()` (or `createAdminClient()` if you prefer server-side only inserts)
- Return 204 No Content on success

### Step 3: Client tracking utility

Create `lib/track.ts`:

```ts
// Fire-and-forget; no await
export function track(
  eventType: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const sessionId = getOrCreateSessionId();
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type: eventType,
      path,
      properties: properties ?? {},
      session_id: sessionId,
    }),
    keepalive: true, // Ensure request completes even if user navigates away
  }).catch(() => {}); // Silently fail; never block UI
}
```

- `getOrCreateSessionId()`: read from `sessionStorage` or generate UUID and store it

### Step 4: React hook (optional but recommended)

Create `hooks/useTrackPageView.ts`:

```ts
"use client";
import { useEffect } from "react";
import { track } from "@/lib/track";

export function useTrackPageView(extraProperties?: Record<string, unknown>) {
  useEffect(() => {
    track("page_view", extraProperties);
  }, []);
}
```

### Step 5: Instrument core pages and components

| Location | What to add |
|----------|--------------|
| `app/page.tsx` | Use a client wrapper or `MarketplaceContent` to call `useTrackPageView()` |
| `MarketplaceContent.tsx` | `useTrackPageView()`; on filter change, `track("filter_applied", {...})` |
| `ListingCard.tsx` | `onClick` wrapper: `track("listing_clicked", { listing_id, ... })` before navigation |
| `app/listings/[id]/page.tsx` | Client component or `ListingDetail` with `useTrackPageView({ listing_id })` |
| `ListingDetail.tsx` | `track("contact_seller_clicked", { listing_id, seller_id })` on Contact button click |
| `SellGate.tsx` | `useTrackPageView({ sell_gate_status })` when status is known |
| `app/sell/setup/page.tsx` | `useTrackPageView()`; `track("shop_setup_completed", {...})` on success |
| `CreateListingForm.tsx` | `track("listing_created", {...})` on successful submit |
| `app/login/page.tsx` | `useTrackPageView()`; `track("login_attempted", { success })` on form submit |
| `app/signup/page.tsx` | `useTrackPageView()`; `track("signup_role_selected", { role })`; `track("signup_completed", {...})` |

**Note:** `page_view` for server components: use a small client component that wraps the page content and calls `useTrackPageView()` on mount, or use Next.js middleware + a client-side layout effect.

---

## 5. Event Type Allowlist

Restrict `event_type` in the API to prevent abuse:

```ts
const ALLOWED_EVENT_TYPES = [
  "page_view",
  "filter_applied",
  "listing_clicked",
  "contact_seller_clicked",
  "shop_setup_completed",
  "listing_created",
  "login_attempted",
  "signup_role_selected",
  "signup_completed",
] as const;
```

---

## 6. Privacy & Performance

- **No PII in properties**: avoid email, name, or other identifiable data in `properties`
- **Fire-and-forget**: use `keepalive: true` and `.catch(() => {})` so tracking never blocks the UI
- **Session ID**: use `sessionStorage` so it resets per tab; no long-lived fingerprinting
- **Rate limiting** (optional): add a simple in-memory or Redis throttle if you expect abuse

---

## 7. Querying Events (for dashboards)

Example queries (run with service role or a dedicated analytics role):

```sql
-- Page views by path, last 7 days
SELECT path, COUNT(*) as views
FROM analytics_events
WHERE event_type = 'page_view' AND created_at > NOW() - INTERVAL '7 days'
GROUP BY path
ORDER BY views DESC;

-- Listing engagement (clicks + contact)
SELECT properties->>'listing_id' as listing_id, COUNT(*) as engagements
FROM analytics_events
WHERE event_type IN ('listing_clicked', 'contact_seller_clicked')
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY properties->>'listing_id';
```

---

## 8. File Summary

| File | Purpose |
|-----|---------|
| `supabase/migrations/YYYYMMDD_create_analytics_events.sql` | Table + indexes + RLS |
| `app/api/events/route.ts` | POST handler, validate, insert |
| `lib/track.ts` | Client-side `track()` utility |
| `hooks/useTrackPageView.ts` | Page view hook |
| Updates to `MarketplaceContent`, `ListingCard`, `ListingDetail`, `SellGate`, `CreateListingForm`, login, signup, sell/setup | Instrument events |

---

## 9. Future Enhancements

- **Batch events**: buffer events client-side and send in batches to reduce requests
- **Server-side page views**: use Next.js middleware to log `page_view` for every route (no client JS required for basic page views)
- **Dashboard**: build a simple admin view to visualize events (e.g. with Chart.js or a BI tool)
