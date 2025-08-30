-- Remove the problematic public read access policy for personality_tags
DROP POLICY IF EXISTS "Enable read access for all users" ON public.personality_tags;

-- Verify that the secure policy still exists (this is just a comment for clarity)
-- The policy "Users can view their own personality tags" with (auth.uid() = user_id) should remain active