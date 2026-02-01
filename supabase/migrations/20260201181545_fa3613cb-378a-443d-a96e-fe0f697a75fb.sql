-- Add missing columns to rats table
ALTER TABLE public.rats 
ADD COLUMN IF NOT EXISTS sex TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Update existing columns to use new names as aliases (for backwards compatibility)
-- The 'gender' column already exists, we'll use it as 'sex' via application code
-- The 'birthdate' column already exists, we'll use it as 'birthday' via application code

-- Create behavior_tags table for BehaviorLogForm
CREATE TABLE IF NOT EXISTS public.behavior_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

ALTER TABLE public.behavior_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own behavior tags" ON public.behavior_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own behavior tags" ON public.behavior_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own behavior tags" ON public.behavior_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own behavior tags" ON public.behavior_tags FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_behavior_tags_updated_at 
BEFORE UPDATE ON public.behavior_tags 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add completed column to tasks table to match the Task interface
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;

-- Sync completed with is_completed
UPDATE public.tasks SET completed = is_completed WHERE completed IS NULL;

-- Create delete_user_by_id function for account deletion
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id_to_delete UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to delete their own account
  IF auth.uid() != user_id_to_delete THEN
    RAISE EXCEPTION 'Not authorized to delete this user';
  END IF;
  
  -- Delete the user from auth.users (this will cascade to all related data)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$$;