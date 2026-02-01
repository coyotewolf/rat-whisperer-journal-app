
-- Update the handle_new_user function to include sample rats, tasks, and log entries
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  
  -- Insert default reminder settings
  INSERT INTO public.reminder_settings (user_id, type, enabled, frequency_days, priority)
  VALUES 
    (NEW.id, 'feeding', true, 1, 'medium'),
    (NEW.id, 'water', true, 3, 'medium'),
    (NEW.id, 'cage_cleaning', true, 5, 'high'),
    (NEW.id, 'litter_cleaning', true, 3, 'medium'),
    (NEW.id, 'weight_check', true, 7, 'medium'),
    (NEW.id, 'health_check', true, 14, 'high'),
    (NEW.id, 'medication', true, 1, 'high')
  ON CONFLICT DO NOTHING;
  
  -- Insert default quick log actions
  INSERT INTO public.quick_log_actions (user_id, name, icon_name, color, log_type, display_order)
  VALUES 
    (NEW.id, 'Feed', 'utensils', '#ec4899', 'feeding', 1),
    (NEW.id, 'Water', 'droplet', '#3b82f6', 'environment', 2),
    (NEW.id, 'Clean Cage', 'sparkles', '#f59e0b', 'environment', 3),
    (NEW.id, 'Clean Toilet', 'toilet', '#a855f7', 'environment', 4)
  ON CONFLICT DO NOTHING;
  
  -- Insert default log tag categories
  INSERT INTO public.log_tag_categories (user_id, name, display_name, color, is_default)
  VALUES 
    (NEW.id, 'health', 'Health', '#ef4444', true),
    (NEW.id, 'behavior', 'Behavior', '#10b981', true)
  ON CONFLICT DO NOTHING;
  
  -- Insert default personality tags
  INSERT INTO public.personality_tags (user_id, name, display_name, color, is_default)
  VALUES
    (NEW.id, 'friendly', 'Friendly', '#10b981', true),
    (NEW.id, 'shy', 'Shy', '#6366f1', true),
    (NEW.id, 'curious', 'Curious', '#f59e0b', true),
    (NEW.id, 'active', 'Active', '#ef4444', true),
    (NEW.id, 'calm', 'Calm', '#3b82f6', true)
  ON CONFLICT DO NOTHING;
  
  -- Insert default log tag suggestions
  INSERT INTO public.log_tag_suggestions (user_id, name, category, color)
  VALUES
    (NEW.id, 'playful', 'behavior', '#10b981'),
    (NEW.id, 'sleepy', 'behavior', '#6366f1'),
    (NEW.id, 'eating well', 'health', '#22c55e'),
    (NEW.id, 'sneezing', 'health', '#ef4444'),
    (NEW.id, 'grooming', 'behavior', '#f59e0b')
  ON CONFLICT DO NOTHING;
  
  -- Insert default task suggestions
  INSERT INTO public.task_suggestions (user_id, name, title, description, priority, color)
  VALUES
    (NEW.id, 'daily_feeding', 'Daily Feeding', 'Feed all rats their daily portion', 'high', '#ec4899'),
    (NEW.id, 'water_change', 'Change Water', 'Replace water bottles with fresh water', 'high', '#3b82f6'),
    (NEW.id, 'cage_cleaning', 'Clean Cage', 'Full cage cleaning and bedding change', 'medium', '#f59e0b'),
    (NEW.id, 'health_check', 'Health Check', 'Check weight, ears, eyes, and overall condition', 'medium', '#10b981'),
    (NEW.id, 'nail_trim', 'Nail Trim', 'Trim nails if needed', 'low', '#a855f7')
  ON CONFLICT DO NOTHING;
  
  -- Insert sample rats
  INSERT INTO public.rats (user_id, name, gender, birthdate, color, coat_type, ear_type, personality, status)
  VALUES
    (NEW.id, 'Whiskers', 'male', CURRENT_DATE - INTERVAL '8 months', 'Agouti', 'Standard', 'Standard', '["friendly", "curious"]', 'active'),
    (NEW.id, 'Cinnamon', 'female', CURRENT_DATE - INTERVAL '6 months', 'Cinnamon', 'Rex', 'Dumbo', '["calm", "friendly"]', 'active'),
    (NEW.id, 'Shadow', 'male', CURRENT_DATE - INTERVAL '10 months', 'Black', 'Standard', 'Standard', '["shy", "calm"]', 'active')
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$function$;
