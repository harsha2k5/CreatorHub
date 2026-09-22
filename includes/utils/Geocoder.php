<?php
/**
 * CreatorHub - Comprehensive Geocoding & Distance Calculation Engine
 */

declare(strict_types=1);

namespace CreatorHub\Utils;

class Geocoder {
    /**
     * Database of Indian Neighborhoods and Cities with Precise Latitude/Longitude
     */
    private static array $locations = [
        // ==========================================
        // BENGALURU LOCALITIES & NEIGHBORHOODS
        // ==========================================
        'vijaynagar' => ['lat' => 12.9719, 'lng' => 77.5305, 'city' => 'Bengaluru', 'name' => 'Vijaynagar'],
        'vijayanagar' => ['lat' => 12.9719, 'lng' => 77.5305, 'city' => 'Bengaluru', 'name' => 'Vijaynagar'],
        'rpc layout' => ['lat' => 12.9648, 'lng' => 77.5327, 'city' => 'Bengaluru', 'name' => 'RPC Layout, Vijaynagar'],
        'nagarbhavi' => ['lat' => 12.9615, 'lng' => 77.5106, 'city' => 'Bengaluru', 'name' => 'Nagarbhavi'],
        'rajajinagar' => ['lat' => 12.9915, 'lng' => 77.5525, 'city' => 'Bengaluru', 'name' => 'Rajajinagar'],
        'malleshwaram' => ['lat' => 13.0031, 'lng' => 77.5643, 'city' => 'Bengaluru', 'name' => 'Malleshwaram'],
        'indiranagar' => ['lat' => 12.9784, 'lng' => 77.6408, 'city' => 'Bengaluru', 'name' => 'Indiranagar'],
        'koramangala' => ['lat' => 12.9352, 'lng' => 77.6245, 'city' => 'Bengaluru', 'name' => 'Koramangala'],
        'hsr layout' => ['lat' => 12.9121, 'lng' => 77.6446, 'city' => 'Bengaluru', 'name' => 'HSR Layout'],
        'hsr' => ['lat' => 12.9121, 'lng' => 77.6446, 'city' => 'Bengaluru', 'name' => 'HSR Layout'],
        'jayanagar' => ['lat' => 12.9308, 'lng' => 77.5838, 'city' => 'Bengaluru', 'name' => 'Jayanagar'],
        'jp nagar' => ['lat' => 12.9063, 'lng' => 77.5857, 'city' => 'Bengaluru', 'name' => 'JP Nagar'],
        'banashankari' => ['lat' => 12.9255, 'lng' => 77.5468, 'city' => 'Bengaluru', 'name' => 'Banashankari'],
        'basavanagudi' => ['lat' => 12.9432, 'lng' => 77.5742, 'city' => 'Bengaluru', 'name' => 'Basavanagudi'],
        'whitefield' => ['lat' => 12.9698, 'lng' => 77.7499, 'city' => 'Bengaluru', 'name' => 'Whitefield'],
        'itpl' => ['lat' => 12.9892, 'lng' => 77.7289, 'city' => 'Bengaluru', 'name' => 'ITPL, Whitefield'],
        'marathahalli' => ['lat' => 12.9591, 'lng' => 77.6974, 'city' => 'Bengaluru', 'name' => 'Marathahalli'],
        'bellandur' => ['lat' => 12.9279, 'lng' => 77.6718, 'city' => 'Bengaluru', 'name' => 'Bellandur'],
        'sarjapur' => ['lat' => 12.8596, 'lng' => 77.7874, 'city' => 'Bengaluru', 'name' => 'Sarjapur'],
        'sarjapur road' => ['lat' => 12.9100, 'lng' => 77.6750, 'city' => 'Bengaluru', 'name' => 'Sarjapur Road'],
        'btm layout' => ['lat' => 12.9166, 'lng' => 77.6101, 'city' => 'Bengaluru', 'name' => 'BTM Layout'],
        'btm' => ['lat' => 12.9166, 'lng' => 77.6101, 'city' => 'Bengaluru', 'name' => 'BTM Layout'],
        'electronic city' => ['lat' => 12.8452, 'lng' => 77.6602, 'city' => 'Bengaluru', 'name' => 'Electronic City'],
        'mg road' => ['lat' => 12.9756, 'lng' => 77.6066, 'city' => 'Bengaluru', 'name' => 'MG Road'],
        'brigade road' => ['lat' => 12.9730, 'lng' => 77.6075, 'city' => 'Bengaluru', 'name' => 'Brigade Road'],
        'church street' => ['lat' => 12.9749, 'lng' => 77.6045, 'city' => 'Bengaluru', 'name' => 'Church Street'],
        'commercial street' => ['lat' => 12.9822, 'lng' => 77.6083, 'city' => 'Bengaluru', 'name' => 'Commercial Street'],
        'frazer town' => ['lat' => 12.9968, 'lng' => 77.6131, 'city' => 'Bengaluru', 'name' => 'Frazer Town'],
        'pulakeshinagar' => ['lat' => 12.9968, 'lng' => 77.6131, 'city' => 'Bengaluru', 'name' => 'Pulakeshinagar'],
        'sadashivanagar' => ['lat' => 13.0068, 'lng' => 77.5813, 'city' => 'Bengaluru', 'name' => 'Sadashivanagar'],
        'vasanth nagar' => ['lat' => 12.9904, 'lng' => 77.5912, 'city' => 'Bengaluru', 'name' => 'Vasanth Nagar'],
        'hebbal' => ['lat' => 13.0358, 'lng' => 77.5970, 'city' => 'Bengaluru', 'name' => 'Hebbal'],
        'yelahanka' => ['lat' => 13.1007, 'lng' => 77.5963, 'city' => 'Bengaluru', 'name' => 'Yelahanka'],
        'kalyan nagar' => ['lat' => 13.0163, 'lng' => 77.6426, 'city' => 'Bengaluru', 'name' => 'Kalyan Nagar'],
        'kammanahalli' => ['lat' => 13.0094, 'lng' => 77.6384, 'city' => 'Bengaluru', 'name' => 'Kammanahalli'],
        'domlur' => ['lat' => 12.9609, 'lng' => 77.6387, 'city' => 'Bengaluru', 'name' => 'Domlur'],
        'old airport road' => ['lat' => 12.9602, 'lng' => 77.6484, 'city' => 'Bengaluru', 'name' => 'Old Airport Road'],
        'yeshwanthpur' => ['lat' => 13.0238, 'lng' => 77.5489, 'city' => 'Bengaluru', 'name' => 'Yeshwanthpur'],
        'peenya' => ['lat' => 13.0329, 'lng' => 77.5273, 'city' => 'Bengaluru', 'name' => 'Peenya'],
        'kengeri' => ['lat' => 12.9177, 'lng' => 77.4838, 'city' => 'Bengaluru', 'name' => 'Kengeri'],
        'bannerghatta' => ['lat' => 12.8875, 'lng' => 77.5971, 'city' => 'Bengaluru', 'name' => 'Bannerghatta Road'],
        'sanjaynagar' => ['lat' => 13.0382, 'lng' => 77.5753, 'city' => 'Bengaluru', 'name' => 'Sanjaynagar'],
        'ulsoor' => ['lat' => 12.9817, 'lng' => 77.6200, 'city' => 'Bengaluru', 'name' => 'Ulsoor'],
        'richmond town' => ['lat' => 12.9660, 'lng' => 77.6000, 'city' => 'Bengaluru', 'name' => 'Richmond Town'],
        'bengaluru' => ['lat' => 12.9716, 'lng' => 77.5946, 'city' => 'Bengaluru', 'name' => 'Central Bengaluru'],
        'bangalore' => ['lat' => 12.9716, 'lng' => 77.5946, 'city' => 'Bengaluru', 'name' => 'Central Bengaluru'],

        // ==========================================
        // MUMBAI & MMR LOCALITIES
        // ==========================================
        'bandra' => ['lat' => 19.0596, 'lng' => 72.8295, 'city' => 'Mumbai', 'name' => 'Bandra, Mumbai'],
        'andheri' => ['lat' => 19.1136, 'lng' => 72.8697, 'city' => 'Mumbai', 'name' => 'Andheri, Mumbai'],
        'juhu' => ['lat' => 19.1075, 'lng' => 72.8263, 'city' => 'Mumbai', 'name' => 'Juhu, Mumbai'],
        'powai' => ['lat' => 19.1176, 'lng' => 72.9060, 'city' => 'Mumbai', 'name' => 'Powai, Mumbai'],
        'colaba' => ['lat' => 18.9067, 'lng' => 72.8147, 'city' => 'Mumbai', 'name' => 'Colaba, Mumbai'],
        'south mumbai' => ['lat' => 18.9388, 'lng' => 72.8354, 'city' => 'Mumbai', 'name' => 'South Mumbai'],
        'thane' => ['lat' => 19.2183, 'lng' => 72.9781, 'city' => 'Mumbai', 'name' => 'Thane, Mumbai'],
        'navi mumbai' => ['lat' => 19.0330, 'lng' => 73.0297, 'city' => 'Mumbai', 'name' => 'Navi Mumbai'],
        'mumbai' => ['lat' => 19.0760, 'lng' => 72.8777, 'city' => 'Mumbai', 'name' => 'Mumbai, Maharashtra'],

        // ==========================================
        // DELHI / NCR LOCALITIES
        // ==========================================
        'connaught place' => ['lat' => 28.6315, 'lng' => 77.2167, 'city' => 'Delhi', 'name' => 'Connaught Place, Delhi'],
        'hauz khas' => ['lat' => 28.5494, 'lng' => 77.2001, 'city' => 'Delhi', 'name' => 'Hauz Khas, Delhi'],
        'gurgaon' => ['lat' => 28.4595, 'lng' => 77.0266, 'city' => 'Delhi NCR', 'name' => 'Gurugram / Gurgaon, NCR'],
        'gurugram' => ['lat' => 28.4595, 'lng' => 77.0266, 'city' => 'Delhi NCR', 'name' => 'Gurugram / Gurgaon, NCR'],
        'cyber hub' => ['lat' => 28.4952, 'lng' => 77.0886, 'city' => 'Delhi NCR', 'name' => 'DLF Cyber Hub, Gurugram'],
        'noida' => ['lat' => 28.5355, 'lng' => 77.3910, 'city' => 'Delhi NCR', 'name' => 'Noida, Uttar Pradesh'],
        'saket' => ['lat' => 28.5244, 'lng' => 77.2177, 'city' => 'Delhi', 'name' => 'Saket, South Delhi'],
        'dwarka' => ['lat' => 28.5921, 'lng' => 77.0460, 'city' => 'Delhi', 'name' => 'Dwarka, Delhi'],
        'delhi' => ['lat' => 28.6139, 'lng' => 77.2090, 'city' => 'Delhi', 'name' => 'New Delhi, India'],
        'new delhi' => ['lat' => 28.6139, 'lng' => 77.2090, 'city' => 'Delhi', 'name' => 'New Delhi, India'],

        // ==========================================
        // HYDERABAD LOCALITIES
        // ==========================================
        'banjara hills' => ['lat' => 17.4156, 'lng' => 78.4350, 'city' => 'Hyderabad', 'name' => 'Banjara Hills, Hyderabad'],
        'jubilee hills' => ['lat' => 17.4319, 'lng' => 78.4073, 'city' => 'Hyderabad', 'name' => 'Jubilee Hills, Hyderabad'],
        'hitech city' => ['lat' => 17.4474, 'lng' => 78.3762, 'city' => 'Hyderabad', 'name' => 'HITEC City, Hyderabad'],
        'madhapur' => ['lat' => 17.4483, 'lng' => 78.3915, 'city' => 'Hyderabad', 'name' => 'Madhapur, Hyderabad'],
        'gachibowli' => ['lat' => 17.4401, 'lng' => 78.3489, 'city' => 'Hyderabad', 'name' => 'Gachibowli, Hyderabad'],
        'hyderabad' => ['lat' => 17.3850, 'lng' => 78.4867, 'city' => 'Hyderabad', 'name' => 'Hyderabad, Telangana'],

        // ==========================================
        // CHENNAI LOCALITIES
        // ==========================================
        't nagar' => ['lat' => 13.0418, 'lng' => 80.2341, 'city' => 'Chennai', 'name' => 'T. Nagar, Chennai'],
        'anna nagar' => ['lat' => 13.0850, 'lng' => 80.2101, 'city' => 'Chennai', 'name' => 'Anna Nagar, Chennai'],
        'adyar' => ['lat' => 13.0012, 'lng' => 80.2565, 'city' => 'Chennai', 'name' => 'Adyar, Chennai'],
        'velachery' => ['lat' => 12.9759, 'lng' => 80.2212, 'city' => 'Chennai', 'name' => 'Velachery, Chennai'],
        'chennai' => ['lat' => 13.0827, 'lng' => 80.2707, 'city' => 'Chennai', 'name' => 'Chennai, Tamil Nadu'],

        // ==========================================
        // PUNE LOCALITIES
        // ==========================================
        'koregaon park' => ['lat' => 18.5362, 'lng' => 73.8940, 'city' => 'Pune', 'name' => 'Koregaon Park, Pune'],
        'viman nagar' => ['lat' => 18.5679, 'lng' => 73.9143, 'city' => 'Pune', 'name' => 'Viman Nagar, Pune'],
        'hinjewadi' => ['lat' => 18.5913, 'lng' => 73.7389, 'city' => 'Pune', 'name' => 'Hinjewadi IT Park, Pune'],
        'baner' => ['lat' => 18.5590, 'lng' => 73.7868, 'city' => 'Pune', 'name' => 'Baner, Pune'],
        'kothrud' => ['lat' => 18.5074, 'lng' => 73.8077, 'city' => 'Pune', 'name' => 'Kothrud, Pune'],
        'pune' => ['lat' => 18.5204, 'lng' => 73.8567, 'city' => 'Pune', 'name' => 'Pune, Maharashtra'],

        // ==========================================
        // OTHER MAJOR METROS & HUBS
        // ==========================================
        'kolkata' => ['lat' => 22.5726, 'lng' => 88.3639, 'city' => 'Kolkata', 'name' => 'Kolkata, West Bengal'],
        'park street' => ['lat' => 22.5511, 'lng' => 88.3524, 'city' => 'Kolkata', 'name' => 'Park Street, Kolkata'],
        'salt lake' => ['lat' => 22.5807, 'lng' => 88.4191, 'city' => 'Kolkata', 'name' => 'Salt Lake, Kolkata'],
        'ahmedabad' => ['lat' => 23.0225, 'lng' => 72.5714, 'city' => 'Ahmedabad', 'name' => 'Ahmedabad, Gujarat'],
        'jaipur' => ['lat' => 26.9124, 'lng' => 75.7873, 'city' => 'Jaipur', 'name' => 'Jaipur, Rajasthan'],
        'chandigarh' => ['lat' => 30.7333, 'lng' => 76.7794, 'city' => 'Chandigarh', 'name' => 'Chandigarh'],
        'kochi' => ['lat' => 9.9312, 'lng' => 76.2673, 'city' => 'Kochi', 'name' => 'Kochi, Kerala'],
        'goa' => ['lat' => 15.4909, 'lng' => 73.8278, 'city' => 'Goa', 'name' => 'Goa'],
        'panaji' => ['lat' => 15.4909, 'lng' => 73.8278, 'city' => 'Goa', 'name' => 'Panaji, Goa'],
        'lucknow' => ['lat' => 26.8467, 'lng' => 80.9462, 'city' => 'Lucknow', 'name' => 'Lucknow, Uttar Pradesh'],
        'indore' => ['lat' => 22.7196, 'lng' => 75.8577, 'city' => 'Indore', 'name' => 'Indore, Madhya Pradesh'],
        'coimbatore' => ['lat' => 11.0168, 'lng' => 76.9558, 'city' => 'Coimbatore', 'name' => 'Coimbatore, Tamil Nadu']
    ];

    /**
     * Resolve latitude & longitude from any neighborhood or city string
     */
    public static function geocode(?string $area, ?string $city = 'Bengaluru'): array {
        $areaClean = strtolower(trim((string)$area));
        $cityClean = strtolower(trim((string)$city));

        // 1. Check exact area match
        if (!empty($areaClean) && isset(self::$locations[$areaClean])) {
            return self::$locations[$areaClean];
        }

        // 2. Check partial area substring match
        if (!empty($areaClean)) {
            foreach (self::$locations as $key => $data) {
                if (str_contains($areaClean, $key) || str_contains($key, $areaClean)) {
                    return $data;
                }
            }
        }

        // 3. Check city match
        if (!empty($cityClean) && isset(self::$locations[$cityClean])) {
            return self::$locations[$cityClean];
        }

        if (!empty($cityClean)) {
            foreach (self::$locations as $key => $data) {
                if (str_contains($cityClean, $key) || str_contains($key, $cityClean)) {
                    return $data;
                }
            }
        }

        // 4. Default to Central Bengaluru if completely unknown
        return [
            'lat' => 12.9716,
            'lng' => 77.5946,
            'city' => !empty($city) ? $city : 'Bengaluru',
            'name' => !empty($area) ? "{$area}, {$city}" : 'Central Bengaluru'
        ];
    }

    /**
     * Calculate spherical distance between two coordinate pairs in kilometers (Haversine Formula)
     */
    public static function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float {
        $earthRadius = 6371.0; // kilometers
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return round($earthRadius * $c, 1);
    }
}
