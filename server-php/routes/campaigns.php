<?php
/**
 * CreatorHub PHP Backend - Campaigns Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleCampaignsRoute(array $segments, string $method, array $body) {
    // GET /api/campaigns
    if (empty($segments) && $method === 'GET') {
        $brandId = $_GET['brand_id'] ?? null;
        $status = $_GET['status'] ?? null;

        $query = "SELECT c.*, b.company_name as brand_name, b.logo_url as brand_logo
                  FROM campaigns c
                  JOIN brand_profiles b ON c.brand_id = b.id WHERE 1=1";
        $params = [];

        if (!empty($brandId) && $brandId !== 'undefined') {
            $query .= " AND c.brand_id = ?";
            $params[] = $brandId;
        }

        if (!empty($status) && $status !== 'ALL') {
            $query .= " AND c.status = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY c.created_at DESC";
        $campaigns = Database::query($query, $params);

        echo json_encode(['success' => true, 'campaigns' => $campaigns]);
        return;
    }

    $id = $segments[0] ?? null;

    // GET /api/campaigns/:id
    if ($id && $method === 'GET') {
        $campaign = Database::queryOne(
            "SELECT c.*, b.company_name as brand_name, b.logo_url as brand_logo, b.business_email
             FROM campaigns c
             JOIN brand_profiles b ON c.brand_id = b.id
             WHERE c.id = ?",
            [$id]
        );

        if (!$campaign) {
            http_response_code(404);
            echo json_encode(['error' => 'Campaign not found.']);
            return;
        }

        echo json_encode(['success' => true, 'campaign' => $campaign]);
        return;
    }

    // POST /api/campaigns
    if (empty($segments) && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            http_response_code(404);
            echo json_encode(['error' => 'Brand profile not found.']);
            return;
        }

        $title = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $reward = (float) ($body['reward_per_creator'] ?? $body['budget'] ?? 5000);
        $deliverables = is_array($body['deliverables'] ?? null) ? json_encode($body['deliverables']) : ($body['deliverables'] ?? '["1x Instagram Reel"]');

        if (empty($title)) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required.']);
            return;
        }

        $campaignId = 'cmp_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);

        Database::execute(
            "INSERT INTO campaigns (id, brand_id, title, description, reward_per_creator, deliverables, status)
             VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED')",
            [$campaignId, $brand['id'], $title, $description, $reward, $deliverables]
        );

        $created = Database::queryOne("SELECT * FROM campaigns WHERE id = ?", [$campaignId]);
        http_response_code(201);
        echo json_encode(['success' => true, 'campaign' => $created]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Campaign endpoint not found.']);
}
