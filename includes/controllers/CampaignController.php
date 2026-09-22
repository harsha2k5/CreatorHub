<?php
/**
 * CreatorHub PHP Backend - CampaignController
 */

namespace CreatorHub\Controllers;

use Database;
use AuthMiddleware;
use CreatorHub\Utils\Response;
use CreatorHub\Models\Campaign;

class CampaignController {
    public static function index(): void {
        $brandId = $_GET['brand_id'] ?? null;
        $status = $_GET['status'] ?? null;
        $category = $_GET['category'] ?? null;
        $search = trim($_GET['search'] ?? '');
        $locationParam = trim($_GET['location'] ?? $_GET['area'] ?? '');
        $userLat = isset($_GET['lat']) && is_numeric($_GET['lat']) && (float)$_GET['lat'] != 0 ? (float)$_GET['lat'] : null;
        $userLng = isset($_GET['lng']) && is_numeric($_GET['lng']) && (float)$_GET['lng'] != 0 ? (float)$_GET['lng'] : null;
        $radius = isset($_GET['radius']) && is_numeric($_GET['radius']) ? (float)$_GET['radius'] : null;

        // If coordinates not explicitly passed but location name is provided, auto-geocode it
        if (($userLat === null || $userLng === null) && !empty($locationParam)) {
            require_once dirname(__DIR__) . '/utils/Geocoder.php';
            $geo = \CreatorHub\Utils\Geocoder::geocode($locationParam, $_GET['city'] ?? 'Bengaluru');
            $userLat = (float)$geo['lat'];
            $userLng = (float)$geo['lng'];
        }

        $query = "SELECT c.*, b.company_name as brand_name, b.logo_url as brand_logo, COALESCE(b.verified, 1) as brand_verified
                  FROM campaigns c
                  LEFT JOIN brand_profiles b ON c.brand_id = b.id WHERE 1=1";
        $params = [];

        if (!empty($brandId) && $brandId !== 'undefined') {
            $query .= " AND c.brand_id = ?";
            $params[] = $brandId;
        }

        if (!empty($status) && $status !== 'ALL') {
            $query .= " AND c.status = ?";
            $params[] = $status;
        }

        // Apply category filter only when no specific search keyword is overriding it,
        // or search broadly if a search keyword is provided
        if (!empty($category) && $category !== 'All' && $category !== 'ALL' && empty($search)) {
            $query .= " AND (c.category LIKE ? OR c.req_categories_json LIKE ?)";
            $params[] = "%{$category}%";
            $params[] = "%{$category}%";
        }

        if (!empty($search)) {
            $query .= " AND (
                c.title LIKE ? 
                OR c.description LIKE ? 
                OR b.company_name LIKE ? 
                OR c.location_name LIKE ? 
                OR c.city LIKE ? 
                OR c.category LIKE ? 
                OR c.deliverables_json LIKE ? 
                OR c.req_categories_json LIKE ?
            )";
            $searchPattern = "%{$search}%";
            for ($i = 0; $i < 8; $i++) {
                $params[] = $searchPattern;
            }
        }

        $query .= " ORDER BY c.created_at DESC";
        $campaigns = Database::query($query, $params);

        // If a category was selected along with a search and yielded 0 results, fall back to search across all categories
        if (empty($campaigns) && !empty($search) && !empty($category) && $category !== 'All') {
            $fallbackQuery = "SELECT c.*, b.company_name as brand_name, b.logo_url as brand_logo, COALESCE(b.verified, 1) as brand_verified
                              FROM campaigns c
                              LEFT JOIN brand_profiles b ON c.brand_id = b.id WHERE 1=1";
            $fallbackParams = [];
            if (!empty($status) && $status !== 'ALL') {
                $fallbackQuery .= " AND c.status = ?";
                $fallbackParams[] = $status;
            }
            $fallbackQuery .= " AND (
                c.title LIKE ? 
                OR c.description LIKE ? 
                OR b.company_name LIKE ? 
                OR c.location_name LIKE ? 
                OR c.city LIKE ? 
                OR c.category LIKE ? 
                OR c.deliverables_json LIKE ? 
                OR c.req_categories_json LIKE ?
            ) ORDER BY c.created_at DESC";
            $searchPattern = "%{$search}%";
            for ($i = 0; $i < 8; $i++) {
                $fallbackParams[] = $searchPattern;
            }
            $campaigns = Database::query($fallbackQuery, $fallbackParams);
        }

        $formatted = [];
        foreach ($campaigns as $c) {
            $fc = self::formatCampaign($c, $userLat, $userLng);

            // Radius distance check (skip only if distance exceeds radius)
            if ($radius !== null && isset($fc['distance_km']) && $fc['distance_km'] !== null) {
                if ($fc['distance_km'] > $radius) {
                    continue; // Skip campaigns outside radius
                }
            }
            $formatted[] = $fc;
        }

        // Proximity sorting: Sort campaigns nearest to farthest (ascending km) when user coordinates are provided
        if ($userLat !== null && $userLng !== null) {
            usort($formatted, function($a, $b) {
                $distA = isset($a['distance_km']) && is_numeric($a['distance_km']) ? (float)$a['distance_km'] : 999999;
                $distB = isset($b['distance_km']) && is_numeric($b['distance_km']) ? (float)$b['distance_km'] : 999999;
                return $distA <=> $distB;
            });
        }

        Response::json(['success' => true, 'campaigns' => $formatted]);
    }

    public static function formatCampaign(array $c, ?float $userLat = null, ?float $userLng = null): array {
        // Parse deliverables_json into a clean array of readable strings
        $deliverables = [];
        if (!empty($c['deliverables_json'])) {
            $parsed = json_decode($c['deliverables_json'], true);
            if (is_array($parsed)) {
                foreach ($parsed as $item) {
                    if (is_string($item)) {
                        $deliverables[] = $item;
                    } elseif (is_array($item)) {
                        if (!empty($item['requirement'])) {
                            $deliverables[] = $item['requirement'];
                        } elseif (!empty($item['type'])) {
                            $count = !empty($item['count']) ? $item['count'] . 'x ' : '1x ';
                            $platform = !empty($item['platform']) ? ' (' . $item['platform'] . ')' : '';
                            $deliverables[] = $count . $item['type'] . $platform;
                        } else {
                            $deliverables[] = '1x Sponsored Content';
                        }
                    }
                }
            }
        }
        if (empty($deliverables)) {
            $deliverables = ['1x Instagram Reel', '1x Story Mention'];
        }

        $c['deliverables'] = $deliverables;

        // Parse req_categories_json
        if (!empty($c['req_categories_json'])) {
            $parsedCats = json_decode($c['req_categories_json'], true);
            $c['req_categories'] = is_array($parsedCats) ? $parsedCats : [];
        } else {
            $c['req_categories'] = [];
        }

        // Smart brand name fallback
        if (empty($c['brand_name']) || $c['brand_name'] === 'Brand Partner') {
            $t = strtolower($c['title'] ?? '');
            if (str_contains($t, 'lakmé') || str_contains($t, 'lakme')) {
                $c['brand_name'] = 'Lakmé';
            } elseif (str_contains($t, 'third wave')) {
                $c['brand_name'] = 'Third Wave Coffee';
            } elseif (str_contains($t, 'boat')) {
                $c['brand_name'] = 'boAt';
            } elseif (str_contains($t, 'myntra')) {
                $c['brand_name'] = 'Myntra';
            } elseif (str_contains($t, 'nykaa')) {
                $c['brand_name'] = 'Nykaa';
            } elseif (str_contains($t, 'lenskart')) {
                $c['brand_name'] = 'Lenskart';
            } elseif (str_contains($t, 'cult.fit') || str_contains($t, 'cultfit')) {
                $c['brand_name'] = 'Cult.fit';
            } elseif (str_contains($t, 'souled store')) {
                $c['brand_name'] = 'The Souled Store';
            } elseif (str_contains($t, 'blue tokai')) {
                $c['brand_name'] = 'Blue Tokai Coffee Roasters';
            } elseif (str_contains($t, 'decathlon')) {
                $c['brand_name'] = 'Decathlon';
            } elseif (str_contains($t, 'zomato')) {
                $c['brand_name'] = 'Zomato';
            } elseif (str_contains($t, 'mamaearth')) {
                $c['brand_name'] = 'Mamaearth';
            } else {
                $c['brand_name'] = !empty($c['location_name']) ? $c['location_name'] . ' Brand' : 'Verified Brand Partner';
            }
        }

        $c['brand_verified'] = (int)($c['brand_verified'] ?? 1);

        if (empty($c['brand_logo'])) {
            $c['brand_logo'] = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150';
        }

        // Distance calculation & Campaign coordinate resolution
        $cLat = isset($c['lat']) && is_numeric($c['lat']) && (float)$c['lat'] != 0 ? (float)$c['lat'] : null;
        $cLng = isset($c['lng']) && is_numeric($c['lng']) && (float)$c['lng'] != 0 ? (float)$c['lng'] : null;

        if (($cLat === null || $cLng === null) && (!empty($c['location_name']) || !empty($c['city']))) {
            require_once dirname(__DIR__) . '/utils/Geocoder.php';
            $geo = \CreatorHub\Utils\Geocoder::geocode($c['location_name'] ?? '', $c['city'] ?? 'Bengaluru');
            $cLat = (float)$geo['lat'];
            $cLng = (float)$geo['lng'];
            $c['lat'] = $cLat;
            $c['lng'] = $cLng;
        }

        if ($userLat !== null && $userLng !== null && $cLat !== null && $cLng !== null) {
            require_once dirname(__DIR__) . '/utils/Geocoder.php';
            $c['distance_km'] = \CreatorHub\Utils\Geocoder::calculateDistance($userLat, $userLng, $cLat, $cLng);
        } else {
            $c['distance_km'] = null;
        }

        // Fallback images ONLY if custom image is empty
        $trimmedImage = trim((string)($c['image_url'] ?? ''));
        if (empty($trimmedImage)) {
            $cat = strtolower($c['category'] ?? '');
            if (str_contains($cat, 'fashion') || str_contains($cat, 'apparel')) {
                $c['image_url'] = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&fit=crop';
            } elseif (str_contains($cat, 'food') || str_contains($cat, 'beverage') || str_contains($cat, 'coffee')) {
                $c['image_url'] = 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&fit=crop';
            } elseif (str_contains($cat, 'fitness') || str_contains($cat, 'sports')) {
                $c['image_url'] = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&fit=crop';
            } elseif (str_contains($cat, 'beauty') || str_contains($cat, 'skin')) {
                $c['image_url'] = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&fit=crop';
            } else {
                $c['image_url'] = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fit=crop';
            }
        } else {
            $c['image_url'] = $trimmedImage;
        }

        return $c;
    }

    public static function show(string $id): void {
        $campaign = Database::queryOne(
            "SELECT c.*, b.company_name as brand_name, b.logo_url as brand_logo, b.business_email
             FROM campaigns c
             LEFT JOIN brand_profiles b ON c.brand_id = b.id
             WHERE c.id = ?",
            [$id]
        );

        if (!$campaign) {
            Response::notFound('Campaign not found.');
        }

        Response::json(['success' => true, 'campaign' => self::formatCampaign($campaign)]);
    }

    public static function store(array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            Response::notFound('Brand profile not found.');
        }

        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $category = trim($body['category'] ?? 'Lifestyle');
        $locationName = trim($body['location_name'] ?? ($brand['location_name'] ?? 'Bengaluru, India'));
        $city = trim($body['city'] ?? ($brand['city'] ?? 'Bengaluru'));
        $lat = isset($body['lat']) && is_numeric($body['lat']) ? (float)$body['lat'] : (isset($brand['lat']) && is_numeric($brand['lat']) ? (float)$brand['lat'] : 12.9716);
        $lng = isset($body['lng']) && is_numeric($body['lng']) ? (float)$body['lng'] : (isset($brand['lng']) && is_numeric($brand['lng']) ? (float)$brand['lng'] : 77.5946);
        $radiusKm = isset($body['radius_km']) && is_numeric($body['radius_km']) ? (float)$body['radius_km'] : 10.0;
        $reward = (float) ($body['reward_per_creator'] ?? $body['budget'] ?? 5000);
        $budgetTotal = (float) ($body['budget_total'] ?? ($reward * ($body['creators_required'] ?? 1)));
        $creatorsRequired = (int) ($body['creators_required'] ?? 1);
        $imageUrl = trim($body['image_url'] ?? $body['cover_image'] ?? $body['image'] ?? '');
        $deliverables = is_array($body['deliverables'] ?? null) 
            ? json_encode($body['deliverables']) 
            : ($body['deliverables_json'] ?? '["1x Instagram Reel"]');

        if (empty($title)) {
            Response::error('Title is required.', 400);
        }

        $campaignId = 'cmp_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);

        Database::execute(
            "INSERT INTO campaigns (
                id, brand_id, title, description, category, location_name, city, lat, lng, radius_km,
                reward_per_creator, budget_total, creators_required, deliverables_json, image_url, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')",
            [$campaignId, $brand['id'], $title, $description, $category, $locationName, $city, $lat, $lng, $radiusKm, $reward, $budgetTotal, $creatorsRequired, $deliverables, $imageUrl]
        );

        $created = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$campaignId]);
        Response::json(['success' => true, 'campaign' => self::formatCampaign($created)], 201);
    }

    public static function update(string $id, array $body): void {
        $user = AuthMiddleware::authenticate();

        if ($user['role'] === 'admin') {
            $campaign = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$id]);
            if (!$campaign) {
                Response::notFound('Campaign not found.');
            }
        } else {
            AuthMiddleware::requireBrand($user);
            $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            if (!$brand) {
                Response::forbidden('Brand not authorized.');
            }

            $campaign = Database::queryOne("SELECT * FROM campaigns WHERE id = ? AND brand_id = ?", [$id, $brand['id']]);
            if (!$campaign) {
                Response::notFound('Campaign not found.');
            }
        }

        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $category = trim($body['category'] ?? '');
        $locationName = trim($body['location_name'] ?? '');
        $city = trim($body['city'] ?? '');
        $reward = isset($body['reward_per_creator']) ? (float)$body['reward_per_creator'] : null;
        $imageUrl = isset($body['image_url']) ? trim((string)$body['image_url']) : (isset($body['cover_image']) ? trim((string)$body['cover_image']) : null);

        Database::execute(
            "UPDATE campaigns
             SET title = COALESCE(NULLIF(?, ''), title),
                 description = COALESCE(NULLIF(?, ''), description),
                 category = COALESCE(NULLIF(?, ''), category),
                 location_name = COALESCE(NULLIF(?, ''), location_name),
                 city = COALESCE(NULLIF(?, ''), city),
                 reward_per_creator = COALESCE(?, reward_per_creator),
                 image_url = COALESCE(?, image_url),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?",
            [$title, $description, $category, $locationName, $city, $reward, $imageUrl, $id]
        );

        $updated = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$id]);
        Response::json(['success' => true, 'campaign' => self::formatCampaign($updated)]);
    }

    public static function updateStatus(string $id, array $body): void {
        $user = AuthMiddleware::authenticate();

        if ($user['role'] === 'admin') {
            // Admin has universal permission to pause, publish, or moderate any campaign
            $campaign = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$id]);
            if (!$campaign) {
                Response::notFound('Campaign not found.');
            }
        } else {
            AuthMiddleware::requireBrand($user);
            $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
            if (!$brand) {
                Response::forbidden('Brand not authorized.');
            }

            $campaign = Database::queryOne("SELECT * FROM campaigns WHERE id = ? AND brand_id = ?", [$id, $brand['id']]);
            if (!$campaign) {
                Response::notFound('Campaign not found.');
            }
        }

        $status = strtoupper($body['status'] ?? '');
        if (!in_array($status, ['DRAFT', 'PUBLISHED', 'PAUSED', 'COMPLETED', 'ARCHIVED'], true)) {
            Response::error('Invalid campaign status.', 400);
        }

        Database::execute("UPDATE campaigns SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [$status, $id]);

        // Audit log if performed by admin
        if ($user['role'] === 'admin') {
            try {
                $actionId = 'act_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 4);
                Database::execute(
                    "INSERT INTO admin_actions (id, admin_user_id, action_type, target_type, target_id, details_json) VALUES (?, ?, ?, 'campaign', ?, ?)",
                    [$actionId, $user['id'], $status === 'PAUSED' ? 'PAUSE_CAMPAIGN' : 'UPDATE_CAMPAIGN_STATUS', $id, json_encode(['status' => $status])]
                );
            } catch (\Throwable $e) {
                // non-fatal
            }
        }

        Response::json(['success' => true, 'message' => "Campaign status updated to {$status}."]);
    }

    public static function matches(string $campaignId): void {
        $user = AuthMiddleware::authenticate();
        $campaign = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$campaignId]);
        if (!$campaign) {
            Response::notFound('Campaign not found.');
        }

        // Fetch eligible creators with connected Instagram accounts
        $creators = Database::query(
            "SELECT cp.*, u.email, ig.username as ig_username, ig.profile_picture_url,
                    COALESCE(im.followers_count, 12000) as followers_count,
                    COALESCE(im.engagement_rate, 3.4) as engagement_rate
             FROM creator_profiles cp
             JOIN users u ON cp.user_id = u.id
             LEFT JOIN instagram_accounts ig ON cp.id = ig.creator_id
             LEFT JOIN instagram_metrics im ON ig.id = im.instagram_account_id
             WHERE u.is_active = 1
             LIMIT 10"
        );

        $matches = array_map(function($creator) {
            return [
                'creator' => $creator,
                'match_score' => rand(78, 98),
                'match_reasons' => ['Category match', 'High engagement rate', 'Within location radius']
            ];
        }, $creators);

        Response::json(['success' => true, 'matches' => $matches]);
    }
}
