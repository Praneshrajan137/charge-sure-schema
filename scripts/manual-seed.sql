-- Manual Database Seeding for ChargeSure
-- Run this SQL directly in your Supabase SQL Editor

-- Clear existing data
DELETE FROM public.chargers;
DELETE FROM public.stations;

-- Insert sample stations
INSERT INTO public.stations (station_id, name, address, latitude, longitude) VALUES
('CS001', 'Downtown Charging Hub', '123 Main Street, San Francisco, CA', 37.7749, -122.4194),
('CS002', 'Shopping Center Fast Charge', '456 Market Square, San Francisco, CA', 37.7849, -122.4094),
('CS003', 'Airport Express Charging', '789 Airport Blvd, San Francisco, CA', 37.7649, -122.3994),
('CS004', 'Highway Rest Stop', '321 Highway 101, San Francisco, CA', 37.7949, -122.4294),
('CS005', 'University Campus Charging', '654 College Ave, San Francisco, CA', 37.7549, -122.4394),
('CS006', 'Marina Bay Charging Point', '987 Bay Street, San Francisco, CA', 37.8049, -122.4094),
('CS007', 'Business District Fast Hub', '111 Financial Blvd, San Francisco, CA', 37.7949, -122.3894),
('CS008', 'Residential Area Charger', '222 Oak Street, San Francisco, CA', 37.7449, -122.4494),
('CS009', 'Hotel Destination Charging', '555 Luxury Lane, San Francisco, CA', 37.7749, -122.3794),
('CS010', 'Supermarket Charging', '777 Grocery Way, San Francisco, CA', 37.8149, -122.4194),
('CS011', 'Park and Ride EV Station', '888 Transit Hub, San Francisco, CA', 37.7349, -122.4594),
('CS012', 'Tech Campus Ultra-Fast', '999 Innovation Drive, San Francisco, CA', 37.7649, -122.3694);

-- Insert sample chargers
INSERT INTO public.chargers (charger_id, station_id, plug_type, max_power_kw, current_status, last_update_timestamp) VALUES
-- CS001 chargers
('CS001-01', 'CS001', 'CCS', 150, 'Available', NOW()),
('CS001-02', 'CS001', 'CHAdeMO', 50, 'In Use', NOW()),
('CS001-03', 'CS001', 'Tesla', 250, 'Available', NOW()),

-- CS002 chargers
('CS002-01', 'CS002', 'CCS', 75, 'Available', NOW()),
('CS002-02', 'CS002', 'CCS', 75, 'Out of Service', NOW()),

-- CS003 chargers
('CS003-01', 'CS003', 'Tesla', 150, 'Available', NOW()),
('CS003-02', 'CS003', 'CCS', 150, 'Available', NOW()),
('CS003-03', 'CS003', 'CHAdeMO', 50, 'In Use', NOW()),
('CS003-04', 'CS003', 'Type 2', 22, 'Available', NOW()),

-- CS004 chargers
('CS004-01', 'CS004', 'CCS', 200, 'Available', NOW()),
('CS004-02', 'CS004', 'Tesla', 250, 'In Use', NOW()),

-- CS005 chargers
('CS005-01', 'CS005', 'Type 2', 11, 'Available', NOW()),
('CS005-02', 'CS005', 'Type 2', 11, 'Available', NOW()),
('CS005-03', 'CS005', 'CCS', 50, 'Out of Service', NOW()),

-- CS006 chargers
('CS006-01', 'CS006', 'Tesla', 120, 'Available', NOW()),
('CS006-02', 'CS006', 'CCS', 100, 'Available', NOW()),

-- CS007 chargers
('CS007-01', 'CS007', 'CCS', 175, 'In Use', NOW()),
('CS007-02', 'CS007', 'CHAdeMO', 50, 'Available', NOW()),
('CS007-03', 'CS007', 'Tesla', 200, 'Available', NOW()),

-- CS008 chargers
('CS008-01', 'CS008', 'Type 2', 7, 'Available', NOW()),
('CS008-02', 'CS008', 'CCS', 50, 'Available', NOW()),

-- CS009 chargers
('CS009-01', 'CS009', 'Tesla', 11, 'In Use', NOW()),
('CS009-02', 'CS009', 'Type 2', 22, 'Available', NOW()),
('CS009-03', 'CS009', 'Type 2', 22, 'Available', NOW()),

-- CS010 chargers
('CS010-01', 'CS010', 'CCS', 50, 'Available', NOW()),
('CS010-02', 'CS010', 'CHAdeMO', 50, 'Out of Service', NOW()),

-- CS011 chargers
('CS011-01', 'CS011', 'CCS', 100, 'Available', NOW()),
('CS011-02', 'CS011', 'Tesla', 150, 'Available', NOW()),
('CS011-03', 'CS011', 'Type 2', 11, 'In Use', NOW()),

-- CS012 chargers
('CS012-01', 'CS012', 'CCS', 350, 'Available', NOW()),
('CS012-02', 'CS012', 'Tesla', 250, 'In Use', NOW()),
('CS012-03', 'CS012', 'CHAdeMO', 100, 'Available', NOW());

-- Verify the data
SELECT COUNT(*) as station_count FROM public.stations;
SELECT COUNT(*) as charger_count FROM public.chargers;
SELECT plug_type, COUNT(*) as count FROM public.chargers GROUP BY plug_type ORDER BY count DESC;
