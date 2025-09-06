-- Fix security warnings by setting proper search paths for functions

CREATE OR REPLACE FUNCTION public.update_charger_rating_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_charger_status(
  p_charger_id text, 
  p_new_status text, 
  p_reported_by text DEFAULT NULL::text, 
  p_notes text DEFAULT NULL::text
)
RETURNS TABLE(success boolean, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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