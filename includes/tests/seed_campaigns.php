<?php
/**
 * Seed Verified Brand Profiles and Realistic Indian Brand Campaigns
 */

require_once dirname(__DIR__, 2) . '/config/config.php';
require_once dirname(__DIR__, 2) . '/config/database.php';

// 1. Seed / Update Verified Brand Profiles
$brands = [
    [
        'id' => 'brd_lakme',
        'user_id' => 'usr_brand_lakme',
        'company_name' => 'Lakmé',
        'business_email' => 'partnerships@lakmeindia.com',
        'category' => 'Beauty & Skincare',
        'logo_url' => 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop',
        'location_name' => 'Indiranagar 100ft Road',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_thirdwave',
        'user_id' => 'usr_brand_thirdwave',
        'company_name' => 'Third Wave Coffee',
        'business_email' => 'creator@thirdwavecoffee.in',
        'category' => 'Food & Beverage',
        'logo_url' => 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&h=200&fit=crop',
        'location_name' => 'Indiranagar 12th Main',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_boat',
        'user_id' => 'usr_brand_boat',
        'company_name' => 'boAt',
        'business_email' => 'creators@boat-lifestyle.com',
        'category' => 'Technology',
        'logo_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
        'location_name' => 'Koramangala 80ft Road',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_myntra',
        'user_id' => 'usr_brand_myntra',
        'company_name' => 'Myntra',
        'business_email' => 'influencers@myntra.com',
        'category' => 'Fashion',
        'logo_url' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200&h=200&fit=crop',
        'location_name' => 'MG Road',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_nykaa',
        'user_id' => 'usr_brand_nykaa',
        'company_name' => 'Nykaa',
        'business_email' => 'beauty@nykaa.com',
        'category' => 'Beauty & Skincare',
        'logo_url' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop',
        'location_name' => 'Lavelle Road',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_lenskart',
        'user_id' => 'usr_brand_lenskart',
        'company_name' => 'Lenskart',
        'business_email' => 'creators@lenskart.com',
        'category' => 'Fashion',
        'logo_url' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop',
        'location_name' => 'Church Street',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_cultfit',
        'user_id' => 'usr_brand_cultfit',
        'company_name' => 'Cult.fit',
        'business_email' => 'partners@cult.fit',
        'category' => 'Fitness & Wellness',
        'logo_url' => 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=200&fit=crop',
        'location_name' => 'HSR Layout Sector 3',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_souledstore',
        'user_id' => 'usr_brand_souledstore',
        'company_name' => 'The Souled Store',
        'business_email' => 'collabs@thesouledstore.com',
        'category' => 'Fashion',
        'logo_url' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=200&h=200&fit=crop',
        'location_name' => 'Koramangala 5th Block',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_bluetokai',
        'user_id' => 'usr_brand_bluetokai',
        'company_name' => 'Blue Tokai Coffee Roasters',
        'business_email' => 'roasters@bluetokaicoffee.com',
        'category' => 'Food & Beverage',
        'logo_url' => 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200&h=200&fit=crop',
        'location_name' => 'Koramangala 4th Block',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_decathlon',
        'user_id' => 'usr_brand_decathlon',
        'company_name' => 'Decathlon',
        'business_email' => 'sports@decathlon.in',
        'category' => 'Fitness & Wellness',
        'logo_url' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&h=200&fit=crop',
        'location_name' => 'Whitefield Main Road',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_zomato',
        'user_id' => 'usr_brand_zomato',
        'company_name' => 'Zomato',
        'business_email' => 'creators@zomato.com',
        'category' => 'Food & Beverage',
        'logo_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
        'location_name' => 'Indiranagar 100ft Road',
        'city' => 'Bengaluru',
        'verified' => 1
    ],
    [
        'id' => 'brd_mamaearth',
        'user_id' => 'usr_brand_mamaearth',
        'company_name' => 'Mamaearth',
        'business_email' => 'influencer@mamaearth.in',
        'category' => 'Beauty & Skincare',
        'logo_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop',
        'location_name' => 'Jayanagar 4th Block',
        'city' => 'Bengaluru',
        'verified' => 1
    ]
];

foreach ($brands as $b) {
    // Ensure corresponding user exists in users table
    $userExists = Database::queryOne('SELECT id FROM users WHERE id = ?', [$b['user_id']]);
    if (!$userExists) {
        Database::execute(
            'INSERT INTO users (id, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)',
            [$b['user_id'], $b['business_email'], password_hash('password123', PASSWORD_BCRYPT), 'brand']
        );
    }

    $existing = Database::queryOne('SELECT id FROM brand_profiles WHERE id = ?', [$b['id']]);
    if ($existing) {
        Database::execute(
            'UPDATE brand_profiles SET company_name = ?, category = ?, logo_url = ?, location_name = ?, city = ?, verified = ? WHERE id = ?',
            [$b['company_name'], $b['category'], $b['logo_url'], $b['location_name'], $b['city'], $b['verified'], $b['id']]
        );
    } else {
        Database::execute(
            'INSERT INTO brand_profiles (id, user_id, company_name, business_email, category, logo_url, location_name, city, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$b['id'], $b['user_id'], $b['company_name'], $b['business_email'], $b['category'], $b['logo_url'], $b['location_name'], $b['city'], $b['verified']]
        );
    }
}

// 2. Clear old duplicate/placeholder campaigns
Database::execute("DELETE FROM campaigns WHERE id NOT IN ('cmp_lakme', 'cmp_thirdwave', 'cmp_boat', 'cmp_myntra', 'cmp_nykaa', 'cmp_lenskart', 'cmp_cultfit', 'cmp_souledstore', 'cmp_bluetokai', 'cmp_decathlon', 'cmp_zomato', 'cmp_mamaearth')");

// 3. Seed Clean, Realistic, Non-Duplicate Indian Brand Campaigns
$campaigns = [
    [
        'id' => 'cmp_lakme',
        'brand_id' => 'brd_lakme',
        'title' => 'Iconic Kajal — Beauty Creator Campaign',
        'description' => 'Create an engaging Instagram Reel showcasing the Iconic Kajal and demonstrate its smudge-proof everyday look and intense finish.',
        'category' => 'Beauty & Skincare',
        'image_url' => 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Indiranagar 100ft Road',
        'address' => '100 Feet Rd, Indiranagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.971600,
        'lng' => 77.641200,
        'radius_km' => 15.00,
        'min_followers' => 1500,
        'max_followers' => 150000,
        'req_categories_json' => '["Beauty & Skincare", "Lifestyle"]',
        'req_engagement' => 2.80,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x 30s High-contrast Eye Makeup Reel"},{"type":"Story","count":2,"requirement":"2x Product close-up Stories"}]',
        'budget_total' => 15000.00,
        'reward_per_creator' => 5000.00,
        'creators_required' => 3,
        'creators_hired' => 0,
        'start_date' => '2026-09-08',
        'end_date' => '2026-10-05',
        'app_deadline' => '2026-09-22',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_thirdwave',
        'brand_id' => 'brd_thirdwave',
        'title' => 'Artisanal Cold Brew Tasting & Craft Reel',
        'description' => 'Create an aesthetic 30-second Reel featuring our seasonal cold brew range, barista craft, and the inviting ambiance of our roastery.',
        'category' => 'Food & Beverage',
        'image_url' => 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Indiranagar 12th Main',
        'address' => '724, 12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.978400,
        'lng' => 77.640800,
        'radius_km' => 15.00,
        'min_followers' => 1000,
        'max_followers' => 100000,
        'req_categories_json' => '["Food & Beverage", "Lifestyle"]',
        'req_engagement' => 2.50,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x 30-45s Reel showcasing cold brew bar"},{"type":"Story","count":2,"requirement":"2x Stories with outlet location tag"}]',
        'budget_total' => 24000.00,
        'reward_per_creator' => 6000.00,
        'creators_required' => 4,
        'creators_hired' => 1,
        'start_date' => '2026-09-01',
        'end_date' => '2026-09-28',
        'app_deadline' => '2026-09-20',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_boat',
        'brand_id' => 'brd_boat',
        'title' => 'Wireless Audio Creator Campaign',
        'description' => 'Showcase the everyday use of boAt wireless audio products through an engaging short-form video highlighting bass quality, battery life, and style.',
        'category' => 'Lifestyle',
        'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Koramangala 80ft Road',
        'address' => '80 Feet Rd, 4th Block, Koramangala, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.935200,
        'lng' => 77.624500,
        'radius_km' => 20.00,
        'min_followers' => 3000,
        'max_followers' => 300000,
        'req_categories_json' => '["Technology", "Lifestyle", "Music"]',
        'req_engagement' => 3.20,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x Beat-synced product lifestyle Reel"},{"type":"Story","count":2,"requirement":"2x Swipe-up product link Stories"}]',
        'budget_total' => 60000.00,
        'reward_per_creator' => 12000.00,
        'creators_required' => 5,
        'creators_hired' => 1,
        'start_date' => '2026-09-05',
        'end_date' => '2026-10-10',
        'app_deadline' => '2026-09-25',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_myntra',
        'brand_id' => 'brd_myntra',
        'title' => 'Festive Fashion Styling Reel',
        'description' => 'Create a short-form styling video featuring festive looks from the latest collection with creative outfit transitions and lookbook breakdowns.',
        'category' => 'Fashion',
        'image_url' => 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'MG Road',
        'address' => 'MG Road Boulevard, Ashok Nagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.975600,
        'lng' => 77.606600,
        'radius_km' => 25.00,
        'min_followers' => 4000,
        'max_followers' => 400000,
        'req_categories_json' => '["Fashion", "Apparel", "Lifestyle"]',
        'req_engagement' => 3.50,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x 3-outfit festive transition Reel"},{"type":"Post","count":1,"requirement":"1x High-resolution carousel lookbook"}]',
        'budget_total' => 90000.00,
        'reward_per_creator' => 15000.00,
        'creators_required' => 6,
        'creators_hired' => 2,
        'start_date' => '2026-09-02',
        'end_date' => '2026-10-15',
        'app_deadline' => '2026-09-24',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_nykaa',
        'brand_id' => 'brd_nykaa',
        'title' => 'Summer Glow Skincare & Beauty Routine',
        'description' => 'Feature your morning skincare essentials using Nykaa Cosmetics in a high-energy transition reel showcasing glowing skin texture and hydration.',
        'category' => 'Beauty & Skincare',
        'image_url' => 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Lavelle Road',
        'address' => 'Lavelle Rd, Shanthala Nagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.971900,
        'lng' => 77.599800,
        'radius_km' => 15.00,
        'min_followers' => 2000,
        'max_followers' => 200000,
        'req_categories_json' => '["Beauty & Skincare", "Wellness"]',
        'req_engagement' => 3.00,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x Step-by-step skincare routine Reel"},{"type":"Story","count":2,"requirement":"2x Product ingredient breakdown Stories"}]',
        'budget_total' => 32000.00,
        'reward_per_creator' => 8000.00,
        'creators_required' => 4,
        'creators_hired' => 0,
        'start_date' => '2026-09-06',
        'end_date' => '2026-10-02',
        'app_deadline' => '2026-09-22',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_lenskart',
        'brand_id' => 'brd_lenskart',
        'title' => 'Studio Eyewear Try-On & Style Guide',
        'description' => 'Showcase 3 curated Lenskart frames paired with casual and workwear outfits to demonstrate how modern eyewear elevates personal style.',
        'category' => 'Fashion',
        'image_url' => 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Church Street',
        'address' => 'Church St, Haridevpur, Shanthala Nagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.974900,
        'lng' => 77.604500,
        'radius_km' => 15.00,
        'min_followers' => 2000,
        'max_followers' => 250000,
        'req_categories_json' => '["Fashion", "Accessories"]',
        'req_engagement' => 2.90,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x 3-frame quick transition Reel"},{"type":"Story","count":2,"requirement":"2x Frame styling polls on Stories"}]',
        'budget_total' => 22500.00,
        'reward_per_creator' => 7500.00,
        'creators_required' => 3,
        'creators_hired' => 0,
        'start_date' => '2026-09-07',
        'end_date' => '2026-10-05',
        'app_deadline' => '2026-09-23',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_cultfit',
        'brand_id' => 'brd_cultfit',
        'title' => 'HIIT Workout Challenge & Fitness Vlog',
        'description' => 'Document a high-intensity session at Cult.fit and share your fitness journey, trainer guidance, and workout energy with your community.',
        'category' => 'Fitness & Wellness',
        'image_url' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'HSR Layout Sector 3',
        'address' => '17th Cross Rd, Sector 3, HSR Layout, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.912100,
        'lng' => 77.644600,
        'radius_km' => 15.00,
        'min_followers' => 2000,
        'max_followers' => 200000,
        'req_categories_json' => '["Fitness & Wellness", "Activewear"]',
        'req_engagement' => 3.00,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x High-energy workout recap Reel"},{"type":"Story","count":3,"requirement":"3x Live Stories during gym workout"}]',
        'budget_total' => 34000.00,
        'reward_per_creator' => 8500.00,
        'creators_required' => 4,
        'creators_hired' => 1,
        'start_date' => '2026-09-02',
        'end_date' => '2026-09-30',
        'app_deadline' => '2026-09-22',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_souledstore',
        'brand_id' => 'brd_souledstore',
        'title' => 'Pop-Culture Merch & Streetwear Lookbook',
        'description' => 'Create an upbeat reel featuring oversized tees, anime drops, and streetwear fits tailored for daily casual aesthetic.',
        'category' => 'Fashion',
        'image_url' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Koramangala 5th Block',
        'address' => '1st Cross Rd, 5th Block, Koramangala, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.934400,
        'lng' => 77.619200,
        'radius_km' => 15.00,
        'min_followers' => 2500,
        'max_followers' => 250000,
        'req_categories_json' => '["Fashion", "Streetwear"]',
        'req_engagement' => 3.10,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x Streetwear lookbook Reel with music"},{"type":"Story","count":2,"requirement":"2x Outfit unboxing Stories"}]',
        'budget_total' => 32500.00,
        'reward_per_creator' => 6500.00,
        'creators_required' => 5,
        'creators_hired' => 0,
        'start_date' => '2026-09-05',
        'end_date' => '2026-10-08',
        'app_deadline' => '2026-09-24',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_bluetokai',
        'brand_id' => 'brd_bluetokai',
        'title' => 'Specialty Pour-Over Experience & Vlogs',
        'description' => 'Capture the barista craft and rich taste profile of single-origin roast coffee during a specialty pour-over workshop in Koramangala.',
        'category' => 'Food & Beverage',
        'image_url' => 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Koramangala 80ft Road',
        'address' => '583, 80 Feet Rd, 4th Block, Koramangala, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.935200,
        'lng' => 77.624500,
        'radius_km' => 15.00,
        'min_followers' => 1500,
        'max_followers' => 150000,
        'req_categories_json' => '["Food & Beverage", "Lifestyle"]',
        'req_engagement' => 2.80,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x High-quality barista brew Reel"},{"type":"Carousel","count":1,"requirement":"1x 5-slide flavor tasting notes"}]',
        'budget_total' => 15000.00,
        'reward_per_creator' => 5000.00,
        'creators_required' => 3,
        'creators_hired' => 0,
        'start_date' => '2026-09-05',
        'end_date' => '2026-09-28',
        'app_deadline' => '2026-09-20',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_decathlon',
        'brand_id' => 'brd_decathlon',
        'title' => 'Active Outdoor Gear & Sports Challenge',
        'description' => 'Test out our trail hiking gear, breathable activewear, and fitness accessories in an energetic outdoor sports challenge video.',
        'category' => 'Fitness & Wellness',
        'image_url' => 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Whitefield Main Road',
        'address' => 'Whitefield Main Rd, Devasandra Industrial Estate, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.969800,
        'lng' => 77.749900,
        'radius_km' => 25.00,
        'min_followers' => 3000,
        'max_followers' => 300000,
        'req_categories_json' => '["Fitness & Wellness", "Sports", "Outdoors"]',
        'req_engagement' => 3.20,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x Outdoor workout / gear test Reel"},{"type":"Story","count":2,"requirement":"2x Gear recommendation Stories"}]',
        'budget_total' => 40000.00,
        'reward_per_creator' => 10000.00,
        'creators_required' => 4,
        'creators_hired' => 1,
        'start_date' => '2026-09-04',
        'end_date' => '2026-10-12',
        'app_deadline' => '2026-09-26',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_zomato',
        'brand_id' => 'brd_zomato',
        'title' => 'Local Culinary Hidden Gems & Food Crawl',
        'description' => 'Explore top trending indie cafes and authentic street delicacies in Bengaluru, creating an appetizing food crawl reel with real tasting reactions.',
        'category' => 'Food & Beverage',
        'image_url' => 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Indiranagar 100ft Road',
        'address' => '100 Feet Rd, Indiranagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.971600,
        'lng' => 77.641200,
        'radius_km' => 15.00,
        'min_followers' => 2000,
        'max_followers' => 200000,
        'req_categories_json' => '["Food & Beverage", "Dining & Nightlife"]',
        'req_engagement' => 2.90,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x Food crawl mini-vlog Reel"},{"type":"Story","count":3,"requirement":"3x Dish rating Stories"}]',
        'budget_total' => 35000.00,
        'reward_per_creator' => 7000.00,
        'creators_required' => 5,
        'creators_hired' => 0,
        'start_date' => '2026-09-08',
        'end_date' => '2026-10-06',
        'app_deadline' => '2026-09-25',
        'status' => 'PUBLISHED'
    ],
    [
        'id' => 'cmp_mamaearth',
        'brand_id' => 'brd_mamaearth',
        'title' => 'Toxin-Free Daily Care & Organic Routine',
        'description' => 'Showcase our naturally certified daily hair and skin essentials in an authentic get-ready-with-me transition video highlighting clean natural ingredients.',
        'category' => 'Beauty & Skincare',
        'image_url' => 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=500&auto=format&fit=crop&q=80',
        'location_name' => 'Jayanagar 4th Block',
        'address' => '11th Main Rd, 4th Block, Jayanagar, Bengaluru',
        'city' => 'Bengaluru',
        'state' => 'Karnataka',
        'lat' => 12.929800,
        'lng' => 77.583300,
        'radius_km' => 15.00,
        'min_followers' => 1500,
        'max_followers' => 150000,
        'req_categories_json' => '["Beauty & Skincare", "Organic Lifestyle"]',
        'req_engagement' => 2.70,
        'deliverables_json' => '[{"type":"Reel","count":1,"requirement":"1x GRWM organic routine Reel"},{"type":"Story","count":2,"requirement":"2x Product texture review Stories"}]',
        'budget_total' => 18000.00,
        'reward_per_creator' => 6000.00,
        'creators_required' => 3,
        'creators_hired' => 0,
        'start_date' => '2026-09-07',
        'end_date' => '2026-10-04',
        'app_deadline' => '2026-09-22',
        'status' => 'PUBLISHED'
    ]
];

foreach ($campaigns as $c) {
    $existing = Database::queryOne('SELECT id FROM campaigns WHERE id = ?', [$c['id']]);
    if ($existing) {
        Database::execute(
            'UPDATE campaigns 
             SET brand_id = ?, title = ?, description = ?, category = ?, image_url = ?, location_name = ?,
                 address = ?, city = ?, state = ?, lat = ?, lng = ?, radius_km = ?,
                 min_followers = ?, max_followers = ?, req_categories_json = ?, req_engagement = ?,
                 deliverables_json = ?, budget_total = ?, reward_per_creator = ?, creators_required = ?,
                 creators_hired = ?, start_date = ?, end_date = ?, app_deadline = ?, status = ?
             WHERE id = ?',
            [
                $c['brand_id'], $c['title'], $c['description'], $c['category'], $c['image_url'], $c['location_name'],
                $c['address'], $c['city'], $c['state'], $c['lat'], $c['lng'], $c['radius_km'],
                $c['min_followers'], $c['max_followers'], $c['req_categories_json'], $c['req_engagement'],
                $c['deliverables_json'], $c['budget_total'], $c['reward_per_creator'], $c['creators_required'],
                $c['creators_hired'], $c['start_date'], $c['end_date'], $c['app_deadline'], $c['status'],
                $c['id']
            ]
        );
    } else {
        Database::execute(
            'INSERT INTO campaigns (
                id, brand_id, title, description, category, image_url, location_name,
                address, city, state, lat, lng, radius_km, min_followers, max_followers,
                req_categories_json, req_engagement, deliverables_json, budget_total,
                reward_per_creator, creators_required, creators_hired, start_date, end_date,
                app_deadline, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                $c['id'], $c['brand_id'], $c['title'], $c['description'], $c['category'], $c['image_url'],
                $c['location_name'], $c['address'], $c['city'], $c['state'], $c['lat'], $c['lng'],
                $c['radius_km'], $c['min_followers'], $c['max_followers'], $c['req_categories_json'],
                $c['req_engagement'], $c['deliverables_json'], $c['budget_total'], $c['reward_per_creator'],
                $c['creators_required'], $c['creators_hired'], $c['start_date'], $c['end_date'],
                $c['app_deadline'], $c['status']
            ]
        );
    }
}

echo "Successfully seeded " . count($brands) . " verified brands and " . count($campaigns) . " curated Indian brand campaigns!\n";
