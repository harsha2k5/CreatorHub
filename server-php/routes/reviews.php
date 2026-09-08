<?php
/**
 * CreatorHub PHP Backend - Reviews Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleReviewsRoute(array $segments, string $method, array $body) {
    $creatorId = $segments[0] ?? null;

    if ($creatorId && $method === 'GET') {
        $reviews = Database::query(
            "SELECT r.*, b.company_name as brand_name, b.logo_url as brand_logo
             FROM reviews r
             JOIN brand_profiles b ON r.brand_id = b.id
             WHERE r.creator_id = ?
             ORDER BY r.created_at DESC",
            [$creatorId]
        );

        echo json_encode(['success' => true, 'reviews' => $reviews]);
        return;
    }

    if (empty($segments) && $method === 'POST') {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireBrand($user);

        $brand = Database::queryOne("SELECT id FROM brand_profiles WHERE user_id = ?", [$user['id']]);
        if (!$brand) {
            http_response_code(404);
            echo json_encode(['error' => 'Brand profile not found.']);
            return;
        }

        $creatorId = $body['creator_id'] ?? '';
        $rating = (float) ($body['rating'] ?? 5);
        $comment = trim($body['comment'] ?? '');

        if (empty($creatorId)) {
            http_response_code(400);
            echo json_encode(['error' => 'creator_id is required.']);
            return;
        }

        $revId = 'rev_' . round(microtime(true) * 1000) . '_' . substr(bin2hex(random_bytes(3)), 0, 5);
        Database::execute(
            "INSERT INTO reviews (id, brand_id, creator_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
            [$revId, $brand['id'], $creatorId, $rating, $comment]
        );

        echo json_encode(['success' => true, 'message' => 'Review submitted successfully.']);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Review endpoint not found.']);
}
