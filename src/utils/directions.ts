// Direction and navigation utilities

export interface Station {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

export const openDirections = (station: Station, userLocation?: { lat: number; lng: number }) => {
  const destination = `${station.latitude},${station.longitude}`;
  const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : "";
  
  // Detect if user is on iOS or Android
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  let url: string;
  
  if (isIOS) {
    // iOS: Try Apple Maps first, fallback to Google Maps
    url = `maps://maps.apple.com/?daddr=${destination}&dirflg=d`;
    
    // Create a fallback link to Google Maps for iOS
    const fallbackUrl = `https://maps.google.com/maps?daddr=${destination}${origin ? `&saddr=${origin}` : ""}&dirflg=d`;
    
    // Try to open Apple Maps, fallback to Google Maps
    const link = document.createElement("a");
    link.href = url;
    link.click();
    
    // If Apple Maps didn't open (no custom protocol handler), open Google Maps
    setTimeout(() => {
      if (document.visibilityState === "visible") {
        window.open(fallbackUrl, "_blank");
      }
    }, 500);
    
    return;
  } else if (isAndroid) {
    // Android: Use Google Maps with navigation intent
    url = `google.navigation:q=${destination}`;
    
    // Fallback to web Google Maps
    const fallbackUrl = `https://maps.google.com/maps?daddr=${destination}${origin ? `&saddr=${origin}` : ""}&dirflg=d`;
    
    try {
      const link = document.createElement("a");
      link.href = url;
      link.click();
      
      // Fallback after a short delay
      setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.open(fallbackUrl, "_blank");
        }
      }, 500);
    } catch {
      window.open(fallbackUrl, "_blank");
    }
    
    return;
  }
  
  // Desktop or other devices: Open Google Maps in browser
  url = `https://maps.google.com/maps?daddr=${destination}${origin ? `&saddr=${origin}` : ""}&dirflg=d`;
  window.open(url, "_blank");
};

export const getDirectionsUrl = (station: Station, userLocation?: { lat: number; lng: number }): string => {
  const destination = `${station.latitude},${station.longitude}`;
  const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : "";
  
  return `https://maps.google.com/maps?daddr=${destination}${origin ? `&saddr=${origin}` : ""}&dirflg=d`;
};

export const formatDirectionsText = (distance?: number): string => {
  if (!distance) return "Get Directions";
  
  if (distance < 1) {
    return `Directions (${Math.round(distance * 1000)}m away)`;
  }
  
  return `Directions (${distance.toFixed(1)}km away)`;
};