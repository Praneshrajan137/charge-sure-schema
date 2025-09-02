-- Insert sample charging stations with realistic data
INSERT INTO public.stations (station_id, name, address, latitude, longitude) VALUES
('STN001', 'Downtown Mall Charging Hub', '123 Main Street, San Francisco, CA 94105', 37.7749, -122.4194),
('STN002', 'Tesla Supercharger - Union Square', '350 Post Street, San Francisco, CA 94108', 37.7880, -122.4074),
('STN003', 'Whole Foods Market Chargers', '2001 Market Street, San Francisco, CA 94114', 37.7670, -122.4312),
('STN004', 'IKEA Fast Charging Station', '4400 Shellmound Street, Emeryville, CA 94608', 37.8311, -122.2886),
('STN005', 'Airport Express Charging', '1650 Mission Street, San Francisco, CA 94103', 37.7688, -122.4190),
('STN006', 'Bay Bridge Plaza Chargers', '456 Harrison Street, San Francisco, CA 94105', 37.7862, -122.3971),
('STN007', 'Golden Gate Park Station', '1000 Great Highway, San Francisco, CA 94122', 37.7694, -122.5064),
('STN008', 'Marina District Quick Charge', '2100 Lombard Street, San Francisco, CA 94123', 37.7989, -122.4421),
('STN009', 'Mission Bay Medical Center', '1825 4th Street, San Francisco, CA 94158', 37.7665, -122.3916),
('STN010', 'Castro Valley Shopping Center', '789 Castro Street, San Francisco, CA 94114', 37.7609, -122.4350),
('STN011', 'Pacific Heights Premium Station', '2500 Fillmore Street, San Francisco, CA 94115', 37.7956, -122.4339),
('STN012', 'Fisherman''s Wharf Charging', '2800 Leavenworth Street, San Francisco, CA 94133', 37.8081, -122.4177),
('STN013', 'SoMa Tech District Hub', '611 Folsom Street, San Francisco, CA 94107', 37.7871, -122.3971),
('STN014', 'Sunset District Community Station', '1200 Irving Street, San Francisco, CA 94122', 37.7644, -122.4692),
('STN015', 'Richmond District Express', '3801 Geary Boulevard, San Francisco, CA 94118', 37.7806, -122.4598),
('STN016', 'Caltrain Station Fast Charge', '700 4th Street, San Francisco, CA 94107', 37.7766, -122.3943),
('STN017', 'Chinatown Gateway Station', '845 Grant Avenue, San Francisco, CA 94108', 37.7938, -122.4077),
('STN018', 'Nob Hill Premium Charging', '1200 California Street, San Francisco, CA 94108', 37.7919, -122.4145);

-- Insert sample chargers with common plug types (avoid Tesla)
INSERT INTO public.chargers (charger_id, station_id, plug_type, max_power_kw, current_status, last_update_timestamp) VALUES
-- Downtown Mall Charging Hub (STN001) - Mixed setup
('CHG001A', 'STN001', 'CCS', 150, 'Available', NOW() - INTERVAL '5 minutes'),
('CHG001B', 'STN001', 'CCS', 150, 'In Use', NOW() - INTERVAL '25 minutes'),
('CHG001C', 'STN001', 'CHAdeMO', 50, 'Available', NOW() - INTERVAL '10 minutes'),
('CHG001D', 'STN001', 'Type 2', 22, 'Available', NOW() - INTERVAL '2 minutes'),

-- Tesla Supercharger - Union Square (STN002) - Use CCS instead of Tesla
('CHG002A', 'STN002', 'CCS', 250, 'Available', NOW() - INTERVAL '1 minute'),
('CHG002B', 'STN002', 'CCS', 250, 'Available', NOW() - INTERVAL '3 minutes'),
('CHG002C', 'STN002', 'CCS', 250, 'In Use', NOW() - INTERVAL '15 minutes'),
('CHG002D', 'STN002', 'CCS', 250, 'In Use', NOW() - INTERVAL '32 minutes'),

-- Whole Foods Market Chargers (STN003) - Slower charging
('CHG003A', 'STN003', 'J-1772', 7, 'Available', NOW() - INTERVAL '8 minutes'),
('CHG003B', 'STN003', 'J-1772', 7, 'Out of Service', NOW() - INTERVAL '120 minutes'),
('CHG003C', 'STN003', 'Type 2', 22, 'Available', NOW() - INTERVAL '4 minutes'),

-- IKEA Fast Charging Station (STN004) - Popular location
('CHG004A', 'STN004', 'CCS', 50, 'In Use', NOW() - INTERVAL '18 minutes'),
('CHG004B', 'STN004', 'CCS', 50, 'In Use', NOW() - INTERVAL '42 minutes'),
('CHG004C', 'STN004', 'CHAdeMO', 50, 'Available', NOW() - INTERVAL '6 minutes'),
('CHG004D', 'STN004', 'Type 2', 22, 'Available', NOW() - INTERVAL '12 minutes'),

-- More chargers with various statuses and types
('CHG005A', 'STN005', 'CCS', 350, 'Available', NOW() - INTERVAL '2 minutes'),
('CHG005B', 'STN005', 'CCS', 350, 'Available', NOW() - INTERVAL '7 minutes'),
('CHG005C', 'STN005', 'CHAdeMO', 150, 'In Use', NOW() - INTERVAL '28 minutes'),

('CHG006A', 'STN006', 'CCS', 150, 'Available', NOW() - INTERVAL '3 minutes'),
('CHG006B', 'STN006', 'CCS', 150, 'Available', NOW() - INTERVAL '1 minute'),
('CHG006C', 'STN006', 'Type 2', 22, 'Available', NOW() - INTERVAL '5 minutes'),

('CHG007A', 'STN007', 'CCS', 50, 'Available', NOW() - INTERVAL '15 minutes'),
('CHG007B', 'STN007', 'J-1772', 7, 'Available', NOW() - INTERVAL '20 minutes'),

('CHG008A', 'STN008', 'CCS', 150, 'Available', NOW() - INTERVAL '4 minutes'),
('CHG008B', 'STN008', 'CCS', 150, 'In Use', NOW() - INTERVAL '35 minutes'),
('CHG008C', 'STN008', 'Type 2', 22, 'Available', NOW() - INTERVAL '8 minutes'),

('CHG009A', 'STN009', 'CCS', 50, 'Available', NOW() - INTERVAL '12 minutes'),
('CHG009B', 'STN009', 'Type 2', 22, 'Available', NOW() - INTERVAL '6 minutes'),

('CHG010A', 'STN010', 'J-1772', 7, 'In Use', NOW() - INTERVAL '55 minutes'),
('CHG010B', 'STN010', 'J-1772', 7, 'Available', NOW() - INTERVAL '9 minutes'),
('CHG010C', 'STN010', 'CCS', 50, 'Available', NOW() - INTERVAL '14 minutes'),

('CHG011A', 'STN011', 'CCS', 250, 'Available', NOW() - INTERVAL '1 minute'),
('CHG011B', 'STN011', 'CCS', 250, 'Available', NOW() - INTERVAL '3 minutes'),

('CHG012A', 'STN012', 'CCS', 150, 'In Use', NOW() - INTERVAL '22 minutes'),
('CHG012B', 'STN012', 'CHAdeMO', 50, 'Available', NOW() - INTERVAL '11 minutes'),
('CHG012C', 'STN012', 'Type 2', 22, 'Out of Service', NOW() - INTERVAL '180 minutes'),

('CHG013A', 'STN013', 'CCS', 350, 'Available', NOW() - INTERVAL '2 minutes'),
('CHG013B', 'STN013', 'CCS', 350, 'In Use', NOW() - INTERVAL '19 minutes'),
('CHG013C', 'STN013', 'CCS', 250, 'Available', NOW() - INTERVAL '5 minutes'),

('CHG014A', 'STN014', 'J-1772', 7, 'Available', NOW() - INTERVAL '25 minutes'),
('CHG014B', 'STN014', 'Type 2', 22, 'Available', NOW() - INTERVAL '16 minutes'),

('CHG015A', 'STN015', 'CCS', 50, 'Available', NOW() - INTERVAL '7 minutes'),
('CHG015B', 'STN015', 'Type 2', 22, 'In Use', NOW() - INTERVAL '41 minutes'),

('CHG016A', 'STN016', 'CCS', 150, 'Available', NOW() - INTERVAL '4 minutes'),
('CHG016B', 'STN016', 'CCS', 150, 'Available', NOW() - INTERVAL '8 minutes'),
('CHG016C', 'STN016', 'CHAdeMO', 50, 'Available', NOW() - INTERVAL '13 minutes'),

('CHG017A', 'STN017', 'CCS', 50, 'Available', NOW() - INTERVAL '18 minutes'),
('CHG017B', 'STN017', 'J-1772', 7, 'Available', NOW() - INTERVAL '22 minutes'),

('CHG018A', 'STN018', 'CCS', 250, 'Available', NOW() - INTERVAL '1 minute'),
('CHG018B', 'STN018', 'CCS', 250, 'Available', NOW() - INTERVAL '2 minutes'),
('CHG018C', 'STN018', 'Type 2', 22, 'Available', NOW() - INTERVAL '6 minutes');