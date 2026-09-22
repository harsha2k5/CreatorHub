<?php
/**
 * CreatorHub PHP Backend - Messages & Chat Routes
 */

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/includes/controllers/MessageController.php';
require_once dirname(__DIR__) . '/includes/controllers/CreatorController.php';

use CreatorHub\Controllers\MessageController;
use CreatorHub\Controllers\CreatorController;
use CreatorHub\Utils\Response;

function handleMessagesRoute(array $segments, string $method, array $body) {
    $action = $segments[0] ?? null;

    if ($action === 'conversations' && $method === 'GET') {
        MessageController::conversations();
        return;
    }

    if ($action === 'direct-pitch' && $method === 'POST') {
        $creatorId = $body['creator_id'] ?? $body['creatorId'] ?? null;
        if (!$creatorId) {
            Response::error('Creator ID is required for direct pitch.', 400);
        }
        CreatorController::pitch($creatorId, $body);
        return;
    }

    if ($action && $method === 'GET') {
        MessageController::messages($action);
        return;
    }

    if ($action && $method === 'POST') {
        MessageController::sendMessage($action, $body);
        return;
    }

    Response::notFound('Messages endpoint not found: /api/messages/' . implode('/', $segments));
}
