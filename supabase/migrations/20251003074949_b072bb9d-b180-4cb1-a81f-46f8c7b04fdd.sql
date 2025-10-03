-- Create table for custom quick log actions
CREATE TABLE IF NOT EXISTS public.quick_log_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#ec4899',
  log_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE public.quick_log_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own quick log actions"
  ON public.quick_log_actions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quick log actions"
  ON public.quick_log_actions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quick log actions"
  ON public.quick_log_actions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quick log actions"
  ON public.quick_log_actions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_quick_log_actions_updated_at
  BEFORE UPDATE ON public.quick_log_actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create default quick log actions for new users
CREATE OR REPLACE FUNCTION public.create_default_quick_log_actions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.quick_log_actions (user_id, name, icon_name, color, log_type, display_order)
  VALUES 
    (NEW.id, 'Feed', 'utensils', '#ec4899', 'feeding', 1),
    (NEW.id, 'Water', 'droplet', '#3b82f6', 'environment', 2),
    (NEW.id, 'Clean Cage', 'sparkles', '#f59e0b', 'environment', 3),
    (NEW.id, 'Clean Toilet', 'toilet', '#a855f7', 'environment', 4)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created_quick_log_actions ON auth.users;
CREATE TRIGGER on_auth_user_created_quick_log_actions
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_quick_log_actions();

-- Insert default actions for existing users
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO public.quick_log_actions (user_id, name, icon_name, color, log_type, display_order)
    VALUES 
      (user_record.id, 'Feed', 'utensils', '#ec4899', 'feeding', 1),
      (user_record.id, 'Water', 'droplet', '#3b82f6', 'environment', 2),
      (user_record.id, 'Clean Cage', 'sparkles', '#f59e0b', 'environment', 3),
      (user_record.id, 'Clean Toilet', 'toilet', '#a855f7', 'environment', 4)
    ON CONFLICT (user_id, name) DO NOTHING;
  END LOOP;
END $$;