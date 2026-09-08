<?php
/**
 * CreatorHub PHP Backend - Notifications Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/controllers/NotificationController.php';

use CreatorHub\Controllers\NotificationController;
use CreatorHub\Utils\Response;

function handleNotificationsRoute(array $segments, string $method, array $body) {
    if (empty($segments) && $method === 'GET') {
        NotificationController::index();
        return;
    }

    $first = $segments[0] ?? null;
    $second = $segments[1] ?? null;

    if ($first === 'read-all' && ($method === 'PUT' || $method === 'POST')) {
        NotificationController::markAllRead();
        return;
    }

    if ($first && $second === 'read' && ($method === 'PATCH' || $method === 'POST')) {
        NotificationController::markRead($first);
        return;
    }

    Response::notFound('Notification endpoint not found: /api/notifications/' . implode('/', $segments));
}
