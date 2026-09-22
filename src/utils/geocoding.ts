export interface LocationPoint {
  name: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
}

export const POPULAR_NEIGHBORHOODS: Record<string, LocationPoint> = {
  // Bengaluru
  vijaynagar: { name: 'Vijaynagar', area: 'Vijaynagar', city: 'Bengaluru', lat: 12.9719, lng: 77.5305 },
  vijayanagar: { name: 'Vijaynagar', area: 'Vijaynagar', city: 'Bengaluru', lat: 12.9719, lng: 77.5305 },
  rpclayout: { name: 'RPC Layout, Vijaynagar', area: 'Vijaynagar', city: 'Bengaluru', lat: 12.9648, lng: 77.5327 },
  nagarbhavi: { name: 'Nagarbhavi', area: 'Nagarbhavi', city: 'Bengaluru', lat: 12.9615, lng: 77.5106 },
  rajajinagar: { name: 'Rajajinagar', area: 'Rajajinagar', city: 'Bengaluru', lat: 12.9915, lng: 77.5525 },
  malleshwaram: { name: 'Malleshwaram', area: 'Malleshwaram', city: 'Bengaluru', lat: 13.0031, lng: 77.5643 },
  indiranagar: { name: 'Indiranagar', area: 'Indiranagar', city: 'Bengaluru', lat: 12.9784, lng: 77.6408 },
  koramangala: { name: 'Koramangala', area: 'Koramangala', city: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
  hsrlayout: { name: 'HSR Layout', area: 'HSR Layout', city: 'Bengaluru', lat: 12.9121, lng: 77.6446 },
  hsr: { name: 'HSR Layout', area: 'HSR Layout', city: 'Bengaluru', lat: 12.9121, lng: 77.6446 },
  jayanagar: { name: 'Jayanagar', area: 'Jayanagar', city: 'Bengaluru', lat: 12.9308, lng: 77.5838 },
  jpnagar: { name: 'JP Nagar', area: 'JP Nagar', city: 'Bengaluru', lat: 12.9063, lng: 77.5857 },
  banashankari: { name: 'Banashankari', area: 'Banashankari', city: 'Bengaluru', lat: 12.9255, lng: 77.5468 },
  basavanagudi: { name: 'Basavanagudi', area: 'Basavanagudi', city: 'Bengaluru', lat: 12.9432, lng: 77.5742 },
  whitefield: { name: 'Whitefield', area: 'Whitefield', city: 'Bengaluru', lat: 12.9698, lng: 77.7499 },
  itpl: { name: 'ITPL, Whitefield', area: 'Whitefield', city: 'Bengaluru', lat: 12.9892, lng: 77.7289 },
  marathahalli: { name: 'Marathahalli', area: 'Marathahalli', city: 'Bengaluru', lat: 12.9591, lng: 77.6974 },
  bellandur: { name: 'Bellandur', area: 'Bellandur', city: 'Bengaluru', lat: 12.9279, lng: 77.6718 },
  sarjapur: { name: 'Sarjapur Road', area: 'Sarjapur Road', city: 'Bengaluru', lat: 12.9100, lng: 77.6750 },
  btmlayout: { name: 'BTM Layout', area: 'BTM Layout', city: 'Bengaluru', lat: 12.9166, lng: 77.6101 },
  btm: { name: 'BTM Layout', area: 'BTM Layout', city: 'Bengaluru', lat: 12.9166, lng: 77.6101 },
  electroniccity: { name: 'Electronic City', area: 'Electronic City', city: 'Bengaluru', lat: 12.8452, lng: 77.6602 },
  mgroad: { name: 'MG Road', area: 'MG Road', city: 'Bengaluru', lat: 12.9756, lng: 77.6066 },
  brigaderoad: { name: 'Brigade Road', area: 'Brigade Road', city: 'Bengaluru', lat: 12.9730, lng: 77.6075 },
  churchstreet: { name: 'Church Street', area: 'Church Street', city: 'Bengaluru', lat: 12.9749, lng: 77.6045 },
  frazertown: { name: 'Frazer Town', area: 'Frazer Town', city: 'Bengaluru', lat: 12.9968, lng: 77.6131 },
  sadashivanagar: { name: 'Sadashivanagar', area: 'Sadashivanagar', city: 'Bengaluru', lat: 13.0068, lng: 77.5813 },
  hebbal: { name: 'Hebbal', area: 'Hebbal', city: 'Bengaluru', lat: 13.0358, lng: 77.5970 },
  yelahanka: { name: 'Yelahanka', area: 'Yelahanka', city: 'Bengaluru', lat: 13.1007, lng: 77.5963 },
  kalyannagar: { name: 'Kalyan Nagar', area: 'Kalyan Nagar', city: 'Bengaluru', lat: 13.0163, lng: 77.6426 },
  bengaluru: { name: 'Central Bengaluru', area: 'Central Bengaluru', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },

  // Mumbai & MMR
  bandra: { name: 'Bandra, Mumbai', area: 'Bandra', city: 'Mumbai', lat: 19.0596, lng: 72.8295 },
  andheri: { name: 'Andheri, Mumbai', area: 'Andheri', city: 'Mumbai', lat: 19.1136, lng: 72.8697 },
  juhu: { name: 'Juhu, Mumbai', area: 'Juhu', city: 'Mumbai', lat: 19.1075, lng: 72.8263 },
  powai: { name: 'Powai, Mumbai', area: 'Powai', city: 'Mumbai', lat: 19.1176, lng: 72.9060 },
  southmumbai: { name: 'South Mumbai', area: 'Colaba', city: 'Mumbai', lat: 18.9388, lng: 72.8354 },
  mumbai: { name: 'Mumbai, Maharashtra', area: 'Mumbai', city: 'Mumbai', lat: 19.0760, lng: 72.8777 },

  // Delhi NCR
  connaughtplace: { name: 'Connaught Place, Delhi', area: 'Connaught Place', city: 'Delhi', lat: 28.6315, lng: 77.2167 },
  hauzkhas: { name: 'Hauz Khas, Delhi', area: 'Hauz Khas', city: 'Delhi', lat: 28.5494, lng: 77.2001 },
  gurgaon: { name: 'Gurugram / Cyber Hub', area: 'Cyber Hub', city: 'Delhi NCR', lat: 28.4595, lng: 77.0266 },
  gurugram: { name: 'Gurugram / Cyber Hub', area: 'Cyber Hub', city: 'Delhi NCR', lat: 28.4595, lng: 77.0266 },
  noida: { name: 'Noida', area: 'Sector 18', city: 'Delhi NCR', lat: 28.5355, lng: 77.3910 },
  delhi: { name: 'New Delhi, India', area: 'New Delhi', city: 'Delhi', lat: 28.6139, lng: 77.2090 },

  // Hyderabad
  banjarahills: { name: 'Banjara Hills, Hyderabad', area: 'Banjara Hills', city: 'Hyderabad', lat: 17.4156, lng: 78.4350 },
  jubileehills: { name: 'Jubilee Hills, Hyderabad', area: 'Jubilee Hills', city: 'Hyderabad', lat: 17.4319, lng: 78.4073 },
  hitechcity: { name: 'HITEC City, Hyderabad', area: 'HITEC City', city: 'Hyderabad', lat: 17.4474, lng: 78.3762 },
  hyderabad: { name: 'Hyderabad, Telangana', area: 'Hyderabad', city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },

  // Chennai
  tnagar: { name: 'T. Nagar, Chennai', area: 'T. Nagar', city: 'Chennai', lat: 13.0418, lng: 80.2341 },
  annanagar: { name: 'Anna Nagar, Chennai', area: 'Anna Nagar', city: 'Chennai', lat: 13.0850, lng: 80.2101 },
  chennai: { name: 'Chennai, Tamil Nadu', area: 'Chennai', city: 'Chennai', lat: 13.0827, lng: 80.2707 },

  // Pune
  koregaonpark: { name: 'Koregaon Park, Pune', area: 'Koregaon Park', city: 'Pune', lat: 18.5362, lng: 73.8940 },
  hinjewadi: { name: 'Hinjewadi, Pune', area: 'Hinjewadi', city: 'Pune', lat: 18.5913, lng: 73.7389 },
  pune: { name: 'Pune, Maharashtra', area: 'Pune', city: 'Pune', lat: 18.5204, lng: 73.8567 },

  // Other Metros
  kolkata: { name: 'Kolkata, West Bengal', area: 'Park Street', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
  ahmedabad: { name: 'Ahmedabad, Gujarat', area: 'SG Highway', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  jaipur: { name: 'Jaipur, Rajasthan', area: 'C Scheme', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
  chandigarh: { name: 'Chandigarh', area: 'Sector 17', city: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  kochi: { name: 'Kochi, Kerala', area: 'Panampilly Nagar', city: 'Kochi', lat: 9.9312, lng: 76.2673 },
  goa: { name: 'Goa', area: 'Panaji', city: 'Goa', lat: 15.4909, lng: 73.8278 }
};

export function geocodeClientLocation(query: string): LocationPoint | null {
  if (!query) return null;
  const clean = query.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (POPULAR_NEIGHBORHOODS[clean]) {
    return POPULAR_NEIGHBORHOODS[clean];
  }

  for (const key of Object.keys(POPULAR_NEIGHBORHOODS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return POPULAR_NEIGHBORHOODS[key];
    }
  }

  return null;
}

export function calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthRadius = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c * 10) / 10;
}
