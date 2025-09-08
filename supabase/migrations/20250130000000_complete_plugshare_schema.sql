-- Complete PlugShare Database Schema
-- This migration creates the full database structure to support all PlugShare features

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Users table for user management and profiles
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    profile_photo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Stations table with complete PlugShare features
DROP TABLE IF EXISTS public.stations CASCADE;
CREATE TABLE public.stations (
    station_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    gps_location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_Point(longitude, latitude), 4326)) STORED,
    plugscore INTEGER CHECK (plugscore >= 0 AND plugscore <= 10) DEFAULT 5,
    station_count INTEGER DEFAULT 1,
    
    -- Amenities as JSONB array for flexible querying
    amenities JSONB DEFAULT '[]'::jsonb,
    
    -- Parking attributes as JSONB array
    parking_attributes JSONB DEFAULT '[]'::jsonb,
    
    -- Station classification
    station_type TEXT DEFAULT 'public' CHECK (station_type IN ('public', 'restricted', 'residential', 'dealership')),
    is_restricted_access BOOLEAN DEFAULT FALSE,
    is_dealership BOOLEAN DEFAULT FALSE,
    
    -- Operational info
    hours_of_operation JSONB DEFAULT '{"24/7": true}'::jsonb,
    access_fee DECIMAL(10, 2) DEFAULT 0.00,
    network_name TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(user_id)
);

-- Enhanced Chargers table
DROP TABLE IF EXISTS public.chargers CASCADE;
CREATE TABLE public.chargers (
    charger_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
    plug_type TEXT NOT NULL,
    max_power_kw DECIMAL(6, 2) NOT NULL,
    current_status TEXT DEFAULT 'Unknown' CHECK (current_status IN ('Available', 'In Use', 'Out of Service', 'Unknown')),
    last_update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Pricing information
    pricing_per_kwh DECIMAL(6, 4),
    pricing_per_minute DECIMAL(6, 4),
    
    -- Technical specs
    connector_type TEXT,
    is_ccs_compatible BOOLEAN DEFAULT FALSE,
    is_chademo_compatible BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check-ins table for user activity tracking
CREATE TABLE IF NOT EXISTS public.check_ins (
    check_in_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
    charger_id UUID REFERENCES public.chargers(charger_id) ON DELETE SET NULL,
    
    -- Check-in details
    comment TEXT,
    photo_urls JSONB DEFAULT '[]'::jsonb,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    charging_duration_minutes INTEGER,
    energy_added_kwh DECIMAL(6, 2),
    
    -- Status updates
    reported_status TEXT CHECK (reported_status IN ('Available', 'In Use', 'Out of Service', 'Unknown')),
    
    -- Timestamps
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table for detailed station feedback
CREATE TABLE IF NOT EXISTS public.reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    station_id UUID NOT NULL REFERENCES public.stations(station_id) ON DELETE CASCADE,
    
    -- Review content
    title TEXT,
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    
    -- Review categories
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
    reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
    
    -- Review metadata
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip Plans table for route planning
CREATE TABLE IF NOT EXISTS public.trip_plans (
    trip_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    
    -- Trip details
    name TEXT NOT NULL,
    start_location_name TEXT NOT NULL,
    end_location_name TEXT NOT NULL,
    start_coordinates GEOGRAPHY(POINT, 4326),
    end_coordinates GEOGRAPHY(POINT, 4326),
    
    -- Route information
    total_distance_km DECIMAL(8, 2),
    estimated_duration_hours DECIMAL(4, 2),
    route_path JSONB, -- GeoJSON LineString
    
    -- Planned stops
    planned_stations JSONB DEFAULT '[]'::jsonb, -- Array of station_ids
    
    -- Trip metadata
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table for user-generated content
CREATE TABLE IF NOT EXISTS public.photos (
    photo_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
    station_id UUID REFERENCES public.stations(station_id) ON DELETE CASCADE,
    check_in_id UUID REFERENCES public.check_ins(check_in_id) ON DELETE CASCADE,
    
    -- Photo details
    photo_url TEXT NOT NULL,
    caption TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stations_gps_location ON public.stations USING GIST (gps_location);
CREATE INDEX IF NOT EXISTS idx_stations_plugscore ON public.stations (plugscore);
CREATE INDEX IF NOT EXISTS idx_stations_station_type ON public.stations (station_type);
CREATE INDEX IF NOT EXISTS idx_chargers_station_id ON public.chargers (station_id);
CREATE INDEX IF NOT EXISTS idx_chargers_plug_type ON public.chargers (plug_type);
CREATE INDEX IF NOT EXISTS idx_chargers_max_power_kw ON public.chargers (max_power_kw);
CREATE INDEX IF NOT EXISTS idx_check_ins_station_id ON public.check_ins (station_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON public.check_ins (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_station_id ON public.reviews (station_id);
CREATE INDEX IF NOT EXISTS idx_trip_plans_user_id ON public.trip_plans (user_id);

-- Create GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_stations_amenities ON public.stations USING GIN (amenities);
CREATE INDEX IF NOT EXISTS idx_stations_parking ON public.stations USING GIN (parking_attributes);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chargers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Allow public read access to stations" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to chargers" ON public.chargers FOR SELECT USING (true);
CREATE POLICY "Allow public read access to check_ins" ON public.check_ins FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read access to photos" ON public.photos FOR SELECT USING (true);

-- RLS Policies for authenticated users
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON public.users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own check_ins" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can manage their own trip_plans" ON public.trip_plans FOR ALL USING (auth.uid() = user_id);

-- Functions for PlugScore calculation
CREATE OR REPLACE FUNCTION calculate_plugscore(station_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_reviews INTEGER;
    avg_rating DECIMAL;
    recent_check_ins INTEGER;
    uptime_score INTEGER;
    final_score INTEGER;
BEGIN
    -- Count total reviews
    SELECT COUNT(*) INTO total_reviews
    FROM public.reviews
    WHERE station_id = station_uuid;
    
    -- Calculate average rating
    SELECT AVG(rating) INTO avg_rating
    FROM public.reviews
    WHERE station_id = station_uuid;
    
    -- Count recent check-ins (last 30 days)
    SELECT COUNT(*) INTO recent_check_ins
    FROM public.check_ins
    WHERE station_id = station_uuid
    AND check_in_time > NOW() - INTERVAL '30 days';
    
    -- Simple uptime calculation based on status reports
    SELECT CASE 
        WHEN COUNT(*) = 0 THEN 7
        WHEN AVG(CASE WHEN reported_status = 'Available' THEN 1 ELSE 0 END) > 0.9 THEN 9
        WHEN AVG(CASE WHEN reported_status = 'Available' THEN 1 ELSE 0 END) > 0.7 THEN 7
        WHEN AVG(CASE WHEN reported_status = 'Available' THEN 1 ELSE 0 END) > 0.5 THEN 5
        ELSE 3
    END INTO uptime_score
    FROM public.check_ins
    WHERE station_id = station_uuid
    AND check_in_time > NOW() - INTERVAL '90 days'
    AND reported_status IS NOT NULL;
    
    -- Calculate final score (weighted average)
    final_score := CASE
        WHEN total_reviews = 0 THEN 5 -- Default score for new stations
        ELSE LEAST(10, GREATEST(1, 
            ROUND(
                (COALESCE(avg_rating, 3) * 0.4) + 
                (uptime_score * 0.4) + 
                (LEAST(10, recent_check_ins / 2.0) * 0.2)
            )::INTEGER
        ))
    END;
    
    RETURN final_score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update PlugScore when reviews or check-ins are added
CREATE OR REPLACE FUNCTION update_station_plugscore()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.stations
    SET plugscore = calculate_plugscore(NEW.station_id),
        updated_at = NOW()
    WHERE station_id = NEW.station_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plugscore_on_review
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_station_plugscore();

CREATE TRIGGER trigger_update_plugscore_on_checkin
    AFTER INSERT OR UPDATE ON public.check_ins
    FOR EACH ROW EXECUTE FUNCTION update_station_plugscore();

