<?php
/**
 * CreatorHub PHP Backend - Admin Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleAdminRoute(array $segments, string $method, array $body) {
    $user = AuthMiddleware::authenticate();
    AuthMiddleware::requireAdmin($user);

    $action = $segments[0] ?? null;

    if ($action === 'stats' && $method === 'GET') {
        $usersCount = Database::queryOne("SELECT COUNT(*) as cnt FROM users");
        $creatorsCount = Database::queryOne("SELECT COUNT(*) as cnt FROM creator_profiles");
        $brandsCount = Database::queryOne("SELECT COUNT(*) as cnt FROM brand_profiles");
        $campaignsCount = Database::queryOne("SELECT COUNT(*) as cnt FROM campaigns");
        $collabsCount = Database::queryOne("SELECT COUNT(*) as cnt FROM collaborations");
        $escrowFunded = Database::queryOne("SELECT SUM(amount) as total FROM payments WHERE status IN ('VERIFIED', 'HELD_IN_ESCROW', 'RELEASED')");

        echo json_encode([
            'success' => true,
            'stats' => [
                'total_users' => (int) ($usersCount['cnt'] ?? 0),
                'total_creators' => (int) ($creatorsCount['cnt'] ?? 0),
                'total_brands' => (int) ($brandsCount['cnt'] ?? 0),
                'total_campaigns' => (int) ($campaignsCount['cnt'] ?? 0),
                'total_collaborations' => (int) ($collabsCount['cnt'] ?? 0),
                'total_escrow_funded' => (float) ($escrowFunded['total'] ?? 0)
            ]
        ]);
        return;
    }

    if ($action === 'users' && $method === 'GET') {
        $users = Database::query("SELECT id, email, role, is_active, is_verified, created_at FROM users ORDER BY created_at DESC LIMIT 100");
        echo json_encode(['success' => true, 'users' => $users]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Admin endpoint not found.']);
}
