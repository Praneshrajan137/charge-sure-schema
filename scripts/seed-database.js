import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleStations = [
  {
    station_id: 'CS001',
    name: 'Downtown Charging Hub',
    address: '123 Main Street, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    chargers: [
      { charger_id: 'CS001-01', plug_type: 'CCS', max_power_kw: 150, current_status: 'Available' },
      { charger_id: 'CS001-02', plug_type: 'CHAdeMO', max_power_kw: 50, current_status: 'In Use' },
      { charger_id: 'CS001-03', plug_type: 'Tesla', max_power_kw: 250, current_status: 'Available' }
    ]
  },
  {
    station_id: 'CS002',
    name: 'Shopping Center Fast Charge',
    address: '456 Market Square, San Francisco, CA',
    latitude: 37.7849,
    longitude: -122.4094,
    chargers: [
      { charger_id: 'CS002-01', plug_type: 'CCS', max_power_kw: 75, current_status: 'Available' },
      { charger_id: 'CS002-02', plug_type: 'CCS', max_power_kw: 75, current_status: 'Out of Service' }
    ]
  },
  {
    station_id: 'CS003',
    name: 'Airport Express Charging',
    address: '789 Airport Blvd, San Francisco, CA',
    latitude: 37.7649,
    longitude: -122.3994,
    chargers: [
      { charger_id: 'CS003-01', plug_type: 'Tesla', max_power_kw: 150, current_status: 'Available' },
      { charger_id: 'CS003-02', plug_type: 'CCS', max_power_kw: 150, current_status: 'Available' },
      { charger_id: 'CS003-03', plug_type: 'CHAdeMO', max_power_kw: 50, current_status: 'In Use' },
      { charger_id: 'CS003-04', plug_type: 'Type 2', max_power_kw: 22, current_status: 'Available' }
    ]
  },
  {
    station_id: 'CS004',
    name: 'Highway Rest Stop',
    address: '321 Highway 101, San Francisco, CA',
    latitude: 37.7949,
    longitude: -122.4294,
    chargers: [
      { charger_id: 'CS004-01', plug_type: 'CCS', max_power_kw: 200, current_status: 'Available' },
      { charger_id: 'CS004-02', plug_type: 'Tesla', max_power_kw: 250, current_status: 'In Use' }
    ]
  },
  {
    station_id: 'CS005',
    name: 'University Campus Charging',
    address: '654 College Ave, San Francisco, CA',
    latitude: 37.7549,
    longitude: -122.4394,
    chargers: [
      { charger_id: 'CS005-01', plug_type: 'Type 2', max_power_kw: 11, current_status: 'Available' },
      { charger_id: 'CS005-02', plug_type: 'Type 2', max_power_kw: 11, current_status: 'Available' },
      { charger_id: 'CS005-03', plug_type: 'CCS', max_power_kw: 50, current_status: 'Out of Service' }
    ]
  },
  {
    station_id: 'CS006',
    name: 'Marina Bay Charging Point',
    address: '987 Bay Street, San Francisco, CA',
    latitude: 37.8049,
    longitude: -122.4094,
    chargers: [
      { charger_id: 'CS006-01', plug_type: 'Tesla', max_power_kw: 120, current_status: 'Available' },
      { charger_id: 'CS006-02', plug_type: 'CCS', max_power_kw: 100, current_status: 'Available' }
    ]
  },
  {
    station_id: 'CS007',
    name: 'Business District Fast Hub',
    address: '111 Financial Blvd, San Francisco, CA',
    latitude: 37.7949,
    longitude: -122.3894,
    chargers: [
      { charger_id: 'CS007-01', plug_type: 'CCS', max_power_kw: 175, current_status: 'In Use' },
      { charger_id: 'CS007-02', plug_type: 'CHAdeMO', max_power_kw: 50, current_status: 'Available' },
      { charger_id: 'CS007-03', plug_type: 'Tesla', max_power_kw: 200, current_status: 'Available' }
    ]
  },
  {
    station_id: 'CS008',
    name: 'Residential Area Charger',
    address: '222 Oak Street, San Francisco, CA',
    latitude: 37.7449,
    longitude: -122.4494,
    chargers: [
      { charger_id: 'CS008-01', plug_type: 'Type 2', max_power_kw: 7, current_status: 'Available' },
      { charger_id: 'CS008-02', plug_type: 'CCS', max_power_kw: 50, current_status: 'Available' }
    ]
  },
  {
    station_id: 'CS009',
    name: 'Hotel Destination Charging',
    address: '555 Luxury Lane, San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.3794,
    chargers: [
      { charger_id: 'CS009-01', plug_type: 'Tesla', max_power_kw: 11, current_status: 'In Use' },
      { charger_id: 'CS009-02', plug_type: 'Type 2', max_power_kw: 22, current_status: 'Available' },
      { charger_id: 'CS009-03', plug_type: 'Type 2', max_power_kw: 22, current_status: 'Available' }
    ]
  },
  {
    station_id: 'CS010',
    name: 'Supermarket Charging',
    address: '777 Grocery Way, San Francisco, CA',
    latitude: 37.8149,
    longitude: -122.4194,
    chargers: [
      { charger_id: 'CS010-01', plug_type: 'CCS', max_power_kw: 50, current_status: 'Available' },
      { charger_id: 'CS010-02', plug_type: 'CHAdeMO', max_power_kw: 50, current_status: 'Out of Service' }
    ]
  },
  {
    station_id: 'CS011',
    name: 'Park and Ride EV Station',
    address: '888 Transit Hub, San Francisco, CA',
    latitude: 37.7349,
    longitude: -122.4594,
    chargers: [
      { charger_id: 'CS011-01', plug_type: 'CCS', max_power_kw: 100, current_status: 'Available' },
      { charger_id: 'CS011-02', plug_type: 'Tesla', max_power_kw: 150, current_status: 'Available' },
      { charger_id: 'CS011-03', plug_type: 'Type 2', max_power_kw: 11, current_status: 'In Use' }
    ]
  },
  {
    station_id: 'CS012',
    name: 'Tech Campus Ultra-Fast',
    address: '999 Innovation Drive, San Francisco, CA',
    latitude: 37.7649,
    longitude: -122.3694,
    chargers: [
      { charger_id: 'CS012-01', plug_type: 'CCS', max_power_kw: 350, current_status: 'Available' },
      { charger_id: 'CS012-02', plug_type: 'Tesla', max_power_kw: 250, current_status: 'In Use' },
      { charger_id: 'CS012-03', plug_type: 'CHAdeMO', max_power_kw: 100, current_status: 'Available' }
    ]
  }
];

async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing chargers...');
    const { error: chargersDeleteError } = await supabase
      .from('chargers')
      .delete()
      .neq('charger_id', '');

    if (chargersDeleteError) {
      console.error('Error clearing chargers:', chargersDeleteError);
      return;
    }

    console.log('Clearing existing stations...');
    const { error: stationsDeleteError } = await supabase
      .from('stations')
      .delete()
      .neq('station_id', '');

    if (stationsDeleteError) {
      console.error('Error clearing stations:', stationsDeleteError);
      return;
    }

    // Insert stations
    console.log('Inserting stations...');
    for (const station of sampleStations) {
      const { chargers, ...stationData } = station;
      
      const { error: stationError } = await supabase
        .from('stations')
        .insert([stationData]);

      if (stationError) {
        console.error('Error inserting station:', stationError);
        continue;
      }

      // Insert chargers for this station
      const chargersWithTimestamp = chargers.map(charger => ({
        ...charger,
        station_id: station.station_id,
        last_update_timestamp: new Date().toISOString()
      }));

      const { error: chargersError } = await supabase
        .from('chargers')
        .insert(chargersWithTimestamp);

      if (chargersError) {
        console.error('Error inserting chargers for station:', station.station_id, chargersError);
      } else {
        console.log(`✓ Inserted station ${station.station_id} with ${chargers.length} chargers`);
      }
    }

    console.log('Database seeding completed successfully!');
    console.log(`Total stations: ${sampleStations.length}`);
    console.log(`Total chargers: ${sampleStations.reduce((total, station) => total + station.chargers.length, 0)}`);

  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

seedDatabase();
