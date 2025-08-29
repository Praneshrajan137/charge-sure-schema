-- Create stations table
CREATE TABLE public.stations (
  station_id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chargers table  
CREATE TABLE public.chargers (
  charger_id TEXT NOT NULL PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
  plug_type TEXT NOT NULL CHECK (plug_type IN ('CCS', 'CHAdeMO', 'Type 2', 'J-1772')),
  max_power_kw DECIMAL(6,2) NOT NULL CHECK (max_power_kw > 0),
  current_status TEXT NOT NULL DEFAULT 'Unknown' CHECK (current_status IN ('Available', 'In Use', 'Out of Service', 'Unknown')),
  last_update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;

-- Create policies for stations (publicly readable)
CREATE POLICY "Stations are viewable by everyone" 
ON public.stations 
FOR SELECT 
USING (true);

-- Create policies for chargers (publicly readable)
CREATE POLICY "Chargers are viewable by everyone" 
ON public.chargers 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_stations_updated_at
  BEFORE UPDATE ON public.stations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chargers_updated_at
  BEFORE UPDATE ON public.chargers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_chargers_station_id ON public.chargers(station_id);
CREATE INDEX idx_chargers_status ON public.chargers(current_status);
CREATE INDEX idx_stations_location ON public.stations(latitude, longitude);