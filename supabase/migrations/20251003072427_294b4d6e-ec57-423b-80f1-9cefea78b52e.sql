-- Create trigger to automatically create default reminder settings for new users
CREATE OR REPLACE FUNCTION public.ensure_reminder_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert default reminder settings if they don't exist
  INSERT INTO public.reminder_settings (user_id, type, enabled, frequency_days, priority, custom_message)
  VALUES 
    (NEW.id, 'feeding', true, 1, 'medium', NULL),
    (NEW.id, 'water', true, 3, 'medium', NULL),
    (NEW.id, 'cage_cleaning', true, 5, 'high', NULL),
    (NEW.id, 'litter_cleaning', true, 3, 'medium', NULL),
    (NEW.id, 'weight_check', true, 7, 'medium', NULL),
    (NEW.id, 'health_check', true, 14, 'high', NULL),
    (NEW.id, 'medication', true, 1, 'high', NULL)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_reminder_settings ON auth.users;

-- Create trigger that fires after user creation
CREATE TRIGGER on_auth_user_created_reminder_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_reminder_settings();

-- Insert default settings for all existing users who don't have them
-- Do this separately for each type to avoid the CASE issue
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    INSERT INTO public.reminder_settings (user_id, type, enabled, frequency_days, priority, custom_message)
    VALUES 
      (user_record.id, 'feeding', true, 1, 'medium', NULL),
      (user_record.id, 'water', true, 3, 'medium', NULL),
      (user_record.id, 'cage_cleaning', true, 5, 'high', NULL),
      (user_record.id, 'litter_cleaning', true, 3, 'medium', NULL),
      (user_record.id, 'weight_check', true, 7, 'medium', NULL),
      (user_record.id, 'health_check', true, 14, 'high', NULL),
      (user_record.id, 'medication', true, 1, 'high', NULL)
    ON CONFLICT (user_id, type) DO NOTHING;
  END LOOP;
END $$;