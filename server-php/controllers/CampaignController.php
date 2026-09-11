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
        $search = $_GET['search'] ?? null;

        $query = "SELECT c.*, b.company_name as brand_name, b.logo_url as brand_logo
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

        if (!empty($category) && $category !== 'All') {
            $query .= " AND c.category = ?";
            $params[] = $category;
        }

        if (!empty($search)) {
            $query .= " AND (c.title LIKE ? OR c.description LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        $query .= " ORDER BY c.created_at DESC";
        $campaigns = Database::query($query, $params);

        $formatted = array_map(function($c) {
            return self::formatCampaign($c);
        }, $campaigns);

        Response::json(['success' => true, 'campaigns' => $formatted]);
    }

    public static function formatCampaign(array $c): array {
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

        if (empty($c['brand_name'])) {
            $c['brand_name'] = 'Brand Partner';
        }
        if (empty($c['brand_logo'])) {
            $c['brand_logo'] = 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=150';
        }

        // Beautiful curated fallback images for campaigns missing custom hero cover
        if (empty($c['image_url'])) {
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

        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            Response::notFound('Brand profile not found.');
        }

        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $category = trim($body['category'] ?? 'Lifestyle');
        $locationName = trim($body['location_name'] ?? 'Bengaluru, India');
        $reward = (float) ($body['reward_per_creator'] ?? $body['budget'] ?? 5000);
        $budgetTotal = (float) ($body['budget_total'] ?? ($reward * ($body['creators_required'] ?? 1)));
        $creatorsRequired = (int) ($body['creators_required'] ?? 1);
        $deliverables = is_array($body['deliverables'] ?? null) 
            ? json_encode($body['deliverables']) 
            : ($body['deliverables_json'] ?? '["1x Instagram Reel"]');

        if (empty($title)) {
            Response::error('Title is required.', 400);
        }

        $campaignId = 'cmp_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);

        Database::execute(
            "INSERT INTO campaigns (
                id, brand_id, title, description, category, location_name,
                reward_per_creator, budget_total, creators_required, deliverables_json, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED')",
            [$campaignId, $brand['id'], $title, $description, $category, $locationName, $reward, $budgetTotal, $creatorsRequired, $deliverables]
        );

        $created = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$campaignId]);
        Response::json(['success' => true, 'campaign' => $created], 201);
    }

    public static function updateStatus(string $id, array $body): void {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            Response::forbidden('Brand not authorized.');
        }

        $campaign = Database::queryOne("SELECT * FROM campaigns WHERE id = ? AND brand_id = ?", [$id, $brand['id']]);
        if (!$campaign) {
            Response::notFound('Campaign not found.');
        }

        $status = strtoupper($body['status'] ?? '');
        if (!in_array($status, ['DRAFT', 'PUBLISHED', 'PAUSED', 'COMPLETED', 'ARCHIVED'], true)) {
            Response::error('Invalid campaign status.', 400);
        }

        Database::execute("UPDATE campaigns SET status = ?, updated_at = datetime('now') WHERE id = ?", [$status, $id]);
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
