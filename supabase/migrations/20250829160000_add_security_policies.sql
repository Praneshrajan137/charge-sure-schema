-- Create a table to store user session data for rate limiting
CREATE TABLE public.user_sessions (
  session_id TEXT PRIMARY KEY,
  last_update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  update_count_24h INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to set a session-level variable
CREATE OR REPLACE FUNCTION public.set_config(setting_name TEXT, setting_value TEXT)
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('SET %I.user_session = %L', current_setting('search_path'), setting_value);
  RETURN setting_value;
END;
$$;

-- Function to check update rate limit for a specific charger
CREATE OR REPLACE FUNCTION public.check_update_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_session TEXT;
  last_update TIMESTAMP WITH TIME ZONE;
  time_diff INTERVAL;
  min_interval INTERVAL := '30 seconds'; -- Minimum interval between updates for the same charger
BEGIN
  user_session := current_setting('public.user_session', true);

  IF user_session IS NULL THEN
    RAISE EXCEPTION 'User session not set. Cannot update charger status.';
  END IF;

  SELECT last_update_timestamp INTO last_update
  FROM public.user_sessions
  WHERE session_id = user_session;

  IF last_update IS NOT NULL THEN
    time_diff := now() - last_update;
    IF time_diff < min_interval THEN
      RAISE EXCEPTION 'Please wait at least % seconds before updating this charger again.', EXTRACT(EPOCH FROM min_interval);
    END IF;
  END IF;

  -- Update last_update_timestamp for the session
  INSERT INTO public.user_sessions (session_id, last_update_timestamp)
  VALUES (user_session, now())
  ON CONFLICT (session_id) DO UPDATE
  SET last_update_timestamp = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check daily update limit for a session
CREATE OR REPLACE FUNCTION public.check_daily_update_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_session TEXT;
  current_count INT;
  max_daily_updates INT := 10; -- Max updates per session per day
BEGIN
  user_session := current_setting('public.user_session', true);

  IF user_session IS NULL THEN
    RAISE EXCEPTION 'User session not set. Cannot update charger status.';
  END IF;

  SELECT update_count_24h INTO current_count
  FROM public.user_sessions
  WHERE session_id = user_session;

  IF current_count IS NULL THEN
    current_count := 0;
  END IF;

  IF current_count >= max_daily_updates THEN
    RAISE EXCEPTION 'Too many status updates. You can only update % times per day.', max_daily_updates;
  END IF;

  -- Increment update count for the session
  INSERT INTO public.user_sessions (session_id, update_count_24h)
  VALUES (user_session, 1)
  ON CONFLICT (session_id) DO UPDATE
  SET update_count_24h = public.user_sessions.update_count_24h + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for rate limiting on charger updates
CREATE TRIGGER enforce_charger_update_rate_limit
BEFORE UPDATE ON public.chargers
FOR EACH ROW
EXECUTE FUNCTION public.check_update_rate_limit();

-- Trigger for daily update limit
CREATE TRIGGER enforce_daily_update_limit
BEFORE UPDATE ON public.chargers
FOR EACH ROW
EXECUTE FUNCTION public.check_daily_update_limit();

-- Policy to allow users to update chargers if they pass rate limits
CREATE POLICY "Allow authenticated users to update charger status with rate limits"
ON public.chargers
FOR UPDATE
USING (
  auth.role() = 'anon' -- Assuming anonymous users can update, but are rate-limited
  AND EXISTS (
    SELECT 1 FROM public.user_sessions
    WHERE session_id = current_setting('public.user_session', true)::text
  )
);
