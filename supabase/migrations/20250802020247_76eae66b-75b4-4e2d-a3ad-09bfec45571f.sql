-- Create hierarchy analysis cache table
CREATE TABLE public.hierarchy_analysis_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  analysis_data JSONB NOT NULL,
  time_range INTEGER NOT NULL,
  last_behavior_log_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  behavior_log_count INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, time_range)
);

-- Enable Row Level Security
ALTER TABLE public.hierarchy_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their own hierarchy analysis" 
  ON public.hierarchy_analysis_cache 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create hierarchy invalidation triggers table
CREATE TABLE public.hierarchy_invalidation_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  log_entry_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.hierarchy_invalidation_triggers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access their own triggers" 
  ON public.hierarchy_invalidation_triggers 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_hierarchy_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hierarchy_cache_updated_at
  BEFORE UPDATE ON public.hierarchy_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_hierarchy_cache_updated_at();