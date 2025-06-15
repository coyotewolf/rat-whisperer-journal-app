
-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_personality_tags_updated_at ON public.personality_tags;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_personality_tags_updated_at
    BEFORE UPDATE ON public.personality_tags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
