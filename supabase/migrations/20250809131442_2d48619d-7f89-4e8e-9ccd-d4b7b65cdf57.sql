-- Create table to persist rank history for long-term trend
CREATE TABLE IF NOT EXISTS public.rat_rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  rat_id UUID NOT NULL,
  rat_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  dominance_score NUMERIC NOT NULL,
  time_range INTEGER
);

-- Enable RLS
ALTER TABLE public.rat_rank_history ENABLE ROW LEVEL SECURITY;

-- Policies: only owner can access their data
CREATE POLICY "Users can view their own rank history"
ON public.rat_rank_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rank history"
ON public.rat_rank_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_rank_history_user_time ON public.rat_rank_history(user_id, analysis_time);
CREATE INDEX IF NOT EXISTS idx_rank_history_user_rat ON public.rat_rank_history(user_id, rat_id);
