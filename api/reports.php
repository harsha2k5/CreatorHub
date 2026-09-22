<?php
/**
 * CreatorHub PHP Backend - Reports Route
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleReportsRoute(array $segments, string $method, array $body) {
    $user = AuthMiddleware::authenticate();

    echo json_encode([
        'success' => true,
        'report' => [
            'generated_at' => date('c'),
            'user_id' => $user['id'],
            'role' => $user['role'],
            'status' => 'ACTIVE'
        ]
    ]);
}
