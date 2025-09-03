-- Add status update tracking table
CREATE TABLE public.charger_status_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  charger_id TEXT NOT NULL,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reported_by TEXT,
  reported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.charger_status_updates ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view status updates
CREATE POLICY "Status updates are viewable by everyone" 
ON public.charger_status_updates 
FOR SELECT 
USING (true);

-- Allow anyone to report status updates
CREATE POLICY "Anyone can report status updates" 
ON public.charger_status_updates 
FOR INSERT 
WITH CHECK (true);

-- Add index for better performance
CREATE INDEX idx_charger_status_updates_charger_id ON public.charger_status_updates(charger_id);
CREATE INDEX idx_charger_status_updates_reported_at ON public.charger_status_updates(reported_at DESC);

-- Create function to update charger status and log the change
CREATE OR REPLACE FUNCTION public.update_charger_status(
  p_charger_id TEXT,
  p_new_status TEXT,
  p_reported_by TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
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
  
  -- Update charger status
  UPDATE public.chargers 
  SET 
    current_status = p_new_status,
    last_update_timestamp = now(),
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
$$ LANGUAGE plpgsql SECURITY DEFINER;