-- Background jobs table for worker processing (Railway, etc.)
-- Jobs are enqueued by the API and processed by a separate worker service.
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts int NOT NULL DEFAULT 0,
  max_attempts int NOT NULL DEFAULT 3,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_jobs_status_created ON public.jobs (status, created_at)
  WHERE status = 'pending';

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role can access (bypasses RLS). Anon users cannot read/write jobs.

COMMENT ON TABLE public.jobs IS 'Queue for background jobs processed by the Railway worker';
