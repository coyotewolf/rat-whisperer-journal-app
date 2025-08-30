-- Create map_data table for storing map points
CREATE TABLE public.map_data (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.map_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for map_data
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

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_map_data_updated_at
    BEFORE UPDATE ON public.map_data
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_map_data_user_id ON public.map_data(user_id);
CREATE INDEX idx_map_data_category ON public.map_data(category);
CREATE INDEX idx_map_data_location ON public.map_data(latitude, longitude);