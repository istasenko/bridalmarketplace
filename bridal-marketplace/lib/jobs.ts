import { createClient } from "@supabase/supabase-js";

export type JobType = "process_listing_images" | "send_notification" | "cleanup_drafts";

export interface JobPayload {
  [key: string]: unknown;
}

export interface EnqueueOptions {
  payload?: JobPayload;
  maxAttempts?: number;
}

/**
 * Enqueue a background job. Called from API routes.
 * Jobs are processed by the Railway worker.
 */
export async function enqueueJob(
  type: JobType,
  options: EnqueueOptions = {}
): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.warn("Jobs: Missing Supabase env vars, skipping enqueue");
    return null;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      type,
      payload: options.payload ?? {},
      status: "pending",
      max_attempts: options.maxAttempts ?? 3,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Jobs: enqueue failed", error);
    return null;
  }
  return data?.id ?? null;
}
