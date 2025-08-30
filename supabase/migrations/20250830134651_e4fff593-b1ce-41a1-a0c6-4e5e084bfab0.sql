-- Update RLS policies for map_data to support veterinary hospital map with role-based access
-- Drop existing user-specific policies
DROP POLICY IF EXISTS "Users can view their own map data" ON public.map_data;
DROP POLICY IF EXISTS "Users can insert their own map data" ON public.map_data;
DROP POLICY IF EXISTS "Users can update their own map data" ON public.map_data;
DROP POLICY IF EXISTS "Users can delete their own map data" ON public.map_data;

-- Create new role-based policies for veterinary hospital map
-- All authenticated users can view all map data (veterinary hospitals are public info)
CREATE POLICY "All users can view map data" 
ON public.map_data 
FOR SELECT 
TO authenticated
USING (true);

-- Only testers can insert new veterinary hospital data
CREATE POLICY "Testers can insert map data" 
ON public.map_data 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'tester'::app_role));

-- Only testers can update veterinary hospital data
CREATE POLICY "Testers can update map data" 
ON public.map_data 
FOR UPDATE 
TO authenticated
USING (has_role(auth.uid(), 'tester'::app_role));

-- Only testers can delete veterinary hospital data
CREATE POLICY "Testers can delete map data" 
ON public.map_data 
FOR DELETE 
TO authenticated
USING (has_role(auth.uid(), 'tester'::app_role));