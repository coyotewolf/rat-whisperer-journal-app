-- Create health_alerts_cache table for AI analysis results
CREATE TABLE public.health_alerts_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  log_count INTEGER NOT NULL,
  last_log_timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.health_alerts_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own health alerts"
  ON public.health_alerts_cache
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health alerts"
  ON public.health_alerts_cache
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health alerts"
  ON public.health_alerts_cache
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health alerts"
  ON public.health_alerts_cache
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_health_alerts_cache_updated_at
  BEFORE UPDATE ON public.health_alerts_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create reminder_settings table
CREATE TABLE public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true NOT NULL,
  frequency_days INTEGER NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  custom_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reminder settings"
  ON public.reminder_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reminder settings"
  ON public.reminder_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminder settings"
  ON public.reminder_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminder settings"
  ON public.reminder_settings
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_reminder_settings_updated_at
  BEFORE UPDATE ON public.reminder_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default reminder settings for new users
CREATE OR REPLACE FUNCTION public.create_default_reminder_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.reminder_settings (user_id, type, enabled, frequency_days, priority, custom_message)
  VALUES 
    (NEW.id, 'feeding', true, 1, 'medium', NULL),
    (NEW.id, 'water', true, 1, 'medium', NULL),
    (NEW.id, 'cage_cleaning', true, 7, 'high', NULL),
    (NEW.id, 'litter_cleaning', true, 3, 'medium', NULL),
    (NEW.id, 'weight_check', true, 7, 'medium', NULL),
    (NEW.id, 'health_check', true, 14, 'high', NULL),
    (NEW.id, 'medication', true, 1, 'high', NULL);
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-create default reminder settings
CREATE TRIGGER on_auth_user_created_reminder_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_reminder_settings();