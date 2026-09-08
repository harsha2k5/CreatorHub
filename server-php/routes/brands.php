<?php
/**
 * CreatorHub PHP Backend - Brands Profile & Analytics Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleBrandsRoute(string $action, string $method, array $body) {
    $user = AuthMiddleware::authenticate();
    AuthMiddleware::requireBrand($user);

    $brand = Database::queryOne("SELECT * FROM brand_profiles WHERE user_id = ?", [$user['id']]);
    if (!$brand) {
        http_response_code(404);
        echo json_encode(['error' => 'Brand profile not found.']);
        return;
    }

    if ($action === 'profile' && $method === 'GET') {
        echo json_encode(['success' => true, 'profile' => $brand]);
        return;
    }

    if ($action === 'profile' && ($method === 'PUT' || $method === 'PATCH' || $method === 'POST')) {
        $companyName = trim($body['company_name'] ?? '');
        $website = trim($body['website'] ?? '');
        $bio = trim($body['bio'] ?? '');

        Database::execute(
            "UPDATE brand_profiles
             SET company_name = COALESCE(NULLIF(?, ''), company_name),
                 website = COALESCE(NULLIF(?, ''), website),
                 bio = COALESCE(NULLIF(?, ''), bio),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = ?",
            [$companyName, $website, $bio, $brand['id']]
        );

        $updated = Database::queryOne("SELECT * FROM brand_profiles WHERE id = ?", [$brand['id']]);
        echo json_encode(['success' => true, 'profile' => $updated]);
        return;
    }

    if ($action === 'analytics' && $method === 'GET') {
        $campaignCount = Database::queryOne("SELECT COUNT(*) as count FROM campaigns WHERE brand_id = ?", [$brand['id']]);
        $activeCollabs = Database::queryOne(
            "SELECT COUNT(*) as count FROM collaborations WHERE brand_id = ? AND status IN ('ACCEPTED', 'ESCROW_LOCKED', 'SUBMITTED', 'APPROVED')",
            [$brand['id']]
        );
        $totalSpent = Database::queryOne(
            "SELECT SUM(amount) as total FROM payments WHERE brand_id = ? AND status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')",
            [$brand['id']]
        );

        echo json_encode([
            'success' => true,
            'analytics' => [
                'total_campaigns' => (int) ($campaignCount['count'] ?? 0),
                'active_collaborations' => (int) ($activeCollabs['count'] ?? 0),
                'total_escrow_funded' => (float) ($totalSpent['total'] ?? 0)
            ]
        ]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Brand action not found.']);
}
