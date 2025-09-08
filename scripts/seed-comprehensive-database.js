import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://iegssgjjnktnwfpojmfu.supabase.co";
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllZ3NzZ2pqbmt0bndmcG9qbWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODAyNzIsImV4cCI6MjA3MjA1NjI3Mn0.rdDUjYrvaNyXKxh6Jo_DRAYPcf-n8bAxdhqlO6C19hE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample users for testing
const sampleUsers = [
  {
    username: "ev_enthusiast_2024",
    email: "john.doe@example.com",
    profile_photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    username: "tesla_roadtripper",
    email: "sarah.wilson@example.com", 
    profile_photo_url: "https://images.unsplash.com/photo-1494790108755-2616b612b002?w=150&h=150&fit=crop&crop=face"
  },
  {
    username: "green_commuter",
    email: "mike.chen@example.com",
    profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  }
];

// Comprehensive station data with full PlugShare features
const comprehensiveStationsData = [
  {
    name: "Downtown Charging Hub",
    address: "123 Main St, San Francisco, CA 94105",
    latitude: 37.7749,
    longitude: -122.4194,
    plugscore: 9,
    station_count: 8,
    station_type: "public",
    amenities: ["Dining", "Restrooms", "Shopping", "WiFi", "Valet Parking"],
    parking_attributes: ["Covered", "Illuminated", "Accessible"],
    network_name: "ChargePoint",
    chargers: [
      { plug_type: "CCS", max_power_kw: 150, current_status: "Available", pricing_per_kwh: 0.29 },
      { plug_type: "CCS", max_power_kw: 150, current_status: "In Use", pricing_per_kwh: 0.29 },
      { plug_type: "CHAdeMO", max_power_kw: 50, current_status: "Available", pricing_per_kwh: 0.25 },
      { plug_type: "J-1772", max_power_kw: 7.2, current_status: "Available", pricing_per_kwh: 0.15 }
    ]
  },
  {
    name: "Tesla Supercharger - Fremont",
    address: "39001 Cherry St, Fremont, CA 94538", 
    latitude: 37.5485,
    longitude: -121.9886,
    plugscore: 10,
    station_count: 16,
    station_type: "public",
    amenities: ["Restrooms", "Shopping", "Dining"],
    parking_attributes: ["Pull through", "Illuminated"],
    network_name: "Tesla Supercharger",
    chargers: [
      { plug_type: "Tesla Supercharger", max_power_kw: 250, current_status: "Available", pricing_per_kwh: 0.28 },
      { plug_type: "Tesla Supercharger", max_power_kw: 250, current_status: "Available", pricing_per_kwh: 0.28 },
      { plug_type: "Tesla Supercharger", max_power_kw: 250, current_status: "In Use", pricing_per_kwh: 0.28 },
      { plug_type: "Tesla Supercharger", max_power_kw: 250, current_status: "Available", pricing_per_kwh: 0.28 }
    ]
  },
  {
    name: "Electrify America - Walmart",
    address: "2675 Geary Blvd, San Francisco, CA 94118",
    latitude: 37.7814,
    longitude: -122.4527,
    plugscore: 8,
    station_count: 6,
    station_type: "public", 
    amenities: ["Restrooms", "Shopping", "Grocery"],
    parking_attributes: ["Pull in", "Accessible"],
    network_name: "Electrify America",
    chargers: [
      { plug_type: "CCS", max_power_kw: 350, current_status: "Available", pricing_per_kwh: 0.31 },
      { plug_type: "CCS", max_power_kw: 150, current_status: "Available", pricing_per_kwh: 0.31 },
      { plug_type: "CHAdeMO", max_power_kw: 50, current_status: "Out of Service", pricing_per_kwh: 0.31 }
    ]
  },
  {
    name: "EVgo Fast Charging",
    address: "1 Zoo Rd, San Francisco, CA 94132",
    latitude: 37.7338,
    longitude: -122.5011,
    plugscore: 7,
    station_count: 4,
    station_type: "public",
    amenities: ["Park", "Restrooms"],
    parking_attributes: ["Pull in", "Illuminated"],
    network_name: "EVgo",
    chargers: [
      { plug_type: "CCS", max_power_kw: 100, current_status: "Available", pricing_per_kwh: 0.32 },
      { plug_type: "CHAdeMO", max_power_kw: 50, current_status: "Available", pricing_per_kwh: 0.32 }
    ]
  },
  {
    name: "Private Residential Charger",
    address: "456 Oak Street, Berkeley, CA 94704",
    latitude: 37.8715,
    longitude: -122.2730,
    plugscore: 6,
    station_count: 1,
    station_type: "residential",
    is_restricted_access: true,
    amenities: [],
    parking_attributes: ["Pull in", "Covered"],
    chargers: [
      { plug_type: "J-1772", max_power_kw: 7.2, current_status: "Available", pricing_per_kwh: 0.12 }
    ]
  },
  {
    name: "BMW Dealership Charging",
    address: "1675 Howard St, San Francisco, CA 94103", 
    latitude: 37.7707,
    longitude: -122.4120,
    plugscore: 5,
    station_count: 3,
    station_type: "dealership",
    is_dealership: true,
    is_restricted_access: true,
    amenities: ["Restrooms", "WiFi"],
    parking_attributes: ["Garage", "Valet Parking"],
    network_name: "BMW ChargeNow",
    chargers: [
      { plug_type: "CCS", max_power_kw: 50, current_status: "Available", pricing_per_kwh: 0.25 },
      { plug_type: "J-1772", max_power_kw: 7.2, current_status: "Available", pricing_per_kwh: 0.20 }
    ]
  }
];

// Sample reviews data
const sampleReviews = [
  {
    title: "Excellent charging experience!",
    review_text: "Fast charging speeds and very clean facilities. The location is perfect for grabbing coffee while charging.",
    rating: 5,
    cleanliness_rating: 5,
    accessibility_rating: 5,
    reliability_rating: 5
  },
  {
    title: "Good but crowded on weekends",
    review_text: "Usually reliable but can get busy. Suggest adding more chargers.",
    rating: 4,
    cleanliness_rating: 4,
    accessibility_rating: 4,
    reliability_rating: 4
  },
  {
    title: "Had issues with connectivity",
    review_text: "Charger worked but had trouble with the mobile app connectivity. Physical card reader worked fine though.",
    rating: 3,
    cleanliness_rating: 4,
    accessibility_rating: 4,
    reliability_rating: 2
  }
];

// Sample check-ins data
const sampleCheckIns = [
  {
    comment: "Charging at max speed, all good!",
    rating: 5,
    charging_duration_minutes: 45,
    energy_added_kwh: 32.5,
    reported_status: "Available"
  },
  {
    comment: "One charger was down but others working well",
    rating: 4,
    charging_duration_minutes: 60,
    energy_added_kwh: 28.3,
    reported_status: "Available"
  },
  {
    comment: "Quick top-up during shopping trip",
    rating: 5,
    charging_duration_minutes: 30,
    energy_added_kwh: 15.7,
    reported_status: "Available"
  }
];

async function seedComprehensiveDatabase() {
  console.log('🚀 Starting comprehensive database seeding...');

  try {
    // 1. Insert sample users
    console.log('📝 Creating sample users...');
    const insertedUsers = [];
    
    for (const userData of sampleUsers) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (userError) {
        console.error(`Error inserting user ${userData.username}:`, userError);
        continue;
      }
      insertedUsers.push(user);
      console.log(`✅ Created user: ${user.username}`);
    }

    // 2. Insert comprehensive stations with all features
    console.log('\n🏢 Creating comprehensive charging stations...');
    const insertedStations = [];
    
    for (const stationData of comprehensiveStationsData) {
      const { chargers, ...stationDetails } = stationData;
      
      const { data: station, error: stationError } = await supabase
        .from('stations')
        .insert(stationDetails)
        .select()
        .single();

      if (stationError) {
        console.error(`Error inserting station ${stationDetails.name}:`, stationError);
        continue;
      }
      
      insertedStations.push(station);
      console.log(`✅ Created station: ${station.name} (PlugScore: ${station.plugscore})`);

      // Insert chargers for each station
      for (const chargerData of chargers) {
        const { error: chargerError } = await supabase
          .from('chargers')
          .insert({ 
            station_id: station.station_id,
            ...chargerData
          });

        if (chargerError) {
          console.error(`Error inserting charger for ${station.name}:`, chargerError);
        } else {
          console.log(`  ⚡ Added ${chargerData.plug_type} charger (${chargerData.max_power_kw}kW)`);
        }
      }
    }

    // 3. Insert sample reviews
    console.log('\n⭐ Adding sample reviews...');
    let reviewIndex = 0;
    
    for (const station of insertedStations.slice(0, 3)) { // Add reviews for first 3 stations
      const user = insertedUsers[reviewIndex % insertedUsers.length];
      const review = sampleReviews[reviewIndex % sampleReviews.length];
      
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          user_id: user.user_id,
          station_id: station.station_id,
          ...review
        });

      if (reviewError) {
        console.error(`Error inserting review for ${station.name}:`, reviewError);
      } else {
        console.log(`✅ Added review for ${station.name} (${review.rating} stars)`);
      }
      reviewIndex++;
    }

    // 4. Insert sample check-ins
    console.log('\n📱 Adding sample check-ins...');
    let checkinIndex = 0;
    
    for (const station of insertedStations.slice(0, 4)) { // Add check-ins for first 4 stations
      const user = insertedUsers[checkinIndex % insertedUsers.length];
      const checkin = sampleCheckIns[checkinIndex % sampleCheckIns.length];
      
      const { error: checkinError } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.user_id,
          station_id: station.station_id,
          ...checkin
        });

      if (checkinError) {
        console.error(`Error inserting check-in for ${station.name}:`, checkinError);
      } else {
        console.log(`✅ Added check-in for ${station.name} (${checkin.energy_added_kwh} kWh)`);
      }
      checkinIndex++;
    }

    // 5. Create a sample trip plan
    console.log('\n🗺️ Creating sample trip plan...');
    const tripUser = insertedUsers[0];
    const tripStations = insertedStations.slice(0, 3).map(s => s.station_id);
    
    const { error: tripError } = await supabase
      .from('trip_plans')
      .insert({
        user_id: tripUser.user_id,
        name: "SF to LA Road Trip",
        start_location_name: "San Francisco, CA",
        end_location_name: "Los Angeles, CA", 
        total_distance_km: 615.5,
        estimated_duration_hours: 6.5,
        planned_stations: tripStations,
        is_public: true
      });

    if (tripError) {
      console.error('Error inserting trip plan:', tripError);
    } else {
      console.log('✅ Created sample trip plan: SF to LA Road Trip');
    }

    console.log('\n🎉 Comprehensive database seeding completed successfully!');
    console.log(`📊 Created:`);
    console.log(`   👥 ${insertedUsers.length} users`);
    console.log(`   🏢 ${insertedStations.length} stations`);
    console.log(`   ⚡ ${comprehensiveStationsData.reduce((sum, s) => sum + s.chargers.length, 0)} chargers`);
    console.log(`   ⭐ ${Math.min(3, insertedStations.length)} reviews`);
    console.log(`   📱 ${Math.min(4, insertedStations.length)} check-ins`);
    console.log(`   🗺️ 1 trip plan`);

  } catch (error) {
    console.error('💥 Error during seeding:', error);
    throw error;
  }
}

// Run the seeding function
seedComprehensiveDatabase().catch(console.error);

