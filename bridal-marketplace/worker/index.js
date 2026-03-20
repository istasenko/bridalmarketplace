#!/usr/bin/env node
/**
 * Background job worker. Deploy to Railway.
 * Polls the jobs table, processes pending jobs, updates status.
 *
 * Env vars (from Railway or .env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const POLL_INTERVAL_MS = 5000;
const BATCH_SIZE = 5;

async function processJob(supabase, job) {
  const { id, type, payload, attempts, max_attempts } = job;

  // Mark as processing
  await supabase
    .from("jobs")
    .update({ status: "processing", started_at: new Date().toISOString(), attempts: attempts + 1 })
    .eq("id", id);

  try {
    switch (type) {
      case "process_listing_images":
        // TODO: Resize images, generate thumbnails, etc.
        console.log(`[worker] process_listing_images: listing_id=${payload?.listing_id}`);
        break;
      case "send_notification":
        // TODO: Send email, push notification, etc.
        console.log(`[worker] send_notification:`, payload);
        break;
      case "cleanup_drafts":
        // TODO: Delete old drafts, expire temp uploads, etc.
        console.log(`[worker] cleanup_drafts`);
        break;
      default:
        throw new Error(`Unknown job type: ${type}`);
    }

    await supabase
      .from("jobs")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", id);
  } catch (err) {
    const msg = err?.message || String(err);
    console.error(`[worker] Job ${id} failed:`, msg);
    const newStatus = attempts + 1 >= max_attempts ? "failed" : "pending";
    await supabase
      .from("jobs")
      .update({
        status: newStatus,
        error_message: msg,
        ...(newStatus === "pending" ? { started_at: null } : { completed_at: new Date().toISOString() }),
      })
      .eq("id", id);
  }
}

async function run() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[worker] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  console.log("[worker] Started. Polling for jobs every", POLL_INTERVAL_MS / 1000, "s");

  const poll = async () => {
    const { data: pendingJobs, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error("[worker] Fetch error:", error);
      return;
    }

    for (const job of pendingJobs || []) {
      await processJob(supabase, job);
    }
  };

  await poll();
  setInterval(poll, POLL_INTERVAL_MS);
}

run().catch((e) => {
  console.error("[worker] Fatal:", e);
  process.exit(1);
});
