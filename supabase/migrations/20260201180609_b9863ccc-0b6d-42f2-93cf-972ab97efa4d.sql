-- ====================================
-- Core function for updating timestamps
-- ====================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ====================================
-- 1. RATS TABLE
-- ====================================
CREATE TABLE public.rats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  birthdate DATE,
  acquisition_date DATE,
  origin TEXT,
  color TEXT,
  coat_type TEXT,
  ear_type TEXT,
  is_neutered BOOLEAN DEFAULT false,
  personality TEXT,
  notes TEXT,
  profile_image_url TEXT,
  is_deceased BOOLEAN DEFAULT false,
  deceased_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rats" ON public.rats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rats" ON public.rats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own rats" ON public.rats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own rats" ON public.rats FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_rats_updated_at BEFORE UPDATE ON public.rats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 2. LOG ENTRIES TABLE
-- ====================================
CREATE TABLE public.log_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  rat_ids UUID[] DEFAULT '{}',
  rat_names TEXT[] DEFAULT '{}',
  content JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.log_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own log entries" ON public.log_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own log entries" ON public.log_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own log entries" ON public.log_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own log entries" ON public.log_entries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_log_entries_updated_at BEFORE UPDATE ON public.log_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_log_entries_user_id ON public.log_entries(user_id);
CREATE INDEX idx_log_entries_type ON public.log_entries(type);
CREATE INDEX idx_log_entries_timestamp ON public.log_entries(timestamp DESC);

-- ====================================
-- 3. TASKS TABLE
-- ====================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_time TIME,
  priority TEXT DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  rat_ids UUID[] DEFAULT '{}',
  repeat_type TEXT,
  repeat_interval INTEGER,
  repeat_unit TEXT,
  repeat_days TEXT[],
  location TEXT,
  quantity NUMERIC,
  unit TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 4. PERSONALITY TAGS TABLE
-- ====================================
CREATE TABLE public.personality_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT,
  color TEXT DEFAULT '#6b7280',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.personality_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own personality tags" ON public.personality_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own personality tags" ON public.personality_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own personality tags" ON public.personality_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own personality tags" ON public.personality_tags FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_personality_tags_updated_at BEFORE UPDATE ON public.personality_tags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 5. TASK SUGGESTIONS TABLE
-- ====================================
CREATE TABLE public.task_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  priority TEXT,
  location TEXT,
  quantity NUMERIC,
  unit TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.task_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own task suggestions" ON public.task_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own task suggestions" ON public.task_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own task suggestions" ON public.task_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own task suggestions" ON public.task_suggestions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_task_suggestions_updated_at BEFORE UPDATE ON public.task_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 6. LOG TAG SUGGESTIONS TABLE
-- ====================================
CREATE TABLE public.log_tag_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'behavior',
  color TEXT DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.log_tag_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own log tag suggestions" ON public.log_tag_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own log tag suggestions" ON public.log_tag_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own log tag suggestions" ON public.log_tag_suggestions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own log tag suggestions" ON public.log_tag_suggestions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_log_tag_suggestions_updated_at BEFORE UPDATE ON public.log_tag_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 7. LOG TAG CATEGORIES TABLE
-- ====================================
CREATE TABLE public.log_tag_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  color TEXT DEFAULT '#6b7280',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.log_tag_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own log tag categories" ON public.log_tag_categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own log tag categories" ON public.log_tag_categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own log tag categories" ON public.log_tag_categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own log tag categories" ON public.log_tag_categories FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_log_tag_categories_updated_at BEFORE UPDATE ON public.log_tag_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 8. REMINDER SETTINGS TABLE
-- ====================================
CREATE TABLE public.reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  frequency_days INTEGER DEFAULT 1,
  priority TEXT DEFAULT 'medium',
  custom_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

ALTER TABLE public.reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminder settings" ON public.reminder_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reminder settings" ON public.reminder_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reminder settings" ON public.reminder_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reminder settings" ON public.reminder_settings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_reminder_settings_updated_at BEFORE UPDATE ON public.reminder_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 9. QUICK LOG ACTIONS TABLE
-- ====================================
CREATE TABLE public.quick_log_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#ec4899',
  log_type TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  default_values JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.quick_log_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quick log actions" ON public.quick_log_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quick log actions" ON public.quick_log_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quick log actions" ON public.quick_log_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quick log actions" ON public.quick_log_actions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_quick_log_actions_updated_at BEFORE UPDATE ON public.quick_log_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 10. USER ROLES (for testers/admins)
-- ====================================
CREATE TYPE public.app_role AS ENUM ('tester', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Testers can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'tester'));

-- ====================================
-- 11. MAP DATA TABLE
-- ====================================
CREATE TABLE public.map_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.map_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view map data" ON public.map_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "Testers can insert map data" ON public.map_data FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'tester'::app_role));
CREATE POLICY "Testers can update map data" ON public.map_data FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'tester'::app_role));
CREATE POLICY "Testers can delete map data" ON public.map_data FOR DELETE TO authenticated USING (has_role(auth.uid(), 'tester'::app_role));

CREATE TRIGGER update_map_data_updated_at BEFORE UPDATE ON public.map_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 12. HIERARCHY ANALYSIS CACHE
-- ====================================
CREATE TABLE public.hierarchy_analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_data JSONB NOT NULL,
  time_range INTEGER NOT NULL,
  last_behavior_log_timestamp TIMESTAMPTZ NOT NULL,
  behavior_log_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, time_range)
);

ALTER TABLE public.hierarchy_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own hierarchy analysis" ON public.hierarchy_analysis_cache FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_hierarchy_cache_updated_at BEFORE UPDATE ON public.hierarchy_analysis_cache FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- 13. HIERARCHY INVALIDATION TRIGGERS
-- ====================================
CREATE TABLE public.hierarchy_invalidation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  trigger_type TEXT NOT NULL,
  log_entry_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hierarchy_invalidation_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own triggers" ON public.hierarchy_invalidation_triggers FOR ALL USING (auth.uid() = user_id);

-- ====================================
-- 14. RAT RANK HISTORY
-- ====================================
CREATE TABLE public.rat_rank_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  analysis_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  rat_id UUID NOT NULL,
  rat_name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  dominance_score NUMERIC NOT NULL,
  time_range INTEGER
);

ALTER TABLE public.rat_rank_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rank history" ON public.rat_rank_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own rank history" ON public.rat_rank_history FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rank_history_user_time ON public.rat_rank_history(user_id, analysis_time);
CREATE INDEX idx_rank_history_user_rat ON public.rat_rank_history(user_id, rat_id);

-- ====================================
-- 15. DAILY INTERACTION SURVEYS
-- ====================================
CREATE TABLE public.daily_interaction_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  survey_date DATE NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB,
  processed_behaviors JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, survey_date)
);

ALTER TABLE public.daily_interaction_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own surveys" ON public.daily_interaction_surveys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own surveys" ON public.daily_interaction_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own surveys" ON public.daily_interaction_surveys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own surveys" ON public.daily_interaction_surveys FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_interaction_surveys_updated_at BEFORE UPDATE ON public.daily_interaction_surveys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================
-- TRIGGERS FOR NEW USER DEFAULTS
-- ====================================

-- Function to handle new user defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();