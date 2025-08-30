-- Update RLS policies for map_data table to allow users to manage their own data
DROP POLICY IF EXISTS "Everyone can view map data" ON public.map_data;
DROP POLICY IF EXISTS "Testers can insert map data" ON public.map_data;
DROP POLICY IF EXISTS "Testers can update map data" ON public.map_data;
DROP POLICY IF EXISTS "Testers can delete map data" ON public.map_data;

-- Create user-specific policies
CREATE POLICY "Users can view their own map data" 
ON public.map_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own map data" 
ON public.map_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own map data" 
ON public.map_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own map data" 
ON public.map_data 
FOR DELETE 
USING (auth.uid() = user_id);