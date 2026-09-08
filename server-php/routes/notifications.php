<?php
/**
 * CreatorHub PHP Backend - Notifications Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/middleware/auth.php';

function handleNotificationsRoute(array $segments, string $method, array $body) {
    $user = AuthMiddleware::authenticate();

    if (empty($segments) && $method === 'GET') {
        $notifications = Database::query(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
            [$user['id']]
        );

        echo json_encode(['success' => true, 'notifications' => $notifications]);
        return;
    }

    $id = $segments[0] ?? null;
    if ($id && ($method === 'PATCH' || $method === 'POST')) {
        Database::execute(
            "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
            [$id, $user['id']]
        );

        echo json_encode(['success' => true, 'message' => 'Notification marked as read.']);
        return;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Notification endpoint not found.']);
}
