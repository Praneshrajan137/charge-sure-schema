// Charging time estimation utilities

export interface ChargingEstimate {
  fastChargeTime: string;
  standardChargeTime: string;
  recommendedPower: number;
}

// Common EV battery sizes (kWh)
const TYPICAL_BATTERY_SIZES = {
  small: 40,    // Compact EVs (Nissan Leaf, etc.)
  medium: 60,   // Mid-size EVs (Tesla Model 3, etc.)
  large: 85,    // Large EVs (Tesla Model S, etc.)
};

// Charging efficiency (actual power vs rated power)
const CHARGING_EFFICIENCY = 0.85;

export const estimateChargingTime = (powerKw: number): ChargingEstimate => {
  const effectivePower = powerKw * CHARGING_EFFICIENCY;
  
  // Calculate time to charge from 20% to 80% (typical charging session)
  const chargeAmount = 0.6; // 60% of battery
  
  const smallCarTime = (TYPICAL_BATTERY_SIZES.small * chargeAmount) / effectivePower;
  const mediumCarTime = (TYPICAL_BATTERY_SIZES.medium * chargeAmount) / effectivePower;
  const largeCarTime = (TYPICAL_BATTERY_SIZES.large * chargeAmount) / effectivePower;

  // Format time as hours and minutes
  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    } else if (hours < 2) {
      const mins = Math.round((hours % 1) * 60);
      return mins > 0 ? `1h ${mins}min` : "1h";
    } else {
      const wholeHours = Math.floor(hours);
      const mins = Math.round((hours % 1) * 60);
      return mins > 0 ? `${wholeHours}h ${mins}min` : `${wholeHours}h`;
    }
  };

  return {
    fastChargeTime: formatTime(smallCarTime),
    standardChargeTime: formatTime(mediumCarTime),
    recommendedPower: powerKw >= 50 ? powerKw : 50, // Recommend at least 50kW for fast charging
  };
};

export const getChargingSpeedCategory = (powerKw: number): string => {
  if (powerKw >= 150) return "Ultra Fast";
  if (powerKw >= 50) return "Fast";
  if (powerKw >= 20) return "Moderate";
  return "Slow";
};

export const getOptimalChargerForTrip = (chargers: any[], urgency: "low" | "medium" | "high" = "medium") => {
  const availableChargers = chargers.filter(c => c.current_status === "Available");
  
  if (availableChargers.length === 0) return null;
  
  switch (urgency) {
    case "high":
      // Find fastest available charger
      return availableChargers.reduce((best, current) => 
        current.max_power_kw > best.max_power_kw ? current : best
      );
    
    case "low":
      // Find slowest available charger (cheaper, less wear on battery)
      return availableChargers.reduce((best, current) => 
        current.max_power_kw < best.max_power_kw ? current : best
      );
    
    default:
      // Find moderate speed charger (good balance)
      const moderateChargers = availableChargers.filter(c => c.max_power_kw >= 50 && c.max_power_kw <= 150);
      return moderateChargers.length > 0 ? moderateChargers[0] : availableChargers[0];
  }
};