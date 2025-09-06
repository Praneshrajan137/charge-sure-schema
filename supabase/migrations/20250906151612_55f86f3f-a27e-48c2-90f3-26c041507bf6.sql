-- Create ratings table for thumbs up/down system
CREATE TABLE public.charger_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  charger_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(charger_id, user_id) -- One rating per user per charger
);

-- Enable RLS
ALTER TABLE public.charger_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for ratings
CREATE POLICY "Users can view all ratings" 
ON public.charger_ratings 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own ratings" 
ON public.charger_ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.charger_ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings" 
ON public.charger_ratings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create analytics table for tracking user interactions
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  station_id TEXT,
  charger_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics
CREATE POLICY "Users can create analytics events" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Add last_verified field to chargers table
ALTER TABLE public.chargers 
ADD COLUMN last_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verification_count INTEGER DEFAULT 0,
ADD COLUMN rating_score NUMERIC DEFAULT 0,
ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Create function to update charger ratings
CREATE OR REPLACE FUNCTION public.update_charger_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update rating statistics for the charger
  UPDATE public.chargers 
  SET 
    rating_count = (
      SELECT COUNT(*) 
      FROM public.charger_ratings 
      WHERE charger_id = COALESCE(NEW.charger_id, OLD.charger_id)
    ),
    rating_score = (
      SELECT COALESCE(
        ROUND(
          (COUNT(*) FILTER (WHERE rating = 'up')::NUMERIC / 
           NULLIF(COUNT(*), 0)) * 100, 0
        ), 0
      )
      FROM public.charger_ratings 
      WHERE charger_id = COALESCE(NEW.charger_id, OLD.charger_id)
    ),
    updated_at = now()
  WHERE charger_id = COALESCE(NEW.charger_id, OLD.charger_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rating updates
CREATE TRIGGER update_charger_ratings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.charger_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_charger_rating_stats();

-- Update the existing update_charger_status function to track verification
CREATE OR REPLACE FUNCTION public.update_charger_status(
  p_charger_id text, 
  p_new_status text, 
  p_reported_by text DEFAULT NULL::text, 
  p_notes text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_old_status TEXT;
BEGIN
  -- Get current status
  SELECT current_status INTO v_old_status 
  FROM public.chargers 
  WHERE charger_id = p_charger_id;
  
  IF v_old_status IS NULL THEN
    RETURN QUERY SELECT false, 'Charger not found';
    RETURN;
  END IF;
  
  IF v_old_status = p_new_status THEN
    RETURN QUERY SELECT false, 'Status is already ' || p_new_status;
    RETURN;
  END IF;
  
  -- Update charger status and verification info
  UPDATE public.chargers 
  SET 
    current_status = p_new_status,
    last_update_timestamp = now(),
    last_verified_at = now(),
    verification_count = verification_count + 1,
    updated_at = now()
  WHERE charger_id = p_charger_id;
  
  -- Log the status change
  INSERT INTO public.charger_status_updates (
    charger_id, 
    old_status, 
    new_status, 
    reported_by, 
    notes
  ) VALUES (
    p_charger_id, 
    v_old_status, 
    p_new_status, 
    p_reported_by, 
    p_notes
  );
  
  RETURN QUERY SELECT true, 'Status updated successfully';
END;
$function$;