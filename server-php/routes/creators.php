<?php
/**
 * CreatorHub PHP Backend - Creators Directory & Profile Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleCreatorsRoute(array $segments, string $method, array $body) {
    // GET /api/creators
    if (empty($segments) && $method === 'GET') {
        $limit = (int) ($_GET['limit'] ?? 50);
        $city = $_GET['city'] ?? null;

        $query = "SELECT c.*, u.email FROM creator_profiles c JOIN users u ON c.user_id = u.id WHERE u.is_active = 1";
        $params = [];

        if (!empty($city)) {
            $query .= " AND c.city LIKE ?";
            $params[] = "%{$city}%";
        }

        $query .= " LIMIT ?";
        $params[] = $limit;

        $creators = Database::query($query, $params);
        echo json_encode(['success' => true, 'creators' => $creators]);
        return;
    }

    $id = $segments[0] ?? null;

    // GET /api/creators/:id
    if ($id && $method === 'GET') {
        $creator = Database::queryOne(
            "SELECT c.*, u.email FROM creator_profiles c JOIN users u ON c.user_id = u.id WHERE c.id = ? OR c.username = ?",
            [$id, $id]
        );

        if (!$creator) {
            http_response_code(404);
            echo json_encode(['error' => 'Creator not found.']);
            return;
        }

        echo json_encode(['success' => true, 'creator' => $creator]);
        return;
    }

    // PUT /api/creators/profile
    if ($id === 'profile' && ($method === 'PUT' || $method === 'PATCH' || $method === 'POST')) {
        $user = AuthMiddleware::authenticate();
        AuthMiddleware::requireCreator($user);

        $fullName = trim($body['full_name'] ?? '');
        $bio = trim($body['bio'] ?? '');
        $city = trim($body['city'] ?? '');
        $minBudget = (float) ($body['min_budget'] ?? 3000);

        Database::execute(
            "UPDATE creator_profiles
             SET full_name = COALESCE(NULLIF(?, ''), full_name),
                 bio = COALESCE(NULLIF(?, ''), bio),
                 city = COALESCE(NULLIF(?, ''), city),
                 min_budget = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = ?",
            [$fullName, $bio, $city, $minBudget, $user['id']]
        );

        $updated = Database::queryOne("SELECT * FROM creator_profiles WHERE user_id = ?", [$user['id']]);
        echo json_encode(['success' => true, 'profile' => $updated]);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Creator endpoint not found.']);
}
