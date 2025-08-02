-- Create daily interaction surveys table
CREATE TABLE public.daily_interaction_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  survey_date DATE NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB,
  processed_behaviors JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, survey_date)
);

-- Enable RLS
ALTER TABLE public.daily_interaction_surveys ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own surveys" 
ON public.daily_interaction_surveys 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own surveys" 
ON public.daily_interaction_surveys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys" 
ON public.daily_interaction_surveys 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys" 
ON public.daily_interaction_surveys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_daily_interaction_surveys_updated_at
BEFORE UPDATE ON public.daily_interaction_surveys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();